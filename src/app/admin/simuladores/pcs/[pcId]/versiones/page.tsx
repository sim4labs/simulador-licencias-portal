'use client'

import { useParams } from 'next/navigation'
import { Loader2, History, RefreshCw, Download, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'
import { useSimulatorPC } from '@/lib/simulator-queries'
import { Button } from '@/components/ui/Button'
import { ReleaseNotesDialog } from '@/components/admin/ReleaseNotesDialog'
import type { VersionHistoryEntry } from '@/lib/simulator-api'

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  const value = bytes / Math.pow(1024, i)
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
}

function formatDate(iso?: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString('es-MX', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function StatusBadge({ status }: { status: VersionHistoryEntry['status'] }) {
  const cfg: Record<VersionHistoryEntry['status'], { color: string; bg: string; Icon: typeof CheckCircle2; label: string }> = {
    PENDING:     { color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200',  Icon: Clock,        label: 'Pendiente' },
    DOWNLOADING: { color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',    Icon: Download,     label: 'Descargando' },
    DOWNLOADED:  { color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',    Icon: Download,     label: 'Descargada' },
    INSTALLING:  { color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',    Icon: Download,     label: 'Instalando' },
    INSTALLED:   { color: 'text-green-700',  bg: 'bg-green-50 border-green-200',  Icon: CheckCircle2, label: 'Instalada' },
    FAILED:      { color: 'text-red-700',    bg: 'bg-red-50 border-red-200',      Icon: XCircle,     label: 'Fallida' },
  }
  const c = cfg[status]
  const Icon = c.Icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${c.color} ${c.bg}`}>
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  )
}

export default function PCVersionesPage() {
  const params = useParams()
  const pcId = params?.pcId as string
  const { data: pc, isLoading, error, refetch, isFetching } = useSimulatorPC(pcId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !pc) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        {(error as Error)?.message || 'PC no encontrada'}
      </div>
    )
  }

  const history = pc.versionHistory || []
  const current = pc.appVersion

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Historial de versiones</h2>
          <p className="text-sm text-gray-500 mt-1">
            Versión actual: <span className="font-mono font-medium text-gray-900">{current || 'desconocida'}</span>
            {' · '}{history.length} despliegue{history.length !== 1 ? 's' : ''} registrado{history.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <History className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Sin historial</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Aún no hay despliegues registrados para esta PC. El historial se empieza a llenar
            con el siguiente deploy de Unity hacia esta PC.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Versión</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Desplegada</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Instalada</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Tamaño</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((entry, i) => {
                const isCurrent = entry.status === 'INSTALLED' && entry.version === current && i === 0
                return (
                  <tr key={`${entry.version}-${entry.deployedAt}`} className={`hover:bg-gray-50 transition-colors ${isCurrent ? 'bg-green-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-gray-900">{entry.version}</span>
                        {entry.mandatory && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 text-[10px] uppercase tracking-wide">
                            Obligatoria
                          </span>
                        )}
                        {isCurrent && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-[10px] uppercase tracking-wide font-medium">
                            Actual
                          </span>
                        )}
                      </div>
                      {entry.sha256 && (
                        <div className="font-mono text-[10px] text-gray-400 mt-0.5" title={entry.sha256}>
                          {entry.sha256.slice(0, 12)}…
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={entry.status} />
                      {entry.error && (
                        <div className="flex items-start gap-1 mt-1 text-[11px] text-red-600 max-w-xs">
                          <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                          <span className="break-words">{entry.error}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(entry.deployedAt)}</td>
                    <td className="px-4 py-3 text-gray-600">{entry.installedAt ? formatDate(entry.installedAt) : <span className="text-gray-400">—</span>}</td>
                    <td className="px-4 py-3 text-gray-600">{entry.size ? formatBytes(entry.size) : '-'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-sm">
                      {entry.releaseNotes ? (
                        <div className="flex flex-col gap-1">
                          <div className="truncate" title={entry.releaseNotes}>
                            {entry.releaseNotes}
                          </div>
                          {entry.releaseNotesS3Key && (
                            <ReleaseNotesDialog
                              version={entry.version}
                              s3Key={entry.releaseNotesS3Key}
                              summary={entry.releaseNotes}
                            />
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
