'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Cpu, Wifi, WifiOff, Radio, RefreshCw, Loader2 } from 'lucide-react'
import { iotApi, type Device, type IoTStats } from '@/lib/iot-api'
import { StatCard } from '@/components/admin/StatCard'
import { DataTable } from '@/components/admin/DataTable'
import { Badge } from '@/components/admin/Badge'
import { Button } from '@/components/ui/Button'

export default function IoTDashboardPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [stats, setStats] = useState<IoTStats>({
    totalDevices: 0,
    online: 0,
    offline: 0,
    activeJobs: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    const [devicesRes, statsRes] = await Promise.all([
      iotApi.listDevices(),
      iotApi.getStats(),
    ])

    if (devicesRes.error) {
      setError(devicesRes.error)
    } else {
      setDevices(devicesRes.data || [])
      setError(null)
    }

    if (statsRes.data) setStats(statsRes.data)

    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()

    // Polling cada 10 segundos
    const interval = setInterval(loadData, 10_000)
    return () => clearInterval(interval)
  }, [loadData])

  const columns = [
    {
      key: 'thingName',
      header: 'Dispositivo',
      render: (d: Device) => (
        <div>
          <Link
            href={`/admin/iot/${d.thingName}`}
            className="font-medium text-primary hover:underline"
          >
            {d.nickname || d.thingName}
          </Link>
          <p className="text-xs text-gray-400 font-mono">{d.thingName}</p>
        </div>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (d: Device) => (
        <Badge variant={d.online ? 'success' : 'destructive'}>
          {d.online ? 'En línea' : 'Fuera de línea'}
        </Badge>
      ),
    },
    {
      key: 'firmware',
      header: 'Firmware',
      render: (d: Device) => (
        <span className="text-xs font-mono">{d.firmwareVersion || '—'}</span>
      ),
    },
    {
      key: 'rssi',
      header: 'RSSI',
      render: (d: Device) => {
        if (d.rssi == null) return <span className="text-xs text-gray-400">—</span>
        const strength =
          d.rssi >= -50 ? 'success' :
          d.rssi >= -70 ? 'warning' :
          'destructive'
        return (
          <Badge variant={strength}>{d.rssi} dBm</Badge>
        )
      },
    },
    {
      key: 'lastSeen',
      header: 'Última conexión',
      render: (d: Device) => (
        <span className="text-xs text-gray-500">
          {d.lastUpdate
            ? new Date(d.lastUpdate * 1000).toLocaleString('es-MX', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '—'}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (d: Device) => (
        <Link href={`/admin/iot/${d.thingName}`}>
          <Button variant="ghost" size="sm">
            Ver detalle
          </Button>
        </Link>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando dispositivos...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dispositivos IoT</h1>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Dispositivos"
          value={stats.totalDevices}
          icon={Cpu}
          variant="primary"
        />
        <StatCard
          label="En Línea"
          value={stats.online}
          icon={Wifi}
          variant="success"
        />
        <StatCard
          label="Fuera de Línea"
          value={stats.offline}
          icon={WifiOff}
          variant="error"
        />
        <StatCard
          label="Jobs OTA Activos"
          value={stats.activeJobs}
          icon={Radio}
          variant="info"
        />
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Tabla de dispositivos */}
      <DataTable
        columns={columns}
        data={devices}
        keyExtractor={(d) => d.thingName}
        emptyMessage="No se encontraron dispositivos IoT"
      />
    </div>
  )
}
