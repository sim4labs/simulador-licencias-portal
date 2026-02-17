'use client'

import Image from 'next/image'

export default function BrochurePage() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      {/* Print Button - Hidden when printing */}
      <div className="print:hidden fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={handlePrint}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir / Guardar PDF
        </button>
      </div>

      {/* A4 Pages Container */}
      <div className="bg-gray-300 print:bg-white min-h-screen py-8 print:py-0">
        <div className="max-w-[210mm] mx-auto space-y-8 print:space-y-0">

          {/* PAGE 1 - Cover */}
          <div className="bg-white shadow-xl print:shadow-none w-[210mm] h-[297mm] mx-auto overflow-hidden print:break-after-page relative">
            {/* Header */}
            <div className="h-[25mm] bg-white flex items-center justify-between px-8 border-b-4 border-primary-600">
              <Image
                src="/Tlaxcala-logo.svg"
                alt="Gobierno del Estado de Tlaxcala"
                width={180}
                height={60}
                className="h-14 w-auto"
                priority
              />
              <Image
                src="/Segob-logo.svg"
                alt="SEGOB"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </div>

            {/* Hero Section */}
            <div className="h-[257mm] bg-primary-700 relative flex flex-col">
              {/* Pattern overlay */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'url(/Flower-pattern.png)',
                  backgroundSize: '120px auto',
                  backgroundRepeat: 'repeat'
                }}
              />

              {/* Content */}
              <div className="relative flex-1 flex flex-col justify-center px-12 py-8">
                <div className="grid grid-cols-2 gap-8 items-center">
                  {/* Left - Text */}
                  <div className="text-white">
                    <p className="text-sm font-medium mb-4 bg-white/20 inline-block px-4 py-2 rounded-full">
                      Gobierno del Estado de Tlaxcala
                    </p>
                    <h1 className="text-4xl font-bold mb-6 leading-tight">
                      Simulador de Licencias de Conducir
                    </h1>
                    <p className="text-lg text-white/90 mb-8 leading-relaxed">
                      Sistema integral para la evaluación y certificación de conductores
                      mediante tecnología de simulación de última generación.
                    </p>
                    <div className="flex gap-4">
                      <div className="bg-white/20 px-5 py-3 rounded-lg text-center">
                        <div className="text-2xl font-bold">4</div>
                        <div className="text-xs text-white/80">Tipos de Licencia</div>
                      </div>
                      <div className="bg-white/20 px-5 py-3 rounded-lg text-center">
                        <div className="text-2xl font-bold">100%</div>
                        <div className="text-xs text-white/80">Digital</div>
                      </div>
                      <div className="bg-white/20 px-5 py-3 rounded-lg text-center">
                        <div className="text-2xl font-bold">Seguro</div>
                        <div className="text-xs text-white/80">Sin riesgos</div>
                      </div>
                    </div>
                  </div>

                  {/* Right - Image */}
                  <div>
                    <div className="bg-white rounded-xl p-4 shadow-2xl">
                      <Image
                        src="/simulador.jpeg"
                        alt="Simulador de Manejo"
                        width={400}
                        height={300}
                        className="rounded-lg w-full"
                        priority
                      />
                      <p className="text-center text-gray-600 mt-3 text-sm font-medium">
                        Simulador con tecnología de movimiento 2DOF
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="relative bg-primary-900 py-4 px-12">
                <div className="flex justify-between text-white text-sm">
                  <span>Portal: simulador.tlaxcala.gob.mx</span>
                  <span>Contacto: licencias@tlaxcala.gob.mx</span>
                </div>
              </div>
            </div>

            {/* Bottom strip */}
            <div className="h-[15mm] bg-primary-800" />
          </div>

          {/* PAGE 2 - Process Steps */}
          <div className="bg-white shadow-xl print:shadow-none w-[210mm] h-[297mm] mx-auto overflow-hidden print:break-after-page">
            {/* Header */}
            <div className="h-[20mm] bg-white flex items-center justify-between px-8 border-b border-gray-200">
              <Image
                src="/Flower-logo.svg"
                alt="Tlaxcala"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="text-primary-600 font-semibold">Proceso de Obtención de Licencia</span>
            </div>

            {/* Content */}
            <div className="h-[262mm] px-10 py-8 bg-gray-50">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Proceso en 6 Pasos</h2>
                <p className="text-gray-600">Guía completa para obtener tu licencia de conducir</p>
              </div>

              <div className="space-y-4">
                {/* Step 1 */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Solicitud en Línea</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      Completa tu solicitud con datos personales y CURP en el portal web.
                    </p>
                    <div className="flex gap-2">
                      <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-medium">Datos personales</span>
                      <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-medium">CURP</span>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Tipo de Licencia</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      Selecciona el tipo de licencia que deseas obtener.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Motocicleta</span>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Particular</span>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Público</span>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Carga</span>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Examen Teórico</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      Realiza el examen de conocimientos sobre leyes de tránsito.
                    </p>
                    <div className="flex gap-2">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">20 preguntas</span>
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">30 minutos</span>
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">80% para aprobar</span>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Agendamiento de Cita</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      Elige fecha y hora para tu prueba práctica. Recibe código QR (TLX-XXXXXX).
                    </p>
                    <div className="flex gap-2">
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">Código QR</span>
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">Descargable</span>
                    </div>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    5
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Prueba Práctica en Simulador</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      Preséntate con tus documentos y realiza la prueba de manejo.
                    </p>
                    <div className="flex gap-2">
                      <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium">INE vigente</span>
                      <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium">Código QR</span>
                      <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium">Pago</span>
                    </div>
                  </div>
                </div>

                {/* Step 6 */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    6
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Consulta de Resultados</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      Consulta tus resultados en línea con tu número de trámite.
                    </p>
                    <div className="flex gap-2">
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">Resultados inmediatos</span>
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">En línea</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="h-[15mm] bg-primary-600 flex items-center justify-center">
              <span className="text-white text-sm">Gobierno del Estado de Tlaxcala - Sistema de Licencias de Conducir</span>
            </div>
          </div>

          {/* PAGE 3 - Specs & Benefits */}
          <div className="bg-white shadow-xl print:shadow-none w-[210mm] h-[297mm] mx-auto overflow-hidden">
            {/* Header */}
            <div className="h-[20mm] bg-white flex items-center justify-between px-8 border-b border-gray-200">
              <Image
                src="/Flower-logo.svg"
                alt="Tlaxcala"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="text-primary-600 font-semibold">Especificaciones y Beneficios</span>
            </div>

            {/* Content */}
            <div className="h-[257mm] px-10 py-8">
              <div className="grid grid-cols-2 gap-8 h-full">
                {/* Left Column - Simulator */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">El Simulador</h2>

                  <div className="bg-gray-100 rounded-xl p-4 mb-6">
                    <Image
                      src="/simulador.jpeg"
                      alt="Simulador de Manejo"
                      width={350}
                      height={260}
                      className="rounded-lg w-full"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Movimiento 2DOF</h4>
                        <p className="text-sm text-gray-600">Simula aceleración, frenado y fuerzas laterales en curvas</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Pantalla Curva</h4>
                        <p className="text-sm text-gray-600">Visualización inmersiva para experiencia realista</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Controles Profesionales</h4>
                        <p className="text-sm text-gray-600">Volante, pedales y palanca de cambios reales</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Escenarios Múltiples</h4>
                        <p className="text-sm text-gray-600">Diferentes condiciones de manejo y tráfico</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Benefits */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Beneficios</h2>

                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                      <h4 className="font-semibold text-green-800 mb-2 text-lg">Seguridad</h4>
                      <p className="text-sm text-green-700">
                        Evaluación sin riesgos para el ciudadano ni para terceros. No hay exposición a accidentes viales durante la prueba.
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                      <h4 className="font-semibold text-blue-800 mb-2 text-lg">Evaluación Objetiva</h4>
                      <p className="text-sm text-blue-700">
                        Criterios estandarizados y métricas precisas. El sistema evalúa de forma imparcial las habilidades del conductor.
                      </p>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
                      <h4 className="font-semibold text-purple-800 mb-2 text-lg">Eficiencia</h4>
                      <p className="text-sm text-purple-700">
                        Proceso 100% digital desde el examen teórico hasta los resultados. Reduce tiempos de espera y trámites.
                      </p>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                      <h4 className="font-semibold text-orange-800 mb-2 text-lg">Accesibilidad</h4>
                      <p className="text-sm text-orange-700">
                        Disponible para todos los tipos de licencia. Horarios de lunes a viernes de 9:00 a 17:00 hrs.
                      </p>
                    </div>
                  </div>

                  {/* Contact Box */}
                  <div className="mt-6 bg-primary-50 border border-primary-200 rounded-xl p-5">
                    <h4 className="font-semibold text-primary-800 mb-3 text-lg">Información de Contacto</h4>
                    <div className="space-y-2 text-sm text-primary-700">
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Portal:</span> simulador.tlaxcala.gob.mx
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Email:</span> licencias@tlaxcala.gob.mx
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="h-[20mm] bg-primary-800 flex items-center justify-between px-8">
              <div className="flex items-center gap-6">
                <Image
                  src="/Tlaxcala-logo.svg"
                  alt="Gobierno del Estado de Tlaxcala"
                  width={140}
                  height={45}
                  className="h-10 w-auto brightness-0 invert"
                />
                <Image
                  src="/Segob-logo.svg"
                  alt="SEGOB"
                  width={100}
                  height={35}
                  className="h-8 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-white/80 text-sm">
                © 2025 Gobierno del Estado de Tlaxcala
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }

          html, body {
            width: 210mm;
            height: 297mm;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          .print\\:break-after-page {
            break-after: page;
            page-break-after: always;
          }
        }
      `}</style>
    </>
  )
}
