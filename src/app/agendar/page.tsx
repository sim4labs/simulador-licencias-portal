'use client'

import { useState, useMemo, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { ChevronLeft, ChevronRight, Bike, Car, Bus, Truck, Check } from 'lucide-react'
import { formatDate, generateAppointmentCode } from '@/lib/utils'

const LICENSE_TYPES = [
  { id: 'motocicleta', name: 'Motocicleta', icon: Bike, description: 'Vehículos de dos ruedas' },
  { id: 'particular', name: 'Vehículo Particular', icon: Car, description: 'Automóviles y camionetas' },
  { id: 'publico', name: 'Transporte Público', icon: Bus, description: 'Taxis y colectivos' },
  { id: 'carga', name: 'Carga Pesada', icon: Truck, description: 'Camiones y tractocamiones' },
]

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00'
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function AgendarContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialType = searchParams.get('tipo') || ''

  const [step, setStep] = useState(initialType ? 2 : 1)
  const [selectedType, setSelectedType] = useState(initialType)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [formData, setFormData] = useState({ nombre: '', email: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth)

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = []
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }, [firstDayOfMonth, daysInMonth])

  const isDateAvailable = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    const dayOfWeek = date.getDay()
    // Not weekends, not past
    if (dayOfWeek === 0 || dayOfWeek === 6) return false
    if (date < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return false
    return true
  }

  const handleSelectType = (typeId: string) => {
    setSelectedType(typeId)
    setStep(2)
  }

  const handleSelectDate = (day: number) => {
    if (!isDateAvailable(day)) return
    setSelectedDate(new Date(currentYear, currentMonth, day))
    setSelectedTime(null)
  }

  const handleSelectTime = (time: string) => {
    setSelectedTime(time)
    setStep(3)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nombre || !formData.email) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    const code = generateAppointmentCode()

    // Store appointment in localStorage for demo
    const appointment = {
      code,
      licenseType: selectedType,
      date: selectedDate?.toISOString(),
      time: selectedTime,
      name: formData.nombre,
      email: formData.email,
      createdAt: new Date().toISOString(),
      status: 'scheduled'
    }

    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]')
    appointments.push(appointment)
    localStorage.setItem('appointments', JSON.stringify(appointments))

    router.push(`/confirmacion?code=${code}`)
  }

  const selectedTypeInfo = LICENSE_TYPES.find(t => t.id === selectedType)

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
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-start justify-center">
              {[
                { num: 1, label: 'Tipo de Licencia' },
                { num: 2, label: 'Fecha y Hora' },
                { num: 3, label: 'Datos' },
              ].map((s, index) => (
                <div key={s.num} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        step >= s.num
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                    </div>
                    <span className={`mt-2 text-sm text-center ${
                      step === s.num ? 'font-semibold text-primary-600' : 'text-gray-600'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                  {index < 2 && (
                    <div
                      className={`w-16 sm:w-24 h-1 mx-2 mb-6 ${
                        step > s.num ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: License Type */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Selecciona el tipo de licencia
              </h1>
              <p className="text-gray-600 text-center mb-8">
                Elige el tipo de licencia que deseas obtener
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {LICENSE_TYPES.map((type) => {
                  const Icon = type.icon
                  return (
                    <Card
                      key={type.id}
                      padding="lg"
                      className={`cursor-pointer transition-all hover:shadow-lg hover:border-primary-300 ${
                        selectedType === type.id ? 'border-2 border-primary-600 bg-primary-50' : ''
                      }`}
                      onClick={() => handleSelectType(type.id)}
                    >
                      <div className="flex items-center">
                        <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mr-4">
                          <Icon className="w-7 h-7 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
                          <p className="text-sm text-gray-500">{type.description}</p>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: Date and Time */}
          {step === 2 && (
            <div>
              <button
                onClick={() => setStep(1)}
                className="text-primary-600 hover:text-primary-700 mb-4 flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Cambiar tipo de licencia
              </button>

              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Selecciona fecha y hora
              </h1>
              <p className="text-gray-600 text-center mb-8">
                Licencia: <span className="font-semibold">{selectedTypeInfo?.name}</span>
              </p>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Calendar */}
                <Card padding="lg">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={handlePrevMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-semibold capitalize">{monthName}</h2>
                    <button
                      onClick={handleNextMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
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
                      if (day === null) {
                        return <div key={`empty-${index}`} />
                      }

                      const isAvailable = isDateAvailable(day)
                      const isSelected =
                        selectedDate &&
                        selectedDate.getDate() === day &&
                        selectedDate.getMonth() === currentMonth &&
                        selectedDate.getFullYear() === currentYear
                      const isToday =
                        today.getDate() === day &&
                        today.getMonth() === currentMonth &&
                        today.getFullYear() === currentYear

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
                    {selectedDate
                      ? `Horarios para ${formatDate(selectedDate)}`
                      : 'Selecciona una fecha'}
                  </h2>

                  {selectedDate ? (
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map((time) => (
                        <button
                          key={time}
                          onClick={() => handleSelectTime(time)}
                          className={`
                            py-3 px-4 rounded-lg border text-center transition-colors
                            ${selectedTime === time
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
            </div>
          )}

          {/* Step 3: User Data */}
          {step === 3 && (
            <div>
              <button
                onClick={() => setStep(2)}
                className="text-primary-600 hover:text-primary-700 mb-4 flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Cambiar fecha y hora
              </button>

              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Completa tus datos
              </h1>
              <p className="text-gray-600 text-center mb-8">
                Ingresa tu información para confirmar la cita
              </p>

              <Card padding="lg" className="max-w-md mx-auto">
                {/* Appointment Summary */}
                <div className="bg-primary-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-primary-900 mb-2">Resumen de tu cita</h3>
                  <div className="text-sm text-primary-700 space-y-1">
                    <p><span className="font-medium">Licencia:</span> {selectedTypeInfo?.name}</p>
                    <p><span className="font-medium">Fecha:</span> {selectedDate && formatDate(selectedDate)}</p>
                    <p><span className="font-medium">Hora:</span> {selectedTime}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Nombre completo"
                    placeholder="Ej: Juan Pérez García"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />

                  <Input
                    label="Correo electrónico"
                    type="email"
                    placeholder="Ej: juan@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    helperText="Recibirás tu código QR en este correo"
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    isLoading={isSubmitting}
                  >
                    Confirmar Cita
                  </Button>
                </form>
              </Card>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default function AgendarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-500">Cargando...</div>
      </div>
    }>
      <AgendarContent />
    </Suspense>
  )
}
