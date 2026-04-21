'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { FaceLivenessDetector } from '@aws-amplify/ui-react-liveness'
import { kioskApi } from '@/lib/citizen-api'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import '@aws-amplify/ui-react/styles.css'

type Step = 'loading' | 'liveness' | 'completing' | 'done' | 'error'

function parseError(err: unknown): string {
  if (!err) return 'Error desconocido'
  if (typeof err === 'string') return err
  if (err instanceof Error) return err.message
  const e = err as Record<string, unknown>
  if (e.error instanceof Error) return `${e.state ?? ''}: ${e.error.message}`
  if (e.state) return String(e.state)
  return JSON.stringify(err)
}

function VerificacionContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session') || ''

  const [step, setStep] = useState<Step>('loading')
  const [livenessSessionId, setLivenessSessionId] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [debugInfo, setDebugInfo] = useState('')

  useEffect(() => {
    if (!sessionId) return
    initLiveness()
  }, [sessionId])

  async function initLiveness() {
    setStep('loading')
    setDebugInfo('')
    const { data, error } = await kioskApi.startVerify(sessionId)
    if (!data || error) {
      setErrorMsg(error || 'No se pudo iniciar la verificación. Escanea el QR de nuevo.')
      setDebugInfo(`startVerify error | sessionId=${sessionId}`)
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
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Enlace inválido</h2>
        <p className="text-slate-500 text-sm">Escanea el código QR del kiosko nuevamente.</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-center mb-2">Verificación Facial</h1>
      <p className="text-slate-500 text-sm text-center mb-8">
        Simulador de Manejo — Tlaxcala
      </p>

      {step === 'loading' && (
        <div className="flex flex-col items-center py-12">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
          <p className="text-slate-500 text-sm">Iniciando verificación facial...</p>
        </div>
      )}

      {step === 'liveness' && (
        <div className="w-full">
          <p className="text-slate-500 text-sm text-center mb-4">
            Mira directamente a la cámara y sigue las instrucciones
          </p>
          <FaceLivenessDetector
            sessionId={livenessSessionId}
            region={process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'}
            onAnalysisComplete={handleLivenessComplete}
            onError={err => {
              console.error('[Liveness error]', err)
              setErrorMsg(parseError(err))
              setDebugInfo(JSON.stringify(err, null, 2))
              setStep('error')
            }}
          />
        </div>
      )}

      {step === 'completing' && (
        <div className="flex flex-col items-center py-12">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
          <p className="text-slate-500">Verificando...</p>
        </div>
      )}

      {step === 'done' && (
        <div className="flex flex-col items-center py-12">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <p className="text-2xl font-bold mb-2">¡Listo!</p>
          <p className="text-slate-500 text-sm text-center">
            Verificación exitosa. El simulador te dará la bienvenida.
          </p>
        </div>
      )}

      {step === 'error' && (
        <div className="flex flex-col items-center py-12">
          <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">Verificación fallida</p>
          <p className="text-red-500 text-sm text-center mb-4">{errorMsg}</p>
          {debugInfo && (
            <pre className="bg-slate-100 text-slate-500 text-xs rounded-lg p-3 w-full overflow-auto max-h-32 mb-4 text-left">
              {debugInfo}
            </pre>
          )}
          <button
            onClick={initLiveness}
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-6 py-3 rounded-full transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      )}
    </div>
  )
}

export default function VerificacionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      }
    >
      <VerificacionContent />
    </Suspense>
  )
}
