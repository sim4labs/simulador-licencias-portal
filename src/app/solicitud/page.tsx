'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { ProgressStepper } from '@/components/ProgressStepper'
import { createTramite, validateCURP, validatePhone, type PersonalData } from '@/lib/tramite'
import { FileText } from 'lucide-react'

export default function SolicitudPage() {
  const router = useRouter()
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
    if (!validate()) return

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    const tramite = createTramite({
      ...formData,
      curp: formData.curp.toUpperCase(),
    })

    // Update step to 2 so tipo-licencia page knows solicitud is done
    const tramites = JSON.parse(localStorage.getItem('tramites') || '[]')
    const idx = tramites.findIndex((t: { id: string }) => t.id === tramite.id)
    if (idx !== -1) {
      tramites[idx].currentStep = 2
      tramites[idx].status = 'iniciado'
      localStorage.setItem('tramites', JSON.stringify(tramites))
    }

    router.push('/tipo-licencia')
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
        <div className="max-w-2xl mx-auto">
          <ProgressStepper currentStep={1} className="mb-8" />

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
    </main>
  )
}
