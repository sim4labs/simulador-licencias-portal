'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  Download,
  Rocket,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
} from 'lucide-react'
import { iotApi, type FirmwareFile, type Device, type Job, type JobDetail } from '@/lib/iot-api'
import { Badge } from '@/components/admin/Badge'
import { Button } from '@/components/ui/Button'

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function jobStatusVariant(status: string) {
  switch (status) {
    case 'COMPLETED': return 'success' as const
    case 'SUCCEEDED': return 'success' as const
    case 'FAILED': return 'destructive' as const
    case 'IN_PROGRESS': return 'info' as const
    case 'QUEUED': return 'warning' as const
    case 'CANCELED': return 'default' as const
    default: return 'default' as const
  }
}

function jobStatusLabel(status: string): string {
  switch (status) {
    case 'COMPLETED': return 'Completado'
    case 'SUCCEEDED': return 'Exitoso'
    case 'FAILED': return 'Fallido'
    case 'IN_PROGRESS': return 'En progreso'
    case 'QUEUED': return 'En cola'
    case 'CANCELED': return 'Cancelado'
    default: return status
  }
}

export default function FirmwarePage() {
  const [firmware, setFirmware] = useState<FirmwareFile[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Deploy modal state
  const [deployFirmware, setDeployFirmware] = useState<FirmwareFile | null>(null)
  const [selectedDevices, setSelectedDevices] = useState<string[]>([])
  const [deployDescription, setDeployDescription] = useState('')
  const [deploying, setDeploying] = useState(false)
  const [deployError, setDeployError] = useState<string | null>(null)

  // Job detail expand
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [jobDetail, setJobDetail] = useState<JobDetail | null>(null)

  const loadData = useCallback(async () => {
    const [fwRes, jobsRes, devicesRes] = await Promise.all([
      iotApi.listFirmware(),
      iotApi.listJobs(),
      iotApi.listDevices(),
    ])

    if (fwRes.error) setError(fwRes.error)
    else setFirmware(fwRes.data || [])

    setJobs(jobsRes.data || [])
    setDevices(devicesRes.data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const openDeployModal = (fw: FirmwareFile) => {
    setDeployFirmware(fw)
    setSelectedDevices([])
    setDeployDescription('')
    setDeployError(null)
  }

  const toggleDevice = (thingName: string) => {
    setSelectedDevices(prev =>
      prev.includes(thingName)
        ? prev.filter(d => d !== thingName)
        : [...prev, thingName]
    )
  }

  const selectAllOnline = () => {
    const online = devices.filter(d => d.online).map(d => d.thingName)
    setSelectedDevices(online)
  }

  const handleDeploy = async () => {
    if (!deployFirmware || selectedDevices.length === 0) return
    setDeploying(true)

    const { error: err } = await iotApi.createJob({
      firmwareKey: deployFirmware.key,
      firmwareVersion: deployFirmware.version || 'unknown',
      description: deployDescription || `OTA ${deployFirmware.version || deployFirmware.filename}`,
      targets: selectedDevices,
    })

    setDeploying(false)
    if (err) {
      setDeployError(err)
    } else {
      setDeployFirmware(null)
      setDeployError(null)
      loadData()
    }
  }

  const toggleJobDetail = async (jobId: string) => {
    if (expandedJob === jobId) {
      setExpandedJob(null)
      setJobDetail(null)
      return
    }
    setExpandedJob(jobId)
    setJobDetail(null)
    const { data } = await iotApi.getJob(jobId)
    if (data) setJobDetail(data)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando firmware...</span>
      </div>
    )
  }

  return (
    <div>
      {/* Navegacion */}
      <Link href="/admin/iot" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Volver a dispositivos
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Firmware</h1>
          <p className="text-sm text-gray-500 mt-1">Versiones disponibles y despliegue OTA</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="text-xs text-red-500 underline mt-1">Cerrar</button>
        </div>
      )}

      {/* Tabla de versiones */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Versiones de Firmware ({firmware.length})
          </h2>
        </div>
        {firmware.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-400">
            No hay archivos de firmware en S3
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {firmware.map(fw => (
              <div key={fw.key} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Download className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{fw.filename}</p>
                    <p className="text-xs text-gray-400">
                      {formatSize(fw.size)}
                      {fw.lastModified && ` — ${formatDate(fw.lastModified)}`}
                    </p>
                  </div>
                  {fw.version && (
                    <Badge variant="info">{fw.version}</Badge>
                  )}
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => openDeployModal(fw)}
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Desplegar
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historial de Jobs OTA */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Historial de Jobs OTA ({jobs.length})
          </h2>
        </div>
        {jobs.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-400">
            Sin jobs OTA registrados
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {jobs.map(job => (
              <div key={job.jobId}>
                <button
                  onClick={() => toggleJobDetail(job.jobId)}
                  className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-gray-600">{job.jobId}</span>
                    {job.firmwareVersion && (
                      <Badge variant="info">{job.firmwareVersion}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {job.targetCount} dispositivo{job.targetCount !== 1 ? 's' : ''}
                    </span>
                    <Badge variant={jobStatusVariant(job.status)}>
                      {jobStatusLabel(job.status)}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {formatDate(job.createdAt)}
                    </span>
                  </div>
                </button>
                {/* Detalle expandido */}
                {expandedJob === job.jobId && !jobDetail && (
                  <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    <span className="text-sm text-gray-400">Cargando detalles...</span>
                  </div>
                )}
                {expandedJob === job.jobId && jobDetail && (
                  <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2 mt-2">
                      {jobDetail.description || 'Sin descripcion'}
                    </p>
                    <div className="space-y-1">
                      {jobDetail.targets.map(t => (
                        <div key={t.thingName} className="flex items-center gap-3 text-sm">
                          {t.status === 'SUCCEEDED' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : t.status === 'FAILED' ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="font-mono text-gray-600">{t.thingName}</span>
                          <Badge variant={jobStatusVariant(t.status)} className="text-[10px]">
                            {jobStatusLabel(t.status)}
                          </Badge>
                          {t.completedAt && (
                            <span className="text-xs text-gray-400">{formatDate(t.completedAt)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de deploy */}
      {deployFirmware && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Desplegar Firmware</h3>
              <p className="text-sm text-gray-500 mt-1">
                {deployFirmware.filename}
                {deployFirmware.version && ` (${deployFirmware.version})`}
              </p>
            </div>

            <div className="px-6 py-4 space-y-4">
              {deployError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{deployError}</p>
                </div>
              )}
              {/* Lista de dispositivos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Dispositivos</label>
                  <button
                    onClick={selectAllOnline}
                    className="text-xs text-primary hover:underline"
                  >
                    Seleccionar todos en linea
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {devices.map(device => (
                    <label
                      key={device.thingName}
                      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                        device.online ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
                      } ${selectedDevices.includes(device.thingName) ? 'bg-primary-50' : ''}`}
                    >
                      <input
                        type="checkbox"
                        disabled={!device.online}
                        checked={selectedDevices.includes(device.thingName)}
                        onChange={() => toggleDevice(device.thingName)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {device.nickname || device.thingName}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">{device.thingName}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-400">
                          {device.firmwareVersion || '—'}
                        </span>
                        <span className={`inline-block w-2 h-2 rounded-full ${device.online ? 'bg-green-400' : 'bg-gray-300'}`} />
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {selectedDevices.length} seleccionado{selectedDevices.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Descripcion */}
              <div>
                <label className="text-sm font-medium text-gray-700">Descripcion (opcional)</label>
                <input
                  type="text"
                  value={deployDescription}
                  onChange={e => setDeployDescription(e.target.value)}
                  placeholder={`OTA ${deployFirmware.version || ''}`}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeployFirmware(null)}
                disabled={deploying}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                disabled={selectedDevices.length === 0}
                isLoading={deploying}
                onClick={handleDeploy}
              >
                <Rocket className="h-4 w-4 mr-2" />
                Crear Job OTA
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
