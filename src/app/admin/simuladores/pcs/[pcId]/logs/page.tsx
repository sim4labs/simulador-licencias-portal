'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Loader2, RefreshCw, Download } from 'lucide-react'
import { simulatorApi } from '@/lib/simulator-api'
import { usePCLogs } from '@/lib/simulator-queries'
import { Button } from '@/components/ui/Button'

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  const value = bytes / Math.pow(1024, i)
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return d.toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function shortKey(key: string): string {
  const parts = key.split('/')
  return parts[parts.length - 1] || key
}

export default function PCLogsPage() {
  const params = useParams()
  const pcId = params.pcId as string

  const logsQuery = usePCLogs(pcId)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const pages = logsQuery.data?.pages ?? []
  const logs = pages.flatMap((p) => p.logs)
  const error = logsQuery.error ? (logsQuery.error as Error).message : null

  const handleDownload = async (key: string) => {
    setDownloadError(null)
    setDownloading(key)
    const res = await simulatorApi.getPCLogDownloadUrl(pcId, key)
    setDownloading(null)
    if (res.error || !res.data) {
      setDownloadError(res.error || 'No se pudo obtener la URL de descarga')
      return
    }
    window.open(res.data.downloadUrl, '_blank', 'noopener,noreferrer')
  }

  if (logsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/simuladores/pcs"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4" /> PCs
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Logs — <span className="font-mono text-base">{pcId}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {logs.length} archivo{logs.length !== 1 ? 's' : ''} cargado{logs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => logsQuery.refetch()}
          disabled={logsQuery.isFetching}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${logsQuery.isFetching ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {downloadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {downloadError}
        </div>
      )}

      {logs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Sin logs disponibles</h3>
          <p className="text-sm text-gray-500">
            Esta PC aún no ha subido logs del simulador
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Archivo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Tamaño</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.key} className="hover:bg-gray-50 transition-colors">
                    <td
                      className="px-4 py-3 font-mono text-xs text-gray-700 max-w-xs truncate"
                      title={log.key}
                    >
                      {shortKey(log.key)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(log.lastModified)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatBytes(log.size)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(log.key)}
                        disabled={downloading === log.key}
                      >
                        {downloading === log.key ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-1" />
                        )}
                        Descargar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {logsQuery.hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => logsQuery.fetchNextPage()}
                disabled={logsQuery.isFetchingNextPage}
              >
                {logsQuery.isFetchingNextPage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Cargando...
                  </>
                ) : (
                  'Cargar más'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
