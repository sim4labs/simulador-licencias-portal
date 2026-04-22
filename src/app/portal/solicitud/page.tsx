import { redirect } from 'next/navigation'
import { FileText } from 'lucide-react'
import { ProgressStepper } from '@/components/ProgressStepper'
import { LICENSE_TYPE_IDS, type LicenseTypeId } from '@/lib/tramite'
import { SolicitudForm } from './SolicitudForm'

export const metadata = {
  title: 'Solicitud de Licencia',
  description: 'Completa tus datos personales para iniciar el trámite de tu licencia.',
}

interface SolicitudPageProps {
  searchParams: { tipo?: string | string[] }
}

export default function SolicitudPage({ searchParams }: SolicitudPageProps) {
  const rawTipo = Array.isArray(searchParams.tipo) ? searchParams.tipo[0] : searchParams.tipo
  if (!rawTipo || !(LICENSE_TYPE_IDS as readonly string[]).includes(rawTipo)) {
    redirect('/portal/tipo-licencia')
  }
  const licenseType = rawTipo as LicenseTypeId

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <ProgressStepper currentStep={2} className="mb-8" />

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Confirmar solicitud
          </h1>
          <p className="text-gray-600">
            Revisa tus datos y confirma para iniciar el trámite
          </p>
        </div>

        <SolicitudForm licenseType={licenseType} />
      </div>
    </div>
  )
}
