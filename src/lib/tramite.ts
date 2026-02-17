export interface PersonalData {
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  fechaNacimiento: string
  curp: string
  email: string
  telefono: string
  direccion: string
}

export interface ExamResult {
  passed: boolean
  score: number
  completedAt: string
}

export interface Appointment {
  date: string
  time: string
  code: string
}

export interface SimulatorResult {
  passed: boolean
  score: number
  feedback: string[]
  completedAt: string
}

export interface Tramite {
  id: string
  personalData: PersonalData
  licenseType?: string
  examResult?: ExamResult
  appointment?: Appointment
  simulatorResult?: SimulatorResult
  currentStep: 1 | 2 | 3 | 4 | 5 | 6
  status:
    | 'iniciado'
    | 'tipo-seleccionado'
    | 'examen-aprobado'
    | 'cita-agendada'
    | 'simulador-completado'
    | 'finalizado'
  createdAt: string
  updatedAt: string
}

const TRAMITES_KEY = 'tramites'
const CURRENT_TRAMITE_KEY = 'currentTramiteId'

export function generateTramiteId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `TLX-${code}`
}

export function getAllTramites(): Tramite[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(TRAMITES_KEY)
  return raw ? JSON.parse(raw) : []
}

function saveTramites(tramites: Tramite[]): void {
  localStorage.setItem(TRAMITES_KEY, JSON.stringify(tramites))
}

export function getTramiteById(id: string): Tramite | null {
  const tramites = getAllTramites()
  return tramites.find((t) => t.id === id) ?? null
}

export function getCurrentTramite(): Tramite | null {
  if (typeof window === 'undefined') return null
  const id = localStorage.getItem(CURRENT_TRAMITE_KEY)
  if (!id) return null
  return getTramiteById(id)
}

export function setCurrentTramiteId(id: string): void {
  localStorage.setItem(CURRENT_TRAMITE_KEY, id)
}

export function createTramite(personalData: PersonalData): Tramite {
  const now = new Date().toISOString()
  const tramite: Tramite = {
    id: generateTramiteId(),
    personalData,
    currentStep: 1,
    status: 'iniciado',
    createdAt: now,
    updatedAt: now,
  }
  const tramites = getAllTramites()
  tramites.push(tramite)
  saveTramites(tramites)
  setCurrentTramiteId(tramite.id)
  return tramite
}

export function updateTramite(
  id: string,
  updates: Partial<Omit<Tramite, 'id' | 'createdAt'>>
): Tramite | null {
  const tramites = getAllTramites()
  const idx = tramites.findIndex((t) => t.id === id)
  if (idx === -1) return null
  tramites[idx] = {
    ...tramites[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  saveTramites(tramites)
  return tramites[idx]
}

export function canProceedToStep(
  tramite: Tramite | null,
  step: number
): boolean {
  if (!tramite) return step === 1
  switch (step) {
    case 1:
      return true
    case 2:
      return tramite.currentStep >= 1
    case 3:
      return tramite.currentStep >= 2 && !!tramite.licenseType
    case 4:
      return tramite.currentStep >= 3 && !!tramite.examResult?.passed
    case 5:
      return tramite.currentStep >= 4 && !!tramite.appointment
    case 6:
      return tramite.currentStep >= 4
    default:
      return false
  }
}

export function validateCURP(curp: string): boolean {
  const re = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/
  return re.test(curp.toUpperCase())
}

export function validatePhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  return digits.length === 10
}
