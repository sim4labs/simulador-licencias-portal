'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { FileText, ExternalLink, CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/Dialog'
import { useReleaseNotes, useBuildTestPlan, useToggleTestPlanItem } from '@/lib/simulator-queries'
import type { TestPlanItem } from '@/lib/simulator-api'

interface ReleaseNotesDialogProps {
  version: string
  s3Key: string
  /** Resumen corto para mostrar como contexto en el header del modal. */
  summary?: string
}

function formatRelative(iso: string): string {
  const d = new Date(iso)
  const diffMs = Date.now() - d.getTime()
  const min = Math.floor(diffMs / 60_000)
  if (min < 1) return 'hace unos segundos'
  if (min < 60) return `hace ${min} min`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `hace ${hr} h`
  const day = Math.floor(hr / 24)
  if (day < 7) return `hace ${day} d`
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}

function TestPlanItemRow({ item, onToggle, disabled }: { item: TestPlanItem; onToggle: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <li className="flex items-start gap-2 py-1">
      <input
        type="checkbox"
        checked={item.checked}
        disabled={disabled}
        onChange={e => onToggle(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer disabled:cursor-not-allowed"
        aria-label={item.text}
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${item.checked ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
          {item.text}
        </p>
        {item.checked && item.checkedBy && item.checkedAt && (
          <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            {item.checkedBy.name} · {formatRelative(item.checkedAt)}
          </p>
        )}
      </div>
    </li>
  )
}

function TestPlanSection({ version, open }: { version: string; open: boolean }) {
  const { data, isLoading, isError, error } = useBuildTestPlan(version, { enabled: open })
  const toggle = useToggleTestPlanItem(version)

  if (isLoading) {
    return (
      <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
        <div className="text-xs text-gray-400">Cargando test plan...</div>
      </div>
    )
  }

  if (isError) {
    const msg = error instanceof Error ? error.message : ''
    const isMissing = /\b404\b|not found|no encontrad|no hay test plan/i.test(msg)
    if (isMissing) return null
    return (
      <div className="border border-amber-200 bg-amber-50 rounded-lg p-3 text-xs text-amber-700">
        No se pudo cargar el test plan: {msg || 'error desconocido'}
      </div>
    )
  }

  if (!data || data.items.length === 0) return null

  const completed = data.items.filter(i => i.checked).length
  const total = data.items.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <section className="border border-gray-200 rounded-lg p-3 bg-white">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900">Test Plan</h3>
        <span className="text-xs text-gray-500 font-medium">
          {completed} / {total} completados
        </span>
      </div>
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="space-y-0">
        {data.items.map(item => (
          <TestPlanItemRow
            key={item.id}
            item={item}
            disabled={toggle.isPending}
            onToggle={checked => toggle.mutate({ itemId: item.id, checked })}
          />
        ))}
      </ul>
    </section>
  )
}

/**
 * Botón "Ver detalles" + modal con el markdown completo de release notes.
 * Lazy load: el fetch al backend solo dispara cuando el modal se abre.
 *
 * Si la build tiene `test-plan.json` (publicada con el skill `publish-unity-build`
 * actualizado), arriba del markdown aparece una sección "Test Plan" con
 * checkboxes accionables que persisten en DDB. Builds sin el JSON degradan
 * limpiamente: la sección no se renderiza y el `- [ ]` del MD se ve estático
 * como antes.
 *
 * Si el backend devuelve `compareUrl`, agregamos un footer con link a GitHub
 * Compare (`github.com/.../compare/vX.Y.Z...HEAD`) — más útil para devs/QA
 * que un commits panel custom.
 */
export function ReleaseNotesDialog({ version, s3Key, summary }: ReleaseNotesDialogProps) {
  const [open, setOpen] = useState(false)
  const { data, isLoading, isError, error } = useReleaseNotes(s3Key, { enabled: open })
  const { data: testPlan } = useBuildTestPlan(version, { enabled: open })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-800 hover:underline"
          aria-label={`Ver detalles del release ${version}`}
        >
          <FileText className="h-3 w-3" />
          Ver detalles
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Release v{version}</DialogTitle>
          {summary && (
            <DialogDescription className="mt-1 max-w-2xl truncate" title={summary}>
              {summary}
            </DialogDescription>
          )}
        </DialogHeader>

        <TestPlanSection version={version} open={open} />

        {isLoading && (
          <div className="py-12 text-center text-sm text-gray-500">
            Cargando release notes...
          </div>
        )}

        {isError && (
          (() => {
            const msg = error instanceof Error ? error.message : 'desconocido'
            const isMissing = /\b404\b|not found|no encontrad/i.test(msg)
            return isMissing ? (
              <div className="py-12 text-center text-sm text-gray-500">
                No hay release notes registradas para v{version}.
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-red-600">
                Error cargando release notes: {msg}
              </div>
            )
          })()
        )}

        {data?.content && (
          <article className="prose prose-sm max-w-none mt-2 prose-headings:mt-4 prose-headings:mb-2 prose-h2:text-base prose-h2:font-semibold prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-1 prose-h3:text-sm prose-h3:font-semibold prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none prose-pre:bg-gray-900 prose-pre:text-gray-100">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.content}</ReactMarkdown>
          </article>
        )}

        {testPlan?.compareUrl && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-right">
            <a
              href={testPlan.compareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-800 hover:underline"
            >
              Ver commits en GitHub
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
