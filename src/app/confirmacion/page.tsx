'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CheckCircle, Calendar, Clock, Car, Download, Home } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import QRCode from 'qrcode'

interface Appointment {
  code: string
  licenseType: string
  date: string
  time: string
  name: string
  email: string
  createdAt: string
  status: string
}

const LICENSE_NAMES: Record<string, string> = {
  motocicleta: 'Motocicleta',
  particular: 'Vehículo Particular',
  publico: 'Transporte Público',
  carga: 'Carga Pesada',
}

function ConfirmacionContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

  useEffect(() => {
    if (code) {
      // Get appointment from localStorage
      const appointments = JSON.parse(localStorage.getItem('appointments') || '[]')
      const found = appointments.find((a: Appointment) => a.code === code)
      if (found) {
        setAppointment(found)

        // Generate QR code
        const qrData = JSON.stringify({
          code: found.code,
          type: found.licenseType,
          date: found.date,
          time: found.time,
          name: found.name,
        })

        QRCode.toDataURL(qrData, {
          width: 256,
          margin: 2,
          color: {
            dark: '#582672',
            light: '#ffffff',
          },
        }).then(setQrCodeUrl)
      }
    }
  }, [code])

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return
    const link = document.createElement('a')
    link.download = `cita-simulador-${code}.png`
    link.href = qrCodeUrl
    link.click()
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/Flower-logo.svg"
              alt="Gobierno del Estado de Tlaxcala"
              width={50}
              height={50}
              className="h-12 w-auto"
              priority
            />
          </Link>
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
            Volver al inicio
          </Link>
        </div>
      </header>

      {!appointment ? (
        <div className="flex-grow flex items-center justify-center">
          <Card padding="lg" className="text-center">
            <p className="text-gray-600">Cita no encontrada</p>
            <Link href="/agendar" className="text-primary-600 hover:underline mt-2 inline-block">
              Agendar nueva cita
            </Link>
          </Card>
        </div>
      ) : (
      <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Cita Confirmada!
            </h1>
            <p className="text-gray-600">
              Tu cita ha sido registrada exitosamente
            </p>
          </div>

          {/* QR Code Card */}
          <Card padding="lg" className="mb-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-4">Tu código QR</h2>
              {qrCodeUrl && (
                <div className="inline-block p-4 bg-white border-2 border-gray-100 rounded-lg mb-4">
                  <Image
                    src={qrCodeUrl}
                    alt="Código QR de tu cita"
                    width={200}
                    height={200}
                  />
                </div>
              )}
              <p className="text-2xl font-bold text-primary-600 mb-2">{code}</p>
              <p className="text-sm text-gray-500 mb-4">
                Presenta este código QR el día de tu cita
              </p>
              <Button onClick={handleDownloadQR} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Descargar QR
              </Button>
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
                  <p className="font-medium">{LICENSE_NAMES[appointment.licenseType]}</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                  <Calendar className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-medium">{formatDate(new Date(appointment.date))}</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                  <Clock className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hora</p>
                  <p className="font-medium">{appointment.time} hrs</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Instructions */}
          <Card padding="lg" className="mb-6 bg-gold-light border border-gold">
            <h3 className="font-semibold text-gold-foreground mb-2">Recuerda traer:</h3>
            <ul className="text-sm text-gold-foreground space-y-1">
              <li>• Identificación oficial vigente</li>
              <li>• Este código QR (impreso o en tu celular)</li>
              <li>• Comprobante de pago de derechos</li>
            </ul>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild variant="outline" className="flex-1 gap-2">
              <Link href="/">
                <Home className="w-4 h-4" />
                Ir al inicio
              </Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/resultados">
                Consultar resultados
              </Link>
            </Button>
          </div>
        </div>
      </div>
      )}
    </main>
  )
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-500">Cargando...</div>
      </div>
    }>
      <ConfirmacionContent />
    </Suspense>
  )
}
