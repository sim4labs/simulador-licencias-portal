'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi, type IntegrationToken } from '@/lib/admin-api'
import { adminKeys, useAdminIntegrationTokens } from '@/lib/admin-queries'
import { fetchIntegrationHealth } from '@/lib/integration-probe'
import { Modal } from '@/components/admin/Modal'
import { Badge } from '@/components/admin/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/admin/Textarea'
import { Copy, KeyRound, Check, ArrowRight, Activity, RefreshCw } from 'lucide-react'

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-MX', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function statusBadge(t: IntegrationToken) {
  if (t.isActive) return <Badge variant="success">Activo</Badge>
  if (t.rotatedIntoTokenId) return <Badge variant="default">Rotado</Badge>
  return <Badge variant="destructive">Revocado</Badge>
}

export default function IntegracionesPage() {
  const qc = useQueryClient()
  const tokensQuery = useAdminIntegrationTokens()
  const tokens = tokensQuery.data?.tokens ?? []
  const loading = tokensQuery.isLoading

  const healthQuery = useQuery({
    queryKey: ['admin', 'integration-health'],
    queryFn: fetchIntegrationHealth,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })
  const health = healthQuery.data
  const healthTone =
    health?.status === 'ok'
      ? { dot: 'bg-success', label: 'success' as const, text: 'Operativo' }
      : health?.status === 'degraded'
      ? { dot: 'bg-warning', label: 'warning' as const, text: 'Degradado' }
      : { dot: 'bg-muted-foreground', label: 'default' as const, text: healthQuery.isLoading ? 'Verificando…' : 'Sin respuesta' }
  const dynamoLatency = health?.checks?.dynamodb?.latencyMs

  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [newToken, setNewToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetCreateState = () => {
    setName('')
    setDescription('')
    setNewToken(null)
    setCopied(false)
    setError(null)
  }

  const openCreate = () => {
    resetCreateState()
    setCreateOpen(true)
  }

  const closeCreate = () => {
    setCreateOpen(false)
    resetCreateState()
  }

  const handleCreate = async () => {
    if (!name.trim()) { setError('El nombre es obligatorio'); return }
    setSubmitting(true); setError(null)
    const { data, error: apiError } = await adminApi.createIntegrationToken({
      name: name.trim(),
      description: description.trim(),
    })
    setSubmitting(false)
    if (apiError || !data) { setError(apiError || 'No se pudo crear el token'); return }
    setNewToken(data.token)
    qc.invalidateQueries({ queryKey: adminKeys.integrationTokens })
  }

  const handleCopy = async () => {
    if (!newToken) return
    try {
      await navigator.clipboard.writeText(newToken)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('No se pudo copiar al portapapeles')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integraciones</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tokens bearer para que sistemas externos consulten el API por CURP.
          </p>
        </div>
        <Button onClick={openCreate}>Crear token</Button>
      </div>

      <div className="bg-white rounded-xl border border-border p-4 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
            <Activity className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${healthTone.dot}`} aria-hidden />
              <span className="font-medium text-foreground">API de integración</span>
              <Badge variant={healthTone.label}>{healthTone.text}</Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-4">
              <span>
                <code className="font-mono">GET /integration/health</code>
              </span>
              {health?.httpStatus ? <span>HTTP {health.httpStatus}</span> : null}
              {typeof dynamoLatency === 'number' ? <span>DynamoDB {dynamoLatency} ms</span> : null}
              {typeof health?.responseMs === 'number' ? <span>Latencia {health.responseMs} ms</span> : null}
              {health?.environment ? <span>env: {health.environment}</span> : null}
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => healthQuery.refetch()}
          disabled={healthQuery.isFetching}
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${healthQuery.isFetching ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : tokens.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <KeyRound className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Aún no hay tokens.</p>
          <p className="text-xs text-gray-400 mt-1">Crea el primero para que un sistema externo pueda consultar por CURP.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tokens.map((t) => (
            <Link
              key={t.tokenId}
              href={`/admin/integraciones/${t.tokenId}`}
              className="group bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{t.name}</h3>
                    <code className="text-xs text-gray-500">{t.tokenPreview || '—'}</code>
                  </div>
                </div>
                {statusBadge(t)}
              </div>

              {t.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{t.description}</p>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-100 mt-auto">
                <div>
                  <div className="text-gray-400 uppercase tracking-wide text-[10px]">Creado</div>
                  <div className="text-gray-700">{formatDate(t.createdAt)}</div>
                </div>
                <div>
                  <div className="text-gray-400 uppercase tracking-wide text-[10px]">Último uso</div>
                  <div className="text-gray-700">{formatDate(t.lastUsedAt)}</div>
                </div>
              </div>

              <div className="flex items-center justify-end text-xs text-primary-600 group-hover:text-primary-700 font-medium">
                Ver detalles <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={closeCreate}
        title={newToken ? 'Token generado' : 'Crear token de integración'}
      >
        {newToken ? (
          <div className="space-y-4">
            <p className="text-sm text-foreground">
              Token creado. Queda disponible en la página de detalle para copiarlo y probarlo cuando lo necesites.
            </p>
            <div className="bg-foreground rounded-lg p-3">
              <code className="text-xs text-background break-all block">{newToken}</code>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCopy} variant="secondary" className="flex-1">
                {copied ? (<><Check className="h-4 w-4 mr-1" /> Copiado</>) : (<><Copy className="h-4 w-4 mr-1" /> Copiar</>)}
              </Button>
              <Button onClick={closeCreate} className="flex-1">Cerrar</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label="Nombre"
              placeholder="Ej: Sistema de cobros"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Textarea
              label="Descripción"
              placeholder="Breve contexto sobre el uso del token (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-2 text-xs text-destructive">{error}</div>
            )}
            <div className="flex gap-2 justify-end">
              <Button onClick={closeCreate} variant="secondary" disabled={submitting}>Cancelar</Button>
              <Button onClick={handleCreate} isLoading={submitting}>Crear token</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
