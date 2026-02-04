'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Search, CheckCircle, XCircle, Clock, AlertCircle, Calendar, Car, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Appointment {
  code: string
  licenseType: string
  date: string
  time: string
  name: string
  email: string
  createdAt: string
  status: string
  result?: {
    score: number
    passed: boolean
    completedAt: string
    feedback: string[]
  }
}

const LICENSE_NAMES: Record<string, string> = {
  motocicleta: 'Motocicleta',
  particular: 'Vehículo Particular',
  publico: 'Transporte Público',
  carga: 'Carga Pesada',
}

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  scheduled: { icon: Clock, color: 'text-warning', label: 'Pendiente' },
  completed: { icon: CheckCircle, color: 'text-success', label: 'Completado' },
  passed: { icon: CheckCircle, color: 'text-success', label: 'Aprobado' },
  failed: { icon: XCircle, color: 'text-destructive', label: 'No Aprobado' },
}

export default function ResultadosPage() {
  const [searchCode, setSearchCode] = useState('')
  const [searchResult, setSearchResult] = useState<Appointment | null | 'not_found'>(null)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchCode.trim()) return

    setIsSearching(true)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // Search in localStorage
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]')
    const found = appointments.find((a: Appointment) =>
      a.code.toLowerCase() === searchCode.trim().toLowerCase()
    )

    if (found) {
      // Simulate that some appointments have been completed with results
      const appointmentDate = new Date(found.date)
      const now = new Date()

      if (appointmentDate < now) {
        // Past appointment - simulate result
        const passed = Math.random() > 0.3 // 70% pass rate for demo
        const score = passed ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 30) + 40

        found.status = passed ? 'passed' : 'failed'
        found.result = {
          score,
          passed,
          completedAt: found.date,
          feedback: passed
            ? [
                'Excelente control del vehículo',
                'Buena respuesta a señales de tránsito',
                'Manejo adecuado de velocidad',
              ]
            : [
                'Mejorar el control en curvas',
                'Atención a las señales de alto',
                'Revisar técnica de frenado',
              ],
        }
      }

      setSearchResult(found)
    } else {
      setSearchResult('not_found')
    }

    setIsSearching(false)
  }

  const StatusIcon = searchResult && searchResult !== 'not_found'
    ? STATUS_CONFIG[searchResult.status]?.icon || Clock
    : Clock

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
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
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
            Volver al inicio
          </Link>
        </div>
      </header>

      <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-600 mb-2">
              Consulta de Resultados
            </h1>
            <p className="text-gray-600">
              Ingresa tu código de cita para ver el estado y resultados de tu prueba
            </p>
          </div>

          {/* Search Form */}
          <Card padding="lg" className="mb-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <Input
                placeholder="Ingresa tu código (ej: ABC12345)"
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

          {/* Results */}
          {searchResult === 'not_found' && (
            <Card padding="lg" className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontró la cita
              </h2>
              <p className="text-gray-600 mb-4">
                El código ingresado no corresponde a ninguna cita registrada.
                Verifica el código e intenta de nuevo.
              </p>
              <Button asChild variant="outline">
                <Link href="/agendar">Agendar nueva cita</Link>
              </Button>
            </Card>
          )}

          {searchResult && searchResult !== 'not_found' && (
            <div className="space-y-6">
              {/* Status Card */}
              <Card padding="lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Código de cita</p>
                    <p className="text-2xl font-bold text-primary-600">{searchResult.code}</p>
                  </div>
                  <div
                    className="flex items-center gap-2"
                    style={{
                      color: searchResult.status === 'passed' ? '#86B747'
                        : searchResult.status === 'failed' ? '#ef4444'
                        : searchResult.status === 'scheduled' ? '#f59e0b'
                        : '#6b7280'
                    }}
                  >
                    <StatusIcon className="w-6 h-6" />
                    <span className="font-semibold">
                      {STATUS_CONFIG[searchResult.status]?.label || 'Pendiente'}
                    </span>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Solicitante</p>
                      <p className="font-medium text-sm">{searchResult.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Car className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Licencia</p>
                      <p className="font-medium text-sm">{LICENSE_NAMES[searchResult.licenseType]}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Fecha</p>
                      <p className="font-medium text-sm">
                        {formatDate(new Date(searchResult.date))} - {searchResult.time}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Results Card (if completed) */}
              {searchResult.result && (
                <Card padding="lg">
                  <h2 className="text-xl font-semibold mb-4 text-primary-600">Resultados de la Prueba</h2>

                  {/* Score */}
                  <div className="text-center py-6 mb-6 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">Calificación obtenida</p>
                    <p
                      className="text-5xl font-bold"
                      style={{ color: searchResult.result.passed ? '#86B747' : '#ef4444' }}
                    >
                      {searchResult.result.score}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">de 100 puntos</p>
                    <p
                      className="mt-2 font-semibold"
                      style={{ color: searchResult.result.passed ? '#86B747' : '#ef4444' }}
                    >
                      {searchResult.result.passed ? 'APROBADO' : 'NO APROBADO'}
                    </p>
                  </div>

                  {/* Feedback */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Observaciones:</h3>
                    <ul className="space-y-2">
                      {searchResult.result.feedback.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span
                            className="mt-1 w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: searchResult.result?.passed ? '#86B747' : '#f59e0b' }}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Next Steps */}
                  {searchResult.result.passed ? (
                    <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(134, 183, 71, 0.15)' }}>
                      <p className="text-sm font-medium" style={{ color: '#5a7a2e' }}>
                        ¡Felicidades! Has aprobado la prueba del simulador.
                        Acude a las oficinas de tránsito para continuar con el trámite de tu licencia.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 p-4 bg-warning/10 rounded-lg">
                      <p className="text-sm text-warning-foreground font-medium mb-2">
                        No te desanimes. Puedes volver a agendar una nueva cita para intentar de nuevo.
                      </p>
                      <Button asChild size="sm">
                        <Link href="/agendar">Agendar nueva cita</Link>
                      </Button>
                    </div>
                  )}
                </Card>
              )}

              {/* Pending Message */}
              {searchResult.status === 'scheduled' && (
                <Card padding="lg" className="bg-primary-50 border border-primary-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary-900 mb-1">Cita pendiente</h3>
                      <p className="text-sm text-primary-700">
                        Tu cita está programada para el{' '}
                        <span className="font-medium">{formatDate(new Date(searchResult.date))}</span>{' '}
                        a las <span className="font-medium">{searchResult.time}</span>.
                        Los resultados estarán disponibles después de realizar la prueba.
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
              <p className="text-gray-500">
                Ingresa tu código de cita para ver los resultados
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
