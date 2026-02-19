'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FileText,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bike,
  Car,
  Bus,
  Truck,
} from 'lucide-react'
import { citizenApi } from '@/lib/citizen-api'
import { adaptTramite } from '@/lib/adapters'
import type { Tramite } from '@/lib/tramite'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  'iniciado': { label: 'Iniciado', color: 'bg-gray-100 text-gray-700', icon: Clock },
  'tipo-seleccionado': { label: 'Tipo seleccionado', color: 'bg-blue-50 text-blue-700', icon: Clock },
  'examen-aprobado': { label: 'Examen aprobado', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  'examen-reprobado': { label: 'Examen reprobado', color: 'bg-red-50 text-red-700', icon: XCircle },
  'cita-agendada': { label: 'Cita agendada', color: 'bg-amber-50 text-amber-700', icon: Clock },
  'simulador-completado': { label: 'Simulador completado', color: 'bg-purple-50 text-purple-700', icon: CheckCircle2 },
  'finalizado': { label: 'Finalizado', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
}

const LICENSE_ICONS: Record<string, typeof Car> = {
  motocicleta: Bike,
  particular: Car,
  publico: Bus,
  carga: Truck,
}

export default function HistorialPage() {
  const [tramites, setTramites] = useState<Tramite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await citizenApi.listarTramites()
      if (data) {
        setTramites(data.map(adaptTramite).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)))
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-white rounded-2xl border border-gray-200 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Trámites</h1>
        <p className="text-gray-500 mt-1">Historial de todos tus trámites de licencia</p>
      </div>

      {tramites.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Sin trámites</h3>
          <p className="text-sm text-gray-500 mb-6">Aún no has iniciado ningún trámite de licencia.</p>
          <Link
            href="/portal/solicitud"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all text-sm font-medium"
          >
            Iniciar Trámite
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tramites.map((t) => {
            const statusCfg = STATUS_CONFIG[t.status] || STATUS_CONFIG['iniciado']
            const StatusIcon = statusCfg.icon
            const LicenseIcon = LICENSE_ICONS[t.licenseType || ''] || Car
            const isActive = t.currentStep < 6 && t.status !== 'finalizado'

            return (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left */}
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <LicenseIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-mono font-semibold text-gray-900">{t.id}</span>
                          {isActive && (
                            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                          {t.licenseType && (
                            <span className="capitalize">{t.licenseType}</span>
                          )}
                          <span>Paso {t.currentStep} de 5</span>
                          <span>
                            {new Date(t.updatedAt).toLocaleDateString('es-MX', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        {t.examResult && (
                          <div className="mt-2 flex items-center gap-2 text-xs">
                            {t.examResult.passed ? (
                              <span className="text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Examen: {t.examResult.score}%
                              </span>
                            ) : (
                              <span className="text-red-600 flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> Examen: {t.examResult.score}%
                              </span>
                            )}
                          </div>
                        )}
                        {t.appointment && (
                          <div className="mt-1 text-xs text-gray-500">
                            Cita: {t.appointment.date} a las {t.appointment.time} &middot; Código: {t.appointment.code}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusCfg.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusCfg.label}
                      </span>
                      {isActive && (
                        <Link
                          href={`/portal/solicitud`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors"
                        >
                          Continuar
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-gray-100">
                  <div
                    className="h-full bg-primary-600 transition-all duration-300"
                    style={{ width: `${((t.currentStep - 1) / 5) * 100}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
