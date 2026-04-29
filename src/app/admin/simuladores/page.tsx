'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw, Loader2, Plus, Box, Monitor, Cpu, Trash2 } from 'lucide-react'
import { simulatorApi, type Simulator, type CreateSimulatorRequest } from '@/lib/simulator-api'
import { simulatorKeys, useSimulators } from '@/lib/simulator-queries'
import type { VehicleType } from '@/lib/iot-api'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

const vehicleTypeLabels: Record<string, string> = {
  passenger_bus: 'Camion Pasajeros',
  cargo_truck: 'Camion Carga',
  car: 'Automovil',
  motorcycle: 'Motocicleta',
}

export default function SimuladoresPage() {
  const qc = useQueryClient()
  const simulatorsQuery = useSimulators()
  const simulators = simulatorsQuery.data ?? []
  const loading = simulatorsQuery.isLoading
  const error = simulatorsQuery.error ? simulatorsQuery.error.message : null
  const [showCreateModal, setShowCreateModal] = useState(false)

  const loadData = () => qc.invalidateQueries({ queryKey: simulatorKeys.simulators })

  const handleDelete = async (simulatorId: string) => {
    if (!confirm(`Eliminar simulador ${simulatorId}?`)) return
    await simulatorApi.deleteSimulator(simulatorId)
    loadData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Simuladores</h1>
          <p className="text-sm text-gray-500 mt-1">
            {simulators.length} simulador{simulators.length !== 1 ? 'es' : ''} configurado{simulators.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-1" /> Actualizar
          </Button>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-1" /> Crear Simulador
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {simulators.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Box className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Sin simuladores</h3>
          <p className="text-sm text-gray-500 mb-4">Crea tu primer simulador para agrupar una PC y un controlador 2DOF</p>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-1" /> Crear Simulador
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {simulators.map(sim => (
            <SimulatorCard key={sim.simulatorId} simulator={sim} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateSimulatorModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { setShowCreateModal(false); loadData() }}
        />
      )}
    </div>
  )
}

function SimulatorCard({ simulator: sim, onDelete }: { simulator: Simulator; onDelete: (id: string) => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <Link href={`/admin/simuladores/${sim.simulatorId}`} className="group">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
            {sim.name}
          </h3>
          <p className="text-xs text-gray-400">{sim.simulatorId}</p>
        </Link>
        <div className="flex items-center gap-2">
          {sim.vehicleType && (
            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
              {vehicleTypeLabels[sim.vehicleType] || sim.vehicleType}
            </span>
          )}
          <button
            onClick={() => onDelete(sim.simulatorId)}
            className="text-gray-300 hover:text-red-500 transition-colors p-1"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <DeviceRow
          icon={<Monitor className="h-4 w-4" />}
          label="PC"
          name={sim.pcName}
          online={sim.pcOnline}
          unassigned={!sim.pcId}
          version={sim.pcAppVersion ?? null}
        />
        <DeviceRow
          icon={<Cpu className="h-4 w-4" />}
          label="2DOF"
          name={sim.dofThingName}
          online={sim.dofOnline}
          unassigned={!sim.dofThingName}
        />
      </div>
    </div>
  )
}

function DeviceRow({ icon, label, name, online, unassigned, version }: {
  icon: React.ReactNode
  label: string
  name: string | null
  online: boolean
  unassigned: boolean
  version?: string | null
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-400">{icon}</span>
      <span className="text-gray-500 w-10">{label}:</span>
      {unassigned ? (
        <span className="text-gray-300 italic">Sin asignar</span>
      ) : (
        <>
          <span className={`h-2 w-2 rounded-full ${online ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-gray-700 truncate">{name}</span>
          {version && (
            <span className="ml-auto text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded shrink-0">
              v{version}
            </span>
          )}
        </>
      )}
    </div>
  )
}

function CreateSimulatorModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('')
  const [vehicleType, setVehicleType] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setSaving(true)
    const data: CreateSimulatorRequest = {
      name: name.trim(),
      vehicleType: (vehicleType || null) as VehicleType | null,
    }
    const res = await simulatorApi.createSimulator(data)
    setSaving(false)

    if (!res.error) {
      onCreated()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Crear Simulador</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Simulador 1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              autoFocus
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
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={!name.trim() || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
              Crear
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
