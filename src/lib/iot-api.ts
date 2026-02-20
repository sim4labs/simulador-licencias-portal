import { apiRequest } from './api'

// ─── Interfaces para dispositivos IoT ───

export type VehicleType = 'passenger_bus' | 'cargo_truck' | 'car' | 'motorcycle'

export interface Device {
  thingName: string
  nickname: string
  online: boolean
  firmwareVersion: string
  rssi?: number
  ip?: string
  lastUpdate?: number
  vehicleType?: VehicleType | null
  serialNumber?: string | null
}

export interface UpdateDeviceRequest {
  nickname?: string
  vehicleType?: VehicleType | null
  serialNumber?: string | null
  location?: string | null
  notes?: string | null
}

export interface ShadowReported {
  uptime?: number
  heap?: number
  rssi?: number
  ip?: string
  firmware?: string
  lastUpdate?: number
  m1?: { state: string; pos: number; speed: number; moving: boolean; cycles: number }
  m2?: { state: string; pos: number; speed: number; moving: boolean; cycles: number }
  [key: string]: unknown
}

export interface JobExecution {
  jobId: string
  status: string
  queuedAt: string
  startedAt?: string
  completedAt?: string
  firmwareVersion?: string
}

export interface DeviceDetail extends Device {
  location?: string
  installedDate?: string
  shadow: {
    reported: ShadowReported
  }
  jobExecutions: JobExecution[]
}

export interface FirmwareFile {
  key: string
  filename: string
  size: number
  lastModified: string
  version?: string
}

export interface Job {
  jobId: string
  status: string
  description?: string
  firmwareVersion?: string
  targetCount: number
  completedCount: number
  failedCount: number
  createdAt: string
}

export interface JobTargetDetail {
  thingName: string
  status: string
  startedAt?: string
  completedAt?: string
}

export interface JobDetail extends Job {
  targets: JobTargetDetail[]
  firmwareKey?: string
}

export interface CreateJobRequest {
  firmwareKey: string
  firmwareVersion: string
  description?: string
  targets: string[]
}

// ─── Interfaces para sesiones de prueba ───

export interface SessionFault {
  type: string              // 'stop-sign' | 'speed-limit' | 'lane-departure' | ...
  description: string
  secondsFromStart: number
  severity: 'minor' | 'major' | 'critical'
  deduction: number
}

export interface Session {
  sessionId: string
  thingName: string
  tramiteId: string
  citizenName: string
  licenseType: string
  startedAt: string
  endedAt?: string
  duration?: number
  status: 'active' | 'completed' | 'cancelled'
  passed?: boolean
  score?: number
  faults?: SessionFault[]
  feedback?: string[]
}

export interface DeviceStats {
  totalSessions: number
  passRate: number
  todayAppointments: number
  avgScore: number
}

export interface DeviceAppointment {
  id: string
  tramiteId: string
  citizenName: string
  licenseType: string
  date: string
  time: string
  status: 'pendiente' | 'en-progreso' | 'aprobado' | 'reprobado'
}

// ─── Datos mock para desarrollo ───

const MOCK_SESSIONS: Session[] = [
  {
    sessionId: 'SES-001',
    thingName: 'sim-tlax-01',
    tramiteId: 'TRM-2026-0041',
    citizenName: 'María Guadalupe Hernández López',
    licenseType: 'particular',
    startedAt: '2026-02-19T09:05:00Z',
    endedAt: '2026-02-19T09:20:00Z',
    duration: 900,
    status: 'completed',
    passed: true,
    score: 85,
    faults: [
      { type: 'speed-limit', description: 'Exceso de velocidad en zona escolar (35 km/h en zona de 20)', secondsFromStart: 180, severity: 'major', deduction: 10 },
      { type: 'lane-departure', description: 'Salida de carril sin señalización', secondsFromStart: 420, severity: 'minor', deduction: 5 },
    ],
    feedback: ['Buena respuesta en frenado de emergencia', 'Mejorar atención a señales de velocidad en zonas escolares'],
  },
  {
    sessionId: 'SES-002',
    thingName: 'sim-tlax-01',
    tramiteId: 'TRM-2026-0042',
    citizenName: 'José Antonio Martínez García',
    licenseType: 'particular',
    startedAt: '2026-02-19T09:35:00Z',
    endedAt: '2026-02-19T09:50:00Z',
    duration: 900,
    status: 'completed',
    passed: false,
    score: 58,
    faults: [
      { type: 'stop-sign', description: 'No respetar señal de alto', secondsFromStart: 120, severity: 'critical', deduction: 20 },
      { type: 'speed-limit', description: 'Exceso de velocidad en carretera (95 km/h en zona de 80)', secondsFromStart: 300, severity: 'minor', deduction: 5 },
      { type: 'lane-departure', description: 'Invasión de carril contrario en curva', secondsFromStart: 510, severity: 'critical', deduction: 15 },
      { type: 'pedestrian', description: 'No ceder paso a peatón en cruce', secondsFromStart: 680, severity: 'major', deduction: 10 },
    ],
    feedback: ['Debe mejorar respeto a señalización vial', 'Peligro al invadir carril contrario', 'Atención a peatones en cruces'],
  },
  {
    sessionId: 'SES-003',
    thingName: 'sim-tlax-01',
    tramiteId: 'TRM-2026-0038',
    citizenName: 'Ana Patricia Sánchez Morales',
    licenseType: 'motocicleta',
    startedAt: '2026-02-18T10:10:00Z',
    endedAt: '2026-02-18T10:22:00Z',
    duration: 720,
    status: 'completed',
    passed: true,
    score: 92,
    faults: [
      { type: 'lane-position', description: 'Posición inadecuada en carril compartido', secondsFromStart: 340, severity: 'minor', deduction: 5 },
      { type: 'signal', description: 'Señalización tardía de cambio de carril', secondsFromStart: 560, severity: 'minor', deduction: 3 },
    ],
    feedback: ['Excelente manejo defensivo', 'Buena velocidad constante'],
  },
  {
    sessionId: 'SES-004',
    thingName: 'sim-tlax-01',
    tramiteId: 'TRM-2026-0035',
    citizenName: 'Roberto Carlos Flores Jiménez',
    licenseType: 'carga',
    startedAt: '2026-02-18T11:00:00Z',
    endedAt: '2026-02-18T11:18:00Z',
    duration: 1080,
    status: 'completed',
    passed: true,
    score: 78,
    faults: [
      { type: 'wide-turn', description: 'Giro amplio excesivo en intersección', secondsFromStart: 200, severity: 'minor', deduction: 5 },
      { type: 'brake-distance', description: 'Distancia de frenado insuficiente para vehículo de carga', secondsFromStart: 480, severity: 'major', deduction: 10 },
      { type: 'speed-limit', description: 'Velocidad inadecuada en pendiente descendente', secondsFromStart: 750, severity: 'minor', deduction: 5 },
    ],
    feedback: ['Mejorar técnica de frenado con carga', 'Respetar distancias de seguridad ampliadas'],
  },
  {
    sessionId: 'SES-005',
    thingName: 'sim-tlax-01',
    tramiteId: 'TRM-2026-0033',
    citizenName: 'Laura Elena Ramírez Díaz',
    licenseType: 'particular',
    startedAt: '2026-02-17T14:00:00Z',
    endedAt: '2026-02-17T14:15:00Z',
    duration: 900,
    status: 'completed',
    passed: true,
    score: 95,
    faults: [
      { type: 'signal', description: 'Señalización tardía al incorporarse', secondsFromStart: 600, severity: 'minor', deduction: 5 },
    ],
    feedback: ['Excelente desempeño general', 'Manejo seguro y responsable'],
  },
  {
    sessionId: 'SES-006',
    thingName: 'sim-tlax-01',
    tramiteId: 'TRM-2026-0030',
    citizenName: 'Fernando Miguel Torres Vega',
    licenseType: 'publico',
    startedAt: '2026-02-17T15:30:00Z',
    endedAt: '2026-02-17T15:48:00Z',
    duration: 1080,
    status: 'completed',
    passed: false,
    score: 62,
    faults: [
      { type: 'stop-sign', description: 'Ignorar semáforo en amarillo prolongado', secondsFromStart: 150, severity: 'major', deduction: 10 },
      { type: 'passenger-safety', description: 'Frenado brusco que pone en riesgo a pasajeros', secondsFromStart: 380, severity: 'critical', deduction: 15 },
      { type: 'speed-limit', description: 'Exceso de velocidad en zona urbana', secondsFromStart: 600, severity: 'major', deduction: 10 },
      { type: 'lane-departure', description: 'Cambio de carril sin verificar punto ciego', secondsFromStart: 820, severity: 'minor', deduction: 5 },
    ],
    feedback: ['Seguridad del pasajero es prioridad en transporte público', 'Debe mejorar técnicas de frenado progresivo'],
  },
  {
    sessionId: 'SES-007',
    thingName: 'sim-tlax-01',
    tramiteId: 'TRM-2026-0028',
    citizenName: 'Carmen Isabel Guzmán Reyes',
    licenseType: 'particular',
    startedAt: '2026-02-16T09:30:00Z',
    endedAt: '2026-02-16T09:45:00Z',
    duration: 900,
    status: 'completed',
    passed: true,
    score: 88,
    faults: [
      { type: 'parking', description: 'Estacionamiento en paralelo con distancia excesiva a banqueta', secondsFromStart: 700, severity: 'minor', deduction: 5 },
      { type: 'mirror-check', description: 'No verificar espejos antes de retroceder', secondsFromStart: 780, severity: 'major', deduction: 7 },
    ],
    feedback: ['Buen manejo en general', 'Practicar estacionamiento en paralelo'],
  },
]

const MOCK_APPOINTMENTS: DeviceAppointment[] = [
  {
    id: 'APT-001',
    tramiteId: 'TRM-2026-0050',
    citizenName: 'Diego Alejandro Ruiz Castillo',
    licenseType: 'particular',
    date: '2026-02-19',
    time: '09:00',
    status: 'aprobado',
  },
  {
    id: 'APT-002',
    tramiteId: 'TRM-2026-0051',
    citizenName: 'Sofía Valentina Mendoza Cruz',
    licenseType: 'particular',
    date: '2026-02-19',
    time: '09:30',
    status: 'reprobado',
  },
  {
    id: 'APT-003',
    tramiteId: 'TRM-2026-0052',
    citizenName: 'Carlos Eduardo Vargas Peña',
    licenseType: 'motocicleta',
    date: '2026-02-19',
    time: '10:00',
    status: 'pendiente',
  },
  {
    id: 'APT-004',
    tramiteId: 'TRM-2026-0053',
    citizenName: 'Paola Andrea Núñez Salazar',
    licenseType: 'particular',
    date: '2026-02-20',
    time: '09:00',
    status: 'pendiente',
  },
  {
    id: 'APT-005',
    tramiteId: 'TRM-2026-0054',
    citizenName: 'Miguel Ángel Ortega Fuentes',
    licenseType: 'carga',
    date: '2026-02-20',
    time: '10:30',
    status: 'pendiente',
  },
  {
    id: 'APT-006',
    tramiteId: 'TRM-2026-0055',
    citizenName: 'Gabriela Patricia López Moreno',
    licenseType: 'publico',
    date: '2026-02-20',
    time: '11:00',
    status: 'pendiente',
  },
  {
    id: 'APT-007',
    tramiteId: 'TRM-2026-0056',
    citizenName: 'Jesús Armando Delgado Ríos',
    licenseType: 'particular',
    date: '2026-02-21',
    time: '09:30',
    status: 'pendiente',
  },
  {
    id: 'APT-008',
    tramiteId: 'TRM-2026-0057',
    citizenName: 'Mariana Elizabeth Castro Herrera',
    licenseType: 'motocicleta',
    date: '2026-02-21',
    time: '14:00',
    status: 'pendiente',
  },
]

// ─── Funciones de sesiones y citas (mock por ahora) ───

export async function getDeviceSessions(
  thingName: string,
  params?: { desde?: string; hasta?: string; resultado?: string }
): Promise<Session[]> {
  // TODO: conectar a API real en Fase 3
  let sessions = MOCK_SESSIONS.filter(s => s.thingName === thingName)

  if (params?.desde) {
    sessions = sessions.filter(s => s.startedAt >= params.desde!)
  }
  if (params?.hasta) {
    sessions = sessions.filter(s => s.startedAt <= params.hasta! + 'T23:59:59Z')
  }
  if (params?.resultado === 'aprobado') {
    sessions = sessions.filter(s => s.passed === true)
  } else if (params?.resultado === 'reprobado') {
    sessions = sessions.filter(s => s.passed === false)
  }

  return sessions
}

export async function getDeviceStats(thingName: string): Promise<DeviceStats> {
  // TODO: conectar a API real en Fase 3
  const sessions = MOCK_SESSIONS.filter(s => s.thingName === thingName)
  const completed = sessions.filter(s => s.status === 'completed')
  const passed = completed.filter(s => s.passed)
  const today = new Date().toISOString().slice(0, 10)
  const todayAppts = MOCK_APPOINTMENTS.filter(a => a.date === today)
  const avgScore = completed.length > 0
    ? completed.reduce((sum, s) => sum + (s.score || 0), 0) / completed.length
    : 0

  return {
    totalSessions: completed.length,
    passRate: completed.length > 0 ? Math.round((passed.length / completed.length) * 100) : 0,
    todayAppointments: todayAppts.length,
    avgScore: Math.round(avgScore * 10) / 10,
  }
}

export async function getDeviceAppointments(
  thingName: string,
  params?: { desde?: string; hasta?: string }
): Promise<DeviceAppointment[]> {
  // TODO: conectar a API real en Fase 3
  let appointments = [...MOCK_APPOINTMENTS]

  if (params?.desde) {
    appointments = appointments.filter(a => a.date >= params.desde!)
  }
  if (params?.hasta) {
    appointments = appointments.filter(a => a.date <= params.hasta!)
  }

  return appointments
}

// ─── Estadísticas del dashboard IoT ───

export interface IoTStats {
  totalDevices: number
  online: number
  offline: number
  activeJobs: number
}

// ─── Endpoints IoT (requieren auth admin) ───

export const iotApi = {
  // Dispositivos
  listDevices() {
    return apiRequest<Device[]>('/admin/iot/devices', { pool: 'admin' })
  },

  getDevice(thingName: string) {
    return apiRequest<DeviceDetail>(`/admin/iot/devices/${thingName}`, { pool: 'admin' })
  },

  updateDevice(thingName: string, data: UpdateDeviceRequest) {
    return apiRequest<{ message: string }>(`/admin/iot/devices/${thingName}`, {
      method: 'PATCH',
      body: data,
      pool: 'admin',
    })
  },

  sendCommand(thingName: string, command: string, payload?: object) {
    return apiRequest<void>(`/admin/iot/devices/${thingName}/command`, {
      method: 'POST',
      body: { command, payload },
      pool: 'admin',
    })
  },

  // Firmware
  async listFirmware() {
    const res = await apiRequest<{ files: FirmwareFile[]; total: number }>('/admin/iot/firmware', { pool: 'admin' })
    if (res.error || !res.data) {
      return { data: [] as FirmwareFile[], error: res.error, status: res.status }
    }
    return { data: res.data.files, error: null, status: res.status }
  },

  // Jobs OTA
  createJob(data: CreateJobRequest) {
    return apiRequest<{ jobId: string }>('/admin/iot/jobs', {
      method: 'POST',
      body: data,
      pool: 'admin',
    })
  },

  listJobs(status?: string) {
    return apiRequest<Job[]>(`/admin/iot/jobs${status ? `?status=${status}` : ''}`, {
      pool: 'admin',
    })
  },

  getJob(jobId: string) {
    return apiRequest<JobDetail>(`/admin/iot/jobs/${jobId}`, { pool: 'admin' })
  },

  // Estadísticas (derivadas de devices y jobs)
  async getStats(): Promise<{
    data: IoTStats | null
    error: string | null
    status: number
  }> {
    const [devicesRes, jobsRes] = await Promise.all([
      this.listDevices(),
      this.listJobs('IN_PROGRESS'),
    ])

    if (devicesRes.error) {
      return { data: null, error: devicesRes.error, status: devicesRes.status }
    }

    const devices = devicesRes.data || []
    const jobs = jobsRes.data || []

    return {
      data: {
        totalDevices: devices.length,
        online: devices.filter(d => d.online).length,
        offline: devices.filter(d => !d.online).length,
        activeJobs: jobs.length,
      },
      error: null,
      status: 200,
    }
  },
}
