'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressStepper } from '@/components/ProgressStepper'
import type { Tramite } from '@/lib/tramite'
import { citizenApi } from '@/lib/citizen-api'
import { adaptTramite } from '@/lib/adapters'
import { CheckCircle, Calendar, Clock, Car, Download, Home, User, Mail, Phone } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import QRCode from 'qrcode'

const LICENSE_NAMES: Record<string, string> = {
  motocicleta: 'Motocicleta',
  particular: 'Vehículo Particular',
  publico: 'Transporte Público',
  carga: 'Carga Pesada',
}

function ConfirmacionContent() {
  const searchParams = useSearchParams()
  const tramiteId = searchParams.get('id')
  const [tramite, setTramite] = useState<Tramite | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

  useEffect(() => {
    if (!tramiteId) return

    async function load() {
      const { data } = await citizenApi.getTramite(tramiteId!)
      if (!data) return
      const t = adaptTramite(data)
      setTramite(t)

      const qrData = JSON.stringify({
        tramiteId: t.id,
        code: t.appointment?.code,
        type: t.licenseType,
        date: t.appointment?.date,
        time: t.appointment?.time,
        name: `${t.personalData.nombre} ${t.personalData.apellidoPaterno}`,
      })

      const url = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: { dark: '#582672', light: '#ffffff' },
      })
      setQrCodeUrl(url)
    }
    load()
  }, [tramiteId])

  const handleDownloadQR = () => {
    if (!qrCodeUrl || !tramite) return
    const link = document.createElement('a')
    link.download = `cita-simulador-${tramite.id}.png`
    link.href = qrCodeUrl
    link.click()
  }

  if (!tramite) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card padding="lg" className="text-center">
          <p className="text-gray-600">Cita no encontrada</p>
          <Link href="/portal/solicitud" className="text-primary-600 hover:underline mt-2 inline-block">
            Iniciar nuevo trámite
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <ProgressStepper currentStep={5} className="mb-8" />

        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cita Confirmada</h1>
          <p className="text-gray-600">Tu cita ha sido registrada exitosamente</p>
        </div>

        {/* QR Code Card */}
        <Card padding="lg" className="mb-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-4">Tu código QR</h2>
            {qrCodeUrl && (
              <div className="inline-block p-4 bg-white border-2 border-gray-100 rounded-lg mb-4">
                <Image src={qrCodeUrl} alt="Código QR de tu cita" width={200} height={200} />
              </div>
            )}
            <p className="text-2xl font-bold text-primary-600 mb-1">{tramite.id}</p>
            <p className="text-sm text-gray-500 mb-1">Código de cita: {tramite.appointment?.code}</p>
            <p className="text-sm text-gray-500 mb-4">Presenta este código QR el día de tu cita</p>
            <Button onClick={handleDownloadQR} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Descargar QR
            </Button>
          </div>
        </Card>

        {/* Personal Data Summary */}
        <Card padding="lg" className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Datos del solicitante</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="font-medium">
                  {tramite.personalData.nombre} {tramite.personalData.apellidoPaterno}{' '}
                  {tramite.personalData.apellidoMaterno}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                <Mail className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Correo</p>
                <p className="font-medium">{tramite.personalData.email}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                <Phone className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="font-medium">{tramite.personalData.telefono}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Appointment Details */}
        <Card padding="lg" className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Detalles de la cita</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                <Car className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tipo de licencia</p>
                <p className="font-medium">{LICENSE_NAMES[tramite.licenseType || '']}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                <Calendar className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha</p>
                <p className="font-medium">{formatDate(new Date(tramite.appointment!.date))}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                <Clock className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Hora</p>
                <p className="font-medium">{tramite.appointment!.time} hrs</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card padding="lg" className="mb-6 bg-gold-light border border-gold">
          <h3 className="font-semibold text-gold-foreground mb-2">Recuerda traer:</h3>
          <ul className="text-sm text-gold-foreground space-y-1">
            <li>Identificación oficial vigente</li>
            <li>Este código QR (impreso o en tu celular)</li>
            <li>Comprobante de pago de derechos</li>
          </ul>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild variant="outline" className="flex-1 gap-2">
            <Link href="/portal">
              <Home className="w-4 h-4" />
              Ir al inicio
            </Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href="/portal/resultados">Consultar resultados</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmacionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-gray-500">Cargando...</div>
        </div>
      }
    >
      <ConfirmacionContent />
    </Suspense>
  )
}
