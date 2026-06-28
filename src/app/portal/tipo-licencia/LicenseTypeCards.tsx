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
  letter: string
  name: string
  icon: LucideIcon
  description: string
}> = [
  { id: '3', letter: 'C', name: 'Automovilista', icon: Car, description: 'Automóviles y camionetas van, uso particular' },
  { id: '4', letter: 'D', name: 'Motociclista', icon: Bike, description: 'Motocicletas, motonetas, trimotos y cuatrimotos' },
  { id: '2', letter: 'B', name: 'Chofer Particular', icon: UserCog, description: 'Vehículos de hasta 3.5 toneladas, uso particular' },
  { id: '1', letter: 'A', name: 'Transporte de Personas', icon: Bus, description: 'Transporte público en sus diferentes modalidades' },
  { id: '6', letter: 'F', name: 'Mercantil', icon: Truck, description: 'Carga y vehículos mercantiles hasta 12 toneladas' },
  { id: '9', letter: 'P', name: 'Permiso de Menor', icon: UserPlus, description: 'Menores de edad, vehículos particulares' },
  { id: '18', letter: 'E', name: 'Emergencia', icon: Ambulance, description: 'Vehículos de emergencia (patrullas, ambulancias)' },
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
                    <span className="inline-block text-xs font-semibold text-primary-600 uppercase tracking-wide">
                      Tipo {type.letter}
                    </span>
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
