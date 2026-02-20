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
  listFirmware() {
    return apiRequest<FirmwareFile[]>('/admin/iot/firmware', { pool: 'admin' })
  },

  getUploadUrl(filename: string) {
    return apiRequest<{ uploadUrl: string; key: string }>('/admin/iot/firmware/upload-url', {
      method: 'POST',
      body: { filename },
      pool: 'admin',
    })
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
