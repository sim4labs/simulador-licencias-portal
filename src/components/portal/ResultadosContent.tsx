'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ProgressStepper } from '@/components/ProgressStepper'
import type { Tramite } from '@/lib/tramite'
import { publicApi } from '@/lib/admin-api'
import { adaptPublicTramite } from '@/lib/adapters'
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  Car,
  User,
  FileText,
  ClipboardList,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

const LICENSE_NAMES: Record<string, string> = {
  motocicleta: 'Motocicleta',
  particular: 'Vehículo Particular',
  publico: 'Transporte Público',
  carga: 'Carga Pesada',
}

interface ResultadosContentProps {
  basePath?: string
}

export function ResultadosContent({ basePath = '' }: ResultadosContentProps) {
  const [searchCode, setSearchCode] = useState('')
  const [searchResult, setSearchResult] = useState<Tramite | null | 'not_found'>(null)
  const [isSearching, setIsSearching] = useState(false)

  const solicitudHref = basePath ? `${basePath}/solicitud` : '/solicitud'

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchCode.trim()) return

    setIsSearching(true)
    const query = searchCode.trim().toUpperCase()

    const isTramiteId = query.startsWith('TLX-')
    const searchQuery = isTramiteId
      ? { tramiteId: query }
      : { appointmentCode: query }

    const { data } = await publicApi.buscarTramite(searchQuery)

    if (data) {
      const tramite = adaptPublicTramite(data) as Tramite
      setSearchResult(tramite)
    } else {
      setSearchResult('not_found')
    }

    setIsSearching(false)
  }

  const getStepStatus = (tramite: Tramite, stepNum: number) => {
    if (stepNum < tramite.currentStep) return 'completed'
    if (stepNum === tramite.currentStep) return 'current'
    return 'pending'
  }

  return (
    <>
      <ProgressStepper currentStep={6} className="mb-8" />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary-600 mb-2">Consulta de Resultados</h1>
        <p className="text-gray-600">
          Ingresa tu número de trámite (TLX-XXXXXX) o código de cita para ver el estado de tu proceso
        </p>
      </div>

      {/* Search Form */}
      <Card padding="lg" className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <Input
            placeholder="Ej: TLX-ABC123 o código de cita"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
            className="flex-1 uppercase"
          />
          <Button type="submit" isLoading={isSearching} className="gap-2">
            <Search className="w-4 h-4" />
            Buscar
          </Button>
        </form>
      </Card>

      {/* Not found */}
      {searchResult === 'not_found' && (
        <Card padding="lg" className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No se encontró el trámite</h2>
          <p className="text-gray-600 mb-4">
            El código ingresado no corresponde a ningún trámite registrado. Verifica el código e intenta de nuevo.
          </p>
          <Button asChild variant="outline">
            <Link href={solicitudHref}>Iniciar nuevo trámite</Link>
          </Button>
        </Card>
      )}

      {/* Result found */}
      {searchResult && searchResult !== 'not_found' && (
        <div className="space-y-6">
          {/* Tramite Status Card */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-500">Número de trámite</p>
                <p className="text-2xl font-bold text-primary-600">{searchResult.id}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Estado</p>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                    searchResult.status === 'finalizado'
                      ? 'bg-green-100 text-green-700'
                      : searchResult.status === 'simulador-completado'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {searchResult.status === 'finalizado' && <CheckCircle className="w-4 h-4" />}
                  {searchResult.status === 'simulador-completado' && <XCircle className="w-4 h-4" />}
                  {!['finalizado', 'simulador-completado'].includes(searchResult.status) && (
                    <Clock className="w-4 h-4" />
                  )}
                  {searchResult.status === 'finalizado'
                    ? 'Aprobado'
                    : searchResult.status === 'simulador-completado'
                      ? 'No Aprobado'
                      : 'En proceso'}
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Solicitante</p>
                  <p className="font-medium text-sm">
                    {searchResult.personalData.nombre} {searchResult.personalData.apellidoPaterno}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Licencia</p>
                  <p className="font-medium text-sm">{LICENSE_NAMES[searchResult.licenseType || ''] || 'Pendiente'}</p>
                </div>
              </div>
              {searchResult.appointment && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cita</p>
                    <p className="font-medium text-sm">
                      {formatDate(new Date(searchResult.appointment.date))} - {searchResult.appointment.time}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Progress Steps */}
          <Card padding="lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary-600" />
              Progreso del trámite
            </h2>
            <div className="space-y-3">
              {[
                { num: 1, label: 'Tipo de Licencia', icon: Car },
                { num: 2, label: 'Solicitud', icon: FileText },
                { num: 3, label: 'Examen Teórico', icon: FileText },
                { num: 4, label: 'Cita Agendada', icon: Calendar },
                { num: 5, label: 'Prueba en Simulador', icon: ClipboardList },
                { num: 6, label: 'Resultado Final', icon: CheckCircle },
              ].map((s) => {
                const status = getStepStatus(searchResult, s.num)
                const Icon = s.icon
                return (
                  <div
                    key={s.num}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      status === 'completed'
                        ? 'bg-green-50'
                        : status === 'current'
                          ? 'bg-primary-50'
                          : 'bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        status === 'completed'
                          ? 'bg-green-500 text-white'
                          : status === 'current'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-300 text-white'
                      }`}
                    >
                      {status === 'completed' ? <CheckCircle className="w-4 h-4" /> : s.num}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          status === 'completed'
                            ? 'text-green-700'
                            : status === 'current'
                              ? 'text-primary-700'
                              : 'text-gray-400'
                        }`}
                      >
                        {s.label}
                      </p>
                    </div>
                    <Icon
                      className={`w-4 h-4 ${
                        status === 'completed'
                          ? 'text-green-500'
                          : status === 'current'
                            ? 'text-primary-500'
                            : 'text-gray-300'
                      }`}
                    />
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Exam Result */}
          {searchResult.examResult && (
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-primary-600 mb-4">Examen Teórico</h2>
              <div className="flex items-center gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg flex-1">
                  <p className="text-3xl font-bold text-primary-600">{searchResult.examResult.score}%</p>
                  <p className="text-sm text-gray-600">Calificación</p>
                </div>
                <div
                  className={`text-center p-4 rounded-lg flex-1 ${
                    searchResult.examResult.passed ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <p
                    className={`text-lg font-bold ${
                      searchResult.examResult.passed ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {searchResult.examResult.passed ? 'APROBADO' : 'NO APROBADO'}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Simulator Result */}
          {searchResult.simulatorResult && (
            <Card padding="lg">
              <h2 className="text-xl font-semibold mb-4 text-primary-600">Resultados del Simulador</h2>

              <div className="text-center py-6 mb-6 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">Calificación obtenida</p>
                <p
                  className="text-5xl font-bold"
                  style={{ color: searchResult.simulatorResult.passed ? '#86B747' : '#ef4444' }}
                >
                  {searchResult.simulatorResult.score}
                </p>
                <p className="text-sm text-gray-500 mt-1">de 100 puntos</p>
                <p
                  className="mt-2 font-semibold"
                  style={{ color: searchResult.simulatorResult.passed ? '#86B747' : '#ef4444' }}
                >
                  {searchResult.simulatorResult.passed ? 'APROBADO' : 'NO APROBADO'}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Observaciones:</h3>
                <ul className="space-y-2">
                  {searchResult.simulatorResult.feedback.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span
                        className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: searchResult.simulatorResult?.passed ? '#86B747' : '#f59e0b',
                        }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {searchResult.simulatorResult.passed ? (
                <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(134, 183, 71, 0.15)' }}>
                  <p className="text-sm font-medium" style={{ color: '#5a7a2e' }}>
                    Has aprobado la prueba del simulador. Acude a las oficinas de tránsito para continuar con el
                    trámite de tu licencia.
                  </p>
                </div>
              ) : (
                <div className="mt-6 p-4 bg-warning/10 rounded-lg">
                  <p className="text-sm text-warning-foreground font-medium mb-2">
                    No te desanimes. Puedes volver a agendar una nueva cita para intentar de nuevo.
                  </p>
                  <Button asChild size="sm">
                    <Link href={solicitudHref}>Iniciar nuevo trámite</Link>
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Pending Message */}
          {searchResult.appointment &&
            !searchResult.simulatorResult &&
            new Date(searchResult.appointment.date) >= new Date() && (
              <Card padding="lg" className="bg-primary-50 border border-primary-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900 mb-1">Cita pendiente</h3>
                    <p className="text-sm text-primary-700">
                      Tu cita está programada para el{' '}
                      <span className="font-medium">{formatDate(new Date(searchResult.appointment.date))}</span> a
                      las <span className="font-medium">{searchResult.appointment.time}</span>. Los resultados del
                      simulador estarán disponibles después de realizar la prueba.
                    </p>
                  </div>
                </div>
              </Card>
            )}
        </div>
      )}

      {/* Empty State */}
      {!searchResult && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-gray-500">Ingresa tu número de trámite o código de cita para ver los resultados</p>
        </div>
      )}
    </>
  )
}
