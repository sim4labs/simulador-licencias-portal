'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/Dialog'
import { useReleaseNotes } from '@/lib/simulator-queries'

interface ReleaseNotesDialogProps {
  version: string
  s3Key: string
  /** Resumen corto para mostrar como contexto en el header del modal. */
  summary?: string
}

/**
 * Botón "Ver detalles" + modal con el markdown completo de release notes.
 * Lazy load: el fetch al backend solo dispara cuando el modal se abre.
 */
export function ReleaseNotesDialog({ version, s3Key, summary }: ReleaseNotesDialogProps) {
  const [open, setOpen] = useState(false)
  const { data, isLoading, isError, error } = useReleaseNotes(s3Key, { enabled: open })

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
      </DialogContent>
    </Dialog>
  )
}
