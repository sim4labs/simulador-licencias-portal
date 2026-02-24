'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressStepper } from '@/components/ProgressStepper'
import { citizenApi } from '@/lib/citizen-api'
import { adaptTramite } from '@/lib/adapters'
import { Camera, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

type Step = 'loading' | 'already-uploaded' | 'preview' | 'captured' | 'uploading' | 'done' | 'error'

export default function FotoPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [step, setStep] = useState<Step>('loading')
  const [tramiteId, setTramiteId] = useState<string | null>(null)
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null)
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function init() {
      const { data } = await citizenApi.getTramiteActivo()
      if (!data) { router.replace('/portal'); return }
      const t = adaptTramite(data)
      setTramiteId(t.id)

      if (t.status !== 'examen-aprobado') {
        router.replace('/portal')
        return
      }

      if ((data as any).photoS3Key) {
        setStep('already-uploaded')
      } else {
        startCamera()
        setStep('preview')
      }
    }
    init()

    return () => stopCamera()
  }, [])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {
      setErrorMsg('No se pudo acceder a la cámara. Verifica los permisos del navegador.')
      setStep('error')
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  function capture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)

    canvas.toBlob(blob => {
      if (!blob) return
      setCapturedBlob(blob)
      setCapturedUrl(canvas.toDataURL('image/jpeg', 0.9))
      stopCamera()
      setStep('captured')
    }, 'image/jpeg', 0.9)
  }

  function retake() {
    setCapturedUrl(null)
    setCapturedBlob(null)
    startCamera()
    setStep('preview')
  }

  async function upload() {
    if (!capturedBlob || !tramiteId) return
    setStep('uploading')

    const { data, error } = await citizenApi.getPhotoUploadUrl(tramiteId)
    if (!data || error) {
      setErrorMsg(error || 'Error al obtener URL de subida')
      setStep('error')
      return
    }

    try {
      const res = await fetch(data.uploadUrl, {
        method: 'PUT',
        body: capturedBlob,
        headers: { 'Content-Type': 'image/jpeg' },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStep('done')
      setTimeout(() => router.push('/portal/agendar'), 2000)
    } catch {
      setErrorMsg('Error al subir la foto. Intenta de nuevo.')
      setStep('error')
    }
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <ProgressStepper currentStep={4} className="mb-8" />

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Foto de registro</h1>
          <p className="text-gray-600 text-sm">
            Se usará para verificar tu identidad el día de tu cita
          </p>
        </div>

        {step === 'loading' && (
          <Card padding="lg" className="text-center">
            <div className="animate-pulse text-gray-500">Cargando...</div>
          </Card>
        )}

        {step === 'already-uploaded' && (
          <Card padding="lg" className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <p className="font-semibold text-gray-900">Ya tienes una foto registrada</p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => { startCamera(); setStep('preview') }} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" /> Actualizar foto
              </Button>
              <Button onClick={() => router.push('/portal/agendar')}>
                Continuar a agendar cita
              </Button>
            </div>
          </Card>
        )}

        {(step === 'preview' || step === 'captured') && (
          <Card padding="lg" className="space-y-4">
            <div className="bg-gray-100 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
              {step === 'preview' && (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              )}
              {step === 'captured' && capturedUrl && (
                <img src={capturedUrl} alt="Foto capturada" className="w-full h-full object-cover" />
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />

            {step === 'preview' && (
              <>
                <p className="text-sm text-gray-500 text-center">
                  Asegúrate de estar bien iluminado y mirando directamente a la cámara
                </p>
                <Button onClick={capture} className="w-full gap-2">
                  <Camera className="w-4 h-4" /> Tomar foto
                </Button>
              </>
            )}

            {step === 'captured' && (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-600 text-center">¿La foto se ve bien?</p>
                <div className="flex gap-3">
                  <Button onClick={retake} variant="outline" className="flex-1 gap-2">
                    <RefreshCw className="w-4 h-4" /> Retomar
                  </Button>
                  <Button onClick={upload} className="flex-1 gap-2">
                    <CheckCircle className="w-4 h-4" /> Confirmar
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {step === 'uploading' && (
          <Card padding="lg" className="text-center space-y-3">
            <div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
            <p className="text-gray-600">Guardando tu foto...</p>
          </Card>
        )}

        {step === 'done' && (
          <Card padding="lg" className="text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <p className="font-semibold text-gray-900">¡Foto guardada!</p>
            <p className="text-gray-500 text-sm">Redirigiendo para agendar tu cita...</p>
          </Card>
        )}

        {step === 'error' && (
          <Card padding="lg" className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <p className="text-red-600 font-medium">{errorMsg}</p>
            <Button onClick={() => { setStep('preview'); startCamera() }} variant="outline">
              Intentar de nuevo
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
