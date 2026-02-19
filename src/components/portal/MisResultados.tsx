'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Gamepad2,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ClipboardList,
  Bike,
  Car,
  Bus,
  Truck,
  CalendarDays,
} from 'lucide-react'
import { citizenApi } from '@/lib/citizen-api'
import { adaptTramite } from '@/lib/adapters'
import type { Tramite } from '@/lib/tramite'

/* ─── Constants ─── */

const STEPS = [
  { num: 1, label: 'Tipo' },
  { num: 2, label: 'Solicitud' },
  { num: 3, label: 'Examen' },
  { num: 4, label: 'Cita' },
  { num: 5, label: 'Simulador' },
]

const STEP_LABELS: Record<number, string> = {
  1: 'Tipo de Licencia',
  2: 'Solicitud',
  3: 'Examen Teórico',
  4: 'Agendar Cita',
  5: 'Simulador',
  6: 'Resultados',
}

const STEP_ROUTES: Record<number, string> = {
  1: '/portal/tipo-licencia',
  2: '/portal/solicitud',
  3: '/portal/examen',
  4: '/portal/agendar',
  5: '/portal/confirmacion',
  6: '/portal/resultados',
}

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

const LICENSE_NAMES: Record<string, string> = {
  motocicleta: 'Motocicleta',
  particular: 'Particular',
  publico: 'Transporte Público',
  carga: 'Carga Pesada',
}

/* ─── Sub-components ─── */

function ExamResultBlock({ tramite }: { tramite: Tramite }) {
  const exam = tramite.examResult

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-blue-600" />
        </div>
        <h4 className="text-sm font-semibold text-gray-900">Examen Teórico</h4>
      </div>

      {exam ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">{exam.score}%</span>
            {exam.passed ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                APROBADO
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                <XCircle className="w-3.5 h-3.5" />
                NO APROBADO
              </span>
            )}
          </div>
          <div className="w-full h-2 rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all ${exam.passed ? 'bg-emerald-500' : 'bg-red-400'}`}
              style={{ width: `${exam.score}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">Mínimo aprobatorio: 80%</p>
        </div>
      ) : (
        <div className="flex items-center gap-2 py-3">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">Pendiente</span>
        </div>
      )}
    </div>
  )
}

function SimulatorResultBlock({ tramite }: { tramite: Tramite }) {
  const sim = tramite.simulatorResult

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center">
          <Gamepad2 className="w-4 h-4 text-purple-600" />
        </div>
        <h4 className="text-sm font-semibold text-gray-900">Examen Práctico</h4>
      </div>

      {sim ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">{sim.score}<span className="text-base font-normal text-gray-500">/100</span></span>
            {sim.passed ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                APROBADO
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                <XCircle className="w-3.5 h-3.5" />
                NO APROBADO
              </span>
            )}
          </div>
          <div className="w-full h-2 rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all ${sim.passed ? 'bg-emerald-500' : 'bg-red-400'}`}
              style={{ width: `${sim.score}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">Mínimo aprobatorio: 70/100</p>
          {sim.feedback.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-700 mb-1">Retroalimentación:</p>
              <ul className="space-y-1">
                {sim.feedback.map((f, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <span className="text-gray-400 mt-0.5">&#8226;</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 py-3">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">Pendiente</span>
        </div>
      )}
    </div>
  )
}

function MiniStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, i) => {
        const isComplete = currentStep > step.num
        const isCurrent = currentStep === step.num
        return (
          <div key={step.num} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="w-full flex items-center">
              {i > 0 && (
                <div className={`flex-1 h-0.5 ${isComplete ? 'bg-primary-600' : 'bg-gray-200'}`} />
              )}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold transition-colors ${
                  isComplete
                    ? 'bg-primary-600 text-white'
                    : isCurrent
                      ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isComplete ? <CheckCircle2 className="w-4 h-4" /> : step.num}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 ${isComplete ? 'bg-primary-600' : 'bg-gray-200'}`} />
              )}
            </div>
            <span className={`text-[11px] ${isCurrent ? 'text-primary-600 font-semibold' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Active Tramite Card ─── */

function ActiveTramiteCard({ tramite }: { tramite: Tramite }) {
  const statusCfg = STATUS_CONFIG[tramite.status] || STATUS_CONFIG['iniciado']
  const StatusIcon = statusCfg.icon
  const LicenseIcon = LICENSE_ICONS[tramite.licenseType || ''] || Car
  const licenseName = LICENSE_NAMES[tramite.licenseType || ''] || tramite.licenseType || 'Sin tipo'

  const hasAppointmentNoSimResult = !!tramite.appointment && !tramite.simulatorResult

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
              <LicenseIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-semibold text-gray-900">{tramite.id}</span>
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{licenseName}</p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusCfg.color}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Mini stepper */}
      <div className="px-6 pb-4">
        <MiniStepper currentStep={tramite.currentStep} />
      </div>

      {/* Exam + Simulator results grid */}
      <div className="px-6 pb-4 grid sm:grid-cols-2 gap-3">
        <ExamResultBlock tramite={tramite} />
        <SimulatorResultBlock tramite={tramite} />
      </div>

      {/* Appointment banner */}
      {hasAppointmentNoSimResult && (
        <div className="mx-6 mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
          <CalendarDays className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-amber-800">Cita agendada:</span>{' '}
            <span className="text-amber-700">
              {tramite.appointment!.date} a las {tramite.appointment!.time}
            </span>
            <span className="text-amber-600 text-xs ml-2">Código: {tramite.appointment!.code}</span>
          </div>
        </div>
      )}

      {/* Footer CTA */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-gray-700">
          Siguiente: <span className="font-medium">{STEP_LABELS[tramite.currentStep]}</span>
        </p>
        <Link
          href={STEP_ROUTES[tramite.currentStep] || '/portal'}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 text-sm font-medium group shadow-sm"
        >
          Continuar
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  )
}

/* ─── Completed Tramite Card ─── */

function CompletedTramiteCard({ tramite }: { tramite: Tramite }) {
  const [expanded, setExpanded] = useState(false)
  const LicenseIcon = LICENSE_ICONS[tramite.licenseType || ''] || Car
  const licenseName = LICENSE_NAMES[tramite.licenseType || ''] || tramite.licenseType || 'Sin tipo'

  const overallPassed =
    tramite.status === 'finalizado' ||
    (tramite.status === 'simulador-completado' && tramite.simulatorResult?.passed === true)

  const hasFeedback = tramite.simulatorResult && tramite.simulatorResult.feedback.length > 0

  const dateStr = new Date(tramite.updatedAt).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
              <LicenseIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-mono font-semibold text-gray-900">{tramite.id}</span>
                <span className="text-xs text-gray-400">{licenseName}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {tramite.examResult && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    tramite.examResult.passed
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    <BookOpen className="w-3 h-3" />
                    Teórico: {tramite.examResult.score}%
                  </span>
                )}
                {tramite.simulatorResult && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    tramite.simulatorResult.passed
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    <Gamepad2 className="w-3 h-3" />
                    Simulador: {tramite.simulatorResult.score}/100
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{dateStr}</span>
            {overallPassed ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Aprobado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-700">
                <XCircle className="w-3.5 h-3.5" />
                No aprobado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expandable feedback */}
      {hasFeedback && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-6 py-3 border-t border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="text-xs font-medium text-gray-600">Retroalimentación del simulador</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          </button>
          {expanded && (
            <div className="px-6 pb-4">
              <ul className="space-y-1.5">
                {tramite.simulatorResult!.feedback.map((f, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <span className="text-gray-400 mt-0.5">&#8226;</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ─── Main Component ─── */

export function MisResultados() {
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

  const activeTramites = tramites.filter(
    (t) => t.status !== 'simulador-completado' && t.status !== 'finalizado'
  )
  const completedTramites = tramites.filter(
    (t) => t.status === 'simulador-completado' || t.status === 'finalizado'
  )

  /* Loading */
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-80 bg-gray-100 rounded animate-pulse mt-2" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-white rounded-2xl border border-gray-200 animate-pulse" />
        ))}
      </div>
    )
  }

  /* Empty */
  if (tramites.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Resultados</h1>
          <p className="text-gray-500 mt-1">Revisa el avance y resultados de tus trámites de licencia</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Aún no tienes resultados</h3>
          <p className="text-sm text-gray-500 mb-6">Inicia un trámite de licencia para ver tus resultados aquí.</p>
          <Link
            href="/portal/tipo-licencia"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all text-sm font-medium"
          >
            Iniciar Trámite
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Resultados</h1>
        <p className="text-gray-500 mt-1">Revisa el avance y resultados de tus trámites de licencia</p>
      </div>

      {/* Active Tramites */}
      {activeTramites.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold text-gray-900">Trámites Activos</h2>
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            <span className="text-xs text-gray-500">({activeTramites.length})</span>
          </div>
          <div className="space-y-5">
            {activeTramites.map((t) => (
              <ActiveTramiteCard key={t.id} tramite={t} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tramites */}
      {completedTramites.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Completados</h2>
          <div className="space-y-3">
            {completedTramites.map((t) => (
              <CompletedTramiteCard key={t.id} tramite={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
