'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge, statusVariant, statusLabel } from './Badge'
import { Modal } from './Modal'
import type { Tramite } from '@/lib/tramite'
import { cn } from '@/lib/utils'

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30',
]

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']

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

interface CalendarViewProps {
  tramites: Tramite[]
}

export function CalendarView({ tramites }: CalendarViewProps) {
  const [view, setView] = useState<'day' | 'week'>('day')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedTramite, setSelectedTramite] = useState<Tramite | null>(null)

  const dateStr = formatDateISO(currentDate)

  const dayAppointments = useMemo(() => {
    return tramites.filter(t => t.appointment?.date === dateStr)
  }, [tramites, dateStr])

  const monday = useMemo(() => getMonday(currentDate), [currentDate])

  const weekDays = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(d.getDate() + i)
      return d
    })
  }, [monday])

  const weekAppointments = useMemo(() => {
    const map: Record<string, Tramite[]> = {}
    for (const d of weekDays) {
      const ds = formatDateISO(d)
      map[ds] = tramites.filter(t => t.appointment?.date === ds)
    }
    return map
  }, [tramites, weekDays])

  const navigate = (dir: number) => {
    const d = new Date(currentDate)
    if (view === 'day') d.setDate(d.getDate() + dir)
    else d.setDate(d.getDate() + dir * 7)
    setCurrentDate(d)
  }

  const goToday = () => setCurrentDate(new Date())

  return (
    <div>
      {/* Controls */}
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

      {/* Day View */}
      {view === 'day' && (
        <div className="bg-white rounded-lg shadow divide-y divide-gray-100">
          {TIME_SLOTS.map(slot => {
            const appts = dayAppointments.filter(t => t.appointment?.time === slot)
            return (
              <div key={slot} className="flex">
                <div className="w-20 flex-shrink-0 py-3 px-3 text-xs font-medium text-gray-500 border-r border-gray-100">
                  {slot}
                </div>
                <div className="flex-1 py-2 px-3 min-h-[48px]">
                  {appts.length === 0 ? (
                    <span className="text-xs text-gray-300">—</span>
                  ) : (
                    <div className="space-y-1">
                      {appts.map(t => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTramite(t)}
                          className="block w-full text-left bg-primary-50 rounded px-3 py-1.5 hover:bg-primary-100 transition-colors"
                        >
                          <span className="text-sm font-medium text-gray-900">
                            {t.personalData.nombre} {t.personalData.apellidoPaterno}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">{t.id}</span>
                          <Badge variant={statusVariant[t.status]} className="ml-2">
                            {statusLabel[t.status] || t.status}
                          </Badge>
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

      {/* Week View */}
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
                    const appts = (weekAppointments[ds] || []).filter(t => t.appointment?.time === slot)
                    return (
                      <td key={i} className="py-1 px-1 border-l border-gray-50 align-top">
                        {appts.map(t => (
                          <button
                            key={t.id}
                            onClick={() => { setCurrentDate(d); setView('day'); setSelectedTramite(t) }}
                            className="block w-full text-left bg-primary-50 rounded px-1.5 py-0.5 mb-0.5 hover:bg-primary-100 text-xs truncate"
                          >
                            {t.personalData.nombre} {t.personalData.apellidoPaterno?.charAt(0)}.
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

      {/* Detail Modal */}
      <Modal open={!!selectedTramite} onClose={() => setSelectedTramite(null)} title="Detalle de Cita">
        {selectedTramite && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-gray-500">ID:</span> <span className="font-medium">{selectedTramite.id}</span></div>
              <div><span className="text-gray-500">Estado:</span> <Badge variant={statusVariant[selectedTramite.status]}>{statusLabel[selectedTramite.status]}</Badge></div>
              <div><span className="text-gray-500">Nombre:</span> <span className="font-medium">{selectedTramite.personalData.nombre} {selectedTramite.personalData.apellidoPaterno} {selectedTramite.personalData.apellidoMaterno}</span></div>
              <div><span className="text-gray-500">CURP:</span> <span className="font-mono text-xs">{selectedTramite.personalData.curp}</span></div>
              <div><span className="text-gray-500">Tipo:</span> <span className="capitalize">{selectedTramite.licenseType || '—'}</span></div>
              <div><span className="text-gray-500">Hora:</span> {selectedTramite.appointment?.time || '—'}</div>
              <div><span className="text-gray-500">Fecha:</span> {selectedTramite.appointment?.date || '—'}</div>
              <div><span className="text-gray-500">Email:</span> {selectedTramite.personalData.email}</div>
            </div>
            {selectedTramite.examResult && (
              <div className="pt-2 border-t border-gray-200">
                <span className="text-gray-500">Examen:</span>{' '}
                <Badge variant={selectedTramite.examResult.passed ? 'success' : 'destructive'}>
                  {selectedTramite.examResult.passed ? 'Aprobado' : 'Reprobado'} — {selectedTramite.examResult.score}%
                </Badge>
              </div>
            )}
            {selectedTramite.simulatorResult && (
              <div className="pt-2 border-t border-gray-200">
                <span className="text-gray-500">Simulador:</span>{' '}
                <Badge variant={selectedTramite.simulatorResult.passed ? 'success' : 'destructive'}>
                  {selectedTramite.simulatorResult.passed ? 'Aprobado' : 'Reprobado'} — {selectedTramite.simulatorResult.score}%
                </Badge>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
