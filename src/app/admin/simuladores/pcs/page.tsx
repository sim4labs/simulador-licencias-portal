'use client'

import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { RefreshCw, Loader2, Monitor, ArrowUpRight, Download, FileText, ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react'
import { simulatorApi } from '@/lib/simulator-api'
import { simulatorKeys, useSimulatorPCs } from '@/lib/simulator-queries'
import { Button } from '@/components/ui/Button'

type SortKey = 'name' | 'appVersion' | 'ip' | 'simulatorId' | 'online'
type SortDir = 'asc' | 'desc'

const ENV_LABEL: Record<string, string> = {
  dev: 'Dev',
  stage: 'Stage',
  prod: 'Prod',
}

const CURRENT_ENV = process.env.NEXT_PUBLIC_ENV || 'dev'

export default function PCsPage() {
  const qc = useQueryClient()
  const pcsQuery = useSimulatorPCs()
  const pcs = useMemo(() => pcsQuery.data ?? [], [pcsQuery.data])
  const loading = pcsQuery.isLoading
  const error = pcsQuery.error ? pcsQuery.error.message : null
  const [promoting, setPromoting] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const loadData = () => qc.invalidateQueries({ queryKey: simulatorKeys.pcs })

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const sortedPcs = useMemo(() => {
    const sorted = [...pcs].sort((a, b) => {
      if (sortKey === 'online') {
        return (a.online === b.online) ? 0 : a.online ? -1 : 1
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
    if (sortKey !== col) return <ChevronsUpDown className="h-3.5 w-3.5 text-gray-300" />
    return sortDir === 'asc'
      ? <ArrowUp className="h-3.5 w-3.5 text-primary" />
      : <ArrowDown className="h-3.5 w-3.5 text-primary" />
  }

  const handleEnvironmentChange = async (pcId: string, environment: string) => {
    if (environment === CURRENT_ENV) return
    if (!confirm(`Promover esta PC a ${ENV_LABEL[environment]}? Se moverá al próximo heartbeat (~3 min).`)) return

    setPromoting(pcId)
    await simulatorApi.updatePCEnvironment(pcId, environment)
    setPromoting(null)
    loadData()
  }

  const onlineCount = pcs.filter(pc => pc.online).length

  if (loading) {
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
          <h1 className="text-2xl font-bold text-gray-900">PCs Registradas</h1>
          <p className="text-sm text-gray-500 mt-1">
            {pcs.length} PC{pcs.length !== 1 ? 's' : ''} &middot; {onlineCount} online &middot; Ambiente: {ENV_LABEL[CURRENT_ENV]}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-1" /> Actualizar
        </Button>
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
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {([
                  ['name', 'Nombre'],
                  [null, 'UID'],
                  ['appVersion', 'Version'],
                  ['ip', 'IP'],
                  ['simulatorId', 'Simulador'],
                  ['online', 'Estado'],
                  [null, 'Actualizacion'],
                  [null, 'Ambiente'],
                  [null, 'Logs'],
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
                      className="hover:text-primary hover:underline"
                    >
                      {pc.name || '-'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                    {pc.pcId.slice(0, 8)}...{pc.pcId.slice(-4)}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{pc.appVersion || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{pc.ip || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{pc.simulatorId || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                      pc.online ? 'text-green-700' : 'text-gray-400'
                    }`}>
                      <span className={`h-2 w-2 rounded-full ${pc.online ? 'bg-green-500' : 'bg-gray-300'}`} />
                      {pc.online ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {pc.pendingUpdate ? (
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        pc.pendingUpdate.status === 'INSTALLED' ? 'text-green-700'
                          : pc.pendingUpdate.status === 'FAILED' ? 'text-red-600'
                          : pc.pendingUpdate.status === 'DOWNLOADING' || pc.pendingUpdate.status === 'INSTALLING' ? 'text-blue-600'
                          : 'text-amber-600'
                      }`}>
                        <Download className="h-3 w-3" />
                        v{pc.pendingUpdate.version} · {
                          pc.pendingUpdate.status === 'INSTALLED' ? 'Instalado'
                            : pc.pendingUpdate.status === 'FAILED' ? 'Fallido'
                            : pc.pendingUpdate.status === 'DOWNLOADING' ? 'Descargando'
                            : pc.pendingUpdate.status === 'INSTALLING' ? 'Instalando'
                            : 'Pendiente'
                        }
                      </span>
                    ) : (
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
                    <Link
                      href={`/admin/simuladores/pcs/${encodeURIComponent(pc.pcId)}/logs`}
                      className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-primary border border-gray-200 hover:border-primary/40 rounded px-2 py-1 transition-colors"
                      title="Ver logs"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
