import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock, Phone, DollarSign } from 'lucide-react'
import { PROCESS_STEPS } from '@/lib/landing-content'
import { LandingSessionGate } from '@/components/landing/LandingSessionGate'
import { FaqAccordion } from '@/components/landing/FaqAccordion'
import { ScrollReveal } from '@/components/landing/ScrollReveal'
import type { LicenciaResponse } from '@/lib/adapters'
import { formatMXN } from '@/lib/utils'

async function fetchLicenciasCostos(): Promise<LicenciaResponse[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) return []
  try {
    const res = await fetch(`${apiUrl}/licencias`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    const data = (await res.json()) as LicenciaResponse[]
    return data
      .filter(l => typeof l.costo === 'number' && l.costo > 0 && l.name)
      .sort((a, b) => (a.costo ?? 0) - (b.costo ?? 0))
  } catch {
    return []
  }
}

export default async function Home() {
  const costos = await fetchLicenciasCostos()
  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* Header */}
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
          <nav className="flex items-center gap-4">
            <Link
              href="/portal"
              className="inline-flex items-center px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Iniciar Trámite
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 bg-repeat bg-center"
            style={{
              backgroundImage: 'url(/Flower-pattern.png)',
              backgroundSize: '200px auto',
            }}
          />
          <div className="absolute inset-0 bg-primary-accent/90" />
          <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 relative">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 animate-fade-up">
                Simulador de Licencias de Conducir
              </h1>
              <p
                className="text-xl text-white/90 mb-6 max-w-2xl mx-auto opacity-0 animate-fade-up"
                style={{ animationDelay: '0.15s' }}
              >
                Realiza tu trámite completo para obtener tu licencia de conducir en el Estado de
                Tlaxcala
              </p>
              <p
                className="text-lg text-white/80 mb-10 max-w-2xl mx-auto opacity-0 animate-fade-up"
                style={{ animationDelay: '0.3s' }}
              >
                El Gobierno del Estado de Tlaxcala pone a tu disposición simuladores de manejo de
                última generación para evaluar tus habilidades de conducción de forma segura.
              </p>
              <div
                className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap opacity-0 animate-fade-up"
                style={{ animationDelay: '0.45s' }}
              >
                <Link
                  href="/portal/tipo-licencia"
                  className="bg-white text-primary px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-light transition-colors inline-block shadow-lg"
                >
                  Iniciar Solicitud
                </Link>
                <Link
                  href="/resultados"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white/10 transition-colors inline-block"
                >
                  Consultar Resultados
                </Link>
              </div>

              <LandingSessionGate />
            </div>
          </div>
        </section>

        {/* How it Works - 5 Steps */}
        <ScrollReveal className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-on-scroll">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Cómo funciona?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Proceso sencillo en 5 pasos para obtener tu licencia
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {PROCESS_STEPS.map((step) => (
                <div key={step.num} className={`text-center animate-on-scroll stagger-${step.num}`}>
                  <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {step.num}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* License Types */}
        <ScrollReveal className="bg-gray-100 py-20" threshold={0.1}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-on-scroll">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Tipos de Licencia</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Selecciona el tipo de licencia que deseas obtener
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-on-scroll stagger-1">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Motocicleta</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Licencia para conducir motocicletas y vehículos de dos ruedas.
                </p>
                <Link href="/portal" className="text-primary-600 font-medium hover:text-primary-700">
                  Iniciar trámite →
                </Link>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-on-scroll stagger-2">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Vehículo Particular</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Licencia para automóviles, camionetas y vehículos particulares.
                </p>
                <Link href="/portal" className="text-primary-600 font-medium hover:text-primary-700">
                  Iniciar trámite →
                </Link>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-on-scroll stagger-3">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Transporte Público</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Licencia para taxis, colectivos y transporte de pasajeros.
                </p>
                <Link href="/portal" className="text-primary-600 font-medium hover:text-primary-700">
                  Iniciar trámite →
                </Link>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-on-scroll stagger-4">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 17h8M8 17v-4h8v4M8 17H6a2 2 0 01-2-2V9a2 2 0 012-2h1V5a2 2 0 012-2h6a2 2 0 012 2v2h1a2 2 0 012 2v6a2 2 0 01-2 2h-2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Carga Pesada</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Licencia para camiones, tractocamiones y vehículos de carga.
                </p>
                <Link href="/portal" className="text-primary-600 font-medium hover:text-primary-700">
                  Iniciar trámite →
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Costs */}
        {costos.length > 0 && (
          <ScrollReveal className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 animate-on-scroll">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Costos y Vigencia</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Tarifas oficiales por tipo de licencia
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {costos.map((item, i) => (
                  <div
                    key={item.licenseId}
                    className={`bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-shadow animate-on-scroll stagger-${(i % 5) + 1}`}
                  >
                    <DollarSign className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                    <p className="text-3xl font-bold text-primary-600 mb-1">{formatMXN(item.costo)}</p>
                    {item.vigencia && (
                      <p className="text-sm text-gray-500">Vigencia: {item.vigencia}</p>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-gray-500 mt-8 animate-on-scroll stagger-5">
                Métodos de pago aceptados: efectivo en ventanilla, transferencia bancaria y pago en
                línea. Los precios incluyen el uso del simulador y la emisión de la licencia.
              </p>
            </div>
          </ScrollReveal>
        )}

        {/* Requirements */}
        <ScrollReveal className="bg-gray-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-on-scroll">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Requisitos</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Documentos necesarios para realizar tu prueba
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="flex items-center p-4 bg-white rounded-lg border border-gray-200 animate-on-scroll stagger-1">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
                <span className="font-medium text-gray-800">Identificación oficial</span>
              </div>
              <div className="flex items-center p-4 bg-white rounded-lg border border-gray-200 animate-on-scroll stagger-2">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-800">Código QR de cita</span>
              </div>
              <div className="flex items-center p-4 bg-white rounded-lg border border-gray-200 animate-on-scroll stagger-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-800">Comprobante de pago</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Location & Hours */}
        <ScrollReveal className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-on-scroll">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ubicación y Horarios</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Visítanos en nuestras instalaciones
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm animate-on-scroll stagger-1">
                <MapPin className="w-10 h-10 text-primary-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Dirección</h3>
                <p className="text-gray-600 text-sm">
                  Centro de Evaluación de Conductores<br />
                  Blvd. Guillermo Valle #100<br />
                  Col. Centro, Tlaxcala de Xicohténcatl, Tlax.
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm animate-on-scroll stagger-2">
                <Clock className="w-10 h-10 text-primary-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Horarios</h3>
                <p className="text-gray-600 text-sm">
                  Lunes a Viernes<br />
                  <span className="font-medium text-gray-800">9:00 AM – 5:00 PM</span><br />
                  Sábados, domingos y días festivos: Cerrado
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm animate-on-scroll stagger-3">
                <Phone className="w-10 h-10 text-primary-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Contacto</h3>
                <p className="text-gray-600 text-sm">
                  Tel: (246) 462-0000<br />
                  Ext. 1234<br />
                  licencias@tlaxcala.gob.mx
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* FAQ */}
        <ScrollReveal className="bg-gray-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-on-scroll">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Preguntas Frecuentes</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Resuelve tus dudas antes de iniciar tu trámite
              </p>
            </div>
            <FaqAccordion />
          </div>
        </ScrollReveal>

        {/* CTA Final */}
        <ScrollReveal className="relative overflow-hidden">
          <div
            className="absolute inset-0 bg-repeat bg-center"
            style={{
              backgroundImage: 'url(/Flower-pattern.png)',
              backgroundSize: '200px auto',
            }}
          />
          <div className="absolute inset-0 bg-primary-accent/90" />
          <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 relative">
            <div className="text-center animate-on-scroll">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                ¿Listo para obtener tu licencia?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Inicia tu trámite hoy y agenda tu cita en el simulador de manejo
              </p>
              <Link
                href="/portal"
                className="bg-white text-primary px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-light transition-colors inline-block shadow-lg"
              >
                Iniciar Trámite
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Footer */}
      <footer className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-repeat bg-center"
          style={{
            backgroundImage: 'url(/Flower-pattern.png)',
            backgroundSize: '200px auto',
          }}
        />
        <div className="absolute inset-0 bg-primary-accent/95" />

        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <Image
                  src="/Tlaxcala-logo-white.svg"
                  alt="Gobierno del Estado de Tlaxcala"
                  width={200}
                  height={60}
                  className="h-16 w-auto mb-4"
                />
                <p className="text-white/80 text-sm">
                  Portal oficial del Simulador de Licencias de Conducir del Gobierno del Estado de
                  Tlaxcala.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-4">Enlaces</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/portal" className="text-white/80 hover:text-white text-sm transition-colors">
                      Iniciar Trámite
                    </Link>
                  </li>
                  <li>
                    <Link href="/portal/examen" className="text-white/80 hover:text-white text-sm transition-colors">
                      Examen Teórico
                    </Link>
                  </li>
                  <li>
                    <Link href="/resultados" className="text-white/80 hover:text-white text-sm transition-colors">
                      Consultar Resultados
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-4">Contacto</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="tel:+522464620000" className="text-white/80 hover:text-white text-sm transition-colors">
                      (246) 462-0000 ext. 1234
                    </a>
                  </li>
                  <li>
                    <a href="mailto:licencias@tlaxcala.gob.mx" className="text-white/80 hover:text-white text-sm transition-colors">
                      licencias@tlaxcala.gob.mx
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <Image
                    src="/SMyT-logo-white.svg"
                    alt="Secretaría de Movilidad y Transporte"
                    width={120}
                    height={40}
                    className="h-10 w-auto"
                  />
                </div>
                <p className="text-white/60 text-sm text-center md:text-right">
                  © {new Date().getFullYear()} Gobierno del Estado de Tlaxcala. Todos los derechos
                  reservados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
