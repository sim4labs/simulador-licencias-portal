'use client'

import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import {
  RefreshCw, Loader2, Monitor, ArrowUpRight, Download, FileText,
  ArrowUp, ArrowDown, ChevronsUpDown, Pencil, Rocket, Package, X, CheckCircle2,
} from 'lucide-react'
import { simulatorKeys, useSimulatorPCs, useUpdatePC, useUnityBuilds } from '@/lib/simulator-queries'
import { simulatorApi, type SimulatorPC, type UnityBuild } from '@/lib/simulator-api'
import { Button } from '@/components/ui/Button'

type SortKey = 'name' | 'appVersion' | 'ip' | 'online' | 'pendingUpdate' | 'pendingConfig'
type SortDir = 'asc' | 'desc'

const ENV_LABEL: Record<string, string> = {
  dev: 'Dev',
  stage: 'Stage',
  prod: 'Prod',
}

const CURRENT_ENV = process.env.NEXT_PUBLIC_ENV || 'dev'

type SchedulePreset = 'now' | 'evening' | 'morning'

const SCHEDULE_OPTIONS: { value: SchedulePreset; label: string }[] = [
  { value: 'now', label: 'Ahora' },
  { value: 'evening', label: 'Después de las 6 PM PST' },
  { value: 'morning', label: 'Mañana 6 AM PST' },
]

function getScheduleTimestamp(preset: SchedulePreset): string {
  const now = new Date()
  if (preset === 'now') return now.toISOString()
  const utcDate = new Date(now)
  if (preset === 'evening') {
    utcDate.setUTCHours(2, 0, 0, 0)
    if (utcDate <= now) utcDate.setUTCDate(utcDate.getUTCDate() + 1)
  } else {
    utcDate.setUTCHours(14, 0, 0, 0)
    if (utcDate <= now) utcDate.setUTCDate(utcDate.getUTCDate() + 1)
  }
  return utcDate.toISOString()
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}

const IN_PROGRESS_STATUSES = new Set(['PENDING', 'DOWNLOADING', 'DOWNLOADED', 'INSTALLING'])

function isUpdateInProgress(pc: SimulatorPC): boolean {
  const s = pc.pendingUpdate?.status
  return !!s && IN_PROGRESS_STATUSES.has(s)
}

export default function PCsPage() {
  const qc = useQueryClient()
  const pcsQuery = useSimulatorPCs()
  const buildsQuery = useUnityBuilds()
  const pcs = useMemo(() => pcsQuery.data ?? [], [pcsQuery.data])
  const builds = buildsQuery.data?.builds ?? []
  const latestVersion = buildsQuery.data?.latestVersion ?? null
  const loading = pcsQuery.isLoading
  const error = pcsQuery.error ? pcsQuery.error.message : null
  const [promoting, setPromoting] = useState<string | null>(null)
  const [renameTarget, setRenameTarget] = useState<SimulatorPC | null>(null)
  const [installTarget, setInstallTarget] = useState<{ kind: 'single'; pc: SimulatorPC } | { kind: 'bulk' } | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const updatePC = useUpdatePC()

  const isRefreshing = pcsQuery.isFetching || buildsQuery.isFetching

  const loadData = () => {
    qc.invalidateQueries({ queryKey: simulatorKeys.pcs })
    qc.invalidateQueries({ queryKey: simulatorKeys.unityBuilds })
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const sortedPcs = useMemo(() => {
    const sorted = [...pcs].sort((a, b) => {
      if (sortKey === 'online') {
        return (a.online === b.online) ? 0 : a.online ? -1 : 1
      }
      if (sortKey === 'pendingUpdate') {
        const va = a.pendingUpdate ? `${a.pendingUpdate.status}-${a.pendingUpdate.version}` : ''
        const vb = b.pendingUpdate ? `${b.pendingUpdate.status}-${b.pendingUpdate.version}` : ''
        if (!va && !vb) return 0
        if (!va) return 1
        if (!vb) return -1
        return va.localeCompare(vb, 'es', { numeric: true })
      }
      if (sortKey === 'pendingConfig') {
        const va = a.pendingConfig?.environment ?? ''
        const vb = b.pendingConfig?.environment ?? ''
        if (!va && !vb) return 0
        if (!va) return 1
        if (!vb) return -1
        return va.localeCompare(vb, 'es', { numeric: true })
      }
      const va = (a[sortKey] ?? '') as string
      const vb = (b[sortKey] ?? '') as string
      if (!va && !vb) return 0
      if (!va) return 1
      if (!vb) return -1
      return va.localeCompare(vb, 'es', { numeric: true })
    })
    if (sortDir === 'desc') sorted.reverse()
    return sorted
  }, [pcs, sortKey, sortDir])

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400" />
    return sortDir === 'asc'
      ? <ArrowUp className="h-3.5 w-3.5 text-primary" />
      : <ArrowDown className="h-3.5 w-3.5 text-primary" />
  }

  const handleEnvironmentChange = async (pcId: string, environment: string) => {
    if (environment === CURRENT_ENV) return
    if (!confirm(`Promover esta PC a ${ENV_LABEL[environment]}? Se moverá al próximo heartbeat (~3 min).`)) return

    setPromoting(pcId)
    try {
      await updatePC.mutateAsync({ pcId, body: { environment } })
    } finally {
      setPromoting(null)
    }
  }

  const onlineCount = pcs.filter(pc => pc.online).length
  const bulkEligible = pcs.filter(pc => pc.online && !isUpdateInProgress(pc))
  const bulkExcludedOffline = pcs.filter(pc => !pc.online).length
  const bulkExcludedInProgress = pcs.filter(pc => pc.online && isUpdateInProgress(pc)).length
  const noBuilds = builds.length === 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PCs Registradas</h1>
          <p className="text-sm text-gray-500 mt-1">
            {pcs.length} PC{pcs.length !== 1 ? 's' : ''} &middot; {onlineCount} online &middot; Ambiente: {ENV_LABEL[CURRENT_ENV]}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isRefreshing}
            title="Refrescar lista de PCs"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refrescando…' : 'Refrescar'}
          </Button>
          <Button
            size="sm"
            onClick={() => setInstallTarget({ kind: 'bulk' })}
            disabled={noBuilds || bulkEligible.length === 0}
            title={
              noBuilds ? 'No hay builds disponibles. Sube uno desde Builds Unity.'
                : bulkEligible.length === 0 ? 'No hay PCs online elegibles'
                : `Desplegar build a ${bulkEligible.length} PC${bulkEligible.length !== 1 ? 's' : ''} online`
            }
          >
            <Rocket className="h-4 w-4 mr-1" /> Instalar en todas
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {pcs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Monitor className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Sin PCs registradas</h3>
          <p className="text-sm text-gray-500">
            Las PCs se registran automaticamente al guardar la configuracion en el simulador de Unity (F10)
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {([
                  ['name', 'Nombre'],
                  ['appVersion', 'Version'],
                  ['ip', 'IP'],
                  ['online', 'Estado'],
                  ['pendingUpdate', 'Actualizacion'],
                  ['pendingConfig', 'Ambiente'],
                  [null, 'Acciones'],
                ] as const).map(([key, label]) => (
                  <th key={label} className="text-left px-4 py-3 font-medium text-gray-500">
                    {key ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(key)}
                        className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
                      >
                        {label}
                        <SortIcon col={key} />
                      </button>
                    ) : label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedPcs.map(pc => (
                <tr key={pc.pcId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <Link
                      href={`/admin/simuladores/pcs/${encodeURIComponent(pc.pcId)}`}
                      className="block hover:text-primary"
                    >
                      <div className="hover:underline">{pc.name || '-'}</div>
                      {pc.simulatorId && (
                        <div className="text-xs font-normal text-gray-500 mt-0.5">{pc.simulatorId}</div>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{pc.appVersion || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{pc.ip || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                      pc.online ? 'text-green-700' : 'text-gray-400'
                    }`}>
                      <span className={`h-2 w-2 rounded-full ${pc.online ? 'bg-green-500' : 'bg-gray-300'}`} />
                      {pc.online ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {pc.pendingUpdate ? (() => {
                      const attempts = pc.pendingUpdate.attemptCount ?? 0
                      const abandoned = pc.pendingUpdate.status === 'FAILED' && attempts >= 3
                      const colorClass = abandoned ? 'text-gray-500'
                        : pc.pendingUpdate.status === 'INSTALLED' ? 'text-green-700'
                        : pc.pendingUpdate.status === 'FAILED' ? 'text-red-600'
                        : pc.pendingUpdate.status === 'DOWNLOADING' || pc.pendingUpdate.status === 'INSTALLING' ? 'text-blue-600'
                        : 'text-amber-600'
                      const label = abandoned ? 'Abandonada'
                        : pc.pendingUpdate.status === 'INSTALLED' ? 'Instalado'
                        : pc.pendingUpdate.status === 'FAILED' ? 'Fallido'
                        : pc.pendingUpdate.status === 'DOWNLOADING' ? 'Descargando'
                        : pc.pendingUpdate.status === 'INSTALLING' ? 'Instalando'
                        : 'Pendiente'
                      const tooltip = abandoned
                        ? `Abandonada tras ${attempts} intentos fallidos. Sube versión nueva para reintentar.`
                        : pc.pendingUpdate.error || undefined
                      return (
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${colorClass}`}
                          title={tooltip}
                        >
                          <Download className="h-3 w-3" />
                          v{pc.pendingUpdate.version} · {label}
                          {attempts > 0 && !abandoned && (
                            <span className="text-gray-400 ml-0.5">× {attempts}</span>
                          )}
                        </span>
                      )
                    })() : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {pc.pendingConfig ? (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                        <ArrowUpRight className="h-3 w-3" />
                        → {ENV_LABEL[pc.pendingConfig.environment] || pc.pendingConfig.environment}
                      </span>
                    ) : promoting === pc.pcId ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    ) : (
                      <select
                        value={CURRENT_ENV}
                        onChange={e => handleEnvironmentChange(pc.pcId, e.target.value)}
                        className="border border-gray-200 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      >
                        <option value="dev">Dev</option>
                        <option value="stage">Stage</option>
                        <option value="prod">Prod</option>
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setInstallTarget({ kind: 'single', pc })}
                        disabled={noBuilds}
                        title={noBuilds ? 'Sin builds disponibles' : 'Instalar build'}
                        className="inline-flex items-center justify-center text-gray-500 hover:text-primary border border-gray-200 hover:border-primary/40 rounded p-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Rocket className="h-3.5 w-3.5" />
                      </button>
                      <Link
                        href={`/admin/simuladores/pcs/${encodeURIComponent(pc.pcId)}/logs`}
                        className="inline-flex items-center justify-center text-gray-500 hover:text-primary border border-gray-200 hover:border-primary/40 rounded p-1.5 transition-colors"
                        title="Ver logs"
                      >
                        <FileText className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setRenameTarget(pc)}
                        title="Renombrar PC"
                        className="inline-flex items-center justify-center text-gray-500 hover:text-primary border border-gray-200 hover:border-primary/40 rounded p-1.5 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {renameTarget && (
        <RenamePCModal
          pc={renameTarget}
          onClose={() => setRenameTarget(null)}
          onSaved={() => setRenameTarget(null)}
        />
      )}

      {installTarget && (
        <InstallBuildModal
          target={installTarget}
          builds={builds}
          buildsLoading={buildsQuery.isLoading}
          latestVersion={latestVersion}
          eligiblePcs={installTarget.kind === 'bulk' ? bulkEligible : [installTarget.pc]}
          excludedOffline={installTarget.kind === 'bulk' ? bulkExcludedOffline : 0}
          excludedInProgress={installTarget.kind === 'bulk' ? bulkExcludedInProgress : 0}
          onClose={() => setInstallTarget(null)}
          onDeployed={() => {
            setInstallTarget(null)
            loadData()
          }}
        />
      )}
    </div>
  )
}

function RenamePCModal({ pc, onClose, onSaved }: {
  pc: SimulatorPC
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(pc.name || '')
  const updatePC = useUpdatePC()
  const trimmed = name.trim()
  const unchanged = trimmed === (pc.name || '').trim()
  const tooLong = trimmed.length > 40

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trimmed || unchanged || tooLong) return
    await updatePC.mutateAsync({ pcId: pc.pcId, body: { name: trimmed } })
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Renombrar PC</h2>
        <p className="text-xs text-gray-500 font-mono mb-4">{pc.pcId.slice(0, 8)}...{pc.pcId.slice(-4)}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={40}
              placeholder="Ej. Simulador Aramis"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              autoFocus
            />
            {tooLong && (
              <p className="text-xs text-red-600 mt-1">Máximo 40 caracteres</p>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2 rounded-lg">
            El nombre se aplicará en la PC en el próximo heartbeat (hasta ~3 min).
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={!trimmed || unchanged || tooLong || updatePC.isPending}>
              {updatePC.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function InstallBuildModal({
  target, builds, buildsLoading, latestVersion, eligiblePcs,
  excludedOffline, excludedInProgress, onClose, onDeployed,
}: {
  target: { kind: 'single'; pc: SimulatorPC } | { kind: 'bulk' }
  builds: UnityBuild[]
  buildsLoading: boolean
  latestVersion: string | null
  eligiblePcs: SimulatorPC[]
  excludedOffline: number
  excludedInProgress: number
  onClose: () => void
  onDeployed: () => void
}) {
  const isBulk = target.kind === 'bulk'
  const singlePc = target.kind === 'single' ? target.pc : null

  // Snapshot at mount: parent's pcs query may refresh while modal is open,
  // but the deploy target must match what the user saw when they confirmed.
  const [snapshotPcs] = useState<SimulatorPC[]>(() => isBulk ? eligiblePcs : (singlePc ? [singlePc] : []))
  const [snapshotExcluded] = useState(() => ({ offline: excludedOffline, inProgress: excludedInProgress }))

  const [selectedBuild, setSelectedBuild] = useState<UnityBuild | null>(null)
  const [schedulePreset, setSchedulePreset] = useState<SchedulePreset>('now')
  const [installing, setInstalling] = useState(false)
  const [installError, setInstallError] = useState<string | null>(null)

  const pcCount = snapshotPcs.length

  const title = isBulk ? 'Actualizar todas las PCs online' : 'Instalar build'
  const subtitle = isBulk
    ? `${pcCount} PC${pcCount !== 1 ? 's' : ''} elegibles`
    : singlePc
      ? `${singlePc.name || singlePc.pcId.slice(0, 12)}${singlePc.appVersion ? ` · actual v${singlePc.appVersion}` : ''}`
      : ''

  const singlePcWarning = (() => {
    if (!singlePc?.pendingUpdate) return null
    const s = singlePc.pendingUpdate.status
    if (s === 'INSTALLED' || s === 'FAILED') return null
    return `Esta PC ya tiene un update v${singlePc.pendingUpdate.version} en estado ${s}. Instalar otro lo reemplazará.`
  })()

  const handleClose = () => { if (!installing) onClose() }

  const handleInstall = async () => {
    if (installing || !selectedBuild || pcCount === 0) return
    if (isBulk) {
      const ok = confirm(
        `Desplegar v${selectedBuild.version} a ${pcCount} PC${pcCount !== 1 ? 's' : ''}? Esta acción no se puede revertir.`
      )
      if (!ok) return
    }

    setInstalling(true)
    setInstallError(null)

    try {
      const { error: err } = await simulatorApi.deployUnityBuild({
        version: selectedBuild.version,
        s3Key: selectedBuild.s3Key,
        sha256: '',
        size: selectedBuild.size,
        scheduledAfter: getScheduleTimestamp(schedulePreset),
        targetPcIds: snapshotPcs.map(p => p.pcId),
      })
      if (err) setInstallError(err)
      else onDeployed()
    } catch (e) {
      setInstallError(e instanceof Error ? e.message : 'Error desplegando build')
    } finally {
      setInstalling(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-modal-title"
        className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 id="install-modal-title" className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={installing}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4 overflow-y-auto">
          {installError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{installError}</p>
            </div>
          )}

          {singlePcWarning && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-700">{singlePcWarning}</p>
            </div>
          )}

          {isBulk && (snapshotExcluded.offline > 0 || snapshotExcluded.inProgress > 0) && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600 space-y-0.5">
              {snapshotExcluded.offline > 0 && (
                <p>· {snapshotExcluded.offline} PC{snapshotExcluded.offline !== 1 ? 's' : ''} offline (no se incluyen)</p>
              )}
              {snapshotExcluded.inProgress > 0 && (
                <p>· {snapshotExcluded.inProgress} con update en curso (excluidas)</p>
              )}
            </div>
          )}

          {isBulk && pcCount > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700">PCs incluidas</p>
              <div className="mt-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                {snapshotPcs.map(pc => (
                  <div key={pc.pcId} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-700 truncate">{pc.name || pc.pcId.slice(0, 12)}</span>
                    <span className="text-gray-400 flex-shrink-0">v{pc.appVersion || '?'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Build picker */}
          <fieldset>
            <legend className="text-sm font-medium text-gray-700">Build a instalar</legend>
            {buildsLoading ? (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Cargando builds...
              </div>
            ) : builds.length === 0 ? (
              <p className="mt-2 text-sm text-gray-400">Sin builds disponibles. Sube uno desde Builds Unity.</p>
            ) : (
              <div className="mt-2 space-y-1.5 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {builds.map(build => {
                  const isSelected = selectedBuild?.s3Key === build.s3Key
                  const isCurrent = singlePc?.appVersion === build.version
                  return (
                    <label
                      key={build.s3Key}
                      className={`flex items-center gap-3 p-2.5 rounded-md cursor-pointer border transition-colors ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="build"
                        checked={isSelected}
                        onChange={() => setSelectedBuild(build)}
                        className="text-primary focus:ring-primary"
                      />
                      <Package className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">v{build.version}</span>
                          {build.version === latestVersion && (
                            <span className="text-[10px] uppercase tracking-wide text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                              última
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[10px] uppercase tracking-wide text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                              <CheckCircle2 className="h-2.5 w-2.5" /> instalada
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate">{formatSize(build.size)} · {build.filename}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
          </fieldset>

          {/* Schedule */}
          <fieldset>
            <legend className="text-sm font-medium text-gray-700">Horario de instalación</legend>
            <div className="mt-2 space-y-2">
              {SCHEDULE_OPTIONS.map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-2.5 rounded-md cursor-pointer border transition-colors ${
                    schedulePreset === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="schedule"
                    value={opt.value}
                    checked={schedulePreset === opt.value}
                    onChange={() => setSchedulePreset(opt.value)}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={installing}>
            Cancelar
          </Button>
          <Button
            size="sm"
            disabled={installing || !selectedBuild || pcCount === 0}
            isLoading={installing}
            onClick={handleInstall}
          >
            <Rocket className="h-4 w-4 mr-2" />
            {selectedBuild
              ? (isBulk
                  ? `Actualizar ${pcCount} PC${pcCount !== 1 ? 's' : ''}`
                  : `Instalar v${selectedBuild.version}`)
              : 'Instalar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
