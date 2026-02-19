import type { Tramite } from './tramite'

// DynamoDB flat tramite shape (as returned by the API)
export interface TramiteResponse {
  tramiteId: string
  citizenId?: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno?: string
  fechaNacimiento?: string
  curp?: string
  email?: string
  telefono?: string
  direccion?: string
  licenseType?: string
  currentStep: number
  status: string
  examPassed?: boolean
  examScore?: number
  examCompletedAt?: string
  appointmentDate?: string
  appointmentTime?: string
  appointmentCode?: string
  simulatorPassed?: boolean
  simulatorScore?: number
  simulatorFeedback?: string[]
  simulatorCompletedAt?: string
  createdAt: string
  updatedAt: string
}

export function adaptTramite(r: TramiteResponse): Tramite {
  const tramite: Tramite = {
    id: r.tramiteId,
    personalData: {
      nombre: r.nombre || '',
      apellidoPaterno: r.apellidoPaterno || '',
      apellidoMaterno: r.apellidoMaterno || '',
      fechaNacimiento: r.fechaNacimiento || '',
      curp: r.curp || '',
      email: r.email || '',
      telefono: r.telefono || '',
      direccion: r.direccion || '',
    },
    licenseType: r.licenseType,
    currentStep: (r.currentStep || 1) as Tramite['currentStep'],
    status: (r.status || 'iniciado') as Tramite['status'],
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }

  if (r.examPassed !== undefined) {
    tramite.examResult = {
      passed: r.examPassed,
      score: r.examScore || 0,
      completedAt: r.examCompletedAt || '',
    }
  }

  if (r.appointmentDate) {
    tramite.appointment = {
      date: r.appointmentDate,
      time: r.appointmentTime || '',
      code: r.appointmentCode || '',
    }
  }

  if (r.simulatorPassed !== undefined) {
    tramite.simulatorResult = {
      passed: r.simulatorPassed,
      score: r.simulatorScore || 0,
      feedback: r.simulatorFeedback || [],
      completedAt: r.simulatorCompletedAt || '',
    }
  }

  return tramite
}

// Public search result (limited fields)
export interface TramitePublicResponse {
  tramiteId: string
  nombre: string
  apellidoPaterno: string
  status: string
  currentStep: number
  licenseType?: string
  examPassed?: boolean
  examScore?: number
  appointmentDate?: string
  appointmentTime?: string
  appointmentCode?: string
  simulatorPassed?: boolean
  simulatorScore?: number
}

export function adaptPublicTramite(r: TramitePublicResponse): Partial<Tramite> {
  const result: Partial<Tramite> = {
    id: r.tramiteId,
    personalData: {
      nombre: r.nombre || '',
      apellidoPaterno: r.apellidoPaterno || '',
      apellidoMaterno: '',
      fechaNacimiento: '',
      curp: '',
      email: '',
      telefono: '',
      direccion: '',
    },
    licenseType: r.licenseType,
    currentStep: (r.currentStep || 1) as Tramite['currentStep'],
    status: (r.status || 'iniciado') as Tramite['status'],
  }

  if (r.examPassed !== undefined) {
    result.examResult = {
      passed: r.examPassed,
      score: r.examScore || 0,
      completedAt: '',
    }
  }

  if (r.appointmentDate) {
    result.appointment = {
      date: r.appointmentDate,
      time: r.appointmentTime || '',
      code: r.appointmentCode || '',
    }
  }

  if (r.simulatorPassed !== undefined) {
    result.simulatorResult = {
      passed: r.simulatorPassed,
      score: r.simulatorScore || 0,
      feedback: [],
      completedAt: '',
    }
  }

  return result
}

// Question shape from DynamoDB
export interface QuestionResponse {
  questionId: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
  category: string
  difficulty: string
  createdAt?: string
  updatedAt?: string
}

// Licencia shape from DynamoDB
export interface LicenciaResponse {
  licenseId: string
  name: string
  icon: string
  description: string
  requirements: string[]
  questionCount?: number
  generalQuestionCount?: number
  updatedAt?: string
}

// Disponibilidad shape
export interface DisponibilidadResponse {
  date: string
  availableSlots: string[]
  message?: string
}

// Confirmación shape
export interface ConfirmacionResponse {
  tramiteId: string
  nombre: string
  apellidoPaterno: string
  licenseType?: string
  appointmentDate?: string
  appointmentTime?: string
  appointmentCode?: string
  status: string
}

// Stats shape
export interface DashboardStatsResponse {
  total: number
  byStatus: Record<string, number>
  byLicenseType: Record<string, number>
  citasHoy: number
  examenesAprobados: number
  examenesTotales: number
  simuladorPendientes: number
}

// Exam submission result
export interface ExamSubmitResponse {
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  score: number
  passed: boolean
}

// Appointment creation result
export interface AppointmentResponse {
  tramiteId: string
  appointmentDate: string
  appointmentTime: string
  appointmentCode: string
}
