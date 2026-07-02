import { apiRequest } from './api'
import type {
  TramiteResponse,
  QuestionResponse,
  LicenciaResponse,
  DisponibilidadResponse,
  ConfirmacionResponse,
  DashboardStatsResponse,
  TramitePublicResponse,
  MetricsResponse,
  ScheduleConfigResponse,
  UpdateScheduleConfigBody,
  UpdateScheduleConfigResponse,
} from './adapters'

export interface ScoringConfig {
  penalties: {
    speeding: number
    pedestrianHit: number
    bicycleCollision: number
    vehicleCollision: number
    passiveVehicleCollision: number
    signCollision: number
    obstacleCollision: number
    redLight: number
    wrongWay: number
    dangerousGearChange: number
    gearChangeWithoutClutch: number
  }
  passingScore: number
  gradeThresholds: {
    apto: number
    aptoCondicionado: number
    aptoReentrenamiento: number
  }
  examDurationSeconds: number
  minValidDistanceMeters: number
  // Sentido contrario: segundos continuos en el carril contrario antes de
  // marcar la infracción, threshold del dot product (-1..0) y velocidad
  // mínima (km/h) para evaluar.
  wrongWaySustainedSeconds: number
  wrongWayDotThreshold: number
  wrongWayMinSpeedKmh: number
  updatedAt?: string
}

// ─── Admin endpoints (require admin auth) ───

export const adminApi = {
  getStats() {
    return apiRequest<DashboardStatsResponse>('/admin/stats', { pool: 'admin' })
  },

  listarTramites(params?: {
    status?: string
    tipo?: string
    search?: string
    limit?: number
    cursor?: string
  }) {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    if (params?.tipo) qs.set('tipo', params.tipo)
    if (params?.search) qs.set('search', params.search)
    if (params?.limit) qs.set('limit', String(params.limit))
    if (params?.cursor) qs.set('cursor', params.cursor)
    const query = qs.toString()
    return apiRequest<{ items: TramiteResponse[]; nextCursor: string | null }>(
      `/admin/tramites${query ? `?${query}` : ''}`,
      { pool: 'admin' },
    )
  },

  getTramite(tramiteId: string) {
    return apiRequest<TramiteResponse>(`/admin/tramites/${tramiteId}`, { pool: 'admin' })
  },

  getCitas(params: { fecha?: string; desde?: string; hasta?: string }) {
    const qs = new URLSearchParams()
    if (params.fecha) qs.set('fecha', params.fecha)
    if (params.desde) qs.set('desde', params.desde)
    if (params.hasta) qs.set('hasta', params.hasta)
    return apiRequest<TramiteResponse[]>(`/admin/citas?${qs.toString()}`, { pool: 'admin' })
  },

  // ─── Schedule config (calendario operativo) ───
  getScheduleConfig() {
    return apiRequest<ScheduleConfigResponse>('/admin/schedule-config', { pool: 'admin' })
  },

  updateScheduleWeekly(dayOfWeek: number, body: UpdateScheduleConfigBody) {
    return apiRequest<UpdateScheduleConfigResponse>(
      `/admin/schedule-config/weekly/${dayOfWeek}`,
      { method: 'PUT', body, pool: 'admin' },
    )
  },

  upsertScheduleException(date: string, body: UpdateScheduleConfigBody) {
    return apiRequest<UpdateScheduleConfigResponse>(
      `/admin/schedule-config/exception/${date}`,
      { method: 'PUT', body, pool: 'admin' },
    )
  },

  deleteScheduleException(date: string) {
    return apiRequest<{ deleted: boolean; date: string }>(
      `/admin/schedule-config/exception/${date}`,
      { method: 'DELETE', pool: 'admin' },
    )
  },

  listarPreguntas(params?: { cat?: string; dif?: string }) {
    const qs = new URLSearchParams()
    if (params?.cat) qs.set('cat', params.cat)
    if (params?.dif) qs.set('dif', params.dif)
    const query = qs.toString()
    return apiRequest<QuestionResponse[]>(`/admin/preguntas${query ? `?${query}` : ''}`, {
      pool: 'admin',
    })
  },

  crearPregunta(data: {
    question: string
    options: string[]
    correctAnswer: number
    explanation?: string
    category: string
    difficulty?: string
  }) {
    return apiRequest<QuestionResponse>('/admin/preguntas', {
      method: 'POST',
      body: data,
      pool: 'admin',
    })
  },

  actualizarPregunta(questionId: string, data: Partial<QuestionResponse>) {
    return apiRequest<QuestionResponse>(`/admin/preguntas/${questionId}`, {
      method: 'PUT',
      body: data,
      pool: 'admin',
    })
  },

  eliminarPregunta(questionId: string) {
    return apiRequest<{ message: string; questionId: string }>(`/admin/preguntas/${questionId}`, {
      method: 'DELETE',
      pool: 'admin',
    })
  },

  listarLicencias() {
    return apiRequest<LicenciaResponse[]>('/admin/licencias', { pool: 'admin' })
  },

  actualizarLicencia(licenseId: string, data: Partial<LicenciaResponse>) {
    return apiRequest<LicenciaResponse>(`/admin/licencias/${licenseId}`, {
      method: 'PUT',
      body: data,
      pool: 'admin',
    })
  },

  // ─── Scoring Config ───

  getScoringConfig() {
    return apiRequest<ScoringConfig>('/admin/scoring-config', { pool: 'admin' })
  },

  updateScoringConfig(data: ScoringConfig) {
    return apiRequest<{ success: boolean; updatedAt: string }>('/admin/scoring-config', {
      method: 'PUT',
      body: data,
      pool: 'admin',
    })
  },

  // ─── Métricas ───

  getMetrics(period: string = '24h') {
    return apiRequest<MetricsResponse>(`/admin/metrics?period=${period}`, { pool: 'admin' })
  },

  // ─── Admin Users ───

  listarAdmins() {
    return apiRequest<AdminUser[]>('/admin/users', { pool: 'admin' })
  },

  crearAdmin(data: { username: string; email: string; name: string }) {
    return apiRequest<AdminUser & { temporaryPassword: string }>('/admin/users', {
      method: 'POST',
      body: data,
      pool: 'admin',
    })
  },

  toggleAdminStatus(userId: string) {
    return apiRequest<AdminUser>(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      pool: 'admin',
    })
  },

  resetAdminPassword(userId: string) {
    return apiRequest<{ message: string; temporaryPassword: string }>(
      `/admin/users/${userId}/reset-password`,
      { method: 'POST', pool: 'admin' }
    )
  },

  // ─── Integration Tokens (bearer tokens para sistemas externos) ───

  listIntegrationTokens() {
    return apiRequest<{ tokens: IntegrationToken[] }>('/admin/integration-tokens', { pool: 'admin' })
  },

  createIntegrationToken(data: { name: string; description?: string; expiresAt?: string }) {
    return apiRequest<IntegrationToken & { token: string }>('/admin/integration-tokens', {
      method: 'POST',
      body: data,
      pool: 'admin',
    })
  },

  revokeIntegrationToken(tokenId: string) {
    return apiRequest<void>(`/admin/integration-tokens/${tokenId}`, {
      method: 'DELETE',
      pool: 'admin',
    })
  },

  rotateIntegrationToken(tokenId: string) {
    return apiRequest<IntegrationToken & { token: string }>(
      `/admin/integration-tokens/${tokenId}/rotate`,
      { method: 'POST', pool: 'admin' }
    )
  },

  getIntegrationTokenCalls(tokenId: string, limit = 100) {
    return apiRequest<{ tokenId: string; calls: IntegrationTokenCall[]; count: number }>(
      `/admin/integration-tokens/${tokenId}/calls?limit=${limit}`,
      { pool: 'admin' }
    )
  },

  // ─── Practice results (Modo Práctica del simulador) ───
  listPracticeResults(params?: {
    pcId?: string
    vehicleType?: string
    dateFrom?: string
    dateTo?: string
    limit?: number
    cursor?: string
  }) {
    const qs = new URLSearchParams()
    if (params?.pcId) qs.set('pcId', params.pcId)
    if (params?.vehicleType) qs.set('vehicleType', params.vehicleType)
    if (params?.dateFrom) qs.set('dateFrom', params.dateFrom)
    if (params?.dateTo) qs.set('dateTo', params.dateTo)
    if (params?.limit) qs.set('limit', String(params.limit))
    if (params?.cursor) qs.set('cursor', params.cursor)
    const query = qs.toString()
    return apiRequest<{ items: PracticeResult[]; nextCursor: string | null }>(
      `/admin/practice-results${query ? `?${query}` : ''}`,
      { pool: 'admin' },
    )
  },
}

export interface PracticeFault {
  type: string
  description: string
  secondsFromStart: number
  severity: string
  deduction: number
}

export interface PracticeResult {
  practiceId: string
  pcId: string
  simulatorId: string | null
  vehicleType: string
  transmission: string | null
  weather: string
  spawnLocation: string
  startedAt: string
  completedAt: string
  durationSeconds: number
  score: number
  // Metros recorridos durante la práctica (Unity ≥1.3.8). 0 o ausente para
  // builds anteriores. Si está bajo el umbral configurado, la sesión se marcó
  // inválida por inactividad — bandera visible en el detalle.
  distanceMeters?: number
  faults: PracticeFault[]
  completed: boolean
  createdAt?: string
}

export interface IntegrationToken {
  tokenId: string
  tokenPreview: string | null
  token: string | null
  name: string
  description: string
  createdBy: string
  createdAt: string
  lastUsedAt: string | null
  expiresAt: string | null
  isActive: boolean
  revokedAt: string | null
  rotatedIntoTokenId: string | null
  rotatedFromTokenId: string | null
}

export interface IntegrationTokenCall {
  timestamp: string
  curp: string
  result: 'no_existe' | 'sin_aprobar' | 'aprobado'
  sourceIp: string
}

export interface AdminUser {
  userId: string
  username: string
  email: string
  name: string
  userType: string
  isActive: boolean
  createdAt: string
}

// ─── Public endpoints (no auth) ───

export const publicApi = {
  getLicencias() {
    return apiRequest<LicenciaResponse[]>('/licencias')
  },

  getPreguntasExamen(tipo: string) {
    return apiRequest<QuestionResponse[]>(`/preguntas/examen?tipo=${encodeURIComponent(tipo)}`)
  },

  buscarTramite(query: { tramiteId?: string; appointmentCode?: string }) {
    return apiRequest<TramitePublicResponse>('/tramites/buscar', {
      method: 'POST',
      body: query,
    })
  },

  getDisponibilidad(fecha: string, licenseType: string) {
    const qs = new URLSearchParams({ fecha, licenseType })
    return apiRequest<DisponibilidadResponse>(`/disponibilidad?${qs.toString()}`)
  },

  getConfirmacion(tramiteId: string) {
    return apiRequest<ConfirmacionResponse>(`/tramites/${tramiteId}/confirmacion`)
  },
}
