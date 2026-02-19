'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CalendarDays,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bike,
  Car,
  Bus,
  Truck,
  MapPin,
  Plus,
  BookOpen,
} from 'lucide-react'
import { citizenApi } from '@/lib/citizen-api'
import { adaptTramite } from '@/lib/adapters'
import { canProceedToStep, type Tramite } from '@/lib/tramite'

const LICENSE_NAMES: Record<string, string> = {
  motocicleta: 'Motocicleta',
  particular: 'Vehículo Particular',
  publico: 'Transporte Público',
  carga: 'Carga Pesada',
}

const LICENSE_ICONS: Record<string, typeof Car> = {
  motocicleta: Bike,
  particular: Car,
  publico: Bus,
  carga: Truck,
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  'iniciado': { label: 'Iniciado', color: 'bg-gray-100 text-gray-700', icon: Clock },
  'tipo-seleccionado': { label: 'Tipo seleccionado', color: 'bg-blue-50 text-blue-700', icon: Clock },
  'examen-aprobado': { label: 'Examen aprobado', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  'examen-reprobado': { label: 'Examen reprobado', color: 'bg-red-50 text-red-700', icon: XCircle },
  'cita-agendada': { label: 'Cita agendada', color: 'bg-amber-50 text-amber-700', icon: CalendarDays },
  'simulador-completado': { label: 'Simulador completado', color: 'bg-purple-50 text-purple-700', icon: CheckCircle2 },
  'finalizado': { label: 'Finalizado', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
}

export default function AdministrarCitasPage() {
  const [tramites, setTramites] = useState<Tramite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await citizenApi.listarTramites()
      if (data) {
        const all = data.map(adaptTramite)
        // Mostrar todos los trámites que no están finalizados
        const activos = all.filter((t) => t.status !== 'finalizado')
        setTramites(activos.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)))
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid sm:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-56 bg-white rounded-2xl border border-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Administrar Citas</h1>
        <p className="text-gray-500 mt-1">Selecciona un trámite para agendar o ver tu cita en el simulador</p>
      </div>

      {tramites.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Sin trámites elegibles</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Para agendar una cita en el simulador, primero debes iniciar un trámite y aprobar el examen teórico.
          </p>
          <Link
            href="/portal/tipo-licencia"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Iniciar Trámite
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {tramites.map((t) => {
            const LicenseIcon = LICENSE_ICONS[t.licenseType || ''] || Car
            const statusCfg = STATUS_CONFIG[t.status] || { label: t.status, color: 'bg-gray-100 text-gray-700', icon: Clock }
            const StatusIcon = statusCfg.icon
            const hasCita = !!t.appointment
            const isElegible = canProceedToStep(t, 4) || hasCita
            const nombre = `${t.personalData.nombre} ${t.personalData.apellidoPaterno}`

            // Determinar qué prerequisito falta
            const getMissingPrerequisite = () => {
              if (!t.licenseType) return { message: 'Selecciona el tipo de licencia para continuar.', href: '/portal/tipo-licencia', cta: 'Seleccionar Tipo' }
              if (!t.examResult) return { message: 'Debes aprobar el examen teórico antes de agendar tu cita.', href: '/portal/examen', cta: 'Ir al Examen' }
              if (!t.examResult.passed) return { message: 'No aprobaste el examen teórico. Vuelve a presentarlo para poder agendar.', href: '/portal/examen', cta: 'Reintentar Examen' }
              return null
            }

            const missing = !isElegible ? getMissingPrerequisite() : null

            return (
              <div
                key={t.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-shadow ${
                  isElegible ? 'border-gray-200 hover:shadow-md' : 'border-gray-200 opacity-90'
                }`}
              >
                <div className="p-6">
                  {/* Header: ícono + badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${
                      isElegible ? 'bg-primary-50 border-primary-100' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <LicenseIcon className={`w-6 h-6 ${isElegible ? 'text-primary-600' : 'text-gray-400'}`} />
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusCfg.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Info */}
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{nombre}</h3>
                  <p className="text-xs text-gray-500 mb-1">
                    {LICENSE_NAMES[t.licenseType || ''] || 'Sin tipo de licencia'}
                  </p>
                  <p className="text-xs font-mono text-gray-400 mb-4">{t.id}</p>

                  {/* Cita info (si ya tiene) */}
                  {hasCita && t.appointment && (
                    <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-700">
                        <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium">{t.appointment.date}</span>
                        <Clock className="w-3.5 h-3.5 text-gray-400 ml-2" />
                        <span className="font-medium">{t.appointment.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-700">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>Código: <span className="font-mono font-medium">{t.appointment.code}</span></span>
                      </div>
                    </div>
                  )}

                  {/* Prerequisito faltante */}
                  {missing && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-800">{missing.message}</p>
                    </div>
                  )}
                </div>

                {/* Action */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  {isElegible ? (
                    <Link
                      href={`/portal/agendar/${t.id}`}
                      className="inline-flex items-center gap-2 w-full justify-center px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all text-sm font-medium group"
                    >
                      {hasCita ? 'Ver Cita' : 'Agendar Cita'}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ) : missing ? (
                    <Link
                      href={missing.href}
                      className="inline-flex items-center gap-2 w-full justify-center px-5 py-2.5 bg-white text-primary-700 border border-primary-200 rounded-xl hover:bg-primary-50 transition-all text-sm font-medium group"
                    >
                      <BookOpen className="w-4 h-4" />
                      {missing.cta}
                    </Link>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
