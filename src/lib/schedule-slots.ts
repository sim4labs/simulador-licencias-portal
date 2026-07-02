import type { ScheduleConfigResponse } from './adapters'

export const DEFAULT_SLOT_DURATION_MINUTES = 30
export const ALLOWED_SLOT_DURATIONS = [15, 20, 30, 45, 60]

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function toHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function generateSlots(
  startTime: string,
  endTime: string,
  slotMinutes = DEFAULT_SLOT_DURATION_MINUTES,
): string[] {
  const slots: string[] = []
  const end = toMinutes(endTime)
  let t = toMinutes(startTime)
  while (t + slotMinutes <= end) {
    slots.push(toHHMM(t))
    t += slotMinutes
  }
  return slots
}

const FALLBACK_SLOTS = generateSlots('09:00', '17:00', DEFAULT_SLOT_DURATION_MINUTES)

/**
 * Rejilla de horarios de un día según la config operativa real
 * (excepción > patrón semanal) y la duración de slot vigente.
 * Mientras la config carga se usa la rejilla histórica 09:00–17:00 / 30 min.
 */
export function slotsForDate(
  config: ScheduleConfigResponse | undefined,
  dateISO: string,
): string[] {
  if (!config) return FALLBACK_SLOTS
  const duration = config.settings?.slotDurationMinutes ?? DEFAULT_SLOT_DURATION_MINUTES
  const dayOfWeek = new Date(dateISO + 'T12:00:00').getDay()
  const item =
    config.exceptions.find(e => e.key === dateISO) ??
    config.weekly.find(w => w.key === String(dayOfWeek))
  if (!item) return FALLBACK_SLOTS
  if (!item.isOpen || !item.startTime || !item.endTime) return []
  return generateSlots(item.startTime, item.endTime, duration)
}

/**
 * Une la rejilla con horas de citas que no caen en ella (citas agendadas
 * con una duración/horario anterior) para que ninguna cita quede invisible.
 */
export function mergeSlotTimes(
  grid: string[],
  appointmentTimes: Array<string | undefined>,
): string[] {
  const set = new Set(grid)
  for (const t of appointmentTimes) {
    if (t) set.add(t)
  }
  return Array.from(set).sort()
}
