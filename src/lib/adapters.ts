import type { Tramite, LicenseTypeId, TipoSangre, EstadoCivil, Nacionalidad, EstadoMx } from './tramite'

// DynamoDB flat tramite shape (as returned by the API)
export interface TramiteResponse {
  tramiteId: string
  citizenId?: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno?: string
  fechaNacimiento?: string
  nacionalidad?: string
  curp?: string
  rfc?: string
  email?: string
  telefono?: string
  tipoSangre?: string
  alergias?: string
  estadoCivil?: string
  calle?: string
  noExterior?: string
  noInterior?: string
  codigoPostal?: string
  municipio?: string
  colonia?: string
  estado?: string
  donador?: boolean
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
  simulatorId?: string
  appointmentVehicleType?: string
  simulatorPassed?: boolean
  simulatorScore?: number
  simulatorFeedback?: string[]
  simulatorFaults?: { type: string; description: string; secondsFromStart: number; severity: string; deduction: number }[]
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
      nacionalidad: (r.nacionalidad || '') as Nacionalidad | '',
      curp: r.curp || '',
      rfc: r.rfc || '',
      email: r.email || '',
      telefono: r.telefono || '',
      tipoSangre: (r.tipoSangre || '') as TipoSangre | '',
      alergias: r.alergias || '',
      estadoCivil: (r.estadoCivil || '') as EstadoCivil | '',
      calle: r.calle || '',
      noExterior: r.noExterior || '',
      noInterior: r.noInterior || '',
      codigoPostal: r.codigoPostal || '',
      municipio: r.municipio || '',
      colonia: r.colonia || '',
      estado: (r.estado || '') as EstadoMx | '',
      donador: r.donador === true,
    },
    licenseType: r.licenseType as LicenseTypeId | undefined,
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
      simulatorId: r.simulatorId,
      vehicleType: r.appointmentVehicleType,
    }
  }

  if (r.simulatorPassed !== undefined) {
    tramite.simulatorResult = {
      passed: r.simulatorPassed,
      score: r.simulatorScore || 0,
      feedback: r.simulatorFeedback || [],
      faults: r.simulatorFaults || [],
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
  simulatorFaults?: { type: string; description: string; secondsFromStart: number; severity: string; deduction: number }[]
}

export function adaptPublicTramite(r: TramitePublicResponse): Partial<Tramite> {
  const result: Partial<Tramite> = {
    id: r.tramiteId,
    personalData: {
      nombre: r.nombre || '',
      apellidoPaterno: r.apellidoPaterno || '',
      apellidoMaterno: '',
      fechaNacimiento: '',
      nacionalidad: '',
      curp: '',
      rfc: '',
      email: '',
      telefono: '',
      tipoSangre: '',
      alergias: '',
      estadoCivil: '',
      calle: '',
      noExterior: '',
      noInterior: '',
      codigoPostal: '',
      municipio: '',
      colonia: '',
      estado: '',
      donador: false,
    },
    licenseType: r.licenseType as LicenseTypeId | undefined,
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
      faults: r.simulatorFaults || [],
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
  // El examen NO incluye correctAnswer/explanation al cargar (no se filtran al
  // cliente); se rellenan tras enviar el examen con los `details` de la respuesta
  // para la pantalla de revisión.
  correctAnswer?: number
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
  costo?: number
  vigencia?: string
  questionCount?: number
  generalQuestionCount?: number
  updatedAt?: string
}

// Disponibilidad shape
export interface DisponibilidadResponse {
  date: string
  availableSlots: string[]
  message?: string
  capacity?: number
}

// Schedule config (admin)
export interface ScheduleConfigItem {
  configType: 'weekly' | 'exception'
  key: string
  isOpen: boolean
  startTime?: string
  endTime?: string
  slotDurationMinutes?: number
  note?: string
  updatedAt?: string
  updatedBy?: string
}

export interface ScheduleConfigResponse {
  weekly: ScheduleConfigItem[]
  exceptions: ScheduleConfigItem[]
}

export interface UpdateScheduleConfigBody {
  isOpen: boolean
  startTime?: string
  endTime?: string
  slotDurationMinutes?: number
  note?: string
}

export interface UpdateScheduleConfigResponse extends ScheduleConfigItem {
  conflictingAppointments: number
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

// Metrics
export interface MetricSeries {
  datapoints: { t: string; v: number }[]
  total: number
}

export interface MetricsResponse {
  period: string
  start: string
  end: string
  metrics: Record<string, MetricSeries>
}

// Exam submission result
export interface ExamAnswerDetail {
  questionId: string
  selectedAnswer: number
  correctAnswer: number
  explanation: string
  isCorrect: boolean
}

export interface ExamSubmitResponse {
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  score: number
  passed: boolean
  details?: ExamAnswerDetail[]
}

// Appointment creation result
export interface AppointmentResponse {
  tramiteId: string
  appointmentDate: string
  appointmentTime: string
  appointmentCode: string
}
