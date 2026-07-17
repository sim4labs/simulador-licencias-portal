'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, Mail, Shield, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { citizenApi } from '@/lib/citizen-api'
import type { PersonalData } from '@/lib/tramite'
import {
  emptyProfileData,
  PersonalSection,
  DomicilioSection,
  MedicaSection,
  validateAll,
  type ProfileErrors,
} from '@/components/portal/ProfileForm'

export default function PerfilPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams?.get('returnTo') || ''
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [values, setValues] = useState<PersonalData>(emptyProfileData)
  const [errors, setErrors] = useState<ProfileErrors>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null)

  useEffect(() => {
    citizenApi.getPerfil().then(({ data }) => {
      if (data) {
        setEmail(data.email)
        setDisplayName(data.name)
        setProfileComplete(data.profileComplete === true)
        setValues({
          nombre: data.nombre ?? '',
          apellidoPaterno: data.apellidoPaterno ?? '',
          apellidoMaterno: data.apellidoMaterno ?? '',
          fechaNacimiento: data.fechaNacimiento ?? '',
          nacionalidad: (data.nacionalidad as PersonalData['nacionalidad']) ?? 'MEXICANA',
          curp: data.curp ?? '',
          rfc: data.rfc ?? '',
          email: data.email,
          telefono: data.telefono ?? '',
          tipoSangre: (data.tipoSangre as PersonalData['tipoSangre']) ?? '',
          alergias: data.alergias ?? '',
          estadoCivil: (data.estadoCivil as PersonalData['estadoCivil']) ?? '',
          calle: data.calle ?? '',
          noExterior: data.noExterior ?? '',
          noInterior: data.noInterior ?? '',
          codigoPostal: data.codigoPostal ?? '',
          municipio: data.municipio ?? '',
          colonia: data.colonia ?? '',
          estado: (data.estado as PersonalData['estado']) ?? 'TLAXCALA',
          donador: data.donador ?? true,
        })
      }
      setLoading(false)
    })
  }, [])

  const updateField = <K extends keyof PersonalData>(field: K, value: PersonalData[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
    if (successMsg) setSuccessMsg(null)
  }

  const handleSave = async () => {
    const e = validateAll(values)
    setErrors(e)
    if (Object.keys(e).length > 0) return
    setSaving(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    const { data, error } = await citizenApi.updatePerfil({
      ...values,
      curp: values.curp.toUpperCase(),
      rfc: values.rfc.toUpperCase(),
    })
    setSaving(false)
    if (error || !data) {
      setErrorMsg(error || 'No se pudo guardar el perfil')
      return
    }
    setProfileComplete(data.profileComplete === true)
    setSuccessMsg('Perfil actualizado correctamente')
    if (returnTo) {
      // Pequeña pausa para que el user vea el mensaje de éxito.
      setTimeout(() => router.replace(returnTo), 600)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-80 bg-white rounded-2xl border border-gray-200 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-500 mt-1">Administra tus datos personales</p>
      </div>

      {profileComplete === false && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">
              Tu perfil está incompleto
            </p>
            <p className="text-sm text-amber-800 mt-0.5">
              {returnTo
                ? 'Completa los campos requeridos para continuar con tu trámite. Al guardar regresarás automáticamente.'
                : 'Completa los campos requeridos para poder iniciar trámites.'}
            </p>
          </div>
        </div>
      )}

      {/* Cuenta (read-only, viene de Cognito) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Cuenta</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-gray-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Nombre de la cuenta</p>
              <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-gray-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Correo electrónico</p>
              <p className="text-sm font-medium text-gray-900 truncate">{email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form editable */}
      <div className="space-y-6">
        <PersonalSection values={values} errors={errors} onChange={updateField} disabled={saving} />
        <DomicilioSection values={values} errors={errors} onChange={updateField} disabled={saving} />
        <MedicaSection values={values} errors={errors} onChange={updateField} disabled={saving} />

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {successMsg}
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave} isLoading={saving}>
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  )
}
