'use client'

import { useState } from 'react'
import { GitCommit, Tag, ChevronDown, ChevronRight, Sparkles } from 'lucide-react'
import { changelog, currentVersion, type ChangelogEntryDecorated } from '@/data/changelog'
import { useBackendVersion } from '@/lib/version-api'
import { cn } from '@/lib/utils'

interface ChangelogListProps {
  /** Mostrar lista detallada de commits. Citizens normalmente no la necesitan. */
  showCommits?: boolean
}

export function ChangelogList({ showCommits = true }: ChangelogListProps) {
  const version = currentVersion()
  const totalCommits = changelog.reduce((n, e) => n + e.commits.length, 0)
  const { data: be } = useBackendVersion()
  const beLabel = be ? (be.version === 'unreleased' ? 'sin release' : `v${be.version}`) : '…'

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">Historial de versiones</h1>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-800 text-white text-xs font-semibold px-3 py-1">
            <Tag className="h-3 w-3" />
            FE {version === 'unreleased' ? 'sin release' : `v${version}`}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary text-white text-xs font-semibold px-3 py-1">
            <Tag className="h-3 w-3" />
            BE {beLabel}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {changelog.length} {changelog.length === 1 ? 'entrada' : 'entradas'}
          {showCommits && (
            <>
              {' · '}
              {totalCommits} {totalCommits === 1 ? 'commit' : 'commits'}
            </>
          )}
          .
        </p>
      </div>

      <div className="space-y-4">
        {changelog.map((entry, idx) => (
          <ChangelogCard
            key={entry.version + idx}
            entry={entry}
            defaultOpen={idx === 0}
            showCommits={showCommits}
          />
        ))}
      </div>
    </div>
  )
}

function ChangelogCard({
  entry,
  defaultOpen,
  showCommits,
}: {
  entry: ChangelogEntryDecorated
  defaultOpen: boolean
  showCommits: boolean
}) {
  const [openCommits, setOpenCommits] = useState(defaultOpen)
  const isUnreleased = entry.tag === null

  return (
    <article className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <header className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold',
                isUnreleased
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-primary-100 text-primary-800',
              )}
            >
              <Tag className="h-3 w-3" />
              {isUnreleased ? 'Próxima versión' : entry.tag}
            </span>
            <span className="text-xs text-gray-500">{entry.date}</span>
            {showCommits && (
              <>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-500">
                  {entry.commits.length} {entry.commits.length === 1 ? 'commit' : 'commits'}
                </span>
              </>
            )}
          </div>
          {entry.title && (
            <h2 className="mt-2 text-lg font-semibold text-gray-900">{entry.title}</h2>
          )}
        </div>
      </header>

      {entry.highlights && entry.highlights.length > 0 && (
        <div className="px-5 py-4 border-b border-gray-100 bg-primary-50">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary-800" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-800">
              Lo destacado
            </span>
          </div>
          <ul className="space-y-1.5 text-sm text-gray-700">
            {entry.highlights.map((h, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary-800 mt-1 flex-shrink-0">·</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showCommits && (
        <div className="px-5 py-3">
          <button
            type="button"
            onClick={() => setOpenCommits((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            {openCommits ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <GitCommit className="h-4 w-4" />
            Commits ({entry.commits.length})
          </button>

          {openCommits && (
            <ul className="mt-3 space-y-1.5">
              {entry.commits.map((c) => (
                <li key={c.hash} className="flex gap-3 text-sm font-mono">
                  <span className="text-gray-400 flex-shrink-0 w-16">{c.date}</span>
                  <span className="text-primary-800 flex-shrink-0 w-16">{c.hash}</span>
                  <span className="text-gray-700 break-words font-sans">{c.subject}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </article>
  )
}
