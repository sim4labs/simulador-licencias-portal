'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { ProgressStepper } from '@/components/ProgressStepper'
import {
  validateCURP,
  validatePhone,
  validateRFC,
  validateCP,
  LICENSE_TYPE_NAMES,
  LICENSE_TYPE_IDS,
  TIPOS_SANGRE,
  ESTADOS_CIVIL,
  ESTADO_CIVIL_LABELS,
  type LicenseTypeId,
  type PersonalData,
} from '@/lib/tramite'
import { citizenApi } from '@/lib/citizen-api'
import { FileText } from 'lucide-react'

const emptyPersonalData: PersonalData = {
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  fechaNacimiento: '',
  curp: '',
  rfc: '',
  email: '',
  telefono: '',
  tipoSangre: '',
  alergias: '',
  estadoCivil: '',
  calle: '',
  noExterior: '',
  noInterior: '',
  codigoPostal: '',
  municipio: '',
  colonia: '',
  donador: false,
}

type ErrorMap = Partial<Record<keyof PersonalData, string>>

export default function SolicitudPage() {
  const router = useRouter()
  const [licenseType, setLicenseType] = useState<LicenseTypeId | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [errors, setErrors] = useState<ErrorMap>({})
  const [formData, setFormData] = useState<PersonalData>(emptyPersonalData)

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedLicenseType')
    if (!stored || !(LICENSE_TYPE_IDS as readonly string[]).includes(stored)) {
      router.replace('/portal/tipo-licencia')
      return
    }
    setLicenseType(stored as LicenseTypeId)
  }, [router])

  const updateField = <K extends keyof PersonalData>(field: K, value: PersonalData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: ErrorMap = {}

    // Datos personales
    if (!formData.nombre.trim()) newErrors.nombre = 'Requerido'
    if (!formData.apellidoPaterno.trim()) newErrors.apellidoPaterno = 'Requerido'
    if (!formData.apellidoMaterno.trim()) newErrors.apellidoMaterno = 'Requerido'
    if (!formData.fechaNacimiento) newErrors.fechaNacimiento = 'Requerido'

    if (!formData.curp.trim()) newErrors.curp = 'Requerido'
    else if (!validateCURP(formData.curp)) newErrors.curp = 'CURP no válido (18 caracteres)'

    if (!formData.rfc.trim()) newErrors.rfc = 'Requerido'
    else if (!validateRFC(formData.rfc)) newErrors.rfc = 'RFC no válido (formato mexicano)'

    // Contacto
    if (!formData.email.trim()) newErrors.email = 'Requerido'
    if (!formData.telefono.trim()) newErrors.telefono = 'Requerido'
    else if (!validatePhone(formData.telefono)) newErrors.telefono = 'Debe tener 10 dígitos'

    // Domicilio
    if (!formData.calle.trim()) newErrors.calle = 'Requerido'
    if (!formData.noExterior.trim()) newErrors.noExterior = 'Requerido'

    if (!formData.codigoPostal.trim()) newErrors.codigoPostal = 'Requerido'
    else if (!validateCP(formData.codigoPostal)) newErrors.codigoPostal = 'CP de Tlaxcala (5 dígitos, inicia con 9)'

    if (!formData.municipio.trim()) newErrors.municipio = 'Requerido'
    if (!formData.colonia.trim()) newErrors.colonia = 'Requerido'

    // Datos médicos / cívicos
    if (!formData.tipoSangre) newErrors.tipoSangre = 'Requerido'
    if (!formData.estadoCivil) newErrors.estadoCivil = 'Requerido'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !licenseType) return

    setIsSubmitting(true)
    setSubmitError(null)

    const { data, error: apiError } = await citizenApi.crearTramite({
      ...formData,
      curp: formData.curp.toUpperCase(),
      rfc: formData.rfc.toUpperCase(),
      licenseType,
    })

    if (apiError || !data) {
      setIsSubmitting(false)
      setSubmitError(apiError || 'Error al crear trámite')
      return
    }

    sessionStorage.removeItem('selectedLicenseType')
    sessionStorage.setItem('currentTramiteId', data.tramiteId)
    router.push('/portal/examen')
  }

  if (!licenseType) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-gray-500">Cargando...</div>
      </div>
    )
  }

  const licenseName = LICENSE_TYPE_NAMES[licenseType]

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <ProgressStepper currentStep={2} className="mb-8" />

        <div className="bg-primary-50 rounded-lg p-3 mb-6 text-center">
          <p className="text-sm font-medium text-primary-700">
            Licencia: {licenseName}
          </p>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Solicitud de Licencia
          </h1>
          <p className="text-gray-600">
            Completa tus datos para iniciar el trámite
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ── Datos personales ── */}
          <Card padding="lg">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Datos personales</h2>
            <div className="space-y-4">
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

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="CURP"
                  placeholder="GALO850101HTLRPN09"
                  value={formData.curp}
                  onChange={(e) => updateField('curp', e.target.value.toUpperCase())}
                  error={errors.curp}
                  helperText="18 caracteres"
                  required
                  className="uppercase"
                />
                <Input
                  label="RFC"
                  placeholder="GALO850101XX1"
                  value={formData.rfc}
                  onChange={(e) => updateField('rfc', e.target.value.toUpperCase())}
                  error={errors.rfc}
                  helperText="12 o 13 caracteres"
                  required
                  className="uppercase"
                />
              </div>
            </div>
          </Card>

          {/* ── Contacto ── */}
          <Card padding="lg">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Datos de contacto</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Correo electrónico"
                type="email"
                placeholder="juan@email.com"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                error={errors.email}
                required
              />
              <Input
                label="Teléfono"
                type="tel"
                placeholder="2461234567"
                value={formData.telefono}
                onChange={(e) => updateField('telefono', e.target.value)}
                error={errors.telefono}
                helperText="10 dígitos"
                required
              />
            </div>
          </Card>

          {/* ── Domicilio ── */}
          <Card padding="lg">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Domicilio</h2>
            <div className="space-y-4">
              <Input
                label="Calle"
                placeholder="Av. Independencia"
                value={formData.calle}
                onChange={(e) => updateField('calle', e.target.value)}
                error={errors.calle}
                required
              />

              <div className="grid sm:grid-cols-3 gap-4">
                <Input
                  label="Número Exterior"
                  placeholder="123"
                  value={formData.noExterior}
                  onChange={(e) => updateField('noExterior', e.target.value)}
                  error={errors.noExterior}
                  required
                />
                <Input
                  label="Número Interior"
                  placeholder="A (opcional)"
                  value={formData.noInterior}
                  onChange={(e) => updateField('noInterior', e.target.value)}
                />
                <Input
                  label="Código Postal"
                  placeholder="90000"
                  value={formData.codigoPostal}
                  onChange={(e) => updateField('codigoPostal', e.target.value.replace(/\D/g, '').slice(0, 5))}
                  error={errors.codigoPostal}
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Municipio"
                  placeholder="Tlaxcala"
                  value={formData.municipio}
                  onChange={(e) => updateField('municipio', e.target.value)}
                  error={errors.municipio}
                  required
                />
                <Input
                  label="Colonia"
                  placeholder="Centro"
                  value={formData.colonia}
                  onChange={(e) => updateField('colonia', e.target.value)}
                  error={errors.colonia}
                  required
                />
              </div>
            </div>
          </Card>

          {/* ── Información médica y cívica ── */}
          <Card padding="lg">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Información médica y cívica</h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Sangre <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.tipoSangre}
                    onChange={(e) => updateField('tipoSangre', e.target.value as PersonalData['tipoSangre'])}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    required
                  >
                    <option value="" disabled>Selecciona...</option>
                    {TIPOS_SANGRE.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {errors.tipoSangre && (
                    <p className="mt-1 text-xs text-red-600">{errors.tipoSangre}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado Civil <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.estadoCivil}
                    onChange={(e) => updateField('estadoCivil', e.target.value as PersonalData['estadoCivil'])}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    required
                  >
                    <option value="" disabled>Selecciona...</option>
                    {ESTADOS_CIVIL.map((s) => (
                      <option key={s} value={s}>{ESTADO_CIVIL_LABELS[s]}</option>
                    ))}
                  </select>
                  {errors.estadoCivil && (
                    <p className="mt-1 text-xs text-red-600">{errors.estadoCivil}</p>
                  )}
                </div>
              </div>

              <Input
                label="Alergias"
                placeholder="Ej: Penicilina (opcional)"
                value={formData.alergias}
                onChange={(e) => updateField('alergias', e.target.value)}
                helperText="Deja en blanco si no aplica"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Deseas ser donador de órganos? <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="donador"
                      checked={formData.donador === true}
                      onChange={() => updateField('donador', true)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Sí</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="donador"
                      checked={formData.donador === false}
                      onChange={() => updateField('donador', false)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">No</span>
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isSubmitting}
          >
            Continuar
          </Button>
        </form>
      </div>
    </div>
  )
}
