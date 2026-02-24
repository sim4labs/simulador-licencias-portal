'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { FaceLivenessDetector } from '@aws-amplify/ui-react-liveness'
import { kioskApi } from '@/lib/citizen-api'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import '@aws-amplify/ui-react/styles.css'

type Step = 'code-input' | 'liveness' | 'completing' | 'done' | 'error'

function VerificarContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session') || ''

  const [step, setStep] = useState<Step>('code-input')
  const [appointmentCode, setAppointmentCode] = useState('')
  const [citizenName, setCitizenName] = useState('')
  const [livenessSessionId, setLivenessSessionId] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [confidence, setConfidence] = useState(0)

  async function handleStartVerify() {
    if (!appointmentCode.trim()) return

    const { data, error } = await kioskApi.startVerify(sessionId, appointmentCode.trim().toUpperCase())
    if (!data || error) {
      setErrorMsg(error || 'Código inválido o sesión expirada. Pide asistencia.')
      setStep('error')
      return
    }

    setCitizenName(data.citizenName)
    setLivenessSessionId(data.livenessSessionId)
    setStep('liveness')
  }

  async function handleLivenessComplete() {
    setStep('completing')

    const { data, error } = await kioskApi.completeVerify(sessionId)
    if (!data || error) {
      setErrorMsg(error || 'No se pudo verificar tu identidad. Pide asistencia al operador.')
      setStep('error')
      return
    }

    setConfidence(data.confidence)
    setStep('done')
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Enlace inválido</h2>
          <p className="text-gray-500 text-sm">Escanea el código QR del kiosko nuevamente.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm max-w-sm w-full overflow-hidden">

        {/* Header */}
        <div className="bg-[#582672] px-6 py-5">
          <h1 className="text-white text-lg font-bold text-center">Verificación de Identidad</h1>
          <p className="text-purple-200 text-sm text-center mt-1">Simulador de Manejo — Tlaxcala</p>
        </div>

        <div className="p-6">

          {/* Step 1: Código de cita */}
          {step === 'code-input' && (
            <div className="space-y-5">
              <p className="text-gray-600 text-sm text-center">
                Ingresa el código de tu cita para continuar
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de cita
                </label>
                <input
                  type="text"
                  value={appointmentCode}
                  onChange={e => setAppointmentCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleStartVerify()}
                  placeholder="Ej. ABCDE123"
                  maxLength={8}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-[#582672] focus:border-transparent uppercase"
                />
              </div>
              <button
                onClick={handleStartVerify}
                disabled={appointmentCode.length < 6}
                className="w-full bg-[#582672] text-white rounded-lg py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          )}

          {/* Step 2: Face Liveness */}
          {step === 'liveness' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="font-semibold text-gray-900">Hola, {citizenName}</p>
                <p className="text-gray-500 text-sm mt-1">
                  Ahora verifica tu identidad con tu cámara
                </p>
              </div>
              <FaceLivenessDetector
                sessionId={livenessSessionId}
                region={process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'}
                onAnalysisComplete={handleLivenessComplete}
                onError={err => {
                  setErrorMsg(String(err))
                  setStep('error')
                }}
              />
            </div>
          )}

          {/* Step 3: Completando */}
          {step === 'completing' && (
            <div className="text-center space-y-4 py-4">
              <Loader2 className="w-10 h-10 text-[#582672] animate-spin mx-auto" />
              <p className="text-gray-600">Verificando tu identidad...</p>
            </div>
          )}

          {/* Step 4: Éxito */}
          {step === 'done' && (
            <div className="text-center space-y-4 py-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <div>
                <p className="text-xl font-bold text-gray-900">¡Verificación exitosa!</p>
                <p className="text-gray-500 text-sm mt-2">
                  Hola {citizenName}, el kiosko te mostrará tu información para continuar.
                </p>
                {confidence > 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    Coincidencia: {confidence.toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {step === 'error' && (
            <div className="text-center space-y-4 py-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <div>
                <p className="font-semibold text-gray-900">Verificación fallida</p>
                <p className="text-gray-500 text-sm mt-1">{errorMsg}</p>
              </div>
              <button
                onClick={() => { setStep('code-input'); setErrorMsg('') }}
                className="text-[#582672] text-sm underline"
              >
                Intentar de nuevo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerificarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#582672] animate-spin" />
        </div>
      }
    >
      <VerificarContent />
    </Suspense>
  )
}
