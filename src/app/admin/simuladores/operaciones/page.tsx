'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Loader2,
  Monitor,
  RefreshCw,
  Search,
  User,
  XCircle,
} from 'lucide-react'
import type { Simulator } from '@/lib/simulator-api'
import { simulatorKeys, useSimulators, useCancelSession } from '@/lib/simulator-queries'
import { publicApi } from '@/lib/admin-api'
import { Button } from '@/components/ui/Button'

const LICENSE_TYPE_LABELS: Record<string, string> = {
  particular: 'Automovilista',
  publico: 'Servicio Público',
  motocicleta: 'Motociclista',
  carga: 'Servicio de Carga',
  // Fallbacks por si llega el id numérico del trámite
  '1': 'Servicio Público',
  '3': 'Automovilista',
  '4': 'Motociclista',
  '6': 'Servicio de Carga',
}

const LICENSE_TYPE_COLORS: Record<string, string> = {
  particular: 'bg-purple-50 text-purple-700 border-purple-200',
  publico: 'bg-amber-50 text-amber-700 border-amber-200',
  motocicleta: 'bg-blue-50 text-blue-700 border-blue-200',
  carga: 'bg-red-50 text-red-700 border-red-200',
}

const DEMO_CODES = [
  { code: '00000', nombre: 'Demo Automóvil', licenseType: 'particular' },
  { code: '11111', nombre: 'Demo Pasajeros', licenseType: 'publico' },
  { code: '22222', nombre: 'Demo Moto', licenseType: 'motocicleta' },
  { code: '33333', nombre: 'Demo Carga', licenseType: 'carga' },
]

export default function OperacionesPage() {
  const qc = useQueryClient()
  const simulatorsQuery = useSimulators({ refetchInterval: 10_000 })
  const simulators = simulatorsQuery.data ?? []
  const loading = simulatorsQuery.isLoading
  const error = simulatorsQuery.error ? simulatorsQuery.error.message : null

  const refresh = () => qc.invalidateQueries({ queryKey: simulatorKeys.simulators })

  const stats = useMemo(() => {
    const list = simulatorsQuery.data ?? []
    const pcOnline = list.filter(s => s.pcOnline).length
    const activeSessions = list.filter(s => s.activeSession).length
    return { total: list.length, pcOnline, activeSessions }
  }, [simulatorsQuery.data])

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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Operaciones
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {stats.total} simulador{stats.total !== 1 ? 'es' : ''} · {stats.pcOnline} PC{stats.pcOnline !== 1 ? 's' : ''} online · {stats.activeSessions} sesión{stats.activeSessions !== 1 ? 'es' : ''} activa{stats.activeSessions !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="h-4 w-4 mr-1" /> Actualizar
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {simulators.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Monitor className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Sin simuladores configurados</h3>
          <p className="text-sm text-gray-500">
            Crea simuladores desde <Link href="/admin/simuladores" className="text-primary underline">Simuladores</Link>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {simulators.map(sim => (
            <SimulatorOpsCard key={sim.simulatorId} simulator={sim} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DemoCodesBox />
        <TramiteSearchBox />
      </div>
    </div>
  )
}

// ─── Simulator card (PC-focused) ─────────────────────────────────────────────

function SimulatorOpsCard({ simulator: sim }: { simulator: Simulator }) {
  const cancelMut = useCancelSession()
  const hasSession = !!sim.activeSession

  const handleCancel = async () => {
    if (!sim.activeSession) return
    const ok = confirm(
      `Cancelar sesión de ${sim.activeSession.citizenName} (${sim.activeSession.tramiteId})?\n\n` +
      `Se marcará como "interrumpida". Usa esto solo si la PC se colgó o el ciudadano ya se fue.`
    )
    if (!ok) return
    await cancelMut.mutateAsync({
      sessionId: sim.activeSession.sessionId,
      reason: 'cancelled_by_operator',
    })
  }

  return (
    <div className={`rounded-xl border p-5 transition-all ${
      hasSession
        ? 'bg-gradient-to-br from-purple-50 to-white border-purple-200 shadow-sm'
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <Link href={`/admin/simuladores/${sim.simulatorId}`} className="group">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
            {sim.name}
          </h3>
          <p className="text-xs text-gray-400 font-mono">{sim.simulatorId}</p>
        </Link>
        <StatusPill online={sim.pcOnline} unassigned={!sim.pcId} />
      </div>

      {hasSession ? (
        <ActiveSessionPanel
          session={sim.activeSession!}
          onCancel={handleCancel}
          cancelling={cancelMut.isPending}
        />
      ) : (
        <div className="py-3 text-center">
          <p className="text-sm text-gray-400 italic">En espera</p>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <Monitor className="h-3 w-3" />
          {sim.pcName || 'Sin PC asignada'}
        </span>
        {sim.pcAppVersion && <span>v{sim.pcAppVersion}</span>}
      </div>
    </div>
  )
}

function StatusPill({ online, unassigned }: { online: boolean; unassigned: boolean }) {
  if (unassigned) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
        Sin PC
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
      online ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-100'
    }`}>
      <span className={`h-2 w-2 rounded-full ${online ? 'bg-green-500' : 'bg-gray-400'}`} />
      {online ? 'Online' : 'Offline'}
    </span>
  )
}

function ActiveSessionPanel({
  session,
  onCancel,
  cancelling,
}: {
  session: NonNullable<Simulator['activeSession']>
  onCancel: () => void
  cancelling: boolean
}) {
  const elapsed = useElapsedTime(session.startedAt)
  const ltColor = LICENSE_TYPE_COLORS[session.licenseType] || 'bg-gray-50 text-gray-700 border-gray-200'
  const ltLabel = LICENSE_TYPE_LABELS[session.licenseType] || session.licenseType
  const isDemo = session.tramiteId?.startsWith('TLX-DEMO')

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-purple-600" />
        <span className="text-sm font-medium text-gray-900 truncate">{session.citizenName}</span>
        {isDemo && (
          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
            Demo
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-500 font-mono">{session.tramiteId}</span>
        <span className={`border px-1.5 py-0.5 rounded text-[10px] font-medium ${ltColor}`}>
          {ltLabel}
        </span>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-sm font-mono text-gray-700 tabular-nums">{elapsed}</span>
        <button
          onClick={onCancel}
          disabled={cancelling}
          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors disabled:opacity-50 inline-flex items-center gap-1"
        >
          {cancelling
            ? <Loader2 className="h-3 w-3 animate-spin" />
            : <XCircle className="h-3 w-3" />}
          Cancelar sesión
        </button>
      </div>
    </div>
  )
}

function useElapsedTime(startedAt: string) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const diff = Math.max(0, now - new Date(startedAt).getTime())
  const m = Math.floor(diff / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ─── Demo codes box ──────────────────────────────────────────────────────────

function DemoCodesBox() {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(code)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-900 mb-1">Códigos de demostración</h2>
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          Los resultados de códigos demo <strong>NO se asocian a trámites reales</strong>.
          Úsalos solo para pruebas, capacitación o demostraciones.
        </p>
      </div>
      <div className="space-y-2">
        {DEMO_CODES.map(d => {
          const ltColor = LICENSE_TYPE_COLORS[d.licenseType] || 'bg-gray-50 text-gray-700 border-gray-200'
          const ltLabel = LICENSE_TYPE_LABELS[d.licenseType] || d.licenseType
          return (
            <div key={d.code} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3 min-w-0">
                <code className="text-lg font-mono font-bold text-gray-900">{d.code}</code>
                <span className="text-sm text-gray-600 truncate">{d.nombre}</span>
                <span className={`border px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${ltColor}`}>
                  {ltLabel}
                </span>
              </div>
              <button
                onClick={() => copy(d.code)}
                className="text-xs text-gray-500 hover:text-primary hover:bg-primary/5 px-2 py-1 rounded inline-flex items-center gap-1 transition-colors"
                title="Copiar"
              >
                {copied === d.code
                  ? <><CheckCircle2 className="h-3 w-3 text-green-600" /> Copiado</>
                  : <><Copy className="h-3 w-3" /> Copiar</>}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Tramite search box ──────────────────────────────────────────────────────

type TramiteResult = {
  tramiteId: string
  nombre?: string
  apellidoPaterno?: string
  status?: string
  licenseType?: string | number
  appointmentDate?: string
  appointmentTime?: string
  appointmentCode?: string
  simulatorPassed?: boolean
  simulatorScore?: number
}

function TramiteSearchBox() {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState<TramiteResult | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return

    setSearching(true)
    setNotFound(false)
    setErr(null)
    setResult(null)

    // Heurística: si empieza con TLX- → tramiteId; si no, appointmentCode (6 chars alfanum)
    const body = q.startsWith('TLX-')
      ? { tramiteId: q }
      : { appointmentCode: q.toUpperCase() }

    const res = await publicApi.buscarTramite(body)
    setSearching(false)

    if (res.status === 404) {
      setNotFound(true)
      return
    }
    if (res.error || !res.data) {
      setErr(res.error || 'Error al buscar')
      return
    }
    setResult(res.data as TramiteResult)
  }

  const ltKey = result?.licenseType != null ? String(result.licenseType) : ''
  const ltLabel = LICENSE_TYPE_LABELS[ltKey] || ltKey
  const ltColor = LICENSE_TYPE_COLORS[ltKey] || 'bg-gray-50 text-gray-700 border-gray-200'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-900 mb-1">Búsqueda rápida de trámite</h2>
      <p className="text-xs text-gray-500 mb-3">
        Ingresa <code className="bg-gray-100 px-1 rounded">TLX-XXXXXX</code> o código de cita de 6 caracteres
      </p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-3">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="TLX-ABC123"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
        />
        <Button type="submit" size="sm" disabled={searching || !query.trim()}>
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </form>

      {err && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          {err}
        </div>
      )}

      {notFound && (
        <div className="bg-gray-50 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm">
          Trámite no encontrado.
        </div>
      )}

      {result && (
        <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-500">{result.tramiteId}</span>
            {ltKey && (
              <span className={`border px-1.5 py-0.5 rounded text-[10px] font-medium ${ltColor}`}>
                {ltLabel}
              </span>
            )}
          </div>
          <div className="font-medium text-gray-900">
            {[result.nombre, result.apellidoPaterno].filter(Boolean).join(' ') || '(sin nombre)'}
          </div>
          {result.appointmentDate && (
            <div className="text-xs text-gray-600">
              Cita: {result.appointmentDate} {result.appointmentTime}
              {result.appointmentCode && (
                <span className="ml-2 font-mono bg-white border border-gray-200 px-1.5 py-0.5 rounded">
                  {result.appointmentCode}
                </span>
              )}
            </div>
          )}
          {result.status && (
            <div className="text-xs text-gray-500">Estado: <span className="text-gray-700 font-medium">{result.status}</span></div>
          )}
          {result.simulatorPassed != null && (
            <div className="text-xs">
              Simulador:{' '}
              <span className={result.simulatorPassed ? 'text-green-700 font-medium' : 'text-red-600 font-medium'}>
                {result.simulatorPassed ? 'Aprobado' : 'Reprobado'}
              </span>
              {typeof result.simulatorScore === 'number' && <span className="text-gray-500"> · {result.simulatorScore} pts</span>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
