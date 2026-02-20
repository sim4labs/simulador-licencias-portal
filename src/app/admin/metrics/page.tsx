'use client'

import { useEffect, useState, useCallback } from 'react'
import { adminApi } from '@/lib/admin-api'
import type { MetricsResponse } from '@/lib/adapters'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { RefreshCw } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'

const PERIODS = ['1h', '24h', '7d', '30d'] as const
type Period = (typeof PERIODS)[number]

const PERIOD_LABELS: Record<Period, string> = {
  '1h': '1 hora',
  '24h': '24 horas',
  '7d': '7 días',
  '30d': '30 días',
}

const COLORS = {
  primary: '#582672',
  success: '#22c55e',
  danger: '#ef4444',
  info: '#3b82f6',
  warning: '#f59e0b',
  slate: '#64748b',
}

function formatTimestamp(iso: string, period: Period): string {
  const d = new Date(iso)
  if (period === '1h' || period === '24h') return format(d, 'HH:mm', { locale: es })
  return format(d, 'dd MMM', { locale: es })
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

function mergeDatapoints(
  series: Record<string, { t: string; v: number }[]>,
  period: Period,
): Record<string, string | number>[] {
  const map = new Map<string, Record<string, string | number>>()
  for (const [key, points] of Object.entries(series)) {
    for (const dp of points) {
      const label = formatTimestamp(dp.t, period)
      if (!map.has(dp.t)) map.set(dp.t, { time: label })
      map.get(dp.t)![key] = dp.v
    }
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v)
}

export default function MetricsPage() {
  const [period, setPeriod] = useState<Period>('24h')
  const [data, setData] = useState<MetricsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = useCallback(async (p: Period) => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminApi.getMetrics(p)
      if (res.error) {
        setError(res.error)
      } else {
        setData(res.data)
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar métricas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMetrics(period)
  }, [period, fetchMetrics])

  const m = data?.metrics

  const tramitesCitasData = m
    ? mergeDatapoints({
        'Trámites': m.tramitesCreated?.datapoints || [],
        'Citas': m.appointmentsScheduled?.datapoints || [],
      }, period)
    : []

  const examenesData = m
    ? mergeDatapoints({
        'Aprobados': m.examsPassed?.datapoints || [],
        'Reprobados': m.examsFailed?.datapoints || [],
      }, period)
    : []

  const iotData = m
    ? mergeDatapoints({
        'Comandos IoT': m.iotCommandsSent?.datapoints || [],
        'Jobs OTA': m.otaJobsCreated?.datapoints || [],
      }, period)
    : []

  const authColdData = m
    ? mergeDatapoints({
        'Auth Failures': m.authFailures?.datapoints || [],
        'Cold Starts': m.coldStarts?.datapoints || [],
      }, period)
    : []

  const latencyData = m
    ? mergeDatapoints({
        'Latencia Avg': m.apiLatencyAvg?.datapoints || [],
        'Latencia P99': m.apiLatencyP99?.datapoints || [],
        'Integración Avg': m.apiIntegrationLatency?.datapoints || [],
      }, period)
    : []

  const apiErrorsData = m
    ? mergeDatapoints({
        'Requests': m.apiRequests?.datapoints || [],
        '4xx': m.api4xx?.datapoints || [],
        '5xx': m.api5xx?.datapoints || [],
      }, period)
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Trámites creados" value={m?.tramitesCreated?.total ?? 0} color={COLORS.primary} />
        <StatCard title="Exámenes aprobados" value={m?.examsPassed?.total ?? 0} color={COLORS.success} />
        <StatCard title="Citas agendadas" value={m?.appointmentsScheduled?.total ?? 0} color={COLORS.info} />
        <StatCard title="Auth failures" value={m?.authFailures?.total ?? 0} color={COLORS.danger} />
      </div>

      {/* Row 2: Trámites+Citas & Exámenes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Trámites y Citas</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tramitesCitasData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Trámites" stroke={COLORS.primary} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Citas" stroke={COLORS.info} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Exámenes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={examenesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Aprobados" stackId="exam" fill={COLORS.success} />
              <Bar dataKey="Reprobados" stackId="exam" fill={COLORS.danger} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: IoT & Auth/ColdStarts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">IoT & OTA</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={iotData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Comandos IoT" stroke={COLORS.primary} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Jobs OTA" stroke={COLORS.info} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Auth Failures & Cold Starts</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={authColdData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Auth Failures" fill={COLORS.danger} />
              <Bar dataKey="Cold Starts" fill={COLORS.info} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* API Performance */}
      <h2 className="text-xl font-bold text-gray-900 pt-2">Performance API</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Requests totales" value={m?.apiRequests?.total ?? 0} color={COLORS.primary} />
        <StatCard title="Latencia promedio" value={m?.apiLatencyAvg?.total ?? 0} color={COLORS.info} unit="ms" />
        <StatCard title="Errores 4xx" value={m?.api4xx?.total ?? 0} color={COLORS.warning} />
        <StatCard title="Errores 5xx" value={m?.api5xx?.total ?? 0} color={COLORS.danger} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Latencia (ms)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={latencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" fontSize={12} />
              <YAxis fontSize={12} unit=" ms" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Latencia Avg" stroke={COLORS.info} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Latencia P99" stroke={COLORS.danger} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Integración Avg" stroke={COLORS.slate} strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Requests y Errores</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={apiErrorsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Requests" fill={COLORS.primary} />
              <Bar dataKey="4xx" fill={COLORS.warning} />
              <Bar dataKey="5xx" fill={COLORS.danger} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
