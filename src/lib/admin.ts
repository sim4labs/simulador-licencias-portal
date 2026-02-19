import type { Tramite } from './tramite'

// ─── Types kept for backward compatibility ───

export interface LicenseType {
  id: string
  name: string
  icon: string
  description: string
  requirements: string[]
}

export interface DashboardStats {
  total: number
  byStatus: Record<string, number>
  byLicenseType: Record<string, number>
  citasHoy: number
  examenesAprobados: number
  examenesTotales: number
  simuladorPendientes: number
}

// Re-export Tramite for any remaining usage
export type { Tramite }
