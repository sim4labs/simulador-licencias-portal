import { apiRequest } from './api'
import type {
  TramiteResponse,
  QuestionResponse,
  LicenciaResponse,
  DisponibilidadResponse,
  ConfirmacionResponse,
  DashboardStatsResponse,
  TramitePublicResponse,
} from './adapters'

// ─── Admin endpoints (require admin auth) ───

export const adminApi = {
  getStats() {
    return apiRequest<DashboardStatsResponse>('/admin/stats', { pool: 'admin' })
  },

  listarTramites(params?: { status?: string; tipo?: string; search?: string }) {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    if (params?.tipo) qs.set('tipo', params.tipo)
    if (params?.search) qs.set('search', params.search)
    const query = qs.toString()
    return apiRequest<TramiteResponse[]>(`/admin/tramites${query ? `?${query}` : ''}`, {
      pool: 'admin',
    })
  },

  getTramite(tramiteId: string) {
    return apiRequest<TramiteResponse>(`/admin/tramites/${tramiteId}`, { pool: 'admin' })
  },

  registrarSimulador(tramiteId: string, result: { passed: boolean; score: number; feedback: string[] }) {
    return apiRequest<{ message: string; tramiteId: string }>(
      `/admin/tramites/${tramiteId}/simulador`,
      { method: 'POST', body: result, pool: 'admin' }
    )
  },

  getCitas(params: { fecha?: string; desde?: string; hasta?: string }) {
    const qs = new URLSearchParams()
    if (params.fecha) qs.set('fecha', params.fecha)
    if (params.desde) qs.set('desde', params.desde)
    if (params.hasta) qs.set('hasta', params.hasta)
    return apiRequest<TramiteResponse[]>(`/admin/citas?${qs.toString()}`, { pool: 'admin' })
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

  getDisponibilidad(fecha: string) {
    return apiRequest<DisponibilidadResponse>(`/disponibilidad?fecha=${encodeURIComponent(fecha)}`)
  },

  getConfirmacion(tramiteId: string) {
    return apiRequest<ConfirmacionResponse>(`/tramites/${tramiteId}/confirmacion`)
  },
}
