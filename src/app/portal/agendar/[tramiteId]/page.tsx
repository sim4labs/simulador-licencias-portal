'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressStepper } from '@/components/ProgressStepper'
import { canProceedToStep, type Tramite } from '@/lib/tramite'
import { citizenApi } from '@/lib/citizen-api'
import { publicApi } from '@/lib/admin-api'
import { adaptTramite } from '@/lib/adapters'
import { formatDate } from '@/lib/utils'
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'

const LICENSE_NAMES: Record<string, string> = {
  motocicleta: 'Motocicleta',
  particular: 'Vehículo Particular',
  publico: 'Transporte Público',
  carga: 'Carga Pesada',
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function AgendarCitaPage({ params }: { params: { tramiteId: string } }) {
  const { tramiteId } = params
  const router = useRouter()
  const [tramite, setTramite] = useState<Tramite | null>(null)
  const [loading, setLoading] = useState(true)

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())

  useEffect(() => {
    async function load() {
      const { data } = await citizenApi.getTramite(tramiteId)
      if (!data) {
        router.replace('/portal/agendar')
        return
      }
      const t = adaptTramite(data)
      if (!canProceedToStep(t, 4)) {
        router.replace('/portal/agendar')
        return
      }
      setTramite(t)
      setLoading(false)
    }
    load()
  }, [tramiteId, router])

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

  const handleSelectDate = async (day: number) => {
    if (!isDateAvailable(day)) return
    const date = new Date(currentYear, currentMonth, day)
    setSelectedDate(date)
    setSelectedTime(null)
    setAvailableSlots([])
    setSubmitError(null)
    setLoadingSlots(true)
    const fechaStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const { data } = await publicApi.getDisponibilidad(fechaStr)
    setLoadingSlots(false)
    if (data) {
      setAvailableSlots(data.availableSlots)
    }
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
    setSubmitError(null)

    const fechaStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    const { data, error, status } = await citizenApi.agendarCita(tramite.id, fechaStr, selectedTime)

    if (error || !data) {
      setIsSubmitting(false)
      if (status === 409) {
        setSubmitError('Este horario ya fue tomado. Selecciona otro.')
        const { data: slotData } = await publicApi.getDisponibilidad(fechaStr)
        if (slotData) setAvailableSlots(slotData.availableSlots)
        setSelectedTime(null)
      } else {
        setSubmitError(error || 'Error al agendar la cita')
      }
      return
    }

    router.push(`/portal/confirmacion?id=${tramite.id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-gray-500">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/portal/agendar"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Administrar Citas
        </Link>

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
              loadingSlots ? (
                <div className="text-center text-gray-500 py-12">
                  <div className="animate-pulse">Cargando horarios...</div>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => { setSelectedTime(time); setSubmitError(null) }}
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
                  <p>No hay horarios disponibles para esta fecha</p>
                </div>
              )
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
              {submitError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                  {submitError}
                </div>
              )}
              <Button onClick={handleSubmit} className="w-full" size="lg" isLoading={isSubmitting}>
                Confirmar Cita
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
