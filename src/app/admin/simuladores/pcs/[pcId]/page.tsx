'use client'

import { useParams } from 'next/navigation'
import { Loader2, Monitor } from 'lucide-react'
import { useSimulatorPC } from '@/lib/simulator-queries'
import { ReleaseNotesDialog } from '@/components/admin/ReleaseNotesDialog'

function formatDate(iso?: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString('es-MX', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

export default function PCDetailPage() {
  const params = useParams()
  const pcId = params?.pcId as string
  const { data: pc, isLoading, error } = useSimulatorPC(pcId)

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Monitor className="h-6 w-6 text-gray-400" />
          {pc.name || pc.pcId}
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">{pc.pcId}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Estado">
          <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${
            pc.online ? 'text-green-700' : 'text-gray-400'
          }`}>
            <span className={`h-2 w-2 rounded-full ${pc.online ? 'bg-green-500' : 'bg-gray-300'}`} />
            {pc.online ? 'Online' : 'Offline'}
          </span>
        </Field>
        <Field label="Versión instalada">
          <span className="font-mono text-sm">{pc.appVersion || '-'}</span>
        </Field>
        <Field label="Plataforma"><span className="text-sm">{pc.platform || '-'}</span></Field>
        <Field label="IP"><span className="font-mono text-xs">{pc.ip || '-'}</span></Field>
        <Field label="Simulador asignado"><span className="text-sm">{pc.simulatorId || '-'}</span></Field>
        <Field label="Último heartbeat"><span className="text-sm">{formatDate(pc.lastSeen)}</span></Field>
        <Field label="Última actualización"><span className="text-sm">{formatDate(pc.lastUpdatedAt)}</span></Field>
        <Field label="Registrada"><span className="text-sm">{formatDate(pc.createdAt)}</span></Field>
      </div>

      {pc.pendingUpdate && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="text-xs uppercase tracking-wide text-blue-700 font-medium mb-2">
            Actualización en curso
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div><span className="text-gray-500">Versión:</span> <span className="font-mono">{pc.pendingUpdate.version}</span></div>
            <div><span className="text-gray-500">Status:</span> <span className="font-medium">{pc.pendingUpdate.status}</span></div>
            <div><span className="text-gray-500">Actualizado:</span> {formatDate(pc.pendingUpdate.statusUpdatedAt)}</div>
          </div>
          {pc.pendingUpdate.releaseNotesS3Key && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <ReleaseNotesDialog
                version={pc.pendingUpdate.version}
                s3Key={pc.pendingUpdate.releaseNotesS3Key}
                summary={pc.pendingUpdate.releaseNotes}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">{label}</div>
      <div>{children}</div>
    </div>
  )
}
