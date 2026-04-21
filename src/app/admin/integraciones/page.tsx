'use client'

import { useState, useEffect } from 'react'
import { adminApi, type IntegrationToken } from '@/lib/admin-api'
import { DataTable } from '@/components/admin/DataTable'
import { Modal } from '@/components/admin/Modal'
import { Badge } from '@/components/admin/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/admin/Textarea'
import { Copy, KeyRound, Trash2, Check } from 'lucide-react'

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-MX', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function IntegracionesPage() {
  const [tokens, setTokens] = useState<IntegrationToken[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [newToken, setNewToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState<IntegrationToken | null>(null)
  const [revoking, setRevoking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = async () => {
    setLoading(true)
    const { data } = await adminApi.listIntegrationTokens()
    if (data) setTokens(data.tokens)
    setLoading(false)
  }

  useEffect(() => {
    reload()
  }, [])

  const openCreate = () => {
    setName('')
    setDescription('')
    setNewToken(null)
    setCopied(false)
    setError(null)
    setCreateOpen(true)
  }

  const closeCreate = () => {
    setCreateOpen(false)
    setName('')
    setDescription('')
    setNewToken(null)
    setCopied(false)
    setError(null)
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    setSubmitting(true)
    setError(null)
    const { data, error: apiError } = await adminApi.createIntegrationToken({
      name: name.trim(),
      description: description.trim(),
    })
    setSubmitting(false)
    if (apiError || !data) {
      setError(apiError || 'No se pudo crear el token')
      return
    }
    setNewToken(data.token)
    await reload()
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

  const handleRevoke = async () => {
    if (!revokeTarget) return
    setRevoking(true)
    const { error: apiError } = await adminApi.revokeIntegrationToken(revokeTarget.tokenId)
    setRevoking(false)
    if (apiError) {
      setError(apiError)
      return
    }
    setRevokeTarget(null)
    await reload()
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
          : <Badge variant="destructive">Revocado</Badge>
      ),
    },
    {
      key: 'acciones', header: 'Acciones', render: (t: IntegrationToken) => (
        t.isActive ? (
          <button
            onClick={() => setRevokeTarget(t)}
            className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Revocar
          </button>
        ) : <span className="text-xs text-gray-400">—</span>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integraciones</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tokens para que sistemas externos consulten el API de trámites por CURP.
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

      <Modal
        open={createOpen}
        onClose={closeCreate}
        title={newToken ? 'Token generado' : 'Crear token de integración'}
      >
        {newToken ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              <strong>Guarda este token ahora.</strong> No lo volverás a ver después de cerrar esta ventana.
            </div>
            <div className="bg-gray-900 rounded-lg p-3">
              <code className="text-xs text-gray-100 break-all block">{newToken}</code>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCopy} variant="secondary" className="flex-1">
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" /> Copiar
                  </>
                )}
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
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-700">
                {error}
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button onClick={closeCreate} variant="secondary" disabled={submitting}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} isLoading={submitting}>
                Crear token
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        title="Revocar token"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            El sistema externo que use este token perderá acceso inmediatamente. Esta acción no se puede deshacer.
          </p>
          {revokeTarget && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <div><strong>Nombre:</strong> {revokeTarget.name}</div>
              {revokeTarget.description && (
                <div className="text-gray-600"><strong>Descripción:</strong> {revokeTarget.description}</div>
              )}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-700">
              {error}
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button onClick={() => setRevokeTarget(null)} variant="secondary" disabled={revoking}>
              Cancelar
            </Button>
            <Button onClick={handleRevoke} isLoading={revoking}>
              Revocar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
