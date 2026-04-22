'use client'

import Link from 'next/link'
import { Bike, Car, Bus, Truck, UserCog, UserPlus, Ambulance } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ProfileRequiredModal } from '@/components/portal/ProfileRequiredModal'
import { useProfileGate } from '@/components/portal/useProfileGate'
import type { LicenseTypeId } from '@/lib/tramite'

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

export function LicenseTypeCards() {
  const { profileComplete, modalOpen, setModalOpen, gate } = useProfileGate()

  return (
    <>
      <div className="grid sm:grid-cols-2 gap-4">
        {LICENSE_TYPES.map((type) => {
          const Icon = type.icon
          const href = `/solicitud?tipo=${type.id}`
          return (
            <Link
              key={type.id}
              href={href}
              prefetch={profileComplete === true}
              onClick={gate(() => { /* navegación ocurre por el Link; gate solo intercepta si falta perfil */ })}
              className="block"
            >
              <Card
                padding="lg"
                className="cursor-pointer transition-all hover:shadow-lg hover:border-primary-300"
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
            </Link>
          )
        })}
      </div>

      <ProfileRequiredModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        returnTo="/tipo-licencia"
      />
    </>
  )
}
