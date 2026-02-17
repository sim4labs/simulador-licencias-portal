'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressStepper } from '@/components/ProgressStepper'
import {
  getCurrentTramite,
  updateTramite,
  canProceedToStep,
  type Tramite,
} from '@/lib/tramite'
import { generateAppointmentCode, formatDate } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const LICENSE_NAMES: Record<string, string> = {
  motocicleta: 'Motocicleta',
  particular: 'Vehículo Particular',
  publico: 'Transporte Público',
  carga: 'Carga Pesada',
}

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00',
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function AgendarPage() {
  const router = useRouter()
  const [tramite, setTramite] = useState<Tramite | null>(null)
  const [loading, setLoading] = useState(true)

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())

  useEffect(() => {
    const t = getCurrentTramite()
    if (!t || !canProceedToStep(t, 4)) {
      router.replace('/solicitud')
      return
    }
    setTramite(t)
    setLoading(false)
  }, [router])

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth)
  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric',
  })

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = []
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    return days
  }, [firstDayOfMonth, daysInMonth])

  const isDateAvailable = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) return false
    if (date < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return false
    return true
  }

  const handleSelectDate = (day: number) => {
    if (!isDateAvailable(day)) return
    setSelectedDate(new Date(currentYear, currentMonth, day))
    setSelectedTime(null)
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handleSubmit = async () => {
    if (!tramite || !selectedDate || !selectedTime) return

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const code = generateAppointmentCode()

    updateTramite(tramite.id, {
      appointment: {
        date: selectedDate.toISOString(),
        time: selectedTime,
        code,
      },
      currentStep: 5,
      status: 'cita-agendada',
    })

    // Also store in legacy appointments for backward compat
    const appointment = {
      code,
      tramiteId: tramite.id,
      licenseType: tramite.licenseType,
      date: selectedDate.toISOString(),
      time: selectedTime,
      name: `${tramite.personalData.nombre} ${tramite.personalData.apellidoPaterno} ${tramite.personalData.apellidoMaterno}`,
      email: tramite.personalData.email,
      createdAt: new Date().toISOString(),
      status: 'scheduled',
    }
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]')
    appointments.push(appointment)
    localStorage.setItem('appointments', JSON.stringify(appointments))

    router.push(`/confirmacion?code=${code}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-500">Cargando...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
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
        <div className="max-w-4xl mx-auto">
          <ProgressStepper currentStep={4} className="mb-8" />

          {/* Tramite summary */}
          {tramite && (
            <div className="bg-primary-50 rounded-lg p-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-primary-700">
                  Trámite <span className="font-semibold">{tramite.id}</span> — {tramite.personalData.nombre}{' '}
                  {tramite.personalData.apellidoPaterno}
                </p>
                <p className="text-sm text-primary-700">
                  Licencia: <span className="font-semibold">{LICENSE_NAMES[tramite.licenseType || '']}</span>
                </p>
              </div>
            </div>
          )}

          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Selecciona fecha y hora
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Elige una fecha y hora disponible para tu cita en el simulador
          </p>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Calendar */}
            <Card padding="lg">
              <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold capitalize">{monthName}</h2>
                <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (day === null) return <div key={`empty-${index}`} />

                  const isAvailable = isDateAvailable(day)
                  const isSelected =
                    selectedDate &&
                    selectedDate.getDate() === day &&
                    selectedDate.getMonth() === currentMonth &&
                    selectedDate.getFullYear() === currentYear
                  const isToday =
                    today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear

                  return (
                    <button
                      key={day}
                      onClick={() => handleSelectDate(day)}
                      disabled={!isAvailable}
                      className={`
                        p-2 text-center rounded-lg transition-colors
                        ${isSelected ? 'bg-primary-600 text-white' : ''}
                        ${isToday && !isSelected ? 'ring-2 ring-primary-300' : ''}
                        ${isAvailable && !isSelected ? 'hover:bg-primary-100' : ''}
                        ${!isAvailable ? 'text-gray-300 cursor-not-allowed' : ''}
                      `}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </Card>

            {/* Time Slots */}
            <Card padding="lg">
              <h2 className="text-lg font-semibold mb-4">
                {selectedDate ? `Horarios para ${formatDate(selectedDate)}` : 'Selecciona una fecha'}
              </h2>

              {selectedDate ? (
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`
                        py-3 px-4 rounded-lg border text-center transition-colors
                        ${
                          selectedTime === time
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                        }
                      `}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <p>Selecciona una fecha en el calendario para ver los horarios disponibles</p>
                </div>
              )}
            </Card>
          </div>

          {/* Confirm button */}
          {selectedDate && selectedTime && (
            <div className="mt-8 max-w-md mx-auto">
              <Card padding="lg">
                <div className="bg-primary-50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-primary-900 mb-2">Resumen de tu cita</h3>
                  <div className="text-sm text-primary-700 space-y-1">
                    <p>
                      <span className="font-medium">Licencia:</span> {LICENSE_NAMES[tramite?.licenseType || '']}
                    </p>
                    <p>
                      <span className="font-medium">Fecha:</span> {formatDate(selectedDate)}
                    </p>
                    <p>
                      <span className="font-medium">Hora:</span> {selectedTime}
                    </p>
                  </div>
                </div>
                <Button onClick={handleSubmit} className="w-full" size="lg" isLoading={isSubmitting}>
                  Confirmar Cita
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
