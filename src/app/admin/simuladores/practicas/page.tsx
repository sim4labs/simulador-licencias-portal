'use client'

import { useMemo, useState } from 'react'
import { Loader2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { usePracticeResults, usePracticeSummary } from '@/lib/admin-queries'
import { useSimulatorPCs } from '@/lib/simulator-queries'
import type { PracticeResult } from '@/lib/admin-api'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/admin/Badge'
import { PracticeDetailModal } from '@/components/admin/PracticeDetailModal'
import { PracticeSummaryPanel } from '@/components/admin/PracticeSummaryPanel'

const VEHICLE_LABELS: Record<string, string> = {
  Sedan: 'Sedán',
  Camioneta: 'SUV',
  BusPasajeros: 'Bus',
  CamionDCarga: 'Camión',
  Motocicleta: 'Moto',
  Ambulancia: 'Ambulancia',
}

const WEATHER_VARIANT: Record<string, 'warning' | 'info' | 'default'> = {
  Sol: 'warning',
  Lluvia: 'info',
  Granizo: 'default',
}

function formatLocalDate(iso: string | undefined | null): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return d.toLocaleString('es-MX', {
      month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatDistance(meters: number | undefined): string {
  if (meters === undefined || meters === null) return '—'
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`
  return `${meters} m`
}

export default function PracticasPage() {
  const [pcId, setPcId] = useState<string>('')
  const [vehicleType, setVehicleType] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [cursorStack, setCursorStack] = useState<string[]>([])
  const [selected, setSelected] = useState<PracticeResult | null>(null)

  const queryParams = useMemo(() => ({
    pcId: pcId || undefined,
    vehicleType: vehicleType || undefined,
    dateFrom: dateFrom ? new Date(dateFrom).toISOString() : undefined,
    dateTo: dateTo ? new Date(`${dateTo}T23:59:59`).toISOString() : undefined,
    cursor,
    limit: 50,
  }), [pcId, vehicleType, dateFrom, dateTo, cursor])

  // El resumen usa los mismos filtros que el listado, sin cursor/limit — el
  // backend agrega todo el rango de una vez.
  const summaryParams = useMemo(() => ({
    pcId: queryParams.pcId,
    vehicleType: queryParams.vehicleType,
    dateFrom: queryParams.dateFrom,
    dateTo: queryParams.dateTo,
  }), [queryParams.pcId, queryParams.vehicleType, queryParams.dateFrom, queryParams.dateTo])

  const practicesQuery = usePracticeResults(queryParams)
  const summaryQuery = usePracticeSummary(summaryParams)
  const pcsQuery = useSimulatorPCs()

  const simulatorNames = useMemo(() => {
    const map: Record<string, string> = {}
    for (const pc of pcsQuery.data || []) {
      if (pc.simulatorId) map[pc.simulatorId] = pc.name || pc.simulatorId
    }
    return map
  }, [pcsQuery.data])

  const items = practicesQuery.data?.items ?? []
  const nextCursor = practicesQuery.data?.nextCursor ?? null
  const error = practicesQuery.error ? (practicesQuery.error as Error).message : null

  const resetFilters = () => {
    setPcId('')
    setVehicleType('')
    setDateFrom('')
    setDateTo('')
    setCursor(undefined)
    setCursorStack([])
  }

  const goNext = () => {
    if (!nextCursor) return
    setCursorStack(prev => [...prev, cursor || ''])
    setCursor(nextCursor)
  }

  const goBack = () => {
    if (cursorStack.length === 0) return
    const prev = [...cursorStack]
    const last = prev.pop()
    setCursorStack(prev)
    setCursor(last || undefined)
  }

  const onFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v)
    setCursor(undefined)
    setCursorStack([])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Prácticas del simulador</h2>
          <p className="text-sm text-gray-500 mt-1">
            Sesiones de Modo Práctica (3 minutos · no cuentan como examen)
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => practicesQuery.refetch()}
          disabled={practicesQuery.isFetching}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${practicesQuery.isFetching ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 grid grid-cols-1 md:grid-cols-5 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">PC</label>
          <select
            className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5"
            value={pcId}
            onChange={(e) => onFilterChange(setPcId)(e.target.value)}
          >
            <option value="">Todas</option>
            {(pcsQuery.data || []).map(pc => (
              <option key={pc.pcId} value={pc.pcId}>
                {pc.name || pc.pcId}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Vehículo</label>
          <select
            className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5"
            value={vehicleType}
            onChange={(e) => onFilterChange(setVehicleType)(e.target.value)}
          >
            <option value="">Todos</option>
            {Object.entries(VEHICLE_LABELS).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
          <input
            type="date"
            className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5"
            value={dateFrom}
            onChange={(e) => onFilterChange(setDateFrom)(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
          <input
            type="date"
            className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5"
            value={dateTo}
            onChange={(e) => onFilterChange(setDateTo)(e.target.value)}
          />
        </div>
        <div className="flex items-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              // Fecha LOCAL — toISOString() daría el día UTC (mañana después
              // de las 18:00 hora centro).
              const d = new Date()
              const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
              onFilterChange(setDateFrom)(today)
              setDateTo(today)
            }}
          >
            Hoy
          </Button>
          <Button variant="outline" size="sm" onClick={resetFilters} className="flex-1">
            Limpiar
          </Button>
        </div>
      </div>

      {/* Resumen analítico del rango filtrado */}
      <PracticeSummaryPanel
        summary={summaryQuery.data?.summary}
        isLoading={summaryQuery.isLoading}
        truncated={summaryQuery.data?.truncated ?? false}
        simulatorNames={simulatorNames}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {practicesQuery.isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-1">Sin prácticas registradas</h3>
          <p className="text-sm text-gray-500">
            Cuando un ciudadano use el Modo Práctica del simulador aparecerá aquí.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">PC</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Vehículo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Transmisión</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Clima</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Escenario</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Score</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Faltas</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Distancia</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Duración</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map(p => (
                  <tr
                    key={p.practiceId}
                    onClick={() => setSelected(p)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">
                      {formatLocalDate(p.completedAt)}
                    </td>
                    <td className="px-4 py-2.5 text-gray-900 font-mono text-xs truncate max-w-[180px]">
                      {p.pcId}
                    </td>
                    <td className="px-4 py-2.5 text-gray-900">
                      {VEHICLE_LABELS[p.vehicleType] || p.vehicleType}
                    </td>
                    <td className="px-4 py-2.5 text-gray-700">
                      {p.transmission || '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={WEATHER_VARIANT[p.weather] || 'default'}>
                        {p.weather}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-gray-700">
                      {p.spawnLocation === 'random' ? 'Aleatorio' : `Ub. ${p.spawnLocation}`}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-gray-900">
                      {p.score}
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-700">
                      {p.faults.length}
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-700 whitespace-nowrap">
                      {formatDistance(p.distanceMeters)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-700">
                      {formatDuration(p.durationSeconds)}
                      {!p.completed && (
                        <span className="ml-1 text-xs text-yellow-600">·int</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              {items.length} práctica{items.length !== 1 ? 's' : ''} en esta página
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goBack}
                disabled={cursorStack.length === 0 || practicesQuery.isFetching}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goNext}
                disabled={!nextCursor || practicesQuery.isFetching}
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}

      <PracticeDetailModal practice={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
