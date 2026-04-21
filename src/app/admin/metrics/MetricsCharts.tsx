'use client'

import type { MetricsResponse } from '@/lib/adapters'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'

type Period = '1h' | '24h' | '7d' | '30d'

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

type Metrics = MetricsResponse['metrics']

export function TopCharts({ metrics: m, period }: { metrics: Metrics; period: Period }) {
  const tramitesCitasData = mergeDatapoints({
    'Trámites': m.tramitesCreated?.datapoints || [],
    'Citas': m.appointmentsScheduled?.datapoints || [],
  }, period)
  const examenesData = mergeDatapoints({
    'Aprobados': m.examsPassed?.datapoints || [],
    'Reprobados': m.examsFailed?.datapoints || [],
  }, period)
  const iotData = mergeDatapoints({
    'Comandos IoT': m.iotCommandsSent?.datapoints || [],
    'Jobs OTA': m.otaJobsCreated?.datapoints || [],
  }, period)
  const authColdData = mergeDatapoints({
    'Auth Failures': m.authFailures?.datapoints || [],
    'Cold Starts': m.coldStarts?.datapoints || [],
  }, period)

  return (
    <>
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
    </>
  )
}

export function PerfCharts({ metrics: m, period }: { metrics: Metrics; period: Period }) {
  const latencyData = mergeDatapoints({
    'Latencia Avg': m.apiLatencyAvg?.datapoints || [],
    'Latencia P99': m.apiLatencyP99?.datapoints || [],
    'Integración Avg': m.apiIntegrationLatency?.datapoints || [],
  }, period)
  const apiErrorsData = mergeDatapoints({
    'Requests': m.apiRequests?.datapoints || [],
    '4xx': m.api4xx?.datapoints || [],
    '5xx': m.api5xx?.datapoints || [],
  }, period)

  return (
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
  )
}
