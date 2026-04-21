'use client'

import { useState, useEffect, useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { Badge } from './Badge'
import { SessionDetailModal } from './SessionDetailModal'
import { simulatorApi } from '@/lib/simulator-api'
import type { Session } from '@/lib/iot-api'

function formatDuration(seconds: number): string {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return sec > 0 ? `${min}m ${sec}s` : `${min}m`
}

interface SimulatorSessionsTableProps {
  simulatorId: string
}

export function SimulatorSessionsTable({ simulatorId }: SimulatorSessionsTableProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  // Filtros
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [resultado, setResultado] = useState<'todos' | 'aprobado' | 'reprobado'>('todos')

  // Paginación
  const [page, setPage] = useState(0)
  const pageSize = 10

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    simulatorApi.getSimulatorSessions(simulatorId, {
      desde: desde || undefined,
      hasta: hasta || undefined,
      resultado: resultado === 'todos' ? undefined : resultado,
    }).then(res => {
      if (!cancelled) {
        setSessions(res.data || [])
        setLoading(false)
        setPage(0)
      }
    })
    return () => { cancelled = true }
  }, [simulatorId, desde, hasta, resultado])

  const paginatedSessions = useMemo(() => {
    const start = page * pageSize
    return sessions.slice(start, start + pageSize)
  }, [sessions, page])

  const totalPages = Math.ceil(sessions.length / pageSize)

  return (
    <div>
      {/* Barra de filtros */}
      <div className="flex flex-wrap items-end gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
          <input
            type="date"
            value={desde}
            onChange={e => setDesde(e.target.value)}
            className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={e => setHasta(e.target.value)}
            className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Resultado</label>
          <select
            value={resultado}
            onChange={e => setResultado(e.target.value as 'todos' | 'aprobado' | 'reprobado')}
            className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="todos">Todos</option>
            <option value="aprobado">Aprobado</option>
            <option value="reprobado">Reprobado</option>
          </select>
        </div>
        {(desde || hasta || resultado !== 'todos') && (
          <button
            onClick={() => { setDesde(''); setHasta(''); setResultado('todos') }}
            className="text-xs text-primary hover:underline self-end pb-2"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-gray-500">Cargando sesiones...</span>
        </div>
      ) : (
        <>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha / Hora</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ciudadano</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calificación</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resultado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faltas</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedSessions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                        No se encontraron sesiones con los filtros seleccionados
                      </td>
                    </tr>
                  ) : (
                    paginatedSessions.map(session => (
                      <tr
                        key={session.sessionId}
                        onClick={() => setSelectedSession(session)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          <span className="text-gray-900">
                            {new Date(session.startedAt).toLocaleDateString('es-MX', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>{' '}
                          <span className="text-gray-400">
                            {new Date(session.startedAt).toLocaleTimeString('es-MX', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <p className="text-gray-900 font-medium">{session.citizenName}</p>
                          <p className="text-xs text-gray-400 capitalize">{session.licenseType}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {session.duration ? formatDuration(session.duration) : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          {session.score != null ? session.score : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {session.status === 'active' ? (
                            <Badge variant="info">En curso</Badge>
                          ) : session.status === 'cancelled' ? (
                            <Badge variant="default">Cancelada</Badge>
                          ) : session.status === 'interrupted' ? (
                            <Badge variant="warning">Interrumpida</Badge>
                          ) : (
                            <Badge variant={session.passed ? 'success' : 'destructive'}>
                              {session.passed ? 'Aprobado' : 'Reprobado'}
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {session.faults ? session.faults.length : 0}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-gray-500">
                Mostrando {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sessions.length)} de {sessions.length}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de detalle */}
      <SessionDetailModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    </div>
  )
}
