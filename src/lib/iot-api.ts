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
  environment?: string
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

// ─── Funciones de sesiones y citas (API real) ───

export async function getDeviceSessions(
  thingName: string,
  params?: { desde?: string; hasta?: string; resultado?: string }
): Promise<Session[]> {
  const qp = new URLSearchParams()
  if (params?.desde) qp.set('desde', params.desde)
  if (params?.hasta) qp.set('hasta', params.hasta)
  if (params?.resultado) qp.set('resultado', params.resultado)

  const qs = qp.toString()
  const { data, error } = await apiRequest<Session[]>(
    `/admin/iot/devices/${thingName}/sessions${qs ? `?${qs}` : ''}`,
    { pool: 'admin' }
  )

  if (error || !data) return []
  return data
}

export async function getDeviceStats(thingName: string): Promise<DeviceStats> {
  const { data, error } = await apiRequest<DeviceStats>(
    `/admin/iot/devices/${thingName}/stats`,
    { pool: 'admin' }
  )

  if (error || !data) {
    return { totalSessions: 0, passRate: 0, todayAppointments: 0, avgScore: 0 }
  }
  return data
}

/** Maps tramite status to appointment display status */
function mapTramiteToAppointmentStatus(
  tramite: Record<string, unknown>
): DeviceAppointment['status'] {
  const status = tramite.status as string
  if (status === 'simulador-completado') {
    return tramite.simulatorPassed ? 'aprobado' : 'reprobado'
  }
  return 'pendiente'
}

export async function getDeviceAppointments(
  _thingName: string,
  params?: { desde?: string; hasta?: string }
): Promise<DeviceAppointment[]> {
  // Default range: 7 days back + 14 days forward
  const now = new Date()
  const back = new Date(now)
  back.setDate(back.getDate() - 7)
  const forward = new Date(now)
  forward.setDate(forward.getDate() + 14)

  const desde = params?.desde || back.toISOString().slice(0, 10)
  const hasta = params?.hasta || forward.toISOString().slice(0, 10)

  const { data, error } = await apiRequest<Record<string, unknown>[]>(
    `/admin/citas?desde=${desde}&hasta=${hasta}`,
    { pool: 'admin' }
  )

  if (error || !data) return []

  return data
    .filter(t => t.appointmentDate && t.appointmentTime)
    .map(t => ({
      id: t.tramiteId as string,
      tramiteId: t.tramiteId as string,
      citizenName: [t.nombre, t.apellidoPaterno, t.apellidoMaterno]
        .filter(Boolean)
        .join(' '),
      licenseType: (t.licenseType as string) || '',
      date: t.appointmentDate as string,
      time: t.appointmentTime as string,
      status: mapTramiteToAppointmentStatus(t),
    }))
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
