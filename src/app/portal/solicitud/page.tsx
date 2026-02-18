'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { ProgressStepper } from '@/components/ProgressStepper'
import { validateCURP, validatePhone, type PersonalData } from '@/lib/tramite'
import { citizenApi } from '@/lib/citizen-api'
import { FileText, Bike, Car, Bus, Truck } from 'lucide-react'

const LICENSE_NAMES: Record<string, { name: string; icon: typeof Bike }> = {
  motocicleta: { name: 'Motocicleta', icon: Bike },
  particular: { name: 'Vehículo Particular', icon: Car },
  publico: { name: 'Transporte Público', icon: Bus },
  carga: { name: 'Carga Pesada', icon: Truck },
}

export default function SolicitudPage() {
  const router = useRouter()
  const [licenseType, setLicenseType] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof PersonalData, string>>>({})
  const [formData, setFormData] = useState<PersonalData>({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    fechaNacimiento: '',
    curp: '',
    email: '',
    telefono: '',
    direccion: '',
  })

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedLicenseType')
    if (!stored) {
      router.replace('/portal/tipo-licencia')
      return
    }
    setLicenseType(stored)
  }, [router])

  const updateField = (field: keyof PersonalData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof PersonalData, string>> = {}

    if (!formData.nombre.trim()) newErrors.nombre = 'Requerido'
    if (!formData.apellidoPaterno.trim()) newErrors.apellidoPaterno = 'Requerido'
    if (!formData.apellidoMaterno.trim()) newErrors.apellidoMaterno = 'Requerido'
    if (!formData.fechaNacimiento) newErrors.fechaNacimiento = 'Requerido'
    if (!formData.curp.trim()) {
      newErrors.curp = 'Requerido'
    } else if (!validateCURP(formData.curp)) {
      newErrors.curp = 'CURP no válido (18 caracteres alfanuméricos)'
    }
    if (!formData.email.trim()) newErrors.email = 'Requerido'
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'Requerido'
    } else if (!validatePhone(formData.telefono)) {
      newErrors.telefono = 'Debe tener 10 dígitos'
    }
    if (!formData.direccion.trim()) newErrors.direccion = 'Requerido'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !licenseType) return

    setIsSubmitting(true)

    const { data, error: apiError } = await citizenApi.crearTramite({
      ...formData,
      curp: formData.curp.toUpperCase(),
      licenseType,
    })

    if (apiError || !data) {
      setIsSubmitting(false)
      setErrors({ nombre: apiError || 'Error al crear trámite' })
      return
    }

    sessionStorage.removeItem('selectedLicenseType')
    sessionStorage.setItem('currentTramiteId', data.tramiteId)
    router.push('/portal/examen')
  }

  const typeInfo = licenseType ? LICENSE_NAMES[licenseType] : null
  const TypeIcon = typeInfo?.icon

  if (!licenseType) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-gray-500">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <ProgressStepper currentStep={2} className="mb-8" />

        {typeInfo && TypeIcon && (
          <div className="bg-primary-50 rounded-lg p-3 mb-6 flex items-center justify-center gap-2">
            <TypeIcon className="w-5 h-5 text-primary-600" />
            <p className="text-sm font-medium text-primary-700">
              Licencia: {typeInfo.name}
            </p>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Solicitud de Licencia
          </h1>
          <p className="text-gray-600">
            Completa tus datos personales para iniciar el trámite
          </p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Nombre(s)"
                placeholder="Ej: Juan Carlos"
                value={formData.nombre}
                onChange={(e) => updateField('nombre', e.target.value)}
                error={errors.nombre}
                required
              />
              <Input
                label="Apellido Paterno"
                placeholder="Ej: García"
                value={formData.apellidoPaterno}
                onChange={(e) => updateField('apellidoPaterno', e.target.value)}
                error={errors.apellidoPaterno}
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Apellido Materno"
                placeholder="Ej: López"
                value={formData.apellidoMaterno}
                onChange={(e) => updateField('apellidoMaterno', e.target.value)}
                error={errors.apellidoMaterno}
                required
              />
              <Input
                label="Fecha de Nacimiento"
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) => updateField('fechaNacimiento', e.target.value)}
                error={errors.fechaNacimiento}
                required
              />
            </div>

            <Input
              label="CURP"
              placeholder="Ej: GALO850101HTLRPN09"
              value={formData.curp}
              onChange={(e) => updateField('curp', e.target.value.toUpperCase())}
              error={errors.curp}
              helperText="18 caracteres alfanuméricos"
              required
              className="uppercase"
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Correo electrónico"
                type="email"
                placeholder="Ej: juan@email.com"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                error={errors.email}
                required
              />
              <Input
                label="Teléfono"
                type="tel"
                placeholder="Ej: 2461234567"
                value={formData.telefono}
                onChange={(e) => updateField('telefono', e.target.value)}
                error={errors.telefono}
                helperText="10 dígitos"
                required
              />
            </div>

            <Input
              label="Dirección"
              placeholder="Ej: Av. Independencia 123, Col. Centro, Tlaxcala"
              value={formData.direccion}
              onChange={(e) => updateField('direccion', e.target.value)}
              error={errors.direccion}
              required
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isSubmitting}
            >
              Continuar
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
