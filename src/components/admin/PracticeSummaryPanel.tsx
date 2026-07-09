'use client'

import { Loader2 } from 'lucide-react'
import type { PracticeSummary } from '@/lib/admin-api'

const FAULT_LABELS: Record<string, string> = {
  'speeding': 'Exceso de velocidad',
  'vehicle-collision': 'Colisión vehicular',
  'wrong-way': 'Sentido contrario',
  'obstacle-collision': 'Colisión con obstáculo',
  'sign-collision': 'Colisión con señalamiento',
  'bicycle-collision': 'Colisión con bicicleta',
  'pedestrian-hit': 'Atropello de peatón',
  'red-light': 'Semáforo en rojo',
  'dangerous-gear-change': 'Cambio D-R en movimiento',
  'gear-change-without-clutch': 'Cambio sin clutch',
  'passive-vehicle-collision': 'Colisión recibida (NPC)',
  'curb-collision': 'Colisión con banqueta',
}

// Tipos que no son faltas de conducta: se muestran en las cards, no en la
// gráfica de faltas.
const NON_CONDUCT_FAULTS = new Set(['inactivity-invalid', 'exam-end'])

const VEHICLE_LABELS: Record<string, string> = {
  Sedan: 'Sedán',
  Camioneta: 'SUV',
  BusPasajeros: 'Bus',
  CamionDCarga: 'Camión',
  Motocicleta: 'Moto',
  Ambulancia: 'Ambulancia',
}

function StatCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className="text-2xl font-bold text-gray-900 mt-0.5">{value}</div>
      {detail && <div className="text-xs text-gray-500 mt-0.5">{detail}</div>}
    </div>
  )
}

function localHourLabel(hourKey: string): string {
  // hourKey = 'YYYY-MM-DDTHH' en UTC → hora local del navegador.
  const d = new Date(`${hourKey}:00:00Z`)
  if (isNaN(d.getTime())) return hourKey
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', hour12: false }) + 'h'
}

// Con rangos de varios días los buckets por hora se vuelven ilegibles:
// se agrupa por día (local) y se etiqueta 'DD/MM'.
function buildRhythm(byHour: Array<{ hour: string; count: number }>) {
  const localDays = new Set<string>()
  for (const h of byHour) {
    const d = new Date(`${h.hour}:00:00Z`)
    if (!isNaN(d.getTime())) localDays.add(d.toLocaleDateString('es-MX'))
  }
  if (localDays.size <= 2) {
    return {
      title: 'Ritmo por hora',
      buckets: byHour.map(h => ({ key: h.hour, label: localHourLabel(h.hour), count: h.count })),
    }
  }
  const perDay = new Map<string, { label: string; count: number }>()
  for (const h of byHour) {
    const d = new Date(`${h.hour}:00:00Z`)
    if (isNaN(d.getTime())) continue
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const acc = perDay.get(key) || {
      label: d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' }),
      count: 0,
    }
    acc.count += h.count
    perDay.set(key, acc)
  }
  return {
    title: 'Ritmo por día',
    buckets: Array.from(perDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, v]) => ({ key, label: v.label, count: v.count })),
  }
}

interface Props {
  summary: PracticeSummary | undefined
  isLoading: boolean
  truncated: boolean
  simulatorNames: Record<string, string>
}

export function PracticeSummaryPanel({ summary, isLoading, truncated, simulatorNames }: Props) {
  if (isLoading && !summary) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl flex items-center justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="ml-2 text-sm text-gray-500">Calculando resumen…</span>
      </div>
    )
  }
  if (!summary || summary.total === 0) return null

  const passPct = Math.round((summary.passed / summary.total) * 100)
  const conductFaults = summary.byFault.filter(f => !NON_CONDUCT_FAULTS.has(f.type))
  const maxFaultCount = Math.max(1, ...conductFaults.map(f => f.count))
  const rhythm = buildRhythm(summary.byHour)
  const maxBucketCount = Math.max(1, ...rhythm.buckets.map(b => b.count))
  // Máximo ~10 etiquetas visibles; las barras se dibujan todas.
  const labelStep = Math.max(1, Math.ceil(rhythm.buckets.length / 10))

  return (
    <div className="space-y-4">
      {truncated && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-xs">
          El rango excede el tope de agregación (10,000 prácticas); el resumen es parcial.
          Acota las fechas para un resumen exacto.
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Prácticas" value={String(summary.total)} />
        <StatCard
          label="Score promedio"
          value={summary.scoreMean.toFixed(1)}
          detail={`mediana ${summary.scoreMedian}`}
        />
        <StatCard
          label={`Aprobadas (≥${summary.passingScore})`}
          value={`${passPct}%`}
          detail={`${summary.passed} de ${summary.total}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Por simulador */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 overflow-x-auto">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Por simulador</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500">
                <th className="text-left font-medium pb-2">Simulador</th>
                <th className="text-right font-medium pb-2">Prácticas</th>
                <th className="text-right font-medium pb-2">Media</th>
                <th className="text-right font-medium pb-2">Aprob.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {summary.bySimulator.map(s => (
                <tr key={s.simulatorId}>
                  <td className="py-1.5 text-gray-900">
                    {simulatorNames[s.simulatorId] || s.simulatorId}
                  </td>
                  <td className="py-1.5 text-right text-gray-700">{s.count}</td>
                  <td className="py-1.5 text-right font-semibold text-gray-900">{s.mean.toFixed(1)}</td>
                  <td className="py-1.5 text-right text-gray-700">{s.passed}/{s.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Faltas de conducta */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Faltas más comunes</h3>
          {conductFaults.length === 0 ? (
            <p className="text-xs text-gray-500">Sin faltas en el rango.</p>
          ) : (
            <div className="space-y-2">
              {conductFaults.slice(0, 8).map(f => (
                <div key={f.type}>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-gray-700">{FAULT_LABELS[f.type] || f.type}</span>
                    <span className="text-gray-500 whitespace-nowrap ml-2">
                      {f.count} · {f.exams} práctica{f.exams !== 1 ? 's' : ''} · −{f.points} pts
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full mt-1">
                    <div
                      className="h-1.5 bg-primary rounded-full"
                      style={{ width: `${Math.max(4, Math.round((f.count / maxFaultCount) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Por vehículo + ritmo */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 overflow-x-auto">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Por vehículo</h3>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-gray-100">
                {summary.byVehicle.map(v => (
                  <tr key={v.vehicleType}>
                    <td className="py-1.5 text-gray-900">{VEHICLE_LABELS[v.vehicleType] || v.vehicleType}</td>
                    <td className="py-1.5 text-right text-gray-700">{v.count}</td>
                    <td className="py-1.5 text-right font-semibold text-gray-900">{v.mean.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{rhythm.title}</h3>
            <div className="flex items-end gap-px h-16">
              {rhythm.buckets.map((b, i) => (
                <div key={b.key} className="flex-1 flex flex-col items-center min-w-0">
                  <div
                    className="w-full bg-primary/70 rounded-sm"
                    style={{ height: `${Math.max(6, Math.round((b.count / maxBucketCount) * 100))}%` }}
                    title={`${b.label}: ${b.count}`}
                  />
                  <span className="text-[10px] text-gray-500 mt-1 truncate w-full text-center">
                    {i % labelStep === 0 ? b.label : ' '}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
