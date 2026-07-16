'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import { adminKeys, useAdminMetrics } from '@/lib/admin-queries'
import { RefreshCw } from 'lucide-react'

function ChartsSkeleton({ rows = 1 }: { rows?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[0, 1].map(j => (
            <div key={j} className="bg-white rounded-lg shadow p-5 h-[340px] animate-pulse">
              <div className="h-5 w-48 bg-gray-200 rounded mb-4" />
              <div className="h-[280px] bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

const TopCharts = dynamic(
  () => import('./MetricsCharts').then(m => m.TopCharts),
  { ssr: false, loading: () => <ChartsSkeleton rows={2} /> },
)

const PerfCharts = dynamic(
  () => import('./MetricsCharts').then(m => m.PerfCharts),
  { ssr: false, loading: () => <ChartsSkeleton rows={1} /> },
)

const PERIODS = ['1h', '24h', '7d', '30d'] as const
type Period = (typeof PERIODS)[number]

const PERIOD_LABELS: Record<Period, string> = {
  '1h': '1 hora',
  '24h': '24 horas',
  '7d': '7 días',
  '30d': '30 días',
}

const COLORS = {
  primary: '#AF2140',
  success: '#22c55e',
  info: '#3b82f6',
  warning: '#f59e0b',
  danger: '#ef4444',
}

function StatCard({ title, value, color, unit }: { title: string; value: number; color: string; unit?: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold mt-1" style={{ color }}>
        {value}{unit && <span className="text-base font-normal text-gray-400 ml-1">{unit}</span>}
      </p>
    </div>
  )
}

export default function MetricsPage() {
  const qc = useQueryClient()
  const [period, setPeriod] = useState<Period>('7d')
  const metricsQuery = useAdminMetrics(period)
  const data = metricsQuery.data ?? null
  const loading = metricsQuery.isFetching
  const error = metricsQuery.error ? metricsQuery.error.message : null

  const fetchMetrics = (p: Period) =>
    qc.invalidateQueries({ queryKey: adminKeys.metrics(p) })

  const m = data?.metrics

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Métricas</h1>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  period === p
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          <button
            onClick={() => fetchMetrics(period)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Trámites creados" value={m?.tramitesCreated?.total ?? 0} color={COLORS.primary} />
        <StatCard title="Exámenes aprobados" value={m?.examsPassed?.total ?? 0} color={COLORS.success} />
        <StatCard title="Citas agendadas" value={m?.appointmentsScheduled?.total ?? 0} color={COLORS.info} />
        <StatCard title="Auth failures" value={m?.authFailures?.total ?? 0} color={COLORS.danger} />
      </div>

      {m && <TopCharts metrics={m} period={period} />}

      <h2 className="text-xl font-bold text-gray-900 pt-2">Performance API</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Requests totales" value={m?.apiRequests?.total ?? 0} color={COLORS.primary} />
        <StatCard title="Latencia promedio" value={m?.apiLatencyAvg?.total ?? 0} color={COLORS.info} unit="ms" />
        <StatCard title="Errores 4xx" value={m?.api4xx?.total ?? 0} color={COLORS.warning} />
        <StatCard title="Errores 5xx" value={m?.api5xx?.total ?? 0} color={COLORS.danger} />
      </div>

      {m && <PerfCharts metrics={m} period={period} />}
    </div>
  )
}
