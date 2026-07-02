'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, Trash2, Plus } from 'lucide-react'
import {
  useScheduleConfig,
  useUpdateScheduleWeekly,
  useUpsertScheduleException,
  useDeleteScheduleException,
  useUpdateScheduleGlobal,
} from '@/lib/admin-queries'
import type { ScheduleConfigItem, UpdateScheduleConfigBody } from '@/lib/adapters'
import { ALLOWED_SLOT_DURATIONS, DEFAULT_SLOT_DURATION_MINUTES } from '@/lib/schedule-slots'
import { dateInTlaxcala } from '@/lib/utils'

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

interface DayDraft {
  isOpen: boolean
  startTime: string
  endTime: string
  note: string
}

function itemToDraft(item: ScheduleConfigItem | undefined): DayDraft {
  return {
    isOpen: item?.isOpen ?? false,
    startTime: item?.startTime ?? '09:00',
    endTime: item?.endTime ?? '17:00',
    note: item?.note ?? '',
  }
}

function isValidTime(t: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(t)) return false
  const [h, m] = t.split(':').map(Number)
  return h >= 0 && h <= 23 && m % 15 === 0
}

export default function ConfiguracionCalendarioPage() {
  const configQuery = useScheduleConfig()
  const updateWeekly = useUpdateScheduleWeekly()
  const upsertException = useUpsertScheduleException()
  const deleteException = useDeleteScheduleException()
  const updateGlobal = useUpdateScheduleGlobal()

  const [drafts, setDrafts] = useState<Record<number, DayDraft>>({})
  const [conflictWarning, setConflictWarning] = useState<string | null>(null)
  const [durationDraft, setDurationDraft] = useState<number | null>(null)

  // Modal nueva excepción
  const [showExceptionModal, setShowExceptionModal] = useState(false)
  const [exceptionDate, setExceptionDate] = useState('')
  const [exceptionDraft, setExceptionDraft] = useState<DayDraft>({
    isOpen: false,
    startTime: '09:00',
    endTime: '17:00',
    note: '',
  })

  useEffect(() => {
    if (!configQuery.data) return
    const next: Record<number, DayDraft> = {}
    for (let d = 0; d < 7; d++) {
      const item = configQuery.data.weekly.find(w => w.key === String(d))
      next[d] = itemToDraft(item)
    }
    setDrafts(next)
  }, [configQuery.data])

  // Hoy en TZ Mexico (no UTC) — el rango de excepciones de calendario
  // se aplica sobre fechas de cita que viven en TZ de México.
  const today = dateInTlaxcala()

  async function handleSaveDay(dayOfWeek: number) {
    const draft = drafts[dayOfWeek]
    if (!draft) return
    if (draft.isOpen) {
      if (!isValidTime(draft.startTime) || !isValidTime(draft.endTime)) {
        alert('Horarios deben estar en formato HH:MM y ser múltiplos de 15 minutos')
        return
      }
      const [sh, sm] = draft.startTime.split(':').map(Number)
      const [eh, em] = draft.endTime.split(':').map(Number)
      if (sh * 60 + sm >= eh * 60 + em) {
        alert('La hora de cierre debe ser posterior a la hora de apertura')
        return
      }
    }

    const body: UpdateScheduleConfigBody = {
      isOpen: draft.isOpen,
      ...(draft.isOpen ? { startTime: draft.startTime, endTime: draft.endTime } : {}),
      ...(draft.note ? { note: draft.note } : {}),
    }

    try {
      const result = await updateWeekly.mutateAsync({ dayOfWeek, body })
      if (result.conflictingAppointments && result.conflictingAppointments > 0) {
        setConflictWarning(
          `Hay ${result.conflictingAppointments} cita(s) ya agendada(s) para ${DAY_NAMES[dayOfWeek]} fuera del nuevo horario. ` +
          'Las citas existentes siguen siendo válidas; deberá contactarlas manualmente si desea reagendarlas.',
        )
      }
    } catch (e: any) {
      alert(`Error al guardar: ${e?.message || e}`)
    }
  }

  async function handleSaveException() {
    if (!exceptionDate || exceptionDate < today) {
      alert('Selecciona una fecha futura')
      return
    }
    if (exceptionDraft.isOpen) {
      if (!isValidTime(exceptionDraft.startTime) || !isValidTime(exceptionDraft.endTime)) {
        alert('Horarios deben estar en formato HH:MM y ser múltiplos de 15 minutos')
        return
      }
    }
    const body: UpdateScheduleConfigBody = {
      isOpen: exceptionDraft.isOpen,
      ...(exceptionDraft.isOpen ? { startTime: exceptionDraft.startTime, endTime: exceptionDraft.endTime } : {}),
      ...(exceptionDraft.note ? { note: exceptionDraft.note } : {}),
    }
    try {
      const result = await upsertException.mutateAsync({ date: exceptionDate, body })
      if (result.conflictingAppointments && result.conflictingAppointments > 0) {
        setConflictWarning(
          `Hay ${result.conflictingAppointments} cita(s) ya agendada(s) para ${exceptionDate} fuera del nuevo horario. ` +
          'Las citas existentes siguen siendo válidas; deberá contactarlas manualmente si desea reagendarlas.',
        )
      }
      setShowExceptionModal(false)
      setExceptionDate('')
      setExceptionDraft({ isOpen: false, startTime: '09:00', endTime: '17:00', note: '' })
    } catch (e: any) {
      alert(`Error al guardar: ${e?.message || e}`)
    }
  }

  async function handleSaveDuration() {
    if (durationDraft === null || durationDraft === savedDuration) return
    try {
      await updateGlobal.mutateAsync(durationDraft)
      setDurationDraft(null)
    } catch (e: any) {
      alert(`Error al guardar: ${e?.message || e}`)
    }
  }

  async function handleDeleteException(date: string) {
    if (!confirm(`¿Eliminar la excepción del ${date}? Volverá a usar el horario semanal por defecto.`)) return
    try {
      await deleteException.mutateAsync(date)
    } catch (e: any) {
      alert(`Error al eliminar: ${e?.message || e}`)
    }
  }

  if (configQuery.isLoading) {
    return <div className="text-center py-12 text-gray-500">Cargando configuración...</div>
  }

  if (configQuery.error) {
    return <div className="text-center py-12 text-red-600">Error al cargar la configuración</div>
  }

  const exceptions = configQuery.data?.exceptions ?? []
  const settings = configQuery.data?.settings
  const savedDuration = settings?.slotDurationMinutes ?? DEFAULT_SLOT_DURATION_MINUTES
  const currentDuration = durationDraft ?? savedDuration

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/calendario"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al calendario
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Horario operativo</h1>
      <p className="text-sm text-gray-500 mb-6">
        Estos horarios aplican a todos los simuladores. Cambiar el horario no afecta citas ya agendadas;
        sólo bloquea nuevas reservas fuera del nuevo rango.
      </p>

      {conflictWarning && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-amber-900">{conflictWarning}</p>
            <button
              type="button"
              onClick={() => setConflictWarning(null)}
              className="mt-2 text-xs text-amber-700 underline"
            >
              Cerrar aviso
            </button>
          </div>
        </div>
      )}

      {/* Duración del slot de cita */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Duración de cada cita</h2>
        <p className="text-sm text-gray-500 mb-4">
          Aplica a todos los simuladores y a todos los días. Cambiarla sólo afecta reservas nuevas:
          las citas ya agendadas conservan su horario original, por lo que se recomienda ajustarla
          cuando haya pocas citas futuras.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={currentDuration}
            onChange={(e) => setDurationDraft(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            {ALLOWED_SLOT_DURATIONS.map((d) => (
              <option key={d} value={d}>{d} minutos</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleSaveDuration}
            disabled={updateGlobal.isPending || currentDuration === savedDuration}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {updateGlobal.isPending ? 'Guardando...' : 'Guardar duración'}
          </button>
          {currentDuration !== savedDuration && (
            <span className="text-xs text-amber-600">Cambio sin guardar (actual: {savedDuration} min)</span>
          )}
        </div>
        {settings?.updatedAt && (
          <div className="mt-3 text-xs text-gray-400">
            Última edición: {new Date(settings.updatedAt).toLocaleString('es-MX')}{settings.updatedBy && ` · ${settings.updatedBy}`}
          </div>
        )}
      </div>

      {/* Horario semanal */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Patrón semanal</h2>
        <div className="space-y-3">
          {[0, 1, 2, 3, 4, 5, 6].map((d) => {
            const draft = drafts[d]
            if (!draft) return null
            const item = configQuery.data?.weekly.find(w => w.key === String(d))
            return (
              <div key={d} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-3 border border-gray-100 rounded-xl">
                <div className="md:col-span-2 font-medium text-sm text-gray-900">{DAY_NAMES[d]}</div>
                <div className="md:col-span-2">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.isOpen}
                      onChange={(e) => setDrafts({ ...drafts, [d]: { ...draft, isOpen: e.target.checked } })}
                      className="rounded"
                    />
                    {draft.isOpen ? 'Abierto' : 'Cerrado'}
                  </label>
                </div>
                <div className="md:col-span-2">
                  <input
                    type="time"
                    step={900}
                    value={draft.startTime}
                    disabled={!draft.isOpen}
                    onChange={(e) => setDrafts({ ...drafts, [d]: { ...draft, startTime: e.target.value } })}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <div className="md:col-span-2">
                  <input
                    type="time"
                    step={900}
                    value={draft.endTime}
                    disabled={!draft.isOpen}
                    onChange={(e) => setDrafts({ ...drafts, [d]: { ...draft, endTime: e.target.value } })}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <div className="md:col-span-3">
                  <input
                    type="text"
                    placeholder="Nota (opcional)"
                    value={draft.note}
                    onChange={(e) => setDrafts({ ...drafts, [d]: { ...draft, note: e.target.value } })}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                  />
                </div>
                <div className="md:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSaveDay(d)}
                    disabled={updateWeekly.isPending}
                    className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
                  >
                    Guardar
                  </button>
                </div>
                {item?.updatedAt && (
                  <div className="md:col-span-12 text-xs text-gray-400">
                    Última edición: {new Date(item.updatedAt).toLocaleString('es-MX')}{item.updatedBy && ` · ${item.updatedBy}`}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Excepciones */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Excepciones</h2>
          <button
            type="button"
            onClick={() => setShowExceptionModal(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>

        {exceptions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No hay excepciones programadas. El patrón semanal aplica todos los días.
          </p>
        ) : (
          <div className="space-y-2">
            {exceptions.map((e) => (
              <div key={e.key} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {e.key} — {e.isOpen ? `Abierto ${e.startTime}–${e.endTime}` : 'Cerrado'}
                  </div>
                  {e.note && <div className="text-xs text-gray-500">{e.note}</div>}
                  {e.updatedAt && (
                    <div className="text-xs text-gray-400">
                      Última edición: {new Date(e.updatedAt).toLocaleString('es-MX')}{e.updatedBy && ` · ${e.updatedBy}`}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteException(e.key)}
                  disabled={deleteException.isPending}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                  aria-label="Eliminar excepción"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal nueva excepción */}
      {showExceptionModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nueva excepción</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  min={today}
                  value={exceptionDate}
                  onChange={(e) => setExceptionDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={exceptionDraft.isOpen}
                    onChange={(e) => setExceptionDraft({ ...exceptionDraft, isOpen: e.target.checked })}
                    className="rounded"
                  />
                  ¿Está abierto este día?
                </label>
              </div>
              {exceptionDraft.isOpen && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Inicio</label>
                    <input
                      type="time"
                      step={900}
                      value={exceptionDraft.startTime}
                      onChange={(e) => setExceptionDraft({ ...exceptionDraft, startTime: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Cierre</label>
                    <input
                      type="time"
                      step={900}
                      value={exceptionDraft.endTime}
                      onChange={(e) => setExceptionDraft({ ...exceptionDraft, endTime: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nota</label>
                <textarea
                  value={exceptionDraft.note}
                  onChange={(e) => setExceptionDraft({ ...exceptionDraft, note: e.target.value })}
                  placeholder="ej. Feriado, mantenimiento"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => { setShowExceptionModal(false); setExceptionDate('') }}
                className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveException}
                disabled={upsertException.isPending}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {upsertException.isPending ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
