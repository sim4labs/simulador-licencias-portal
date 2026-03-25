'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Loader2, Monitor, ArrowUpRight, Download } from 'lucide-react'
import { simulatorApi, type SimulatorPC } from '@/lib/simulator-api'
import { Button } from '@/components/ui/Button'

const ENV_LABEL: Record<string, string> = {
  dev: 'Dev',
  stage: 'Stage',
  prod: 'Prod',
}

const CURRENT_ENV = process.env.NEXT_PUBLIC_ENV || 'dev'

export default function PCsPage() {
  const [pcs, setPcs] = useState<SimulatorPC[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [promoting, setPromoting] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    const res = await simulatorApi.listPCs()
    if (res.error) {
      setError(res.error)
    } else {
      setPcs(res.data || [])
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 10_000)
    return () => clearInterval(interval)
  }, [loadData])

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
                <th className="text-left px-4 py-3 font-medium text-gray-500">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">UID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Version</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">IP</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Simulador</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Actualizacion</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Ambiente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pcs.map(pc => (
                <tr key={pc.pcId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{pc.name || '-'}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
