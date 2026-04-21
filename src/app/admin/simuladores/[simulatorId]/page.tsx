'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Monitor, Cpu, Save } from 'lucide-react'
import { simulatorApi, type UpdateSimulatorRequest } from '@/lib/simulator-api'
import { simulatorKeys, useSimulator, useSimulatorPCs, useSimulatorStats } from '@/lib/simulator-queries'
import { type VehicleType } from '@/lib/iot-api'
import { useIotDevices } from '@/lib/iot-queries'
import { Button } from '@/components/ui/Button'
import { SimulatorSessionsTable } from '@/components/admin/SimulatorSessionsTable'
import Link from 'next/link'

const vehicleTypeLabels: Record<string, string> = {
  passenger_bus: 'Camion Pasajeros',
  cargo_truck: 'Camion Carga',
  car: 'Automovil',
  motorcycle: 'Motocicleta',
}

export default function SimulatorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const simulatorId = params.simulatorId as string
  const qc = useQueryClient()

  const simulatorQuery = useSimulator(simulatorId)
  const pcsQuery = useSimulatorPCs()
  const devicesQuery = useIotDevices()
  const statsQuery = useSimulatorStats(simulatorId)
  const simulator = simulatorQuery.data ?? null
  const pcs = pcsQuery.data ?? []
  const devices = devicesQuery.data ?? []
  const stats = statsQuery.data ?? null
  const loading = simulatorQuery.isLoading
  const [saving, setSaving] = useState(false)

  const [activeTab, setActiveTab] = useState<'config' | 'sessions'>('config')

  // Editable fields
  const [name, setName] = useState('')
  const [vehicleType, setVehicleType] = useState('')
  const [selectedPcId, setSelectedPcId] = useState('')
  const [selectedDof, setSelectedDof] = useState('')

  useEffect(() => {
    if (simulatorQuery.isError) {
      router.push('/admin/simuladores')
      return
    }
    if (simulator) {
      setName(simulator.name)
      setVehicleType(simulator.vehicleType || '')
      setSelectedPcId(simulator.pcId || '')
      setSelectedDof(simulator.dofThingName || '')
    }
  }, [simulator, simulatorQuery.isError, router])

  const loadData = () => {
    qc.invalidateQueries({ queryKey: simulatorKeys.simulator(simulatorId) })
    qc.invalidateQueries({ queryKey: simulatorKeys.simulatorStats(simulatorId) })
    qc.invalidateQueries({ queryKey: simulatorKeys.pcs })
  }

  const handleSave = async () => {
    setSaving(true)
    const data: UpdateSimulatorRequest = {
      name: name.trim(),
      vehicleType: (vehicleType || null) as VehicleType | null,
      pcId: selectedPcId || null,
      dofThingName: selectedDof || null,
    }
    await simulatorApi.updateSimulator(simulatorId, data)
    setSaving(false)
    loadData()
  }

  if (loading || !simulator) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Available PCs: unassigned or assigned to this simulator
  const availablePcs = pcs.filter(pc => !pc.simulatorId || pc.simulatorId === simulatorId)
  // Available DOFs: all devices (IoT things)
  const availableDofs = devices

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/simuladores" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{simulator.name}</h1>
          <p className="text-sm text-gray-400">{simulatorId}</p>
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Sesiones" value={stats.totalSessions} />
          <StatCard label="Aprobados" value={`${stats.passRate}%`} />
          <StatCard label="Citas hoy" value={stats.todayAppointments} />
          <StatCard label="Score prom." value={stats.avgScore} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'config' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Configuracion
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'sessions' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Sesiones
        </button>
      </div>

      {activeTab === 'sessions' ? (
        <SimulatorSessionsTable simulatorId={simulatorId} />
      ) : (
      <>
      {/* Configuration */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Configuracion</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de vehiculo</label>
            <select
              value={vehicleType}
              onChange={e => setVehicleType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            >
              <option value="">Sin asignar</option>
              <option value="car">Automovil</option>
              <option value="motorcycle">Motocicleta</option>
              <option value="passenger_bus">Camion Pasajeros</option>
              <option value="cargo_truck">Camion Carga</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Monitor className="h-4 w-4 inline mr-1" /> PC asignada
            </label>
            <select
              value={selectedPcId}
              onChange={e => setSelectedPcId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            >
              <option value="">Sin asignar</option>
              {availablePcs.map(pc => (
                <option key={pc.pcId} value={pc.pcId}>
                  {pc.name || pc.pcId.slice(0, 12) + '...'} {pc.online ? '(online)' : '(offline)'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Cpu className="h-4 w-4 inline mr-1" /> Controlador 2DOF
            </label>
            <select
              value={selectedDof}
              onChange={e => setSelectedDof(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            >
              <option value="">Sin asignar</option>
              {availableDofs.map(d => (
                <option key={d.thingName} value={d.thingName}>
                  {d.nickname || d.thingName} {d.online ? '(online)' : '(offline)'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button size="sm" onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
            Guardar
          </Button>
        </div>
      </div>

      {/* Device status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PC info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Monitor className="h-4 w-4 text-gray-400" /> PC
          </h3>
          {simulator.pc ? (
            <div className="space-y-2 text-sm">
              <InfoRow label="Nombre" value={simulator.pc.name} />
              <InfoRow label="ID" value={simulator.pc.pcId.slice(0, 16) + '...'} />
              <InfoRow label="Version" value={simulator.pc.appVersion || '-'} />
              <InfoRow label="IP" value={simulator.pc.ip || '-'} />
              <InfoRow label="Estado" value={simulator.pc.online ? 'Online' : 'Offline'} />
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">Sin PC asignada</p>
          )}
        </div>

        {/* DOF info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-gray-400" /> Controlador 2DOF
          </h3>
          {simulator.dof ? (
            <div className="space-y-2 text-sm">
              <InfoRow label="Thing" value={simulator.dof.thingName} />
              <InfoRow label="Estado" value={simulator.dof.online ? 'Online' : 'Offline'} />
              {simulator.dof.shadow && (
                <>
                  <InfoRow label="Firmware" value={String((simulator.dof.shadow as any).firmware || '-')} />
                  <InfoRow label="IP" value={String((simulator.dof.shadow as any).ip || '-')} />
                  <InfoRow label="RSSI" value={`${(simulator.dof.shadow as any).rssi ?? '-'} dBm`} />
                </>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">Sin controlador asignado</p>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-mono text-xs">{value}</span>
    </div>
  )
}
