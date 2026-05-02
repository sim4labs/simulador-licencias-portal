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

export default function KioskPage() {
  const [displayState, setDisplayState] = useState<DisplayState>('loading')
  const [qrUrl, setQrUrl] = useState('')
  const [citizenName, setCitizenName] = useState('')
  const [failReason, setFailReason] = useState('')
  const [confidence, setConfidence] = useState(0)

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const renewRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Guard contra createSession concurrente (visibilitychange + setTimeout
  // de renovación pueden dispararse a la vez tras un alt-tab largo).
  const isCreatingRef = useRef(false)
  // Sid actual para que el handler de visibilitychange pueda forzar un poll
  // sin esperar al siguiente tick del setInterval.
  const currentSidRef = useRef<string | null>(null)

  useEffect(() => {
    createSession()

    function onVisibility() {
      if (document.visibilityState !== 'visible') return
      const sid = currentSidRef.current
      // setInterval se throttlea cuando la tab está hidden — al volver
      // forzamos un poll inmediato. Si la sesión murió, pollSession
      // detecta 404/410 y dispara createSession.
      if (sid) pollSession(sid)
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      clearAll()
    }
  }, [])

  function clearAll() {
    if (pollRef.current) clearInterval(pollRef.current)
    if (renewRef.current) clearTimeout(renewRef.current)
    if (resetRef.current) clearTimeout(resetRef.current)
  }

  async function createSession() {
    if (isCreatingRef.current) return
    isCreatingRef.current = true
    try {
      clearAll()
      currentSidRef.current = null
      setDisplayState('loading')
      setCitizenName('')
      setFailReason('')

      const { data, error } = await kioskApi.createSession()
      if (!data || error) {
        // Reintenta en 5 segundos si falla
        renewRef.current = setTimeout(createSession, 5000)
        return
      }

      const sid = data.sessionId
      currentSidRef.current = sid

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
    if (!data) return

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
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
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
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Esperando verificación...
            </div>
          </div>
        )}

        {displayState === 'verifying' && (
          <div className="space-y-6 py-4">
            <Loader2 className="w-14 h-14 text-purple-400 animate-spin mx-auto" />
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
