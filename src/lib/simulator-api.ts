import { apiRequest } from './api'
import type { VehicleType, Session } from './iot-api'

// ─── Interfaces ───

export interface ActiveSessionSummary {
  sessionId: string
  tramiteId: string
  citizenName: string
  licenseType: string
  startedAt: string
}

export interface Simulator {
  simulatorId: string
  name: string
  pcId: string | null
  pcName: string | null
  pcOnline: boolean
  pcAppVersion?: string | null
  pcEnvironment?: string | null
  pcLastSeen?: string | null
  dofThingName: string | null
  dofOnline: boolean
  vehicleType: VehicleType | null
  location: string | null
  status: 'active' | 'inactive'
  activeSession?: ActiveSessionSummary | null
  createdAt: string
  updatedAt: string
}

export interface SimulatorDetail extends Simulator {
  pc: {
    pcId: string
    name: string
    appVersion: string | null
    platform: string | null
    ip: string | null
    lastSeen: string | null
    online: boolean
  } | null
  dof: {
    thingName: string
    online: boolean
    shadow: Record<string, unknown> | null
  } | null
}

export interface PendingUpdate {
  version: string
  s3Key: string
  sha256: string
  size: number
  releaseNotes: string
  mandatory: boolean
  scheduledAfter: string
  status: 'PENDING' | 'DOWNLOADING' | 'DOWNLOADED' | 'INSTALLING' | 'INSTALLED' | 'FAILED'
  statusUpdatedAt: string
  createdAt: string
  createdBy: string
  error?: string
}

export interface PCCalibration {
  deviceFingerprint?: string
  reverseDone?: boolean
  bindSteerAxis?: string
  bindReverse?: string
  bindDrive?: string
  bindPaddleLeft?: string
  bindPaddleRight?: string
  steerCenter?: number
  steerMax?: number
  steerMin?: number
  gasAxis?: string
  gasRest?: number
  gasPress?: number
  brakeAxis?: string
  brakeRest?: number
  brakePress?: number
  advSteerCurveA?: number
  advSteerDeadzone?: number
  advBrakeSoftEnd?: number
  advBrakeSoftMaxOutput?: number
  advGasCurveN?: number
  transmisionManual?: boolean
}

export interface VersionHistoryEntry {
  version: string
  s3Key: string
  sha256: string
  size: number
  releaseNotes: string
  mandatory: boolean
  status: PendingUpdate['status']
  statusUpdatedAt: string
  deployedAt: string
  deployedBy: string
  installedAt?: string
  error?: string
}

export interface SimulatorPC {
  pcId: string
  name: string
  appVersion: string | null
  platform: string
  ip: string | null
  lastSeen: string | null
  online: boolean
  simulatorId: string | null
  createdAt: string
  lastUpdatedAt?: string | null
  pendingConfig?: { apiBaseUrl: string; environment: string } | null
  pendingUpdate?: PendingUpdate | null
  versionHistory?: VersionHistoryEntry[] | null
  calibration?: PCCalibration | null
  calibrationUpdatedAt?: string | null
}

export interface UnityBuild {
  version: string
  s3Key: string
  filename: string
  size: number
  lastModified: string
  isLatest: boolean
}

export interface PCLogObject {
  key: string
  size: number
  lastModified: string
}

export interface PCLogsResponse {
  logs: PCLogObject[]
  nextContinuationToken?: string
}

export interface PCLogDownloadResponse {
  downloadUrl: string
  expiresIn: number
}

export interface StartUploadResponse {
  uploadId: string
  s3Key: string
  version: string
}

export interface PartUrlResponse {
  url: string
  partNumber: number
}

export interface CreateSimulatorRequest {
  name: string
  vehicleType?: VehicleType | null
  location?: string | null
}

export interface UpdateSimulatorRequest {
  name?: string
  pcId?: string | null
  dofThingName?: string | null
  vehicleType?: VehicleType | null
  location?: string | null
  status?: 'active' | 'inactive'
}

// ─── API functions ───

export const simulatorApi = {
  listSimulators() {
    return apiRequest<Simulator[]>('/admin/simulators', { pool: 'admin' })
  },

  getSimulator(simulatorId: string) {
    return apiRequest<SimulatorDetail>(`/admin/simulators/${simulatorId}`, { pool: 'admin' })
  },

  createSimulator(data: CreateSimulatorRequest) {
    return apiRequest<Simulator>('/admin/simulators', {
      method: 'POST',
      body: data,
      pool: 'admin',
    })
  },

  updateSimulator(simulatorId: string, data: UpdateSimulatorRequest) {
    return apiRequest<{ message: string }>(`/admin/simulators/${simulatorId}`, {
      method: 'PATCH',
      body: data,
      pool: 'admin',
    })
  },

  deleteSimulator(simulatorId: string) {
    return apiRequest<{ message: string }>(`/admin/simulators/${simulatorId}`, {
      method: 'DELETE',
      pool: 'admin',
    })
  },

  listPCs() {
    return apiRequest<SimulatorPC[]>('/admin/pcs', { pool: 'admin' })
  },

  getPC(pcId: string) {
    return apiRequest<SimulatorPC>(`/admin/pcs/${encodeURIComponent(pcId)}`, { pool: 'admin' })
  },

  updatePCEnvironment(pcId: string, environment: string) {
    return apiRequest<{ message: string }>(`/admin/pcs/${encodeURIComponent(pcId)}/environment`, {
      method: 'PATCH',
      body: { environment },
      pool: 'admin',
    })
  },

  listPCLogs(pcId: string, params?: { limit?: number; continuationToken?: string }) {
    const qp = new URLSearchParams()
    qp.set('limit', String(params?.limit ?? 50))
    if (params?.continuationToken) qp.set('continuationToken', params.continuationToken)
    return apiRequest<PCLogsResponse>(
      `/admin/pcs/${encodeURIComponent(pcId)}/logs?${qp.toString()}`,
      { pool: 'admin' }
    )
  },

  getPCLogDownloadUrl(pcId: string, key: string) {
    const qp = new URLSearchParams()
    qp.set('key', key)
    return apiRequest<PCLogDownloadResponse>(
      `/admin/pcs/${encodeURIComponent(pcId)}/logs/download?${qp.toString()}`,
      { pool: 'admin' }
    )
  },

  getSimulatorSessions(simulatorId: string, params?: { desde?: string; hasta?: string; resultado?: string }) {
    const qp = new URLSearchParams()
    if (params?.desde) qp.set('desde', params.desde)
    if (params?.hasta) qp.set('hasta', params.hasta)
    if (params?.resultado) qp.set('resultado', params.resultado)
    const qs = qp.toString()
    return apiRequest<Session[]>(
      `/admin/simulators/${simulatorId}/sessions${qs ? `?${qs}` : ''}`,
      { pool: 'admin' }
    )
  },

  cancelSession(sessionId: string, reason?: string) {
    return apiRequest<{ message: string; sessionId: string; endedAt: string; duration: number }>(
      `/admin/sessions/${encodeURIComponent(sessionId)}/cancel`,
      { method: 'POST', body: { reason }, pool: 'admin' }
    )
  },

  getSimulatorStats(simulatorId: string) {
    return apiRequest<{ totalSessions: number; passRate: number; todayAppointments: number; avgScore: number }>(
      `/admin/simulators/${simulatorId}/stats`,
      { pool: 'admin' }
    )
  },

  // ─── Unity Builds ───

  listUnityBuilds() {
    return apiRequest<{ builds: UnityBuild[]; latestVersion: string | null }>(
      '/admin/unity-builds',
      { pool: 'admin' }
    )
  },

  startUpload(data: { version: string; filename: string; sha256: string; size: number; releaseNotes?: string }) {
    return apiRequest<StartUploadResponse>('/admin/unity-builds/start-upload', {
      method: 'POST',
      body: data,
      pool: 'admin',
    })
  },

  getPartUrl(data: { uploadId: string; s3Key: string; partNumber: number }) {
    return apiRequest<PartUrlResponse>('/admin/unity-builds/part-url', {
      method: 'POST',
      body: data,
      pool: 'admin',
    })
  },

  completeUpload(data: {
    uploadId: string; s3Key: string; parts: { partNumber: number; etag: string }[];
    version: string; sha256?: string; size?: number; releaseNotes?: string; mandatory?: boolean
  }) {
    return apiRequest<{ success: boolean; version: string }>('/admin/unity-builds/complete-upload', {
      method: 'POST',
      body: data,
      pool: 'admin',
    })
  },

  deployUnityBuild(data: {
    version: string; s3Key: string; sha256?: string; size?: number;
    releaseNotes?: string; mandatory?: boolean; scheduledAfter?: string; targetPcIds: string[]
  }) {
    return apiRequest<{ success: boolean; deployedTo: number; scheduledAfter: string }>(
      '/admin/unity-builds/deploy',
      { method: 'POST', body: data, pool: 'admin' }
    )
  },
}
