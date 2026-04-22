'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import {
  adminApi,
  type IntegrationToken,
  type IntegrationTokenCall,
} from '@/lib/admin-api'
import {
  adminKeys,
  useAdminIntegrationTokens,
  useAdminIntegrationTokenCalls,
} from '@/lib/admin-queries'
import {
  CURP_RE,
  integrationApiBase,
  probeIntegrationTramite,
  type IntegrationProbeResult,
} from '@/lib/integration-probe'
import { Modal } from '@/components/admin/Modal'
import { Badge } from '@/components/admin/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  ArrowLeft,
  Check,
  Copy,
  KeyRound,
  Play,
  RefreshCw,
  Terminal,
  Trash2,
} from 'lucide-react'

function formatDate(iso: string | null | undefined) {
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

function resultBadge(r: IntegrationTokenCall['result']) {
  if (r === 'aprobado')    return <Badge variant="success">Aprobado</Badge>
  if (r === 'sin_aprobar') return <Badge variant="warning">Sin aprobar</Badge>
  return <Badge variant="default">No existe</Badge>
}

export default function IntegrationTokenDetailPage() {
  const { tokenId } = useParams<{ tokenId: string }>()
  const router = useRouter()
  const qc = useQueryClient()

  const tokensQuery = useAdminIntegrationTokens()
  const callsQuery = useAdminIntegrationTokenCalls(tokenId, 100)

  const token = tokensQuery.data?.tokens.find((t) => t.tokenId === tokenId)
  const calls = callsQuery.data?.calls ?? []

  const [rotateOpen, setRotateOpen] = useState(false)
  const [revokeOpen, setRevokeOpen] = useState(false)
  const [rotating, setRotating] = useState(false)
  const [revoking, setRevoking] = useState(false)
  const [newToken, setNewToken] = useState<string | null>(null)
  const [rotatedIntoId, setRotatedIntoId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Probe state (live test + curl example)
  const [probeCurp, setProbeCurp] = useState('')
  const [probeRunning, setProbeRunning] = useState(false)
  const [probeResult, setProbeResult] = useState<IntegrationProbeResult | null>(null)
  const [probeError, setProbeError] = useState<string | null>(null)
  const [curlCopied, setCurlCopied] = useState(false)
  const [tokenCopied, setTokenCopied] = useState(false)

  const apiBase = integrationApiBase()
  const curpUpper = probeCurp.trim().toUpperCase()
  const curpValid = CURP_RE.test(curpUpper)
  const effectiveToken = (token?.token || '').trim()
  const tokenForCurl = effectiveToken || '<TU_TOKEN>'
  const curpForCurl = curpValid ? curpUpper : 'CURP_DE_PRUEBA'
  const curlSnippet = useMemo(
    () =>
      `curl -s -H "Authorization: Bearer ${tokenForCurl}" \\\n  ${apiBase}/integration/tramites/${curpForCurl}`,
    [apiBase, tokenForCurl, curpForCurl],
  )

  const runProbe = async () => {
    setProbeError(null)
    setProbeResult(null)
    if (!effectiveToken) { setProbeError('Token no disponible para este registro. Rótalo para obtener uno nuevo.'); return }
    if (!curpValid) { setProbeError('Formato de CURP inválido. Debe cumplir /[A-Z]{4}\\d{6}[HM][A-Z]{5}[A-Z0-9]\\d/.'); return }
    setProbeRunning(true)
    const result = await probeIntegrationTramite({ token: effectiveToken, curp: curpUpper })
    setProbeResult(result)
    setProbeRunning(false)
    // Refrescar historial para que el intento se vea en la tabla.
    qc.invalidateQueries({ queryKey: adminKeys.integrationTokenCalls(tokenId, 100) })
    callsQuery.refetch()
  }

  const copyCurl = async () => {
    try {
      await navigator.clipboard.writeText(curlSnippet)
      setCurlCopied(true)
      setTimeout(() => setCurlCopied(false), 2000)
    } catch {
      setProbeError('No se pudo copiar al portapapeles')
    }
  }

  const copyToken = async () => {
    if (!token?.token) return
    try {
      await navigator.clipboard.writeText(token.token)
      setTokenCopied(true)
      setTimeout(() => setTokenCopied(false), 2000)
    } catch {
      setProbeError('No se pudo copiar al portapapeles')
    }
  }

  const handleRotate = async () => {
    if (!token) return
    setRotating(true); setError(null)
    const { data, error: apiError } = await adminApi.rotateIntegrationToken(token.tokenId)
    setRotating(false)
    if (apiError || !data) { setError(apiError || 'No se pudo rotar el token'); return }
    setNewToken(data.token)
    setRotatedIntoId(data.tokenId)
    qc.invalidateQueries({ queryKey: adminKeys.integrationTokens })
  }

  const handleRevoke = async () => {
    if (!token) return
    setRevoking(true); setError(null)
    const { error: apiError } = await adminApi.revokeIntegrationToken(token.tokenId)
    setRevoking(false)
    if (apiError) { setError(apiError); return }
    setRevokeOpen(false)
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

  const closeRotateModal = () => {
    setRotateOpen(false)
    if (rotatedIntoId) {
      const nextId = rotatedIntoId
      setNewToken(null)
      setRotatedIntoId(null)
      setCopied(false)
      router.replace(`/admin/integraciones/${nextId}`)
    } else {
      setNewToken(null)
      setCopied(false)
    }
  }

  if (tokensQuery.isLoading) {
    return <p className="text-sm text-gray-400">Cargando...</p>
  }

  if (!token) {
    return (
      <div>
        <Link href="/admin/integraciones" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 mb-4">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-500">Token no encontrado.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/integraciones" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700">
          <ArrowLeft className="h-4 w-4" /> Volver a integraciones
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-11 h-11 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
              <KeyRound className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 truncate">{token.name}</h1>
                {statusBadge(token)}
              </div>
              <code className="text-sm text-muted-foreground break-all">{token.tokenPreview || '—'}</code>
              {token.description && token.description.trim().toLowerCase() !== token.name.trim().toLowerCase() && (
                <p className="text-sm text-foreground mt-2">{token.description}</p>
              )}
            </div>
          </div>
          {token.isActive && (
            <div className="shrink-0 flex gap-2">
              <Button variant="default" onClick={() => setRotateOpen(true)}>
                <RefreshCw className="h-4 w-4 mr-1" /> Rotar
              </Button>
              <Button variant="destructive" onClick={() => setRevokeOpen(true)}>
                <Trash2 className="h-4 w-4 mr-1" /> Revocar
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 text-sm">
          <div>
            <div className="text-muted-foreground uppercase tracking-wide text-[10px]">Creado</div>
            <div className="text-foreground">{formatDate(token.createdAt)}</div>
          </div>
          <div>
            <div className="text-muted-foreground uppercase tracking-wide text-[10px]">Último uso</div>
            <div className="text-foreground">{formatDate(token.lastUsedAt)}</div>
          </div>
          <div>
            <div className="text-muted-foreground uppercase tracking-wide text-[10px]">Expira</div>
            <div className="text-foreground">{formatDate(token.expiresAt)}</div>
          </div>
          <div>
            <div className="text-muted-foreground uppercase tracking-wide text-[10px]">Llamadas (90d)</div>
            <div className="text-foreground">{callsQuery.data?.count ?? '—'}</div>
          </div>
        </div>

        {(token.rotatedFromTokenId || token.rotatedIntoTokenId) && (
          <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 space-x-3">
            {token.rotatedFromTokenId && (
              <span>
                Rotado desde:{' '}
                <Link
                  href={`/admin/integraciones/${token.rotatedFromTokenId}`}
                  className="text-primary-600 hover:underline font-mono"
                >
                  {token.rotatedFromTokenId.slice(0, 8)}…
                </Link>
              </span>
            )}
            {token.rotatedIntoTokenId && (
              <span>
                Reemplazado por:{' '}
                <Link
                  href={`/admin/integraciones/${token.rotatedIntoTokenId}`}
                  className="text-primary-600 hover:underline font-mono"
                >
                  {token.rotatedIntoTokenId.slice(0, 8)}…
                </Link>
              </span>
            )}
          </div>
        )}

      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" /> Probar token
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Llamada real contra <code className="font-mono">GET /integration/tramites/{'{curp}'}</code>. El intento queda registrado en el historial.
            </p>
          </div>
          <div className="shrink-0 flex gap-2">
            {probeResult && (
              <Button
                variant="outline"
                onClick={() => { setProbeResult(null); setProbeError(null) }}
              >
                Limpiar
              </Button>
            )}
            <Button
              onClick={runProbe}
              isLoading={probeRunning}
              disabled={!token.token || !curpValid}
            >
              <Play className="h-4 w-4 mr-1" /> Probar
            </Button>
          </div>
        </div>

        {!token.isActive && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-2 text-xs text-foreground mb-3">
            Este token está {token.rotatedIntoTokenId ? 'rotado' : 'revocado'}. Las pruebas devolverán 403.
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Token bearer</label>
            {token.token ? (
              <div className="relative bg-foreground rounded-md p-3 pr-20">
                <code className="text-xs text-background font-mono break-all block">{token.token}</code>
                <button
                  type="button"
                  onClick={copyToken}
                  aria-label="Copiar token"
                  className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md bg-background/10 hover:bg-background/20 text-background text-[11px] px-2 py-1 transition-colors"
                >
                  {tokenCopied ? (<><Check className="h-3.5 w-3.5" /> Copiado</>) : (<><Copy className="h-3.5 w-3.5" /> Copiar</>)}
                </button>
              </div>
            ) : (
              <div className="bg-muted border border-border rounded-md p-3 text-xs text-muted-foreground">
                Token creado antes de habilitar la persistencia. Rótalo para obtener uno nuevo y poder probarlo desde aquí.
              </div>
            )}
          </div>

          <Input
            label="CURP"
            placeholder="AAAA000000HDFXXX00"
            value={probeCurp}
            onChange={(e) => setProbeCurp(e.target.value.toUpperCase())}
            maxLength={18}
            spellCheck={false}
            autoComplete="off"
            className="font-mono"
            helperText={probeCurp && !curpValid ? 'Formato inválido (18 caracteres)' : undefined}
            error={Boolean(probeCurp) && !curpValid}
          />
        </div>

        <div className="mt-5 pt-5 border-t border-border">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Ejemplo curl</div>
          <div className="relative">
            <pre className="bg-foreground rounded-lg p-3 pr-24 text-xs text-background overflow-x-auto whitespace-pre leading-relaxed">
{curlSnippet}
            </pre>
            <button
              type="button"
              onClick={copyCurl}
              aria-label="Copiar curl"
              className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md bg-background/10 hover:bg-background/20 text-background text-[11px] px-2 py-1 transition-colors"
            >
              {curlCopied ? (<><Check className="h-3.5 w-3.5" /> Copiado</>) : (<><Copy className="h-3.5 w-3.5" /> Copiar</>)}
            </button>
          </div>
        </div>

        {probeError && (
          <div className="mt-3 bg-destructive/10 border border-destructive/30 rounded-lg p-2 text-xs text-destructive">{probeError}</div>
        )}

        {probeResult && (
          <div className="mt-4 border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-muted border-b border-border text-xs">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    probeResult.httpStatus === 0
                      ? 'destructive'
                      : probeResult.httpStatus >= 500
                      ? 'destructive'
                      : probeResult.httpStatus >= 400
                      ? 'warning'
                      : 'success'
                  }
                >
                  {probeResult.httpStatus === 0 ? 'Sin respuesta' : `HTTP ${probeResult.httpStatus}`}
                </Badge>
                <span className="text-muted-foreground">{probeResult.elapsedMs} ms</span>
              </div>
              {probeResult.error && <span className="text-destructive">{probeResult.error}</span>}
            </div>
            <pre className="bg-foreground text-background text-xs p-3 overflow-x-auto leading-relaxed max-h-80">
{typeof probeResult.body === 'string'
  ? probeResult.rawBody || '(sin cuerpo)'
  : JSON.stringify(probeResult.body, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Historial de llamadas</h2>
            <p className="text-xs text-gray-500 mt-1">Últimas 100 llamadas · retención 90 días</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => callsQuery.refetch()}
            disabled={callsQuery.isFetching}
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${callsQuery.isFetching ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {callsQuery.isLoading ? (
          <p className="text-sm text-gray-400">Cargando...</p>
        ) : calls.length === 0 ? (
          <p className="text-sm text-gray-500">Este token aún no tiene llamadas registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
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
                    <td className="px-3 py-2 font-mono text-gray-800">{c.curp}</td>
                    <td className="px-3 py-2">{resultBadge(c.result)}</td>
                    <td className="px-3 py-2 text-gray-500">{c.sourceIp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={rotateOpen}
        onClose={closeRotateModal}
        title={newToken ? `Token rotado (${token.name})` : 'Rotar token'}
      >
        {newToken ? (
          <div className="space-y-4">
            <p className="text-sm text-foreground">
              Token rotado. El anterior quedó revocado. El nuevo token queda disponible en su página de detalle.
            </p>
            <div className="bg-foreground rounded-lg p-3">
              <code className="text-xs text-background break-all block">{newToken}</code>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCopy} variant="secondary" className="flex-1">
                {copied ? (<><Check className="h-4 w-4 mr-1" /> Copiado</>) : (<><Copy className="h-4 w-4 mr-1" /> Copiar</>)}
              </Button>
              <Button onClick={closeRotateModal} className="flex-1">Cerrar</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-foreground">
              Se generará un token nuevo con el mismo nombre y descripción. El token actual queda revocado en la misma operación.
            </p>
            <div className="bg-muted rounded-lg p-3 text-sm">
              <div><strong>Nombre:</strong> {token.name}</div>
              <div className="text-muted-foreground"><strong>Token actual:</strong> <code>{token.tokenPreview}</code></div>
            </div>
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-2 text-xs text-destructive">{error}</div>
            )}
            <div className="flex gap-2 justify-end">
              <Button onClick={() => setRotateOpen(false)} variant="secondary" disabled={rotating}>Cancelar</Button>
              <Button onClick={handleRotate} isLoading={rotating}>Rotar token</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={revokeOpen} onClose={() => setRevokeOpen(false)} title="Revocar token">
        <div className="space-y-4">
          <p className="text-sm text-foreground">
            El sistema externo que use este token perderá acceso inmediatamente. Esta acción no se puede deshacer.
          </p>
          <div className="bg-muted rounded-lg p-3 text-sm">
            <div><strong>Nombre:</strong> {token.name}</div>
            <div className="text-muted-foreground"><strong>Token:</strong> <code>{token.tokenPreview}</code></div>
          </div>
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-2 text-xs text-destructive">{error}</div>
          )}
          <div className="flex gap-2 justify-end">
            <Button onClick={() => setRevokeOpen(false)} variant="secondary" disabled={revoking}>Cancelar</Button>
            <Button variant="destructive" onClick={handleRevoke} isLoading={revoking}>Revocar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
