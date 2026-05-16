'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, CheckCircle2, MessageSquare, Tag as TagIcon, GitMerge, RefreshCw, ClipboardCheck } from 'lucide-react'
import { useBugDetail, useAddBugComment, useVerifyBug, useMarkBugForVerification } from '@/lib/bugs-queries'
import { BugStatusPill, BugOriginPill } from '@/components/admin/BugStatusPill'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/admin/Textarea'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-MX', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// Render plano del body de markdown. NO usamos un parser completo (no agregamos deps);
// soportamos solo lo necesario: imágenes `![](url)` se convierten a <img>, todo lo demás
// se muestra como texto preformateado preservando saltos de línea.
function renderBody(body: string | null | undefined) {
  if (!body) return null
  const segments: Array<{ type: 'text' | 'image'; value: string }> = []
  const re = /!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/g
  let lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(body)) !== null) {
    if (m.index > lastIndex) segments.push({ type: 'text', value: body.slice(lastIndex, m.index) })
    segments.push({ type: 'image', value: m[1] })
    lastIndex = m.index + m[0].length
  }
  if (lastIndex < body.length) segments.push({ type: 'text', value: body.slice(lastIndex) })
  return segments.map((seg, i) => {
    if (seg.type === 'image') {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={seg.value} alt="" className="max-w-md rounded-md border border-gray-200 my-2" />
      )
    }
    return <span key={i} className="whitespace-pre-wrap">{seg.value}</span>
  })
}

function eventDescription(e: { event: string; actor: { login: string } | null; label?: string; assignee?: string; rename?: { from: string; to: string }; source?: { number: number; title: string; url: string } }) {
  const who = e.actor?.login ?? 'alguien'
  switch (e.event) {
    case 'closed': return `${who} cerró el bug`
    case 'reopened': return `${who} reabrió el bug`
    case 'labeled': return `${who} agregó label “${e.label}”`
    case 'unlabeled': return `${who} quitó label “${e.label}”`
    case 'assigned': return `${who} asignó a ${e.assignee}`
    case 'unassigned': return `${who} desasignó a ${e.assignee}`
    case 'renamed': return `${who} renombró: "${e.rename?.from}" → "${e.rename?.to}"`
    case 'referenced': return `${who} referenció este bug desde otro lugar`
    case 'cross-referenced': return `${who} mencionó este bug desde #${e.source?.number}`
    case 'merged': return `${who} mergeó el PR relacionado`
    default: return `${e.event} por ${who}`
  }
}

export default function BugDetailPage() {
  const params = useParams<{ owner: string; repo: string; number: string }>()
  const owner = params.owner
  const repo = params.repo
  const number = Number(params.number)
  const { data, isLoading, error, refetch, isRefetching } = useBugDetail(owner, repo, number)
  const addComment = useAddBugComment(owner, repo, number)
  const markForVerification = useMarkBugForVerification(owner, repo, number)
  const verifyBug = useVerifyBug(owner, repo, number)
  const [comment, setComment] = useState('')
  const [markNote, setMarkNote] = useState('')
  const [showMark, setShowMark] = useState(false)
  const [verifyNote, setVerifyNote] = useState('')
  const [showVerify, setShowVerify] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-500">Cargando…</div>
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          No se pudo cargar este bug: {(error as Error).message}
        </div>
        <Link href="/admin/bugs" className="text-sm text-primary mt-4 inline-block">← Volver a la lista</Link>
      </div>
    )
  }

  if (!data) return null

  const timeline: Array<{ kind: 'comment'; createdAt: string; payload: typeof data.comments[number] } | { kind: 'event'; createdAt: string; payload: typeof data.events[number] }> = [
    ...data.comments.map((c) => ({ kind: 'comment' as const, createdAt: c.createdAt, payload: c })),
    ...data.events.map((e) => ({ kind: 'event' as const, createdAt: e.createdAt, payload: e })),
  ].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))

  const handleAddComment = async () => {
    if (!comment.trim()) return
    try {
      await addComment.mutateAsync(comment.trim())
      setComment('')
    } catch (err) {
      // El error queda visible vía mutation.error si quisieras; por ahora silencioso.
      console.error(err)
    }
  }

  const handleMarkForVerification = async () => {
    setActionError(null)
    try {
      await markForVerification.mutateAsync(markNote.trim() || undefined)
      setMarkNote('')
      setShowMark(false)
    } catch (err: any) {
      setActionError(err?.message ?? 'No se pudo marcar para verificar')
    }
  }

  const handleVerify = async () => {
    setActionError(null)
    try {
      await verifyBug.mutateAsync(verifyNote.trim() || undefined)
      setVerifyNote('')
      setShowVerify(false)
    } catch (err: any) {
      setActionError(err?.message ?? 'No se pudo cerrar el bug')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link href="/admin/bugs" className="text-sm text-gray-600 hover:text-primary inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Volver a Bugs
        </Link>
        <button onClick={() => refetch()} className="text-sm text-gray-500 hover:text-primary inline-flex items-center gap-1">
          <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          Refrescar
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-mono mb-1">{data.owner}/{data.repo} #{data.number}</p>
            <h1 className="text-2xl font-semibold text-gray-900">{data.title}</h1>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <BugStatusPill status={data.status} />
              <BugOriginPill origin={data.origin} />
              <span className="text-xs text-gray-500">
                Reportado por <span className="font-medium text-gray-700">{data.author.login}</span> · {formatDate(data.createdAt)}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <a
              href={data.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-gray-500 hover:text-primary inline-flex items-center gap-1"
            >
              Abrir en GitHub <ExternalLink className="h-3 w-3" />
            </a>
            {data.status === 'open' && (
              <Button size="sm" variant="secondary" onClick={() => setShowMark(true)}>
                <ClipboardCheck className="h-4 w-4 mr-1" />
                Marcar para verificar
              </Button>
            )}
            {data.status === 'awaiting-verification' && (
              <Button size="sm" variant="secondary" onClick={() => setShowVerify(true)}>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Cerrar como verificado
              </Button>
            )}
            {actionError && (
              <p className="text-xs text-red-600 max-w-xs text-right">{actionError}</p>
            )}
          </div>
        </div>

        {data.body && (
          <div className="mt-4 prose prose-sm max-w-none text-gray-800">
            {renderBody(data.body)}
          </div>
        )}

        {data.labels.length > 0 && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <TagIcon className="h-3.5 w-3.5 text-gray-400" />
            {data.labels.map((l) => (
              <span key={l} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                {l}
              </span>
            ))}
          </div>
        )}
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-gray-400" />
        Historia
      </h2>

      <div className="space-y-3 mb-6">
        {timeline.length === 0 && (
          <p className="text-sm text-gray-500">Sin actividad todavía. Comenta abajo para empezar.</p>
        )}
        {timeline.map((entry, i) => {
          if (entry.kind === 'comment') {
            const c = entry.payload
            return (
              <div key={`c-${c.id}-${i}`} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  {c.author.avatarUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.author.avatarUrl} alt="" className="h-6 w-6 rounded-full" />
                  )}
                  <span className="text-sm font-medium text-gray-900">{c.author.login}</span>
                  <span className="text-xs text-gray-400">· {formatDate(c.createdAt)}</span>
                </div>
                <div className="text-sm text-gray-800">{renderBody(c.body)}</div>
              </div>
            )
          }
          const e = entry.payload
          return (
            <div key={`e-${i}`} className="flex items-center gap-2 text-xs text-gray-500 pl-2">
              <GitMerge className="h-3.5 w-3.5 text-gray-300" />
              <span>{eventDescription(e)}</span>
              <span className="text-gray-300">· {formatDate(e.createdAt)}</span>
            </div>
          )
        })}
      </div>

      {data.state === 'open' && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <Textarea
            label="Agregar comentario"
            placeholder="Escribí un comentario (se postea en el issue de GitHub)…"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="mt-2 flex justify-end">
            <Button onClick={handleAddComment} disabled={!comment.trim() || addComment.isPending} isLoading={addComment.isPending}>
              Comentar
            </Button>
          </div>
        </div>
      )}

      {showMark && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={(e) => { if (e.target === e.currentTarget) setShowMark(false) }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold mb-2">Marcar para verificar</h3>
            <p className="text-sm text-gray-600 mb-4">El bug pasa a estado <span className="font-medium">Verificar</span>. Después alguien con acceso valida y lo cierra.</p>
            <Textarea
              placeholder="Notas del trabajo realizado (opcional)"
              rows={3}
              value={markNote}
              onChange={(e) => setMarkNote(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowMark(false)} disabled={markForVerification.isPending}>Cancelar</Button>
              <Button variant="secondary" onClick={handleMarkForVerification} isLoading={markForVerification.isPending}>
                <ClipboardCheck className="h-4 w-4 mr-1" />
                Marcar para verificar
              </Button>
            </div>
          </div>
        </div>
      )}

      {showVerify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={(e) => { if (e.target === e.currentTarget) setShowVerify(false) }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold mb-2">Cerrar como verificado</h3>
            <p className="text-sm text-gray-600 mb-4">El issue queda cerrado. Opcionalmente dejá un comentario explicando qué validaste.</p>
            <Textarea
              placeholder="Notas de verificación (opcional)"
              rows={3}
              value={verifyNote}
              onChange={(e) => setVerifyNote(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowVerify(false)} disabled={verifyBug.isPending}>Cancelar</Button>
              <Button variant="secondary" onClick={handleVerify} isLoading={verifyBug.isPending}>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Cerrar como verificado
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
