'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { ProgressStepper } from '@/components/ProgressStepper'
import { Bike, Car, Bus, Truck, UserCog, UserPlus, Ambulance } from 'lucide-react'
import { LICENSE_TYPE_IDS, type LicenseTypeId } from '@/lib/tramite'

type LucideIcon = typeof Bike

const LICENSE_TYPES: Array<{
  id: LicenseTypeId
  name: string
  icon: LucideIcon
  description: string
}> = [
  { id: '3', name: 'Automovilista', icon: Car, description: 'Automóviles y camionetas particulares' },
  { id: '4', name: 'Motociclista', icon: Bike, description: 'Motocicletas y motonetas' },
  { id: '2', name: 'Chofer Particular', icon: UserCog, description: 'Chofer privado de vehículo particular' },
  { id: '1', name: 'Servicio Público', icon: Bus, description: 'Transporte público de pasajeros' },
  { id: '6', name: 'Servicio de Carga', icon: Truck, description: 'Tractocamiones y carga pesada' },
  { id: '9', name: 'Permiso para Menores', icon: UserPlus, description: 'Conductores entre 15 y 17 años' },
  { id: '18', name: 'Emergencias', icon: Ambulance, description: 'Vehículos de emergencia' },
]

export default function TipoLicenciaPage() {
  const router = useRouter()

  const handleSelectType = (typeId: LicenseTypeId) => {
    sessionStorage.setItem('selectedLicenseType', typeId)
    router.push('/portal/solicitud')
  }

  // Guardia en tiempo de desarrollo: el render cubre TODOS los IDs oficiales.
  const coverage = new Set(LICENSE_TYPES.map(t => t.id))
  const missing = LICENSE_TYPE_IDS.filter(id => !coverage.has(id))
  if (missing.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('LICENSE_TYPES no cubre:', missing)
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <ProgressStepper currentStep={1} className="mb-8" />

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
  )
}
