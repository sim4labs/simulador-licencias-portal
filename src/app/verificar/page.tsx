'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { FaceLivenessDetector } from '@aws-amplify/ui-react-liveness'
import { kioskApi } from '@/lib/citizen-api'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import '@aws-amplify/ui-react/styles.css'

type Step = 'loading' | 'liveness' | 'completing' | 'done' | 'error'

function VerificarContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session') || ''

  const [step, setStep] = useState<Step>('loading')
  const [livenessSessionId, setLivenessSessionId] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!sessionId) return
    initLiveness()
  }, [sessionId])

  async function initLiveness() {
    setStep('loading')
    const { data, error } = await kioskApi.startVerify(sessionId)
    if (!data || error) {
      setErrorMsg(error || 'No se pudo iniciar la verificación. Escanea el QR de nuevo.')
      setStep('error')
      return
    }
    setLivenessSessionId(data.livenessSessionId)
    setStep('liveness')
  }

  async function handleLivenessComplete() {
    setStep('completing')
    const { data, error } = await kioskApi.completeVerify(sessionId)
    if (!data || error) {
      setErrorMsg(error || 'Verificación fallida. Pide asistencia al operador.')
      setStep('error')
      return
    }
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

          {/* Cargando / iniciando liveness */}
          {step === 'loading' && (
            <div className="text-center space-y-4 py-6">
              <Loader2 className="w-10 h-10 text-[#582672] animate-spin mx-auto" />
              <p className="text-gray-500 text-sm">Iniciando verificación facial...</p>
            </div>
          )}

          {/* Face Liveness */}
          {step === 'liveness' && (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm text-center">
                Mira directamente a la cámara y sigue las instrucciones
              </p>
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

          {/* Completando */}
          {step === 'completing' && (
            <div className="text-center space-y-4 py-6">
              <Loader2 className="w-10 h-10 text-[#582672] animate-spin mx-auto" />
              <p className="text-gray-500">Verificando...</p>
            </div>
          )}

          {/* Éxito */}
          {step === 'done' && (
            <div className="text-center space-y-4 py-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <div>
                <p className="text-xl font-bold text-gray-900">¡Verificación exitosa!</p>
                <p className="text-gray-500 text-sm mt-2">
                  El simulador te dará la bienvenida. Puedes cerrar esta pantalla.
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {step === 'error' && (
            <div className="text-center space-y-4 py-6">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <div>
                <p className="font-semibold text-gray-900">Verificación fallida</p>
                <p className="text-gray-500 text-sm mt-1">{errorMsg}</p>
              </div>
              <button
                onClick={initLiveness}
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
