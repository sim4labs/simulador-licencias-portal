'use client'

import { useState, useEffect } from 'react'
import { adminApi, type IntegrationToken, type IntegrationTokenCall } from '@/lib/admin-api'
import { DataTable } from '@/components/admin/DataTable'
import { Modal } from '@/components/admin/Modal'
import { Badge } from '@/components/admin/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/admin/Textarea'
import { Copy, KeyRound, Trash2, Check, RefreshCw, History } from 'lucide-react'

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-MX', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function resultBadge(r: IntegrationTokenCall['result']) {
  if (r === 'aprobado')    return <Badge variant="success">Aprobado</Badge>
  if (r === 'sin_aprobar') return <Badge variant="warning">Sin aprobar</Badge>
  return <Badge variant="default">No existe</Badge>
}

export default function IntegracionesPage() {
  const [tokens, setTokens] = useState<IntegrationToken[]>([])
  const [loading, setLoading] = useState(true)

  // Crear
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [newToken, setNewToken] = useState<{ value: string; rotatedFromName?: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Revocar
  const [revokeTarget, setRevokeTarget] = useState<IntegrationToken | null>(null)
  const [revoking, setRevoking] = useState(false)

  // Rotar
  const [rotateTarget, setRotateTarget] = useState<IntegrationToken | null>(null)
  const [rotating, setRotating] = useState(false)

  // Historial
  const [callsTarget, setCallsTarget] = useState<IntegrationToken | null>(null)
  const [calls, setCalls] = useState<IntegrationTokenCall[]>([])
  const [callsLoading, setCallsLoading] = useState(false)

  const reload = async () => {
    setLoading(true)
    const { data } = await adminApi.listIntegrationTokens()
    if (data) setTokens(data.tokens)
    setLoading(false)
  }

  useEffect(() => {
    reload()
  }, [])

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
    setNewToken({ value: data.token })
    await reload()
  }

  const handleCopy = async () => {
    if (!newToken) return
    try {
      await navigator.clipboard.writeText(newToken.value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('No se pudo copiar al portapapeles')
    }
  }

  const handleRevoke = async () => {
    if (!revokeTarget) return
    setRevoking(true)
    const { error: apiError } = await adminApi.revokeIntegrationToken(revokeTarget.tokenId)
    setRevoking(false)
    if (apiError) { setError(apiError); return }
    setRevokeTarget(null)
    await reload()
  }

  const handleRotate = async () => {
    if (!rotateTarget) return
    setRotating(true); setError(null)
    const { data, error: apiError } = await adminApi.rotateIntegrationToken(rotateTarget.tokenId)
    setRotating(false)
    if (apiError || !data) { setError(apiError || 'No se pudo rotar el token'); return }
    setNewToken({ value: data.token, rotatedFromName: rotateTarget.name })
    setRotateTarget(null)
    setCreateOpen(true)
    await reload()
  }

  const openCalls = async (t: IntegrationToken) => {
    setCallsTarget(t)
    setCallsLoading(true)
    setCalls([])
    const { data } = await adminApi.getIntegrationTokenCalls(t.tokenId, 100)
    if (data) setCalls(data.calls)
    setCallsLoading(false)
  }

  const columns = [
    {
      key: 'name', header: 'Nombre', render: (t: IntegrationToken) => (
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{t.name}</span>
        </div>
      ),
    },
    {
      key: 'preview', header: 'Token', render: (t: IntegrationToken) => (
        <code className="text-xs text-gray-600">{t.tokenPreview || '—'}</code>
      ),
    },
    {
      key: 'description', header: 'Descripción', render: (t: IntegrationToken) => (
        <span className="text-xs text-gray-600">{t.description || '—'}</span>
      ),
    },
    {
      key: 'createdAt', header: 'Creado', render: (t: IntegrationToken) => (
        <span className="text-xs text-gray-500">{formatDate(t.createdAt)}</span>
      ),
    },
    {
      key: 'lastUsedAt', header: 'Último uso', render: (t: IntegrationToken) => (
        <span className="text-xs text-gray-500">{formatDate(t.lastUsedAt)}</span>
      ),
    },
    {
      key: 'status', header: 'Estado', render: (t: IntegrationToken) => (
        t.isActive
          ? <Badge variant="success">Activo</Badge>
          : t.rotatedIntoTokenId
            ? <Badge variant="default">Rotado</Badge>
            : <Badge variant="destructive">Revocado</Badge>
      ),
    },
    {
      key: 'acciones', header: 'Acciones', render: (t: IntegrationToken) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => openCalls(t)}
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
          >
            <History className="h-3.5 w-3.5" /> Historial
          </button>
          {t.isActive && (
            <>
              <button
                onClick={() => setRotateTarget(t)}
                className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Rotar
              </button>
              <button
                onClick={() => setRevokeTarget(t)}
                className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" /> Revocar
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

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

      {loading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : (
        <DataTable
          columns={columns}
          data={tokens}
          keyExtractor={(t) => t.tokenId}
          emptyMessage="No hay tokens registrados"
        />
      )}

      {/* ── Crear / mostrar token generado (también se reusa tras rotar) ── */}
      <Modal
        open={createOpen}
        onClose={closeCreate}
        title={newToken ? (newToken.rotatedFromName ? `Token rotado (${newToken.rotatedFromName})` : 'Token generado') : 'Crear token de integración'}
      >
        {newToken ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              <strong>Guarda este token ahora.</strong> No lo volverás a ver después de cerrar esta ventana.
              {newToken.rotatedFromName && (
                <div className="mt-2 text-xs">El token anterior quedó revocado automáticamente.</div>
              )}
            </div>
            <div className="bg-gray-900 rounded-lg p-3">
              <code className="text-xs text-gray-100 break-all block">{newToken.value}</code>
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
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-700">{error}</div>
            )}
            <div className="flex gap-2 justify-end">
              <Button onClick={closeCreate} variant="secondary" disabled={submitting}>Cancelar</Button>
              <Button onClick={handleCreate} isLoading={submitting}>Crear token</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Revocar ── */}
      <Modal open={!!revokeTarget} onClose={() => setRevokeTarget(null)} title="Revocar token">
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            El sistema externo que use este token perderá acceso inmediatamente. Esta acción no se puede deshacer.
          </p>
          {revokeTarget && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <div><strong>Nombre:</strong> {revokeTarget.name}</div>
              <div className="text-gray-600"><strong>Token:</strong> <code>{revokeTarget.tokenPreview}</code></div>
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button onClick={() => setRevokeTarget(null)} variant="secondary" disabled={revoking}>Cancelar</Button>
            <Button onClick={handleRevoke} isLoading={revoking}>Revocar</Button>
          </div>
        </div>
      </Modal>

      {/* ── Rotar ── */}
      <Modal open={!!rotateTarget} onClose={() => setRotateTarget(null)} title="Rotar token">
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Se generará un token nuevo con el mismo nombre y descripción. El token actual queda revocado en la misma operación.
          </p>
          {rotateTarget && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <div><strong>Nombre:</strong> {rotateTarget.name}</div>
              <div className="text-gray-600"><strong>Token actual:</strong> <code>{rotateTarget.tokenPreview}</code></div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-700">{error}</div>
          )}
          <div className="flex gap-2 justify-end">
            <Button onClick={() => setRotateTarget(null)} variant="secondary" disabled={rotating}>Cancelar</Button>
            <Button onClick={handleRotate} isLoading={rotating}>Rotar token</Button>
          </div>
        </div>
      </Modal>

      {/* ── Historial ── */}
      <Modal
        open={!!callsTarget}
        onClose={() => setCallsTarget(null)}
        title={callsTarget ? `Historial · ${callsTarget.name}` : 'Historial'}
        className="max-w-3xl"
      >
        <div className="space-y-3">
          {callsTarget && (
            <div className="text-xs text-gray-500">
              Token <code>{callsTarget.tokenPreview}</code> · últimas 100 llamadas (retención 90 días)
            </div>
          )}
          {callsLoading ? (
            <p className="text-sm text-gray-400">Cargando...</p>
          ) : calls.length === 0 ? (
            <p className="text-sm text-gray-400">Este token aún no tiene llamadas registradas.</p>
          ) : (
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">CURP</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Resultado</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">IP</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {calls.map((c, i) => (
                    <tr key={`${c.timestamp}-${i}`}>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-700">{formatDate(c.timestamp)}</td>
                      <td className="px-3 py-2 font-mono">{c.curp}</td>
                      <td className="px-3 py-2">{resultBadge(c.result)}</td>
                      <td className="px-3 py-2 text-gray-500">{c.sourceIp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
