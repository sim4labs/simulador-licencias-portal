'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bike,
  Car,
  Bus,
  Truck,
  CalendarDays,
  FileText,
  Plus,
  ExternalLink,
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
  'tipo-seleccionado': { label: 'Listo para examen', color: 'bg-blue-50 text-blue-700', icon: BookOpen },
  'examen-aprobado': { label: 'Examen aprobado', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  'examen-reprobado': { label: 'Examen reprobado', color: 'bg-red-50 text-red-700', icon: XCircle },
  'cita-agendada': { label: 'Examen aprobado', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  'simulador-completado': { label: 'Examen aprobado', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  'finalizado': { label: 'Finalizado', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
}

const MATERIAL_APOYO = [
  {
    label: 'Reglamento de Tránsito de Tlaxcala',
    url: 'https://www.congresotlaxcala.gob.mx/archivo/leyes/L063.pdf',
  },
  {
    label: 'Ley de Movilidad y Seguridad Vial',
    url: 'https://www.congresotlaxcala.gob.mx/archivo/leyes/',
  },
]

export default function ExamenTeoricoPage() {
  const [tramites, setTramites] = useState<Tramite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await citizenApi.listarTramites()
      if (data) {
        const all = data.map(adaptTramite)
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
            <div key={i} className="h-64 bg-white rounded-2xl border border-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Examen Teórico</h1>
        <p className="text-gray-500 mt-1">Selecciona un trámite para presentar o consultar tu examen teórico</p>
      </div>

      {tramites.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Sin trámites activos</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Inicia un trámite de licencia para poder presentar el examen teórico.
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
            const nombre = `${t.personalData.nombre} ${t.personalData.apellidoPaterno}`

            const canTakeExam = canProceedToStep(t, 3)
            const examPassed = !!t.examResult?.passed
            const examFailed = !!t.examResult && !t.examResult.passed
            const hasType = !!t.licenseType

            return (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Header: ícono + badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${
                      canTakeExam || examPassed ? 'bg-primary-50 border-primary-100' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <LicenseIcon className={`w-6 h-6 ${canTakeExam || examPassed ? 'text-primary-600' : 'text-gray-400'}`} />
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

                  {/* Estado: Examen aprobado */}
                  {examPassed && t.examResult && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-700">Examen aprobado con {t.examResult.score}%</span>
                      </div>
                      <p className="text-xs text-emerald-600">
                        Tu siguiente paso es agendar tu cita en el simulador.
                      </p>
                    </div>
                  )}

                  {/* Estado: Examen reprobado */}
                  {examFailed && t.examResult && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-semibold text-red-700">Calificación: {t.examResult.score}% (mínimo 80%)</span>
                      </div>
                      <p className="text-xs text-red-600 mb-3">
                        Revisa el material de apoyo antes de volver a intentar.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {MATERIAL_APOYO.map((m) => (
                          <a
                            key={m.label}
                            href={m.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-primary-700 bg-white rounded-md border border-primary-100 hover:bg-primary-50 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {m.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Estado: Falta prerequisito (no tiene tipo) */}
                  {!hasType && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-800">Selecciona el tipo de licencia para poder presentar el examen.</p>
                    </div>
                  )}

                  {/* Estado: Tiene tipo pero no puede tomar examen aún (necesita completar solicitud) */}
                  {hasType && !canTakeExam && !examPassed && !examFailed && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-800">Completa tu solicitud antes de presentar el examen teórico.</p>
                    </div>
                  )}
                </div>

                {/* Action */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  {/* Puede tomar examen (primera vez o reintento) */}
                  {canTakeExam && !examPassed && (
                    <Link
                      href={`/portal/examen/${t.id}`}
                      className="inline-flex items-center gap-2 w-full justify-center px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all text-sm font-medium group"
                    >
                      <BookOpen className="w-4 h-4" />
                      {examFailed ? 'Reintentar Examen' : 'Presentar Examen'}
                    </Link>
                  )}

                  {/* Examen aprobado: ir a agendar */}
                  {examPassed && (
                    <Link
                      href="/portal/agendar"
                      className="inline-flex items-center gap-2 w-full justify-center px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all text-sm font-medium group"
                    >
                      <CalendarDays className="w-4 h-4" />
                      Agendar Cita
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  )}

                  {/* Sin tipo: ir a seleccionar */}
                  {!hasType && (
                    <Link
                      href="/portal/tipo-licencia"
                      className="inline-flex items-center gap-2 w-full justify-center px-5 py-2.5 bg-white text-primary-700 border border-primary-200 rounded-xl hover:bg-primary-50 transition-all text-sm font-medium"
                    >
                      Seleccionar Tipo de Licencia
                    </Link>
                  )}

                  {/* Tiene tipo pero falta solicitud */}
                  {hasType && !canTakeExam && !examPassed && !examFailed && (
                    <Link
                      href="/portal/solicitud"
                      className="inline-flex items-center gap-2 w-full justify-center px-5 py-2.5 bg-white text-primary-700 border border-primary-200 rounded-xl hover:bg-primary-50 transition-all text-sm font-medium"
                    >
                      <FileText className="w-4 h-4" />
                      Completar Solicitud
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
