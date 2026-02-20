'use client'

import { useState, useEffect, useCallback } from 'react'
import { Cpu, Wifi, WifiOff, Radio, RefreshCw, Loader2 } from 'lucide-react'
import { iotApi, type Device, type IoTStats } from '@/lib/iot-api'
import { StatCard } from '@/components/admin/StatCard'
import { SimulatorCard } from '@/components/admin/SimulatorCard'
import { EditDeviceModal } from '@/components/admin/EditDeviceModal'
import { Button } from '@/components/ui/Button'

function sortDevices(devices: Device[]): Device[] {
  return [...devices].sort((a, b) => {
    // Asignados primero, respaldos al final
    const aAssigned = a.vehicleType ? 1 : 0
    const bAssigned = b.vehicleType ? 1 : 0
    if (aAssigned !== bAssigned) return bAssigned - aAssigned

    // Dentro de cada grupo: online primero
    if (a.online !== b.online) return a.online ? -1 : 1

    // Empate: por nombre
    return (a.nickname || a.thingName).localeCompare(b.nickname || b.thingName)
  })
}

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
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)

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

  const sorted = sortDevices(devices)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando simuladores...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Simuladores</h1>
          <p className="text-sm text-gray-500 mt-1">Flota de simuladores de manejo</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Tarjetas de estadisticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Dispositivos"
          value={stats.totalDevices}
          icon={Cpu}
          variant="primary"
        />
        <StatCard
          label="En Linea"
          value={stats.online}
          icon={Wifi}
          variant="success"
        />
        <StatCard
          label="Fuera de Linea"
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

      {/* Grid de tarjetas de simuladores */}
      {sorted.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No se encontraron dispositivos IoT
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((device) => (
            <SimulatorCard
              key={device.thingName}
              device={device}
              onEdit={setEditingDevice}
            />
          ))}
        </div>
      )}

      {/* Modal de edicion */}
      <EditDeviceModal
        device={editingDevice}
        onClose={() => setEditingDevice(null)}
        onSaved={loadData}
      />
    </div>
  )
}
