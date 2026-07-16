'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import QRCode from 'qrcode'
import { kioskApi } from '@/lib/citizen-api'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

type DisplayState = 'loading' | 'qr' | 'verifying' | 'verified' | 'failed'

const POLL_INTERVAL = 2000  // 2 segundos
const SESSION_LIFETIME = 25 * 60 * 1000  // renovar a 25 min (TTL backend = 30 min)
const RESET_DELAY = 10000  // 10 seg antes de reiniciar tras verified/failed
const MAX_POLL_GAP_MS = 30 * 1000  // si pasaron 30s sin poll exitoso, autocurar
const KIOSK_ID_KEY = 'kioskId'

function getOrCreateKioskId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(KIOSK_ID_KEY)
  if (!id) {
    id = (crypto.randomUUID?.() ?? `k-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`)
    localStorage.setItem(KIOSK_ID_KEY, id)
  }
  return id
}

export default function KioskPage() {
  const [displayState, setDisplayState] = useState<DisplayState>('loading')
  const [qrUrl, setQrUrl] = useState('')
  const [citizenName, setCitizenName] = useState('')
  const [failReason, setFailReason] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [degraded, setDegraded] = useState(false)

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const renewRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const healthRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Guard contra createSession concurrente (visibilitychange/online +
  // setTimeout de renovación pueden dispararse a la vez tras un alt-tab largo).
  const isCreatingRef = useRef(false)
  // Sid actual para que los handlers de visibilitychange/online puedan forzar
  // un poll sin esperar al siguiente tick del setInterval.
  const currentSidRef = useRef<string | null>(null)
  // Marca del último poll exitoso — si pasaron MAX_POLL_GAP_MS sin un poll
  // ok (porque setInterval/setTimeout se throttlearon o hubo offline), forzamos
  // un poll. `online` y `visibilitychange` son hints, no autoridad.
  const lastPollOkRef = useRef<number>(0)
  const kioskIdRef = useRef<string>('')

  useEffect(() => {
    kioskIdRef.current = getOrCreateKioskId()
    createSession()

    function forcePoll() {
      const sid = currentSidRef.current
      if (sid) pollSession(sid)
    }

    function onVisibility() {
      if (document.visibilityState !== 'visible') return
      // setInterval se throttlea cuando la tab está hidden — al volver
      // forzamos un poll inmediato. Si la sesión murió, pollSession
      // detecta 404/410 y dispara createSession.
      forcePoll()
    }
    function onOnline() {
      // `online` es hint, no garantía. Disparamos poll y dejamos que falle
      // si la red sigue rota — el watchdog de health se encarga.
      forcePoll()
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('online', onOnline)

    // Watchdog independiente: si pasó >MAX_POLL_GAP_MS desde el último poll
    // exitoso, fuerza un intento. Cubre el caso donde tanto setInterval como
    // visibilitychange/online no disparan (browser suspendido, kiosk mode raro).
    healthRef.current = setInterval(() => {
      if (!currentSidRef.current) return
      const last = lastPollOkRef.current
      if (last && Date.now() - last > MAX_POLL_GAP_MS) {
        forcePoll()
      }
    }, 5000)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('online', onOnline)
      clearAll()
    }
  }, [])

  function clearAll() {
    if (pollRef.current) clearInterval(pollRef.current)
    if (renewRef.current) clearTimeout(renewRef.current)
    if (resetRef.current) clearTimeout(resetRef.current)
    if (healthRef.current) clearInterval(healthRef.current)
  }

  function clearTimers() {
    if (pollRef.current) clearInterval(pollRef.current)
    if (renewRef.current) clearTimeout(renewRef.current)
    if (resetRef.current) clearTimeout(resetRef.current)
  }

  async function createSession() {
    if (isCreatingRef.current) return
    isCreatingRef.current = true
    try {
      clearTimers()
      currentSidRef.current = null
      setDisplayState('loading')
      setCitizenName('')
      setFailReason('')

      const { data, error, status } = await kioskApi.createSession({ kioskId: kioskIdRef.current })
      if (!data || error) {
        // Backoff: si es error de red o 5xx, marcamos degradado y reintentamos.
        setDegraded(true)
        const delay = status === 0 || status >= 500 ? 5000 : 3000
        renewRef.current = setTimeout(createSession, delay)
        return
      }

      setDegraded(false)
      const sid = data.sessionId
      currentSidRef.current = sid
      lastPollOkRef.current = Date.now()

      const verifyUrl = `${window.location.origin}/verificar?session=${sid}`
      const url = await QRCode.toDataURL(verifyUrl, {
        width: 320,
        margin: 2,
        color: { dark: '#1e1b4b', light: '#ffffff' },
      })
      setQrUrl(url)
      setDisplayState('qr')

      // Renovar sesión antes de que expire
      renewRef.current = setTimeout(createSession, SESSION_LIFETIME)

      // Polling
      pollRef.current = setInterval(() => pollSession(sid), POLL_INTERVAL)
    } finally {
      isCreatingRef.current = false
    }
  }

  async function pollSession(sid: string) {
    const { data, status } = await kioskApi.getSessionStatus(sid)

    // 404 = row purgado por TTL, 410 = expiresAt < now (DDB aún no purga).
    // Ambos significan QR muerto: regenerar. Otros errores (5xx, offline,
    // status 0) los tratamos como transitorios y mantenemos el QR actual.
    if (status === 404 || status === 410) {
      createSession()
      return
    }
    if (status === 0 || (status >= 500 && status < 600)) {
      // Error transitorio — marcar degradado, mantener QR. El healthRef
      // watchdog reintentará si pasa demasiado sin recuperar.
      setDegraded(true)
      return
    }
    if (!data) return

    setDegraded(false)
    lastPollOkRef.current = Date.now()

    if (data.status === 'verifying' && data.citizenName) {
      setCitizenName(data.citizenName)
      setDisplayState('verifying')
    } else if (data.status === 'verified') {
      if (pollRef.current) clearInterval(pollRef.current)
      if (renewRef.current) clearTimeout(renewRef.current)
      setCitizenName(data.citizenName || '')
      setConfidence(data.faceMatchConfidence || 0)
      setDisplayState('verified')
      resetRef.current = setTimeout(createSession, RESET_DELAY)
    } else if (data.status === 'failed') {
      if (pollRef.current) clearInterval(pollRef.current)
      if (renewRef.current) clearTimeout(renewRef.current)
      setFailReason(data.reason || 'error_desconocido')
      setDisplayState('failed')
      resetRef.current = setTimeout(createSession, RESET_DELAY)
    }
  }

  const failMessages: Record<string, string> = {
    liveness_failed: 'No se pudo verificar que sea una persona real.',
    face_mismatch: 'La persona no coincide con el registro.',
    error_desconocido: 'Error desconocido.',
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-8 text-white">

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Simulador de Manejo</h1>
        <p className="text-slate-400 mt-2">Centro de Evaluación — Gobierno del Estado de Tlaxcala</p>
      </div>

      {/* Main content card */}
      <div className="bg-[#1e293b] rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">

        {displayState === 'loading' && (
          <div className="space-y-4 py-8">
            <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto" />
            <p className="text-slate-400">Iniciando sesión de verificación...</p>
          </div>
        )}

        {displayState === 'qr' && (
          <div className="space-y-6">
            <p className="text-slate-300 text-lg font-medium">
              Escanea el código con tu teléfono
            </p>
            {qrUrl && (
              <div className="inline-block p-4 bg-white rounded-2xl shadow-lg">
                <Image src={qrUrl} alt="QR de verificación" width={260} height={260} />
              </div>
            )}
            <div className="space-y-2">
              <p className="text-slate-400 text-sm">
                1. Abre la cámara de tu celular
              </p>
              <p className="text-slate-400 text-sm">
                2. Escanea el código QR
              </p>
              <p className="text-slate-400 text-sm">
                3. Ingresa tu código de cita y completa la verificación facial
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-600 mt-4">
              <div className={`w-2 h-2 rounded-full animate-pulse ${degraded ? 'bg-amber-500' : 'bg-green-500'}`} />
              {degraded ? 'Reconectando…' : 'Esperando verificación...'}
            </div>
          </div>
        )}

        {displayState === 'verifying' && (
          <div className="space-y-6 py-4">
            <Loader2 className="w-14 h-14 text-primary-400 animate-spin mx-auto" />
            <div>
              <p className="text-2xl font-semibold">{citizenName}</p>
              <p className="text-slate-400 mt-2">Verificando identidad...</p>
            </div>
          </div>
        )}

        {displayState === 'verified' && (
          <div className="space-y-5 py-4">
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto" />
            <div>
              <p className="text-3xl font-bold text-green-300">¡Bienvenido/a!</p>
              <p className="text-xl font-semibold text-white mt-2">{citizenName}</p>
              <p className="text-slate-400 mt-3">
                Verificación exitosa. Acércate a la ventanilla para continuar con tu trámite.
              </p>
              {confidence > 0 && (
                <p className="text-xs text-slate-600 mt-2">Coincidencia: {confidence.toFixed(1)}%</p>
              )}
            </div>
            <p className="text-slate-500 text-sm">Reiniciando en 10 segundos...</p>
          </div>
        )}

        {displayState === 'failed' && (
          <div className="space-y-5 py-4">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
            <div>
              <p className="text-xl font-bold text-red-300">Verificación fallida</p>
              <p className="text-slate-400 mt-2">
                {failMessages[failReason] || failMessages.error_desconocido}
              </p>
              <p className="text-slate-400 mt-2 font-medium">
                Por favor pide asistencia al operador.
              </p>
            </div>
            <p className="text-slate-500 text-sm">Reiniciando en 10 segundos...</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="text-slate-700 text-xs mt-8">
        Si tienes problemas, solicita ayuda al operador de la sala
      </p>
    </div>
  )
}
