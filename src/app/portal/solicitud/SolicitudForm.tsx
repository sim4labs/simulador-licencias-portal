'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  LICENSE_TYPE_NAMES,
  ESTADO_CIVIL_LABELS,
  NACIONALIDAD_LABELS,
  ESTADO_MX_LABELS,
  type LicenseTypeId,
  type EstadoCivil,
  type Nacionalidad,
  type EstadoMx,
} from '@/lib/tramite'
import { citizenApi, type PerfilResponse } from '@/lib/citizen-api'

export function SolicitudForm({ licenseType }: { licenseType: LicenseTypeId }) {
  const router = useRouter()
  const [perfil, setPerfil] = useState<PerfilResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    citizenApi.getPerfil().then(({ data }) => {
      setPerfil(data)
      setLoading(false)
    })
  }, [])

  const handleConfirm = async () => {
    setSubmitting(true)
    setSubmitError(null)

    // Evitar duplicación: si ya existe un trámite activo con este tipo, reutilizarlo.
    const { data: existingList } = await citizenApi.listarTramites()
    const existing = existingList?.find(
      (t) => t.licenseType === licenseType && t.status !== 'finalizado'
    )
    if (existing) {
      sessionStorage.setItem('currentTramiteId', existing.tramiteId)
      router.push(`/portal/examen/${existing.tramiteId}`)
      return
    }

    const { data, error } = await citizenApi.crearTramite({ licenseType })
    if (error || !data) {
      setSubmitting(false)
      setSubmitError(error || 'No se pudo crear el trámite')
      return
    }
    sessionStorage.setItem('currentTramiteId', data.tramiteId)
    router.push(`/portal/examen/${data.tramiteId}`)
  }

  if (loading) {
    return <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
  }

  if (!perfil || !perfil.profileComplete) {
    // Fallback defensivo — el gate en /tipo-licencia debería interceptar antes.
    return (
      <Card padding="lg">
        <p className="text-sm text-gray-700 mb-4">
          Necesitas completar tu perfil antes de iniciar un trámite.
        </p>
        <Link
          href={`/perfil?returnTo=${encodeURIComponent(`/solicitud?tipo=${licenseType}`)}`}
          className="text-primary-600 font-medium hover:underline"
        >
          Completar perfil ahora →
        </Link>
      </Card>
    )
  }

  const nombreCompleto = [perfil.nombre, perfil.apellidoPaterno, perfil.apellidoMaterno]
    .filter(Boolean)
    .join(' ')
  const estadoLabel = perfil.estado ? ESTADO_MX_LABELS[perfil.estado as EstadoMx] : ''
  const direccion = [
    perfil.calle && perfil.noExterior
      ? `${perfil.calle} ${perfil.noExterior}${perfil.noInterior ? ` int ${perfil.noInterior}` : ''}`
      : '',
    perfil.colonia ? `Col. ${perfil.colonia}` : '',
    perfil.municipio,
    estadoLabel,
    perfil.codigoPostal ? `CP ${perfil.codigoPostal}` : '',
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="space-y-6">
      <div className="bg-primary-50 rounded-lg p-3 text-center">
        <p className="text-sm font-medium text-primary-700">
          Licencia: {LICENSE_TYPE_NAMES[licenseType]}
        </p>
      </div>

      <Card padding="lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">Confirma tus datos</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Estos datos se enviarán al sistema de cobros con el trámite.
            </p>
          </div>
          <Link
            href="/perfil"
            className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <Pencil className="w-3 h-3" />
            Editar perfil
          </Link>
        </div>

        <dl className="divide-y divide-gray-100 text-sm">
          <Row label="Nombre completo" value={nombreCompleto} />
          <Row label="Fecha de nacimiento" value={perfil.fechaNacimiento} />
          <Row
            label="Nacionalidad"
            value={perfil.nacionalidad ? NACIONALIDAD_LABELS[perfil.nacionalidad as Nacionalidad] : ''}
          />
          <Row label="CURP" value={perfil.curp} />
          <Row label="RFC" value={perfil.rfc} />
          <Row label="Correo electrónico" value={perfil.email} />
          <Row label="Teléfono" value={perfil.telefono} />
          <Row label="Domicilio" value={direccion} />
          <Row label="Tipo de sangre" value={perfil.tipoSangre} />
          <Row
            label="Estado civil"
            value={perfil.estadoCivil ? ESTADO_CIVIL_LABELS[perfil.estadoCivil as EstadoCivil] : ''}
          />
          <Row label="Alergias" value={perfil.alergias || 'Ninguna'} />
          <Row label="Donador de órganos" value={perfil.donador ? 'Sí' : 'No'} />
        </dl>
      </Card>

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <Button
        type="button"
        className="w-full"
        size="lg"
        onClick={handleConfirm}
        isLoading={submitting}
      >
        <CheckCircle2 className="w-4 h-4 mr-1.5" />
        Confirmar y continuar
      </Button>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="py-2.5 grid grid-cols-3 gap-4">
      <dt className="text-xs text-gray-500 col-span-1">{label}</dt>
      <dd className="text-sm text-gray-900 col-span-2 truncate">{value || '—'}</dd>
    </div>
  )
}
