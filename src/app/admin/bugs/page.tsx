'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Bug, Plus, ExternalLink } from 'lucide-react'
import { useBugsList } from '@/lib/bugs-queries'
import type { BugListItem, BugOrigin, BugStatus } from '@/lib/bugs-api'
import { BugStatusPill, BugOriginPill } from '@/components/admin/BugStatusPill'
import { CreateBugDialog } from '@/components/admin/CreateBugDialog'
import { Button } from '@/components/ui/Button'

const STATE_OPTIONS: Array<{ value: 'all' | 'open' | 'closed'; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'open', label: 'Abiertos' },
  { value: 'closed', label: 'Cerrados' },
]

const ORIGIN_OPTIONS: Array<{ value: BugOrigin | 'all'; label: string }> = [
  { value: 'all', label: 'Todos los origenes' },
  { value: 'portal-admin', label: 'Portal admin' },
  { value: 'portal-ciudadano', label: 'Portal ciudadano' },
  { value: 'simulador-manejo', label: 'Simulador' },
]

const STATUS_OPTIONS: Array<{ value: BugStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Cualquier estado' },
  { value: 'open', label: 'Abierto' },
  { value: 'awaiting-verification', label: 'Verificar' },
  { value: 'verified', label: 'Cerrado' },
]

function formatRelative(iso: string) {
  const date = new Date(iso)
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'ahora'
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `hace ${days}d`
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

export default function BugsPage() {
  const [state, setState] = useState<'all' | 'open' | 'closed'>('all')
  const [originFilter, setOriginFilter] = useState<BugOrigin | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<BugStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data, isLoading, error, refetch } = useBugsList(state)
  const bugs = data?.bugs ?? []
  const failures = data?.failures ?? []

  const filtered = useMemo<BugListItem[]>(() => {
    let items = bugs
    if (originFilter !== 'all') items = items.filter((i) => i.origin === originFilter)
    if (statusFilter !== 'all') items = items.filter((i) => i.status === statusFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      items = items.filter((i) => i.title.toLowerCase().includes(q) || String(i.number).includes(q))
    }
    return items
  }, [bugs, originFilter, statusFilter, search])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10 text-primary-700">
            <Bug className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Bugs</h1>
            <p className="text-sm text-gray-500">Reportes operativos hacia los repositorios de GitHub</p>
          </div>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Reportar bug
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <select
          value={state}
          onChange={(e) => setState(e.target.value as any)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
        >
          {STATE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={originFilter}
          onChange={(e) => setOriginFilter(e.target.value as any)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
        >
          {ORIGIN_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Buscar por título o número…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
        />
      </div>

      {isLoading && (
        <div className="text-sm text-gray-500 py-12 text-center">Cargando bugs…</div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          <span>No se pudo cargar la lista: {(error as Error).message}</span>
          <button onClick={() => refetch()} className="underline">Reintentar</button>
        </div>
      )}

      {failures.length > 0 && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 mb-3">
          <p className="font-medium">Algunos repos no respondieron — listado parcial:</p>
          <ul className="mt-1 list-disc list-inside text-xs">
            {failures.map((f) => (
              <li key={f.repo}>
                <code className="font-mono">{f.repo}</code> {f.status ? `(${f.status})` : ''} — {f.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="text-sm text-gray-500 py-12 text-center">
          {bugs.length === 0 ? 'No hay bugs reportados todavía.' : 'Ningún bug coincide con los filtros.'}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Título</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Origen</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Comentarios</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actualizado</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filtered.map((bug) => (
                <tr key={`${bug.owner}/${bug.repo}#${bug.number}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">#{bug.number}</td>
                  <td className="px-4 py-3 text-sm">
                    <Link
                      href={`/admin/bugs/${bug.owner}/${bug.repo}/${bug.number}`}
                      className="text-gray-900 font-medium hover:text-primary"
                    >
                      {bug.title}
                    </Link>
                    <p className="text-xs text-gray-400">{bug.owner}/{bug.repo}</p>
                  </td>
                  <td className="px-4 py-3"><BugOriginPill origin={bug.origin} /></td>
                  <td className="px-4 py-3"><BugStatusPill status={bug.status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{bug.commentsCount}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatRelative(bug.updatedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={bug.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-400 hover:text-primary inline-flex"
                      title="Ver en GitHub"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateBugDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  )
}
