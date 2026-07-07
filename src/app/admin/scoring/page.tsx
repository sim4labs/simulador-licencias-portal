'use client'

import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/admin-api'
import { adminKeys, useAdminScoringConfig } from '@/lib/admin-queries'
import type { ScoringConfig } from '@/lib/admin-api'
import { Button } from '@/components/ui/Button'
import { Save, RefreshCw, AlertTriangle } from 'lucide-react'

const DEFAULT_PENALTIES: ScoringConfig['penalties'] = {
  speeding: 5,
  pedestrianHit: 25,
  bicycleCollision: 15,
  vehicleCollision: 10,
  passiveVehicleCollision: 0,
  signCollision: 5,
  obstacleCollision: 5,
  curbCollision: 5,
  redLight: 20,
  wrongWay: 15,
  dangerousGearChange: 20,
  gearChangeWithoutClutch: 5,
}

const DEFAULT_THRESHOLDS: ScoringConfig['gradeThresholds'] = {
  apto: 90,
  aptoCondicionado: 80,
  aptoReentrenamiento: 70,
}

const DEFAULTS: ScoringConfig = {
  penalties: DEFAULT_PENALTIES,
  passingScore: 70,
  gradeThresholds: DEFAULT_THRESHOLDS,
  examDurationSeconds: 300,
  minValidDistanceMeters: 200,
  wrongWaySustainedSeconds: 3,
  wrongWayDotThreshold: -0.3,
  wrongWayMinSpeedKmh: 5,
  pointsOfInterest: {
    minRequired: 0,
    consequence: 'deduct',
    deductPoints: 10,
  },
  trafficMaxVehicles: 100,
  trafficZoneMultiplier: 1,
}

const PENALTY_LABELS: Record<string, { label: string; severity: string; hint?: string }> = {
  pedestrianHit: { label: 'Atropello de peatón', severity: 'critical' },
  bicycleCollision: { label: 'Colisión con bicicleta', severity: 'major' },
  vehicleCollision: { label: 'Colisión vehicular', severity: 'major' },
  passiveVehicleCollision: {
    label: 'Colisión pasiva (lo impactaron)',
    severity: 'info',
    hint: 'Cuando un NPC embiste al alumno por atrás. Default 0: solo se registra para el examinador, no descuenta puntos.',
  },
  redLight: { label: 'Semáforo en rojo', severity: 'major' },
  wrongWay: { label: 'Sentido contrario', severity: 'major' },
  dangerousGearChange: { label: 'Cambio de marcha peligroso', severity: 'major' },
  speeding: { label: 'Exceso de velocidad', severity: 'minor' },
  signCollision: { label: 'Colisión con señalamiento', severity: 'minor' },
  obstacleCollision: { label: 'Colisión con obstáculo', severity: 'minor' },
  curbCollision: { label: 'Golpe a la banqueta', severity: 'minor' },
  gearChangeWithoutClutch: {
    label: 'Cambio de marcha sin clutch (rechino)',
    severity: 'minor',
    hint: 'Solo aplica en exámenes de transmisión manual con volante G923 PS.',
  },
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  major: 'bg-amber-100 text-amber-700 border-amber-200',
  minor: 'bg-blue-100 text-blue-700 border-blue-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
}

export default function ScoringPage() {
  const qc = useQueryClient()
  const scoringQuery = useAdminScoringConfig()
  const [config, setConfig] = useState<ScoringConfig>(DEFAULTS)
  // Drafts en string para los campos con decimales/negativos: un input
  // controlado con parseFloat directo pelea con el tecleo intermedio
  // ("-", "-0", "2.") y no deja escribir "-0.3" a mano.
  const [sustainedDraft, setSustainedDraft] = useState(String(DEFAULTS.wrongWaySustainedSeconds))
  const [dotDraft, setDotDraft] = useState(String(DEFAULTS.wrongWayDotThreshold))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(scoringQuery.error?.message ?? null)
  const [lastSync, setLastSync] = useState<string | null>(null)

  const loading = scoringQuery.isLoading

  useEffect(() => {
    if (scoringQuery.data) {
      const item = scoringQuery.data
      setConfig({
        ...DEFAULTS,
        ...item,
        penalties: { ...DEFAULT_PENALTIES, ...(item.penalties ?? {}) },
        gradeThresholds: { ...DEFAULT_THRESHOLDS, ...(item.gradeThresholds ?? {}) },
        pointsOfInterest: { ...DEFAULTS.pointsOfInterest, ...(item.pointsOfInterest ?? {}) },
      })
      setSustainedDraft(String(item.wrongWaySustainedSeconds ?? DEFAULTS.wrongWaySustainedSeconds))
      setDotDraft(String(item.wrongWayDotThreshold ?? DEFAULTS.wrongWayDotThreshold))
      setLastSync(item.updatedAt ?? null)
    }
  }, [scoringQuery.data])

  const load = () => qc.invalidateQueries({ queryKey: adminKeys.scoringConfig })

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)
    const { error: err } = await adminApi.updateScoringConfig(config)
    if (err) {
      setError(err)
    } else {
      setSaved(true)
      await load()
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  const setPenalty = (key: string, value: number) => {
    setConfig(prev => ({
      ...prev,
      penalties: { ...prev.penalties, [key]: value },
    }))
  }

  const setThreshold = (key: string, value: number) => {
    setConfig(prev => ({
      ...prev,
      gradeThresholds: { ...prev.gradeThresholds, [key]: value },
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calificación del Simulador</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configuración de penalizaciones, umbrales de aprobación y duración del examen.
            {lastSync && (
              <span className="ml-2 text-gray-400">
                Última actualización: {new Date(lastSync).toLocaleString('es-MX')}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={load} disabled={saving}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Recargar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />
            {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Penalizaciones */}
        <div className="bg-white/60 backdrop-blur-sm border border-white/80 shadow-lg rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Penalizaciones por infracción</h2>
          <p className="text-xs text-gray-500 mb-4">Puntos que se restan por cada tipo de infracción durante el examen.</p>
          <div className="space-y-3">
            {Object.entries(PENALTY_LABELS).map(([key, { label, severity, hint }]) => (
              <div key={key} className="flex items-center gap-3" title={hint}>
                <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${SEVERITY_COLORS[severity]}`}>
                  {severity === 'critical' ? 'CRIT' : severity === 'major' ? 'MAJ' : 'MIN'}
                </span>
                <label className="flex-1 text-sm text-gray-700">{label}</label>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-400">-</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={config.penalties[key as keyof typeof config.penalties]}
                    onChange={e => setPenalty(key, parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="text-sm text-gray-400">pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Umbrales y Duración */}
        <div className="space-y-6">
          {/* Calificación mínima */}
          <div className="bg-white/60 backdrop-blur-sm border border-white/80 shadow-lg rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Calificación mínima aprobatoria</h2>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={100}
                value={config.passingScore}
                onChange={e => setConfig(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                className="flex-1 accent-primary"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={config.passingScore}
                  onChange={e => setConfig(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 0 }))}
                  className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <span className="text-sm text-gray-400">pts</span>
              </div>
            </div>
          </div>

          {/* Umbrales de grado */}
          <div className="bg-white/60 backdrop-blur-sm border border-white/80 shadow-lg rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Umbrales de resultado</h2>
            <p className="text-xs text-gray-500 mb-4">Rangos de puntuación para cada resultado del examen.</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-36 text-sm font-medium text-green-700">APTO</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={config.gradeThresholds.apto}
                  onChange={e => setThreshold('apto', parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <span className="text-sm text-gray-500">- 100 pts</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-36 text-sm font-medium text-amber-600">APTO CONDICIONADO</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={config.gradeThresholds.aptoCondicionado}
                  onChange={e => setThreshold('aptoCondicionado', parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <span className="text-sm text-gray-500">- {config.gradeThresholds.apto - 1} pts</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-36 text-sm font-medium text-amber-500">REENTRENAMIENTO</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={config.gradeThresholds.aptoReentrenamiento}
                  onChange={e => setThreshold('aptoReentrenamiento', parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <span className="text-sm text-gray-500">- {config.gradeThresholds.aptoCondicionado - 1} pts</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-36 text-sm font-medium text-red-600">NO APTO</span>
                <span className="text-sm text-gray-500">0 - {config.gradeThresholds.aptoReentrenamiento - 1} pts</span>
              </div>
            </div>
          </div>

          {/* Duración */}
          <div className="bg-white/60 backdrop-blur-sm border border-white/80 shadow-lg rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Duración del examen</h2>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={config.examDurationSeconds}
                onChange={e => setConfig(prev => ({ ...prev, examDurationSeconds: parseInt(e.target.value) || 0 }))}
                className="w-24 px-2 py-1 text-sm text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <span className="text-sm text-gray-500">
                segundos ({Math.floor(config.examDurationSeconds / 60)}:{String(config.examDurationSeconds % 60).padStart(2, '0')} min)
              </span>
            </div>
          </div>

          {/* Distancia mínima válida */}
          <div className="bg-white/60 backdrop-blur-sm border border-white/80 shadow-lg rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Distancia mínima válida</h2>
            <p className="text-xs text-gray-500 mb-4">
              Si el alumno recorre menos que este umbral durante el examen, Unity reporta NO APTO sin
              importar el score. Evita el caso de dejar el coche parado y aprobar con 100. Poner 0 desactiva el check.
            </p>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min={0}
                max={5000}
                step={50}
                value={config.minValidDistanceMeters}
                onChange={e => setConfig(prev => ({ ...prev, minValidDistanceMeters: parseInt(e.target.value) || 0 }))}
                className="w-24 px-2 py-1 text-sm text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <span className="text-sm text-gray-500">
                metros{config.minValidDistanceMeters >= 1000
                  ? ` (${(config.minValidDistanceMeters / 1000).toFixed(2)} km)`
                  : ''}
              </span>
            </div>
          </div>

          {/* Tráfico */}
          <div className="bg-white/60 backdrop-blur-sm border border-white/80 shadow-lg rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tráfico</h2>
            <p className="text-xs text-gray-500 mb-4">
              Controla la cantidad de vehículos de tráfico en las escenas de examen. El tope global
              limita el total de vehículos simultáneos; el multiplicador escala la densidad de cada
              zona del mapa (por ejemplo 0.5 reduce la carretera de 40 a 20 vehículos). Los cambios
              aplican al siguiente examen que inicie cada simulador.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min={0}
                  max={200}
                  step={5}
                  value={config.trafficMaxVehicles}
                  onChange={e => setConfig(prev => ({ ...prev, trafficMaxVehicles: parseInt(e.target.value) || 0 }))}
                  className="w-24 px-2 py-1 text-sm text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <span className="text-sm text-gray-500">
                  tope global de vehículos simultáneos (default 100)
                </span>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min={0}
                  max={2}
                  step={0.1}
                  value={config.trafficZoneMultiplier}
                  onChange={e => setConfig(prev => ({ ...prev, trafficZoneMultiplier: parseFloat(e.target.value) || 0 }))}
                  className="w-24 px-2 py-1 text-sm text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <span className="text-sm text-gray-500">
                  multiplicador por zona (1.0 = normal, 0.5 = mitad de tráfico)
                </span>
              </div>
            </div>
          </div>

          {/* Puntos de interés (estrellas) */}
          <div className="bg-white/60 backdrop-blur-sm border border-white/80 shadow-lg rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Puntos de interés (estrellas)</h2>
            <p className="text-xs text-gray-500 mb-4">
              Estrellas en la ruta que el alumno debe recolectar durante el examen. Si la escena
              tiene menos estrellas que el mínimo, se exige el total de la escena. Poner 0 desactiva la regla.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="flex-1 text-sm text-gray-700">Mínimo a recolectar</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={config.pointsOfInterest.minRequired}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    pointsOfInterest: { ...prev.pointsOfInterest, minRequired: parseInt(e.target.value) || 0 },
                  }))}
                  className="w-20 px-2 py-1 text-sm text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <span className="text-sm text-gray-400 w-16">estrellas</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex-1 text-sm text-gray-700">Consecuencia al no alcanzarlo</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="poiConsequence"
                      checked={config.pointsOfInterest.consequence === 'deduct'}
                      onChange={() => setConfig(prev => ({
                        ...prev,
                        pointsOfInterest: { ...prev.pointsOfInterest, consequence: 'deduct' },
                      }))}
                      className="accent-primary"
                    />
                    Deducir puntos
                  </label>
                  <label className="flex items-center gap-1.5 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="poiConsequence"
                      checked={config.pointsOfInterest.consequence === 'fail'}
                      onChange={() => setConfig(prev => ({
                        ...prev,
                        pointsOfInterest: { ...prev.pointsOfInterest, consequence: 'fail' },
                      }))}
                      className="accent-primary"
                    />
                    Reprobar examen
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex-1 text-sm text-gray-700">Puntos a deducir</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  disabled={config.pointsOfInterest.consequence === 'fail'}
                  value={config.pointsOfInterest.deductPoints}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    pointsOfInterest: { ...prev.pointsOfInterest, deductPoints: parseInt(e.target.value) || 0 },
                  }))}
                  className="w-20 px-2 py-1 text-sm text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:bg-gray-50"
                />
                <span className="text-sm text-gray-400 w-16">pts</span>
              </div>
            </div>
          </div>

          {/* Sentido contrario */}
          <div className="bg-white/60 backdrop-blur-sm border border-white/80 shadow-lg rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Detección de sentido contrario</h2>
            <p className="text-xs text-gray-500 mb-4">
              El alumno debe permanecer en el carril contrario el tiempo indicado antes de que se
              marque la infracción — evita falsos positivos en vueltas cerradas e intersecciones.
              Poner 0 segundos vuelve al comportamiento instantáneo.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="flex-1 text-sm text-gray-700">Segundos sostenidos</label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  step={0.5}
                  value={sustainedDraft}
                  onChange={e => {
                    setSustainedDraft(e.target.value)
                    const parsed = parseFloat(e.target.value)
                    if (Number.isFinite(parsed)) setConfig(prev => ({ ...prev, wrongWaySustainedSeconds: parsed }))
                  }}
                  onBlur={() => setSustainedDraft(String(config.wrongWaySustainedSeconds))}
                  className="w-20 px-2 py-1 text-sm text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <span className="text-sm text-gray-400 w-10">seg</span>
              </div>
              <div
                className="flex items-center gap-3"
                title="Qué tan opuesta debe ser la dirección del vehículo respecto al carril: -1 = totalmente de frente al tráfico, 0 = basta ir perpendicular. Más cerca de 0 = detección más agresiva."
              >
                <label className="flex-1 text-sm text-gray-700">Umbral de dirección (dot)</label>
                <input
                  type="number"
                  min={-1}
                  max={0}
                  step={0.05}
                  value={dotDraft}
                  onChange={e => {
                    setDotDraft(e.target.value)
                    const parsed = parseFloat(e.target.value)
                    if (Number.isFinite(parsed)) setConfig(prev => ({ ...prev, wrongWayDotThreshold: parsed }))
                  }}
                  onBlur={() => setDotDraft(String(config.wrongWayDotThreshold))}
                  className="w-20 px-2 py-1 text-sm text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <span className="text-sm text-gray-400 w-10" />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex-1 text-sm text-gray-700">Velocidad mínima para evaluar</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  step={1}
                  value={config.wrongWayMinSpeedKmh}
                  onChange={e => setConfig(prev => ({ ...prev, wrongWayMinSpeedKmh: parseFloat(e.target.value) || 0 }))}
                  className="w-20 px-2 py-1 text-sm text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <span className="text-sm text-gray-400 w-10">km/h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
