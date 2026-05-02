import { apiRequest } from './api'
import type { PersonalData, LicenseTypeId } from './tramite'
import type {
  TramiteResponse,
  ExamSubmitResponse,
  AppointmentResponse,
} from './adapters'

export interface PerfilResponse extends Partial<PersonalData> {
  userId: string
  email: string
  name: string
  profileComplete: boolean
  profileUpdatedAt?: string
  createdAt?: string
}

export const citizenApi = {
  getTramiteActivo() {
    return apiRequest<TramiteResponse | null>('/ciudadano/tramite-activo', { pool: 'citizen' })
  },

  crearTramite(data: { licenseType: LicenseTypeId }) {
    return apiRequest<TramiteResponse>('/ciudadano/tramites', {
      method: 'POST',
      body: data,
      pool: 'citizen',
    })
  },

  seleccionarTipo(tramiteId: string, licenseType: LicenseTypeId) {
    return apiRequest<TramiteResponse>(`/ciudadano/tramites/${tramiteId}/tipo`, {
      method: 'PATCH',
      body: { licenseType },
      pool: 'citizen',
    })
  },

  enviarExamen(tramiteId: string, answers: { questionId: string; selectedAnswer: number }[]) {
    return apiRequest<ExamSubmitResponse>(`/ciudadano/tramites/${tramiteId}/examen`, {
      method: 'POST',
      body: { answers },
      pool: 'citizen',
    })
  },

  agendarCita(tramiteId: string, date: string, time: string) {
    return apiRequest<AppointmentResponse>(`/ciudadano/tramites/${tramiteId}/cita`, {
      method: 'POST',
      body: { date, time },
      pool: 'citizen',
    })
  },

  cancelarCita(tramiteId: string) {
    return apiRequest<{ tramiteId: string; cancelled: boolean }>(
      `/ciudadano/tramites/${tramiteId}/cita`,
      { method: 'DELETE', pool: 'citizen' },
    )
  },

  getTramite(tramiteId: string) {
    return apiRequest<TramiteResponse>(`/ciudadano/tramites/${tramiteId}`, { pool: 'citizen' })
  },

  listarTramites() {
    return apiRequest<TramiteResponse[]>('/ciudadano/tramites', { pool: 'citizen' })
  },

  getPerfil() {
    return apiRequest<PerfilResponse>('/ciudadano/perfil', { pool: 'citizen' })
  },

  updatePerfil(data: PersonalData) {
    return apiRequest<PerfilResponse>('/ciudadano/perfil', {
      method: 'PUT',
      body: data,
      pool: 'citizen',
    })
  },

  getPhotoUploadUrl(tramiteId: string) {
    return apiRequest<{ uploadUrl: string; s3Key: string }>(
      `/ciudadano/tramites/${tramiteId}/foto-url`,
      { method: 'POST', pool: 'citizen' }
    )
  },
}

// ─── Kiosk API (público — sin auth) ───

export const kioskApi = {
  createSession(args?: { kioskId?: string }) {
    return apiRequest<{
      sessionId: string
      expiresAt: string
      verifyUrl?: string
      reused?: boolean
    }>('/kiosk/sessions', {
      method: 'POST',
      body: args?.kioskId ? { kioskId: args.kioskId } : undefined,
    })
  },

  startVerify(sessionId: string) {
    return apiRequest<{ livenessSessionId: string }>(
      `/kiosk/sessions/${sessionId}/start`,
      { method: 'POST' }
    )
  },

  completeVerify(sessionId: string) {
    return apiRequest<{ verified: boolean; confidence: number }>(
      `/kiosk/sessions/${sessionId}/complete`,
      { method: 'POST' }
    )
  },

  getSessionStatus(sessionId: string) {
    return apiRequest<{
      status: 'pending' | 'verifying' | 'verified' | 'failed'
      citizenName?: string
      tramiteId?: string
      verifiedAt?: string
      faceMatchConfidence?: number
      reason?: string
    }>(`/kiosk/sessions/${sessionId}/status`)
  },
}
