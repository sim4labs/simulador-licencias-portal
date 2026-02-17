'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { ProgressStepper } from '@/components/ProgressStepper'
import { getCurrentTramite, updateTramite, canProceedToStep, type Tramite } from '@/lib/tramite'
import { Bike, Car, Bus, Truck } from 'lucide-react'

const LICENSE_TYPES = [
  { id: 'motocicleta', name: 'Motocicleta', icon: Bike, description: 'Vehículos de dos ruedas' },
  { id: 'particular', name: 'Vehículo Particular', icon: Car, description: 'Automóviles y camionetas' },
  { id: 'publico', name: 'Transporte Público', icon: Bus, description: 'Taxis y colectivos' },
  { id: 'carga', name: 'Carga Pesada', icon: Truck, description: 'Camiones y tractocamiones' },
]

export default function TipoLicenciaPage() {
  const router = useRouter()
  const [tramite, setTramite] = useState<Tramite | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = getCurrentTramite()
    if (!t || !canProceedToStep(t, 2)) {
      router.replace('/solicitud')
      return
    }
    setTramite(t)
    setLoading(false)
  }, [router])

  const handleSelectType = (typeId: string) => {
    if (!tramite) return
    updateTramite(tramite.id, {
      licenseType: typeId,
      currentStep: 3,
      status: 'tipo-seleccionado',
    })
    router.push('/examen')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-500">Cargando...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
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

      <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <ProgressStepper currentStep={2} className="mb-8" />

          {tramite && (
            <div className="bg-primary-50 rounded-lg p-3 mb-6 text-center">
              <p className="text-sm text-primary-700">
                Trámite <span className="font-semibold">{tramite.id}</span> — {tramite.personalData.nombre} {tramite.personalData.apellidoPaterno}
              </p>
            </div>
          )}

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Selecciona el tipo de licencia
            </h1>
            <p className="text-gray-600">
              Elige el tipo de licencia que deseas obtener
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {LICENSE_TYPES.map((type) => {
              const Icon = type.icon
              return (
                <Card
                  key={type.id}
                  padding="lg"
                  className="cursor-pointer transition-all hover:shadow-lg hover:border-primary-300"
                  onClick={() => handleSelectType(type.id)}
                >
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mr-4">
                      <Icon className="w-7 h-7 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
                      <p className="text-sm text-gray-500">{type.description}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
