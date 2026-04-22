import { ProgressStepper } from '@/components/ProgressStepper'
import { LICENSE_TYPE_IDS } from '@/lib/tramite'
import { LicenseTypeCards } from './LicenseTypeCards'

const COVERED: Array<'1' | '2' | '3' | '4' | '6' | '9' | '18'> = ['1', '2', '3', '4', '6', '9', '18']
const MISSING = LICENSE_TYPE_IDS.filter((id) => !COVERED.includes(id as any))
if (MISSING.length > 0 && process.env.NODE_ENV !== 'production') {
  console.warn('LICENSE_TYPES no cubre:', MISSING)
}

export const metadata = {
  title: 'Selecciona el tipo de licencia',
  description: 'Elige el tipo de licencia que deseas tramitar en el simulador de Tlaxcala.',
}

export default function TipoLicenciaPage() {
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

        <LicenseTypeCards />
      </div>
    </div>
  )
}
