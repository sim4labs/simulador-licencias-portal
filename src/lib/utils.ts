import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(
  date: string | Date,
  locale: string = 'es-MX'
): string {
  // Strings 'YYYY-MM-DD' se parsean como fecha local para evitar que
  // `new Date('2026-05-15')` (medianoche UTC) corra el día un día atrás
  // al renderizar en zonas UTC-negativas como Tlaxcala (UTC-6).
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Convierte una Date a string YYYY-MM-DD en la zona de Tlaxcala
 * (America/Mexico_City). Sustituye `d.toISOString().slice(0,10)`, que
 * devuelve la fecha en UTC y se corre un día en la tarde-noche de Tlaxcala.
 * Úsalo para comparar/filtrar contra fechas guardadas en TZ de México
 * (citas en backend, queries `desde/hasta`).
 *
 * Ensambla con `formatToParts` para no depender del patrón exacto de
 * un locale particular.
 */
export function dateInTlaxcala(d: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d)
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

/**
 * Convierte una Date a string YYYY-MM-DD en la TZ LOCAL del navegador
 * (no Mexico). Úsalo en UIs donde el calendario navega por días locales
 * y el filtro debe alinearse con lo que se muestra al usuario.
 */
export function dateInLocalTZ(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Fecha de hoy (YYYY-MM-DD) en la zona de Tlaxcala (America/Mexico_City).
 * Para comparar contra fechas de cita `YYYY-MM-DD` sin que el parseo de
 * `new Date('2026-05-14')` (medianoche UTC) corra el día en zonas UTC-negativas.
 */
export function todayInTlaxcala(): string {
  return dateInTlaxcala()
}

export function formatMXN(value?: number | null): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value)
}

export function generateAppointmentCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
