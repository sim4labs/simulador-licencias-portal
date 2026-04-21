'use client'

import Link from 'next/link'
import { Clock, ExternalLink, MessageSquare } from 'lucide-react'
import { Modal } from './Modal'
import { Badge } from './Badge'
import { Button } from '@/components/ui/Button'
import type { Session } from '@/lib/iot-api'

const SEVERITY_VARIANT: Record<string, 'warning' | 'secondary' | 'destructive'> = {
  minor: 'warning',
  major: 'secondary',
  critical: 'destructive',
}

const SEVERITY_LABEL: Record<string, string> = {
  minor: 'Menor',
  major: 'Mayor',
  critical: 'Crítica',
}

function formatDuration(seconds: number): string {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return sec > 0 ? `${min}m ${sec}s` : `${min}m`
}

function formatSessionTime(secondsFromStart: number): string {
  const min = Math.floor(secondsFromStart / 60)
  const sec = secondsFromStart % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

interface SessionDetailModalProps {
  session: Session | null
  onClose: () => void
}

export function SessionDetailModal({ session, onClose }: SessionDetailModalProps) {
  if (!session) return null

  return (
    <Modal
      open={!!session}
      onClose={onClose}
      title="Detalle de Prueba"
      className="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Encabezado con datos principales */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Ciudadano:</span>{' '}
            <span className="font-medium text-gray-900">{session.citizenName}</span>
          </div>
          <div>
            <span className="text-gray-500">Tipo licencia:</span>{' '}
            <span className="font-medium text-gray-900 capitalize">{session.licenseType}</span>
          </div>
          <div>
            <span className="text-gray-500">Fecha:</span>{' '}
            <span className="font-medium text-gray-900">
              {new Date(session.startedAt).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Duración:</span>{' '}
            <span className="inline-flex items-center gap-1 font-medium text-gray-900">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              {session.duration ? formatDuration(session.duration) : '—'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Calificación:</span>{' '}
            <span className="text-lg font-bold text-gray-900">{session.score ?? '—'}</span>
            <span className="text-sm text-gray-400">/100</span>
          </div>
          <div>
            <span className="text-gray-500">Resultado:</span>{' '}
            {session.status === 'interrupted' ? (
              <Badge variant="warning">Interrumpida</Badge>
            ) : (
              <Badge variant={session.passed ? 'success' : 'destructive'}>
                {session.passed ? 'Aprobado' : 'Reprobado'}
              </Badge>
            )}
          </div>
          {session.status === 'interrupted' && (
            <div className="col-span-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
              Esta prueba fue interrumpida. La calificación es parcial y no cuenta como resultado oficial.
            </div>
          )}
        </div>

        {/* Tabla de faltas */}
        {session.faults && session.faults.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Infracciones ({session.faults.length})
            </h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Minuto</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Infracción</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Severidad</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Puntos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {session.faults.map((fault, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 text-sm font-mono text-gray-600 whitespace-nowrap">
                        {formatSessionTime(fault.secondsFromStart)}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {fault.description}
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant={SEVERITY_VARIANT[fault.severity] || 'default'}>
                          {SEVERITY_LABEL[fault.severity] || fault.severity}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-sm text-right font-medium text-red-600">
                        -{fault.deduction}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Feedback del evaluador */}
        {session.feedback && session.feedback.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-gray-400" />
              Retroalimentación
            </h3>
            <ul className="space-y-1.5">
              {session.feedback.map((comment, idx) => (
                <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-gray-300 mt-1 flex-shrink-0">&bull;</span>
                  {comment}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Link a trámite */}
        <div className="pt-3 border-t border-gray-200">
          <Link href="/admin/tramites" passHref>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver trámite completo
            </Button>
          </Link>
        </div>
      </div>
    </Modal>
  )
}
