'use client'

import { useState, useEffect, useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from './Badge'
import { Modal } from './Modal'
import { cn } from '@/lib/utils'
import {
  getDeviceAppointments,
  type DeviceAppointment,
  type VehicleType,
} from '@/lib/iot-api'

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30',
]

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']

/** Mapeo de vehicleType del dispositivo al licenseType oficial (ID numérico como string). */
const VEHICLE_TO_LICENSE: Record<VehicleType, string> = {
  motorcycle: '4',       // Motociclista
  car: '3',              // Automovilista
  passenger_bus: '1',    // Servicio Público
  cargo_truck: '6',      // Servicio de Carga
}

const STATUS_BG: Record<string, string> = {
  'pendiente': 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  'en-progreso': 'bg-blue-50 hover:bg-blue-100 text-blue-700',
  'aprobado': 'bg-green-50 hover:bg-green-100 text-green-700',
  'reprobado': 'bg-red-50 hover:bg-red-100 text-red-700',
}

const STATUS_VARIANT: Record<string, 'default' | 'info' | 'success' | 'destructive'> = {
  'pendiente': 'default',
  'en-progreso': 'info',
  'aprobado': 'success',
  'reprobado': 'destructive',
}

const STATUS_LABEL: Record<string, string> = {
  'pendiente': 'Pendiente',
  'en-progreso': 'En progreso',
  'aprobado': 'Aprobado',
  'reprobado': 'Reprobado',
}

function formatDateISO(d: Date) {
  return d.toISOString().slice(0, 10)
}

function formatDateDisplay(d: Date) {
  return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function getMonday(d: Date) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

interface DeviceCalendarProps {
  thingName: string
  vehicleType?: VehicleType | null
}

export function DeviceCalendar({ thingName, vehicleType }: DeviceCalendarProps) {
  const [appointments, setAppointments] = useState<DeviceAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'day' | 'week'>('day')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedAppt, setSelectedAppt] = useState<DeviceAppointment | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getDeviceAppointments(thingName).then(data => {
      if (!cancelled) {
        setAppointments(data)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [thingName])

  // Filtrar por tipo de vehículo del dispositivo
  const filteredAppointments = useMemo(() => {
    if (!vehicleType) return appointments
    const targetLicense = VEHICLE_TO_LICENSE[vehicleType]
    if (!targetLicense) return appointments
    return appointments.filter(a => a.licenseType === targetLicense)
  }, [appointments, vehicleType])

  const dateStr = formatDateISO(currentDate)
  const monday = useMemo(() => getMonday(currentDate), [currentDate])

  const weekDays = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(d.getDate() + i)
      return d
    })
  }, [monday])

  const dayAppts = useMemo(() => {
    return filteredAppointments.filter(a => a.date === dateStr)
  }, [filteredAppointments, dateStr])

  const weekAppts = useMemo(() => {
    const map: Record<string, DeviceAppointment[]> = {}
    for (const d of weekDays) {
      const ds = formatDateISO(d)
      map[ds] = filteredAppointments.filter(a => a.date === ds)
    }
    return map
  }, [filteredAppointments, weekDays])

  const navigate = (dir: number) => {
    const d = new Date(currentDate)
    if (view === 'day') d.setDate(d.getDate() + dir)
    else d.setDate(d.getDate() + dir * 7)
    setCurrentDate(d)
  }

  const goToday = () => setCurrentDate(new Date())

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-gray-500">Cargando calendario...</span>
      </div>
    )
  }

  return (
    <div>
      {/* Controles */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToday}>Hoy</Button>
          <Button variant="outline" size="sm" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-gray-700 ml-2">
            {view === 'day'
              ? formatDateDisplay(currentDate)
              : `${weekDays[0].toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} – ${weekDays[4].toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`
            }
          </span>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-md p-0.5">
          <button
            onClick={() => setView('day')}
            className={cn('px-3 py-1 text-xs font-medium rounded', view === 'day' ? 'bg-white shadow text-gray-900' : 'text-gray-500')}
          >
            Día
          </button>
          <button
            onClick={() => setView('week')}
            className={cn('px-3 py-1 text-xs font-medium rounded', view === 'week' ? 'bg-white shadow text-gray-900' : 'text-gray-500')}
          >
            Semana
          </button>
        </div>
      </div>

      {/* Leyenda de colores */}
      <div className="flex items-center gap-4 mb-3 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-gray-300" />
          Pendiente
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-blue-400" />
          En progreso
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-green-400" />
          Aprobado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-red-400" />
          Reprobado
        </span>
      </div>

      {/* Vista de Día */}
      {view === 'day' && (
        <div className="bg-white rounded-lg shadow divide-y divide-gray-100">
          {TIME_SLOTS.map(slot => {
            const slotAppts = dayAppts.filter(a => a.time === slot)
            return (
              <div key={slot} className="flex">
                <div className="w-20 flex-shrink-0 py-3 px-3 text-xs font-medium text-gray-500 border-r border-gray-100">
                  {slot}
                </div>
                <div className="flex-1 py-2 px-3 min-h-[48px]">
                  {slotAppts.length === 0 ? (
                    <span className="text-xs text-gray-300">&mdash;</span>
                  ) : (
                    <div className="space-y-1">
                      {slotAppts.map(a => (
                        <button
                          key={a.id}
                          onClick={() => setSelectedAppt(a)}
                          className={cn(
                            'block w-full text-left rounded px-3 py-1.5 transition-colors',
                            STATUS_BG[a.status] || 'bg-gray-100'
                          )}
                        >
                          <span className="text-sm font-medium">{a.citizenName}</span>
                          <span className="text-xs ml-2 opacity-70 capitalize">{a.licenseType}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Vista de Semana */}
      {view === 'week' && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="w-20 p-2 text-xs text-gray-500" />
                {weekDays.map((d, i) => (
                  <th key={i} className="p-2 text-center border-l border-gray-100">
                    <div className="text-xs font-medium text-gray-500">{DAY_NAMES[i]}</div>
                    <div className={cn(
                      'text-sm font-bold mt-0.5',
                      formatDateISO(d) === formatDateISO(new Date()) ? 'text-primary' : 'text-gray-900'
                    )}>
                      {d.getDate()}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map(slot => (
                <tr key={slot} className="border-b border-gray-50">
                  <td className="py-1 px-2 text-xs text-gray-400 border-r border-gray-100">{slot}</td>
                  {weekDays.map((d, i) => {
                    const ds = formatDateISO(d)
                    const slotAppts = (weekAppts[ds] || []).filter(a => a.time === slot)
                    return (
                      <td key={i} className="py-1 px-1 border-l border-gray-50 align-top">
                        {slotAppts.map(a => (
                          <button
                            key={a.id}
                            onClick={() => { setCurrentDate(d); setView('day'); setSelectedAppt(a) }}
                            className={cn(
                              'block w-full text-left rounded px-1.5 py-0.5 mb-0.5 text-xs truncate',
                              STATUS_BG[a.status] || 'bg-gray-100'
                            )}
                          >
                            {a.citizenName.split(' ').slice(0, 2).join(' ')}
                          </button>
                        ))}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalle */}
      <Modal open={!!selectedAppt} onClose={() => setSelectedAppt(null)} title="Detalle de Cita">
        {selectedAppt && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-gray-500">Ciudadano:</span>{' '}
                <span className="font-medium">{selectedAppt.citizenName}</span>
              </div>
              <div>
                <span className="text-gray-500">Trámite:</span>{' '}
                <span className="font-mono text-xs">{selectedAppt.tramiteId}</span>
              </div>
              <div>
                <span className="text-gray-500">Tipo licencia:</span>{' '}
                <span className="capitalize font-medium">{selectedAppt.licenseType}</span>
              </div>
              <div>
                <span className="text-gray-500">Estado:</span>{' '}
                <Badge variant={STATUS_VARIANT[selectedAppt.status] || 'default'}>
                  {STATUS_LABEL[selectedAppt.status] || selectedAppt.status}
                </Badge>
              </div>
              <div>
                <span className="text-gray-500">Fecha:</span>{' '}
                <span className="font-medium">{selectedAppt.date}</span>
              </div>
              <div>
                <span className="text-gray-500">Hora:</span>{' '}
                <span className="font-medium">{selectedAppt.time}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
