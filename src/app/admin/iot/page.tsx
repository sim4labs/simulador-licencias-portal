'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { RefreshCw, Loader2 } from 'lucide-react'
import { iotApi, type Device } from '@/lib/iot-api'
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

const vehicleTypeLabels: Record<string, string> = {
  passenger_bus: 'Camión Pasajeros',
  cargo_truck: 'Camión Carga',
  car: 'Automóvil',
  motorcycle: 'Motocicleta',
}

export default function IoTDashboardPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const loadData = useCallback(async () => {
    const devicesRes = await iotApi.listDevices()

    if (devicesRes.error) {
      setError(devicesRes.error)
    } else {
      setDevices(devicesRes.data || [])
      setError(null)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()

    // Polling cada 10 segundos
    const interval = setInterval(loadData, 10_000)
    return () => clearInterval(interval)
  }, [loadData])

  const totalDevices = devices.length
  const onlineCount = devices.filter(d => d.online).length
  const offlineCount = totalDevices - onlineCount

  const filtered = useMemo(() => {
    return devices.filter(d => {
      if (statusFilter === 'online' && !d.online) return false
      if (statusFilter === 'offline' && d.online) return false
      if (typeFilter === 'unassigned' && d.vehicleType) return false
      if (typeFilter !== 'all' && typeFilter !== 'unassigned' && d.vehicleType !== typeFilter) return false
      return true
    })
  }, [devices, statusFilter, typeFilter])

  const sorted = sortDevices(filtered)

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
      </div>

      {/* Barra de resumen + filtros */}
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-gray-600 mr-auto">
            <span className="font-semibold text-gray-900">{totalDevices}</span> dispositivos
            {' · '}
            <span className="font-semibold text-emerald-600">{onlineCount}</span> en línea
            {' · '}
            <span className="font-semibold text-gray-400">{offlineCount}</span> fuera de línea
          </p>
          <select
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="online">En línea</option>
            <option value="offline">Fuera de línea</option>
          </select>
          <select
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="all">Todos los tipos</option>
            {Object.entries(vehicleTypeLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
            <option value="unassigned">Sin asignar</option>
          </select>
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
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

      {/* Grid de tarjetas de simuladores */}
      {sorted.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {devices.length === 0
            ? 'No se encontraron dispositivos IoT'
            : 'Ningún dispositivo coincide con los filtros seleccionados'}
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

      {/* Modal de edición */}
      <EditDeviceModal
        device={editingDevice}
        onClose={() => setEditingDevice(null)}
        onSaved={loadData}
      />
    </div>
  )
}
