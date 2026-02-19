'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  RefreshCw,
  RotateCcw,
  Wifi,
  Eye,
  Loader2,
  Cpu,
  Clock,
  HardDrive,
  Signal,
  Activity,
  MapPin,
  Calendar,
} from 'lucide-react'
import { iotApi, type DeviceDetail, type JobExecution } from '@/lib/iot-api'
import { Badge } from '@/components/admin/Badge'
import { Button } from '@/components/ui/Button'

/** Formatea segundos de uptime a texto legible */
function formatUptime(seconds: number): string {
  const dias = Math.floor(seconds / 86400)
  const horas = Math.floor((seconds % 86400) / 3600)
  const minutos = Math.floor((seconds % 3600) / 60)

  const partes: string[] = []
  if (dias > 0) partes.push(`${dias}d`)
  if (horas > 0) partes.push(`${horas}h`)
  partes.push(`${minutos}m`)

  return partes.join(' ')
}

/** Formatea bytes de heap libre */
function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}

/** Variante del Badge según estado de job */
function jobStatusVariant(status: string) {
  switch (status) {
    case 'SUCCEEDED': return 'success' as const
    case 'FAILED': return 'destructive' as const
    case 'IN_PROGRESS': return 'info' as const
    case 'QUEUED': return 'warning' as const
    case 'CANCELED': return 'default' as const
    default: return 'default' as const
  }
}

/** Etiqueta legible para estado de job */
function jobStatusLabel(status: string): string {
  switch (status) {
    case 'SUCCEEDED': return 'Exitoso'
    case 'FAILED': return 'Fallido'
    case 'IN_PROGRESS': return 'En progreso'
    case 'QUEUED': return 'En cola'
    case 'CANCELED': return 'Cancelado'
    default: return status
  }
}

export default function DeviceDetailPage() {
  const params = useParams()
  const thingName = params.thingName as string

  const [device, setDevice] = useState<DeviceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commandLoading, setCommandLoading] = useState<string | null>(null)

  const loadDevice = useCallback(async () => {
    const { data, error: err } = await iotApi.getDevice(thingName)
    if (err) {
      setError(err)
    } else {
      setDevice(data)
      setError(null)
    }
    setLoading(false)
  }, [thingName])

  useEffect(() => {
    loadDevice()

    // Polling cada 5 segundos
    const interval = setInterval(loadDevice, 5_000)
    return () => clearInterval(interval)
  }, [loadDevice])

  const handleCommand = async (command: string) => {
    setCommandLoading(command)
    const { error: err } = await iotApi.sendCommand(thingName, command)
    if (err) {
      setError(err)
    }
    setCommandLoading(null)
    // Recargar datos después de enviar comando
    setTimeout(loadDevice, 1000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando dispositivo...</span>
      </div>
    )
  }

  if (error && !device) {
    return (
      <div>
        <Link href="/admin/iot" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Volver a dispositivos
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  if (!device) return null

  const reported = device.shadow?.reported || {}

  return (
    <div>
      {/* Navegación */}
      <Link href="/admin/iot" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Volver a dispositivos
      </Link>

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {device.nickname || device.thingName}
          </h1>
          <p className="text-sm text-gray-500 font-mono">{device.thingName}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={device.connected ? 'success' : 'destructive'} className="text-sm px-3 py-1">
            {device.connected ? 'En línea' : 'Fuera de línea'}
          </Badge>
          <Button variant="outline" size="sm" onClick={loadDevice}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Información del dispositivo */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700">Información del Dispositivo</h2>
          </div>
          <div className="px-5 py-4 space-y-3">
            <InfoRow icon={Cpu} label="Thing Name" value={device.thingName} mono />
            <InfoRow
              icon={Activity}
              label="Nickname"
              value={device.nickname || '—'}
            />
            <InfoRow
              icon={MapPin}
              label="Ubicación"
              value={device.location || 'Sin asignar'}
            />
            <InfoRow
              icon={HardDrive}
              label="Firmware"
              value={device.firmwareVersion || '—'}
              mono
            />
            <InfoRow
              icon={Calendar}
              label="Fecha de instalación"
              value={
                device.installedDate
                  ? new Date(device.installedDate).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '—'
              }
            />
          </div>
        </div>

        {/* Datos del shadow (estado reportado) */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700">Estado Reportado (Shadow)</h2>
          </div>
          <div className="px-5 py-4 space-y-3">
            <InfoRow
              icon={Clock}
              label="Uptime"
              value={reported.uptime != null ? formatUptime(reported.uptime) : '—'}
            />
            <InfoRow
              icon={HardDrive}
              label="Heap libre"
              value={reported.freeHeap != null ? formatBytes(reported.freeHeap) : '—'}
            />
            <InfoRow
              icon={Signal}
              label="RSSI"
              value={reported.rssi != null ? `${reported.rssi} dBm` : '—'}
              badge={
                reported.rssi != null
                  ? {
                      variant:
                        reported.rssi >= -50
                          ? ('success' as const)
                          : reported.rssi >= -70
                          ? ('warning' as const)
                          : ('destructive' as const),
                      label:
                        reported.rssi >= -50
                          ? 'Excelente'
                          : reported.rssi >= -70
                          ? 'Buena'
                          : 'Débil',
                    }
                  : undefined
              }
            />
            <InfoRow
              icon={Activity}
              label="Estado del motor"
              value={reported.motorState || '—'}
            />
            <InfoRow
              icon={Wifi}
              label="IP"
              value={reported.ip || '—'}
              mono
            />
          </div>
        </div>
      </div>

      {/* Botones de comando */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700">Comandos</h2>
        </div>
        <div className="px-5 py-4 flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={!device.connected || commandLoading !== null}
            isLoading={commandLoading === 'restart'}
            onClick={() => handleCommand('restart')}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reiniciar
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!device.connected || commandLoading !== null}
            isLoading={commandLoading === 'reset-wifi'}
            onClick={() => handleCommand('reset-wifi')}
          >
            <Wifi className="h-4 w-4 mr-2" />
            Reset WiFi
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!device.connected || commandLoading !== null}
            isLoading={commandLoading === 'identify'}
            onClick={() => handleCommand('identify')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Identificar
          </Button>
          {!device.connected && (
            <p className="text-xs text-gray-400 self-center ml-2">
              El dispositivo debe estar en línea para recibir comandos
            </p>
          )}
        </div>
      </div>

      {/* Historial de OTA */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700">Historial OTA</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {(!device.jobExecutions || device.jobExecutions.length === 0) ? (
            <p className="px-5 py-8 text-center text-sm text-gray-400">
              Sin actualizaciones OTA registradas
            </p>
          ) : (
            device.jobExecutions.map((job: JobExecution) => (
              <div key={job.jobId} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-gray-500">{job.jobId}</span>
                  {job.firmwareVersion && (
                    <span className="text-xs text-gray-400">v{job.firmwareVersion}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={jobStatusVariant(job.status)}>
                    {jobStatusLabel(job.status)}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    {job.completedAt
                      ? new Date(job.completedAt).toLocaleString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : job.queuedAt
                      ? new Date(job.queuedAt).toLocaleString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Componente auxiliar para filas de información ───

interface InfoRowProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  mono?: boolean
  badge?: { variant: 'success' | 'warning' | 'destructive'; label: string }
}

function InfoRow({ icon: Icon, label, value, mono, badge }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
      <span className="text-sm text-gray-500 w-36 flex-shrink-0">{label}</span>
      <span className={`text-sm text-gray-900 ${mono ? 'font-mono' : ''}`}>{value}</span>
      {badge && (
        <Badge variant={badge.variant} className="ml-2">{badge.label}</Badge>
      )}
    </div>
  )
}
