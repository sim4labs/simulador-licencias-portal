'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  ClipboardList,
  CalendarDays,
  BookOpen,
  CheckCircle2,
  FileText,
  DollarSign,
  ChevronDown,
  ExternalLink,
  Bike,
  Car,
  Bus,
  Truck,
  AlertCircle,
  Clock,
  MapPin,
} from 'lucide-react'
import { getCurrentCitizen } from '@/lib/citizen-auth'
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

const QUICK_ACTIONS = [
  { label: 'Examen Teórico', desc: 'Practica antes de tu examen', href: '/portal/examen', icon: BookOpen, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { label: 'Consultar Resultados', desc: 'Revisa el estado de tu prueba', href: '/portal/resultados', icon: ClipboardList, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { label: 'Agendar Cita', desc: 'Selecciona fecha y hora', href: '/portal/agendar', icon: CalendarDays, color: 'bg-amber-50 text-amber-600 border-amber-200' },
]

const REQUISITOS = [
  'Identificación oficial vigente (INE/IFE)',
  'CURP (formato impreso o digital)',
  'Comprobante de domicilio reciente (no mayor a 3 meses)',
  'Certificado médico (tipo de sangre y agudeza visual)',
  'Constancia de no antecedentes penales',
  'Fotografías tamaño infantil (2 piezas)',
  'Comprobante de pago de derechos',
]

const COSTOS = [
  { tipo: 'Motocicleta', icon: Bike, vigencia: '3 años', costo: '$850 MXN' },
  { tipo: 'Particular', icon: Car, vigencia: '3 años', costo: '$1,200 MXN' },
  { tipo: 'Transporte Público', icon: Bus, vigencia: '2 años', costo: '$1,800 MXN' },
  { tipo: 'Carga Pesada', icon: Truck, vigencia: '2 años', costo: '$2,500 MXN' },
]

const FAQ_ITEMS = [
  {
    q: '¿Cuánto tiempo tarda el trámite completo?',
    a: 'El proceso completo puede completarse en 1 a 2 semanas, dependiendo de la disponibilidad de citas para el simulador. El examen teórico se realiza en línea y los resultados son inmediatos.',
  },
  {
    q: '¿Qué pasa si repruebo el examen teórico?',
    a: 'Puedes volver a presentar el examen teórico después de 24 horas. No hay límite en el número de intentos. Te recomendamos estudiar la guía y practicar con el examen de prueba antes de presentar el oficial.',
  },
  {
    q: '¿Puedo reagendar mi cita en el simulador?',
    a: 'Sí, puedes reagendar tu cita desde la sección "Agendar Cita" siempre que sea con al menos 24 horas de anticipación. Las citas no reagendadas a tiempo se consideran como falta.',
  },
  {
    q: '¿Qué documentos debo llevar el día de mi cita?',
    a: 'Debes presentar tu identificación oficial vigente, el código QR de confirmación de tu cita (impreso o en tu celular), y tu comprobante de pago de derechos.',
  },
  {
    q: '¿Cuál es la calificación mínima para aprobar?',
    a: 'Para el examen teórico necesitas un mínimo de 80% de aciertos (16 de 20 preguntas). Para la prueba en el simulador, la calificación mínima aprobatoria es de 70 puntos sobre 100.',
  },
]

const ENLACES_OFICIALES = [
  {
    label: 'Reglamento de Tránsito de Tlaxcala',
    url: 'https://www.congresotlaxcala.gob.mx/archivo/leyes/L063.pdf',
  },
  {
    label: 'Ley de Movilidad y Seguridad Vial',
    url: 'https://www.congresotlaxcala.gob.mx/archivo/leyes/',
  },
  {
    label: 'Secretaría de Movilidad y Transporte',
    url: 'https://www.tlaxcala.gob.mx/',
  },
]

/* ─── Page ─── */

export default function PortalPage() {
  const [citizenName, setCitizenName] = useState('')
  const [activeTramite, setActiveTramite] = useState<Tramite | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      const session = await getCurrentCitizen()
      if (session) setCitizenName(session.name)

      const { data } = await citizenApi.getTramiteActivo()
      if (data) {
        const t = adaptTramite(data)
        if (t.currentStep < 6) setActiveTramite(t)
      }
    }
    load()
  }, [])

  const firstName = citizenName.split(' ')[0]

  return (
    <div className="space-y-10">
      {/* ── 1. Saludo + Nuevo Trámite (siempre visible) ── */}
      <div className="relative bg-gradient-to-br from-primary-600 to-primary-accent rounded-2xl overflow-hidden">
        <div
          className="absolute inset-0 bg-repeat opacity-10"
          style={{ backgroundImage: 'url(/Flower-pattern.png)', backgroundSize: '150px auto' }}
        />
        <div className="relative px-8 py-10 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
          <div className="mb-6 sm:mb-0">
            <h1 className="text-xl font-bold text-white mb-2">
              Hola, {firstName}
            </h1>
            <p className="text-white/70 text-sm max-w-md">
              {activeTramite
                ? 'Continúa con tu trámite o inicia uno nuevo.'
                : 'Completa tu solicitud, presenta tu examen teórico y agenda tu cita en el simulador.'}
            </p>
          </div>
          <Link
            href="/portal/tipo-licencia"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 rounded-xl font-semibold text-sm hover:bg-primary-50 transition-colors shadow-lg group"
          >
            Nuevo Trámite
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ── 2. Acciones rápidas ── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
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

      {/* ── 3. Trámites activos ── */}
      {activeTramite && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Mis Trámites Activos</h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-gray-900">Trámite {activeTramite.id}</h3>
                <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2.5 py-1 rounded-full">
                  Paso {activeTramite.currentStep} de 5
                </span>
              </div>
            </div>
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
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-sm text-gray-700">
                Siguiente: <span className="font-medium">{STEP_LABELS[activeTramite.currentStep]}</span>
              </p>
              <Link
                href={STEP_ROUTES[activeTramite.currentStep] || '/solicitud'}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 text-sm font-medium group shadow-sm"
              >
                Continuar
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Citas próximas ── */}
      {activeTramite?.appointment && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Mis Citas Próximas</h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                    <CalendarDays className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fecha</p>
                    <p className="text-sm font-semibold text-gray-900">{activeTramite.appointment.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Hora</p>
                    <p className="text-sm font-semibold text-gray-900">{activeTramite.appointment.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Código de cita</p>
                    <p className="text-sm font-semibold text-gray-900">{activeTramite.appointment.code}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                Confirmada
              </span>
              <Link
                href="/portal/agendar"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Ver detalles →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Recursos de Apoyo ── */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Recursos de Apoyo</h2>
        <p className="text-sm text-gray-500 mb-6">Todo lo que necesitas para completar tu trámite</p>

        {/* Costos + Requisitos */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Costos */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Costos y Vigencia</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {COSTOS.map((item) => (
                  <div
                    key={item.tipo}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                        <item.icon className="w-4.5 h-4.5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.tipo}</p>
                        <p className="text-xs text-gray-500">Vigencia: {item.vigencia}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{item.costo}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-gray-500 text-center">
                Precios sujetos a cambios. Consulta la tabla oficial de derechos vigente.
              </p>
            </div>
          </div>

          {/* Requisitos */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Requisitos del Trámite</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {REQUISITOS.map((req, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-primary-600">{i + 1}</span>
                    </div>
                    <span className="text-sm text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800">
                  Todos los documentos deben ser originales y estar vigentes. Las copias no serán aceptadas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Prepárate para tu Examen */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Prepárate para tu Examen</h3>
          </div>
          <div className="p-6">
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Temas del Examen</h4>
                <ul className="space-y-1.5 text-xs text-blue-800">
                  <li>Señales de tránsito (preventivas, restrictivas, informativas)</li>
                  <li>Límites de velocidad por zona</li>
                  <li>Jerarquía de movilidad</li>
                  <li>Sanciones y alcoholímetro</li>
                  <li>Documentos y seguros obligatorios</li>
                  <li>Reglas específicas por tipo de vehículo</li>
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                <h4 className="text-sm font-semibold text-purple-900 mb-2">Tips de Estudio</h4>
                <ul className="space-y-1.5 text-xs text-purple-800">
                  <li>El examen tiene 20 preguntas de opción múltiple</li>
                  <li>Tienes 30 minutos para completarlo</li>
                  <li>Necesitas mínimo 80% para aprobar (16/20)</li>
                  <li>60% preguntas generales + 40% de tu tipo de licencia</li>
                  <li>Puedes practicar desde &quot;Examen Teórico&quot;</li>
                  <li>Revisa el reglamento de tránsito antes de presentar</li>
                </ul>
              </div>
            </div>

            {/* Enlaces oficiales */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Enlaces Oficiales
              </p>
              <div className="flex flex-wrap gap-2">
                {ENLACES_OFICIALES.map((enlace) => (
                  <a
                    key={enlace.label}
                    href={enlace.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 rounded-lg border border-primary-100 hover:bg-primary-100 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {enlace.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 6. FAQ ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Preguntas Frecuentes</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {FAQ_ITEMS.map((item, idx) => (
            <div key={idx}>
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900 pr-4">{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                    openFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-4 -mt-1">
                  <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 pt-6 pb-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>Gobierno del Estado de Tlaxcala &middot; Secretaría de Movilidad y Transporte</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-gray-600 transition-colors">Aviso de Privacidad</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Términos y Condiciones</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
