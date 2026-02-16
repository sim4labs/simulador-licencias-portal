import { type Question, getAllQuestionsRaw } from './examQuestions'
import { type Tramite, updateTramite } from './tramite'

// ─── Question bank CRUD with localStorage overlay ───

interface QuestionOverlay {
  added: Question[]
  edited: Record<string, Question>
  deleted: string[]
}

function getOverlay(): QuestionOverlay {
  if (typeof window === 'undefined') return { added: [], edited: {}, deleted: [] }
  try {
    const raw = localStorage.getItem('adminQuestions')
    if (!raw) return { added: [], edited: {}, deleted: [] }
    return JSON.parse(raw)
  } catch {
    return { added: [], edited: {}, deleted: [] }
  }
}

function saveOverlay(overlay: QuestionOverlay) {
  localStorage.setItem('adminQuestions', JSON.stringify(overlay))
}

export function getAdminQuestions(): Question[] {
  const raw = getAllQuestionsRaw()
  const overlay = getOverlay()
  return raw
    .filter(q => !overlay.deleted.includes(q.id))
    .map(q => overlay.edited[q.id] ?? q)
    .concat(overlay.added)
}

export function saveAdminQuestion(q: Question): void {
  const overlay = getOverlay()
  const hardcoded = getAllQuestionsRaw()
  const isHardcoded = hardcoded.some(hq => hq.id === q.id)
  const isAdded = overlay.added.some(aq => aq.id === q.id)

  if (isAdded) {
    overlay.added = overlay.added.map(aq => aq.id === q.id ? q : aq)
  } else if (isHardcoded) {
    overlay.edited[q.id] = q
  } else {
    overlay.added.push(q)
  }
  saveOverlay(overlay)
}

export function deleteAdminQuestion(id: string): void {
  const overlay = getOverlay()
  const isAdded = overlay.added.some(q => q.id === id)
  if (isAdded) {
    overlay.added = overlay.added.filter(q => q.id !== id)
  } else {
    overlay.deleted.push(id)
    delete overlay.edited[id]
  }
  saveOverlay(overlay)
}

export function resetQuestions(): void {
  localStorage.removeItem('adminQuestions')
}

export function getQuestionStats() {
  const questions = getAdminQuestions()
  const byCategory: Record<string, number> = {}
  const byDifficulty: Record<string, number> = {}
  for (const q of questions) {
    byCategory[q.category] = (byCategory[q.category] || 0) + 1
    byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1
  }
  return { total: questions.length, byCategory, byDifficulty }
}

// ─── License types ───

export interface LicenseType {
  id: string
  name: string
  icon: string
  description: string
  requirements: string[]
}

const DEFAULT_LICENSE_TYPES: LicenseType[] = [
  {
    id: 'motocicleta',
    name: 'Motocicleta',
    icon: 'Bike',
    description: 'Licencia para conducir motocicletas y motonetas en vías públicas.',
    requirements: ['Mayor de 18 años', 'INE vigente', 'Comprobante de domicilio', 'CURP', 'Examen teórico aprobado', 'Prueba en simulador aprobada'],
  },
  {
    id: 'particular',
    name: 'Particular',
    icon: 'Car',
    description: 'Licencia para conducir automóviles y camionetas de uso particular.',
    requirements: ['Mayor de 18 años', 'INE vigente', 'Comprobante de domicilio', 'CURP', 'Examen teórico aprobado', 'Prueba en simulador aprobada'],
  },
  {
    id: 'publico',
    name: 'Transporte Público',
    icon: 'Bus',
    description: 'Licencia para conducir vehículos de transporte público de pasajeros.',
    requirements: ['Mayor de 21 años', 'INE vigente', 'Comprobante de domicilio', 'CURP', 'Carta de no antecedentes penales', 'Examen psicométrico', 'Examen teórico aprobado', 'Prueba en simulador aprobada'],
  },
  {
    id: 'carga',
    name: 'Carga Pesada',
    icon: 'Truck',
    description: 'Licencia para conducir tractocamiones y vehículos de carga pesada.',
    requirements: ['Mayor de 21 años', 'INE vigente', 'Comprobante de domicilio', 'CURP', 'Carta de no antecedentes penales', 'Examen médico', 'Examen teórico aprobado', 'Prueba en simulador aprobada'],
  },
]

export function getLicenseTypes(): LicenseType[] {
  if (typeof window === 'undefined') return DEFAULT_LICENSE_TYPES
  try {
    const raw = localStorage.getItem('adminLicenseTypes')
    if (!raw) return DEFAULT_LICENSE_TYPES
    const overrides = JSON.parse(raw) as Record<string, Partial<LicenseType>>
    return DEFAULT_LICENSE_TYPES.map(lt => ({
      ...lt,
      ...overrides[lt.id],
      id: lt.id, // id is immutable
    }))
  } catch {
    return DEFAULT_LICENSE_TYPES
  }
}

export function saveLicenseType(lt: LicenseType): void {
  const raw = localStorage.getItem('adminLicenseTypes')
  const overrides: Record<string, Partial<LicenseType>> = raw ? JSON.parse(raw) : {}
  overrides[lt.id] = { name: lt.name, icon: lt.icon, description: lt.description, requirements: lt.requirements }
  localStorage.setItem('adminLicenseTypes', JSON.stringify(overrides))
}

// ─── Dashboard aggregation ───

export interface DashboardStats {
  total: number
  byStatus: Record<string, number>
  byLicenseType: Record<string, number>
  citasHoy: number
  examenesAprobados: number
  examenesTotales: number
  simuladorPendientes: number
}

export function getDashboardStats(tramites: Tramite[]): DashboardStats {
  const today = new Date().toISOString().slice(0, 10)
  const byStatus: Record<string, number> = {}
  const byLicenseType: Record<string, number> = {}
  let citasHoy = 0
  let examenesAprobados = 0
  let examenesTotales = 0
  let simuladorPendientes = 0

  for (const t of tramites) {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1
    if (t.licenseType) {
      byLicenseType[t.licenseType] = (byLicenseType[t.licenseType] || 0) + 1
    }
    if (t.appointment?.date === today) citasHoy++
    if (t.examResult) {
      examenesTotales++
      if (t.examResult.passed) examenesAprobados++
    }
    if (t.status === 'cita-agendada' && !t.simulatorResult) simuladorPendientes++
  }

  return {
    total: tramites.length,
    byStatus,
    byLicenseType,
    citasHoy,
    examenesAprobados,
    examenesTotales,
    simuladorPendientes,
  }
}

export function getAppointmentsForDate(tramites: Tramite[], date: string): Tramite[] {
  return tramites.filter(t => t.appointment?.date === date)
}

export function getAppointmentsForWeek(tramites: Tramite[], startDate: Date): Tramite[] {
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 5) // Mon-Fri
  return tramites.filter(t => {
    if (!t.appointment?.date) return false
    const d = new Date(t.appointment.date + 'T00:00:00')
    return d >= start && d < end
  })
}

// ─── Simulator result entry ───

export function enterSimulatorResult(
  tramiteId: string,
  result: { passed: boolean; score: number; feedback: string[] }
): Tramite | null {
  return updateTramite(tramiteId, {
    simulatorResult: {
      ...result,
      completedAt: new Date().toISOString(),
    },
    status: 'simulador-completado',
    currentStep: 5,
  })
}
