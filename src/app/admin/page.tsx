'use client'

import { useMemo } from 'react'
import { FileText, CalendarDays, Award, Gauge } from 'lucide-react'
import { LICENSE_TYPE_NAMES } from '@/lib/tramite'
import { useAdminStats, useAdminTramites } from '@/lib/admin-queries'
import type { DashboardStatsResponse } from '@/lib/adapters'
import { StatCard } from '@/components/admin/StatCard'
import { Badge, statusVariant, statusLabel } from '@/components/admin/Badge'

const STATUS_COLORS: Record<string, string> = {
  'iniciado': 'bg-gray-400',
  'tipo-seleccionado': 'bg-blue-400',
  'examen-aprobado': 'bg-purple-500',
  'cita-agendada': 'bg-yellow-400',
  'simulador-completado': 'bg-green-500',
  'simulador-reprobado': 'bg-red-500',
  'finalizado': 'bg-green-600',
}

// Claves = IDs oficiales del catálogo de licencias (ver tramite.ts).
const LICENSE_COLORS: Record<string, string> = {
  '1': 'bg-yellow-400',   // Servicio Público
  '2': 'bg-indigo-400',   // Chofer Particular
  '3': 'bg-purple-500',   // Automovilista
  '4': 'bg-blue-400',     // Motociclista
  '6': 'bg-red-400',      // Servicio de Carga
  '9': 'bg-pink-400',     // Permiso Menores
  '18': 'bg-rose-500',    // Emergencias
}

const EMPTY_STATS: DashboardStatsResponse = {
  total: 0, byStatus: {}, byLicenseType: {}, citasHoy: 0,
  examenesAprobados: 0, examenesTotales: 0, simuladorPendientes: 0,
}

export default function AdminDashboard() {
  const statsQuery = useAdminStats()
  const tramitesQuery = useAdminTramites({ limit: 10 })

  const stats = statsQuery.data ?? EMPTY_STATS
  const tramites = tramitesQuery.data?.items ?? []

  const examPassRate = stats.examenesTotales > 0
    ? Math.round((stats.examenesAprobados / stats.examenesTotales) * 100)
    : 0

  const recentTramites = useMemo(() => {
    return [...tramites].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 10)
  }, [tramites])

  const maxStatusCount = Math.max(1, ...Object.values(stats.byStatus))
  const maxLicenseCount = Math.max(1, ...Object.values(stats.byLicenseType))

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Trámites" value={stats.total} icon={FileText} variant="primary" />
        <StatCard label="Citas Hoy" value={stats.citasHoy} icon={CalendarDays} variant="info" />
        <StatCard label="Exámenes Aprobados" value={`${examPassRate}%`} icon={Award} trend={`${stats.examenesAprobados}/${stats.examenesTotales}`} variant="success" />
        <StatCard label="Simulador Pendientes" value={stats.simuladorPendientes} icon={Gauge} variant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status bar chart */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Trámites por Estado</h2>
          {Object.keys(stats.byStatus).length === 0 ? (
            <p className="text-sm text-gray-400">Sin datos</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.byStatus).map(([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{statusLabel[status] || status}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${STATUS_COLORS[status] || 'bg-gray-400'}`}
                      style={{ width: `${(count / maxStatusCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* License type bar chart */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Trámites por Tipo de Licencia</h2>
          {Object.keys(stats.byLicenseType).length === 0 ? (
            <p className="text-sm text-gray-400">Sin datos</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.byLicenseType).map(([type, count]) => (
                <div key={type}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{LICENSE_TYPE_NAMES[type as keyof typeof LICENSE_TYPE_NAMES] || type}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${LICENSE_COLORS[type] || 'bg-gray-400'}`}
                      style={{ width: `${(count / maxLicenseCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700">Actividad Reciente</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentTramites.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-400">No hay trámites registrados</p>
          ) : (
            recentTramites.map(t => (
              <div key={t.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-gray-500">{t.id}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {t.personalData.nombre} {t.personalData.apellidoPaterno}
                  </span>
                  {t.licenseType && (
                    <span className="text-xs text-gray-400">{LICENSE_TYPE_NAMES[t.licenseType] || t.licenseType}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariant[t.status]}>{statusLabel[t.status] || t.status}</Badge>
                  <span className="text-xs text-gray-400">
                    {new Date(t.updatedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
