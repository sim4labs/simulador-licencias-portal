'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, ArrowRight, ClipboardList, CalendarDays, BookOpen, CheckCircle2 } from 'lucide-react'
import { getCurrentCitizen } from '@/lib/citizen-auth'
import { getCurrentTramite, type Tramite } from '@/lib/tramite'

const STEP_LABELS: Record<number, string> = {
  1: 'Solicitud',
  2: 'Tipo de Licencia',
  3: 'Examen Teórico',
  4: 'Agendar Cita',
  5: 'Simulador',
  6: 'Resultados',
}

const STEP_ROUTES: Record<number, string> = {
  1: '/solicitud',
  2: '/tipo-licencia',
  3: '/examen',
  4: '/agendar',
  5: '/confirmacion',
  6: '/resultados',
}

const STEPS = [
  { num: 1, label: 'Solicitud' },
  { num: 2, label: 'Tipo' },
  { num: 3, label: 'Examen' },
  { num: 4, label: 'Cita' },
  { num: 5, label: 'Simulador' },
]

const QUICK_ACTIONS = [
  { label: 'Examen Teórico', desc: 'Practica antes de tu examen', href: '/examen', icon: BookOpen, color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { label: 'Consultar Resultados', desc: 'Revisa el estado de tu prueba', href: '/resultados', icon: ClipboardList, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { label: 'Agendar Cita', desc: 'Selecciona fecha y hora', href: '/agendar', icon: CalendarDays, color: 'bg-amber-50 text-amber-600 border-amber-100' },
]

export default function PortalPage() {
  const [citizenName, setCitizenName] = useState('')
  const [activeTramite, setActiveTramite] = useState<Tramite | null>(null)

  useEffect(() => {
    const session = getCurrentCitizen()
    if (session) setCitizenName(session.name)

    const t = getCurrentTramite()
    if (t && t.currentStep < 6) {
      setActiveTramite(t)
    }
  }, [])

  const firstName = citizenName.split(' ')[0]

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hola, {firstName}
        </h1>
        <p className="text-gray-500 mt-1">
          {activeTramite
            ? 'Continúa con tu trámite de licencia de conducir'
            : 'Bienvenido al portal de trámites de licencia'}
        </p>
      </div>

      {/* Active Tramite or New */}
      {activeTramite ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Step timeline */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-gray-900">Trámite {activeTramite.id}</h2>
              <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2.5 py-1 rounded-full">
                Paso {activeTramite.currentStep} de 5
              </span>
            </div>
          </div>

          {/* Steps visual */}
          <div className="px-6 pb-5">
            <div className="flex items-center gap-1">
              {STEPS.map((step, i) => {
                const isComplete = activeTramite.currentStep > step.num
                const isCurrent = activeTramite.currentStep === step.num
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
          </div>

          {/* Action */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-700">
                Siguiente: <span className="font-medium">{STEP_LABELS[activeTramite.currentStep]}</span>
              </p>
            </div>
            <Link
              href={STEP_ROUTES[activeTramite.currentStep] || '/solicitud'}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 text-sm font-medium group shadow-sm"
            >
              Continuar
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="relative bg-gradient-to-br from-primary-600 to-primary-accent rounded-2xl overflow-hidden">
          <div
            className="absolute inset-0 bg-repeat opacity-10"
            style={{ backgroundImage: 'url(/Flower-pattern.png)', backgroundSize: '150px auto' }}
          />
          <div className="relative px-8 py-10 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
            <div className="mb-6 sm:mb-0">
              <h2 className="text-xl font-bold text-white mb-2">Inicia tu trámite de licencia</h2>
              <p className="text-white/70 text-sm max-w-md">
                Completa tu solicitud, presenta tu examen teórico y agenda tu cita en el simulador.
              </p>
            </div>
            <Link
              href="/solicitud"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 rounded-xl font-semibold text-sm hover:bg-primary-50 transition-colors shadow-lg group"
            >
              <Plus className="w-4 h-4" />
              Nuevo Trámite
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${action.color}`}>
                <action.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{action.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
