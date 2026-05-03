'use client'

import { Modal } from './Modal'
import { Badge } from './Badge'
import type { PracticeResult } from '@/lib/admin-api'
import { useAdminScoringConfig } from '@/lib/admin-queries'

interface PracticeDetailModalProps {
  practice: PracticeResult | null
  onClose: () => void
}

const SEVERITY_VARIANT: Record<string, 'destructive' | 'warning' | 'info' | 'default'> = {
  critical: 'destructive',
  major: 'destructive',
  minor: 'warning',
  info: 'info',
}

function formatTime(secondsFromStart: number): string {
  const m = Math.floor(secondsFromStart / 60)
  const s = secondsFromStart % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatLocalDate(iso: string | undefined | null): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return d.toLocaleString('es-MX', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
  } catch {
    return iso
  }
}

function formatDistance(meters: number | undefined): string {
  if (meters === undefined || meters === null) return '—'
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`
  return `${meters} m`
}

export function PracticeDetailModal({ practice, onClose }: PracticeDetailModalProps) {
  const scoringQuery = useAdminScoringConfig()
  if (!practice) return null

  const totalDeducted = practice.faults.reduce((sum, f) => sum + f.deduction, 0)
  // Si el build del PC reportó distancia (>=1.3.8), comparamos contra el umbral
  // configurado para mostrar el flag "inválida por inactividad". Si distanceMeters
  // es undefined (build viejo), no asumimos inactividad.
  const minDistance = scoringQuery.data?.minValidDistanceMeters ?? 200
  const insufficientMovement = typeof practice.distanceMeters === 'number'
    && practice.distanceMeters < minDistance

  return (
    <Modal
      open={!!practice}
      onClose={onClose}
      title="Detalle de Práctica"
      className="max-w-3xl"
    >
      <div className="overflow-y-auto px-6 py-4 space-y-6">
        {/* Header con badge "Modo Práctica" */}
        <div className="flex items-center justify-between gap-3">
          <Badge variant="secondary">Modo Práctica</Badge>
          <span className="text-xs text-gray-400 font-mono truncate">
            {practice.practiceId}
          </span>
        </div>

        {/* Score grande */}
        <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg px-4 py-3">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Score</div>
            <div className="text-3xl font-bold text-primary-700">{practice.score}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Infracciones</div>
            <div className="text-3xl font-bold text-gray-900">{practice.faults.length}</div>
            {totalDeducted > 0 && (
              <div className="text-xs text-gray-500">-{totalDeducted} pts</div>
            )}
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Duración</div>
            <div className="text-3xl font-bold text-gray-900">
              {Math.floor(practice.durationSeconds / 60)}:{(practice.durationSeconds % 60).toString().padStart(2, '0')}
            </div>
            {!practice.completed && (
              <div className="text-xs text-yellow-600">Interrumpido</div>
            )}
          </div>
        </div>

        {/* Detalles */}
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-gray-500">PC</dt>
            <dd className="font-mono text-xs text-gray-900 break-all">{practice.pcId}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Simulador</dt>
            <dd className="text-gray-900">{practice.simulatorId || '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Vehículo</dt>
            <dd className="text-gray-900">{practice.vehicleType}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Transmisión</dt>
            <dd className="text-gray-900">{practice.transmission || '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Clima</dt>
            <dd className="text-gray-900">{practice.weather}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Escenario</dt>
            <dd className="text-gray-900">
              {practice.spawnLocation === 'random' ? 'Aleatorio' : `Ubicación ${practice.spawnLocation}`}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Inicio</dt>
            <dd className="text-gray-900">{formatLocalDate(practice.startedAt)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Fin</dt>
            <dd className="text-gray-900">{formatLocalDate(practice.completedAt)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Distancia recorrida</dt>
            <dd className={insufficientMovement ? 'font-semibold text-red-600' : 'text-gray-900'}>
              {formatDistance(practice.distanceMeters)}
              {insufficientMovement && (
                <span className="block text-xs text-red-600 font-normal mt-0.5">
                  Bajo el umbral mínimo ({minDistance} m) — sesión inválida por inactividad
                </span>
              )}
            </dd>
          </div>
        </dl>

        {/* Lista de infracciones */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">
            Infracciones ({practice.faults.length})
          </h4>
          {practice.faults.length === 0 ? (
            <div className="text-sm text-gray-500 italic">Sin infracciones</div>
          ) : (
            <ul className="space-y-2">
              {practice.faults.map((f, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 bg-white border border-gray-200 rounded-md px-3 py-2 text-sm"
                >
                  <span className="font-mono text-xs text-gray-500 w-12 shrink-0 mt-0.5">
                    {formatTime(f.secondsFromStart)}
                  </span>
                  <Badge variant={SEVERITY_VARIANT[f.severity] || 'default'}>
                    {f.severity}
                  </Badge>
                  <span className="flex-1 text-gray-900">{f.description}</span>
                  <span className="text-xs text-red-600 font-semibold shrink-0">
                    -{f.deduction}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  )
}
