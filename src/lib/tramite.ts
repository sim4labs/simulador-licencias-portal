export const LICENSE_TYPE_IDS = ['1', '2', '3', '4', '6', '9', '18'] as const
export type LicenseTypeId = typeof LICENSE_TYPE_IDS[number]

export const LICENSE_TYPE_NAMES: Record<LicenseTypeId, string> = {
  '1': 'Servicio Público',
  '2': 'Chofer Particular',
  '3': 'Automovilista',
  '4': 'Motociclista',
  '6': 'Servicio de Carga',
  '9': 'Permiso para Menores de Edad',
  '18': 'Emergencias',
}

export const TIPOS_SANGRE = ['S/I', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] as const
export type TipoSangre = typeof TIPOS_SANGRE[number]

export const ESTADOS_CIVIL = ['SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'UNION_LIBRE'] as const
export type EstadoCivil = typeof ESTADOS_CIVIL[number]

export const ESTADO_CIVIL_LABELS: Record<EstadoCivil, string> = {
  SOLTERO: 'Soltero(a)',
  CASADO: 'Casado(a)',
  DIVORCIADO: 'Divorciado(a)',
  VIUDO: 'Viudo(a)',
  UNION_LIBRE: 'Unión libre',
}

export interface PersonalData {
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  fechaNacimiento: string
  curp: string
  rfc: string
  email: string
  telefono: string
  tipoSangre: TipoSangre | ''
  alergias: string
  estadoCivil: EstadoCivil | ''
  calle: string
  noExterior: string
  noInterior: string
  codigoPostal: string
  municipio: string
  colonia: string
  donador: boolean
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

export interface SimulatorFault {
  type: string
  description: string
  secondsFromStart: number
  severity: string
  deduction: number
}

export interface SimulatorResult {
  passed: boolean
  score: number
  feedback: string[]
  faults: SimulatorFault[]
  completedAt: string
}

export interface Tramite {
  id: string
  personalData: PersonalData
  licenseType?: LicenseTypeId
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

export function validateRFC(rfc: string): boolean {
  // Persona física (13 chars) o moral (12 chars); normaliza a uppercase.
  const re = /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/
  return re.test(rfc.toUpperCase())
}

export function validateCP(cp: string): boolean {
  // CP de Tlaxcala: 5 dígitos que inician con "9".
  return /^9\d{4}$/.test(cp)
}
