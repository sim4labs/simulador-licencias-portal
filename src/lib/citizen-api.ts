import { apiRequest } from './api'
import type { PersonalData } from './tramite'
import type {
  TramiteResponse,
  ExamSubmitResponse,
  AppointmentResponse,
} from './adapters'

export const citizenApi = {
  getTramiteActivo() {
    return apiRequest<TramiteResponse | null>('/ciudadano/tramite-activo', { pool: 'citizen' })
  },

  crearTramite(data: PersonalData & { licenseType: string }) {
    return apiRequest<TramiteResponse>('/ciudadano/tramites', {
      method: 'POST',
      body: data,
      pool: 'citizen',
    })
  },

  seleccionarTipo(tramiteId: string, licenseType: string) {
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

  getTramite(tramiteId: string) {
    return apiRequest<TramiteResponse>(`/ciudadano/tramites/${tramiteId}`, { pool: 'citizen' })
  },

  listarTramites() {
    return apiRequest<TramiteResponse[]>('/ciudadano/tramites', { pool: 'citizen' })
  },

  getPerfil() {
    return apiRequest<{ userId: string; email: string; name: string }>('/ciudadano/perfil', {
      pool: 'citizen',
    })
  },
}
