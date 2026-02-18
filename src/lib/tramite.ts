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
    | 'examen-reprobado'
    | 'cita-agendada'
    | 'simulador-completado'
    | 'finalizado'
  createdAt: string
  updatedAt: string
}

export function canProceedToStep(
  tramite: Tramite | null,
  step: number
): boolean {
  if (!tramite) return step <= 2
  switch (step) {
    case 1:
      return true
    case 2:
      return true
    case 3:
      return tramite.currentStep >= 3 && !!tramite.licenseType
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
