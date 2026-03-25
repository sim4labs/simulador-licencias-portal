'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  RefreshCw,
  Loader2,
  Upload,
  Rocket,
  CheckCircle2,
  Package,
  AlertCircle,
  Monitor,
  X,
} from 'lucide-react'
import {
  simulatorApi,
  type UnityBuild,
  type SimulatorPC,
} from '@/lib/simulator-api'
import { Badge } from '@/components/admin/Badge'
import { Button } from '@/components/ui/Button'

const CHUNK_SIZE = 100 * 1024 * 1024 // 100 MB
const MAX_CONCURRENT = 3

// ─── Helpers ───

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function updateStatusVariant(status: string) {
  switch (status) {
    case 'INSTALLED': return 'success' as const
    case 'DOWNLOADED': return 'info' as const
    case 'DOWNLOADING': return 'info' as const
    case 'INSTALLING': return 'info' as const
    case 'PENDING': return 'warning' as const
    case 'FAILED': return 'destructive' as const
    default: return 'default' as const
  }
}

function updateStatusLabel(status: string): string {
  switch (status) {
    case 'INSTALLED': return 'Instalado'
    case 'DOWNLOADED': return 'Descargado'
    case 'DOWNLOADING': return 'Descargando'
    case 'INSTALLING': return 'Instalando'
    case 'PENDING': return 'Pendiente'
    case 'FAILED': return 'Fallido'
    default: return status
  }
}

// ─── SHA-256 streaming ───

async function computeSHA256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// ─── Schedule presets ───

type SchedulePreset = 'now' | 'evening' | 'morning'

function getScheduleTimestamp(preset: SchedulePreset): string {
  const now = new Date()

  if (preset === 'now') return now.toISOString()

  // Calcular 6 PM PST (UTC-8) = 02:00 UTC del día siguiente
  // o 6 AM PST = 14:00 UTC
  const utcDate = new Date(now)

  if (preset === 'evening') {
    // Siguiente 6 PM PST = 02:00 UTC
    utcDate.setUTCHours(2, 0, 0, 0)
    if (utcDate <= now) utcDate.setUTCDate(utcDate.getUTCDate() + 1)
  } else {
    // Siguiente 6 AM PST = 14:00 UTC
    utcDate.setUTCHours(14, 0, 0, 0)
    if (utcDate <= now) utcDate.setUTCDate(utcDate.getUTCDate() + 1)
  }

  return utcDate.toISOString()
}

const SCHEDULE_OPTIONS: { value: SchedulePreset; label: string }[] = [
  { value: 'now', label: 'Ahora' },
  { value: 'evening', label: 'Despues de las 6 PM PST' },
  { value: 'morning', label: 'Manana 6 AM PST' },
]

// ─── Component ───

export default function BuildsPage() {
  const [builds, setBuilds] = useState<UnityBuild[]>([])
  const [pcs, setPcs] = useState<SimulatorPC[]>([])
  const [latestVersion, setLatestVersion] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Upload state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadVersion, setUploadVersion] = useState('')
  const [uploadNotes, setUploadNotes] = useState('')
  const [uploadSha256, setUploadSha256] = useState('')
  const [isHashing, setIsHashing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const abortRef = useRef(false)

  // Deploy state
  const [deployBuild, setDeployBuild] = useState<UnityBuild | null>(null)
  const [selectedPcIds, setSelectedPcIds] = useState<string[]>([])
  const [schedulePreset, setSchedulePreset] = useState<SchedulePreset>('evening')
  const [deploying, setDeploying] = useState(false)
  const [deployError, setDeployError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    const [buildsRes, pcsRes] = await Promise.all([
      simulatorApi.listUnityBuilds(),
      simulatorApi.listPCs(),
    ])

    if (buildsRes.error) {
      setError(buildsRes.error)
    } else if (buildsRes.data) {
      setBuilds(buildsRes.data.builds || [])
      setLatestVersion(buildsRes.data.latestVersion)
      setError(null)
    }

    if (pcsRes.data) setPcs(pcsRes.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 15_000) // Poll cada 15s para ver status updates
    return () => clearInterval(interval)
  }, [loadData])

  // ─── Upload handlers ───

  const handleFileSelect = async (file: File) => {
    setUploadFile(file)
    setUploadError(null)
    setUploadSha256('')

    // Auto-extraer versión del nombre si posible
    const versionMatch = file.name.match(/v?(\d+\.\d+\.\d+)/)
    if (versionMatch) setUploadVersion(versionMatch[1])

    // Calcular SHA256
    setIsHashing(true)
    try {
      const hash = await computeSHA256(file)
      setUploadSha256(hash)
    } catch (err) {
      setUploadError('Error calculando SHA256')
    }
    setIsHashing(false)
  }

  const handleUpload = async () => {
    if (!uploadFile || !uploadVersion || !uploadSha256) return
    setIsUploading(true)
    setUploadError(null)
    setUploadProgress(0)
    abortRef.current = false

    try {
      // 1. Iniciar multipart
      const startRes = await simulatorApi.startUpload({
        version: uploadVersion,
        filename: uploadFile.name,
        sha256: uploadSha256,
        size: uploadFile.size,
        releaseNotes: uploadNotes,
      })

      if (startRes.error || !startRes.data) {
        throw new Error(startRes.error || 'Error iniciando upload')
      }

      const { uploadId, s3Key } = startRes.data
      const totalParts = Math.ceil(uploadFile.size / CHUNK_SIZE)
      const parts: { partNumber: number; etag: string }[] = []
      let uploadedBytes = 0

      // 2. Subir partes con concurrencia limitada
      const queue = Array.from({ length: totalParts }, (_, i) => i + 1)
      const uploadPart = async (partNumber: number) => {
        if (abortRef.current) return

        // Obtener presigned URL para esta parte
        const urlRes = await simulatorApi.getPartUrl({ uploadId, s3Key, partNumber })
        if (urlRes.error || !urlRes.data) throw new Error(urlRes.error || 'Error obteniendo URL')

        // Slice del archivo
        const start = (partNumber - 1) * CHUNK_SIZE
        const end = Math.min(partNumber * CHUNK_SIZE, uploadFile.size)
        const chunk = uploadFile.slice(start, end)

        // Upload directo a S3
        const putRes = await fetch(urlRes.data.url, {
          method: 'PUT',
          body: chunk,
        })

        if (!putRes.ok) throw new Error(`Error subiendo parte ${partNumber}: ${putRes.status}`)

        const etag = putRes.headers.get('ETag') || ''
        parts.push({ partNumber, etag })

        uploadedBytes += end - start
        setUploadProgress(Math.round((uploadedBytes / uploadFile.size) * 100))
      }

      // Ejecutar con concurrencia limitada
      let i = 0
      const runBatch = async () => {
        const batch: Promise<void>[] = []
        while (i < queue.length && batch.length < MAX_CONCURRENT) {
          const partNum = queue[i++]
          batch.push(uploadPart(partNum))
        }
        await Promise.all(batch)
        if (i < queue.length && !abortRef.current) await runBatch()
      }
      await runBatch()

      if (abortRef.current) {
        setIsUploading(false)
        return
      }

      // 3. Completar multipart
      const completeRes = await simulatorApi.completeUpload({
        uploadId,
        s3Key,
        parts: parts.sort((a, b) => a.partNumber - b.partNumber),
        version: uploadVersion,
        sha256: uploadSha256,
        size: uploadFile.size,
        releaseNotes: uploadNotes,
      })

      if (completeRes.error) throw new Error(completeRes.error)

      // Exito — cerrar modal y recargar
      setShowUploadModal(false)
      setUploadFile(null)
      setUploadVersion('')
      setUploadNotes('')
      setUploadSha256('')
      loadData()
    } catch (err: any) {
      setUploadError(err.message || 'Error durante el upload')
    }

    setIsUploading(false)
  }

  const handleAbortUpload = () => {
    abortRef.current = true
  }

  // ─── Deploy handlers ───

  const openDeployModal = (build: UnityBuild) => {
    setDeployBuild(build)
    setSelectedPcIds([])
    setSchedulePreset('evening')
    setDeployError(null)
  }

  const togglePC = (pcId: string) => {
    setSelectedPcIds(prev =>
      prev.includes(pcId) ? prev.filter(id => id !== pcId) : [...prev, pcId]
    )
  }

  const selectAllOnline = () => {
    setSelectedPcIds(pcs.filter(pc => pc.online).map(pc => pc.pcId))
  }

  const handleDeploy = async () => {
    if (!deployBuild || selectedPcIds.length === 0) return
    setDeploying(true)
    setDeployError(null)

    const { error: err } = await simulatorApi.deployUnityBuild({
      version: deployBuild.version,
      s3Key: deployBuild.s3Key,
      sha256: '', // ya validado en upload
      size: deployBuild.size,
      scheduledAfter: getScheduleTimestamp(schedulePreset),
      targetPcIds: selectedPcIds,
    })

    setDeploying(false)
    if (err) {
      setDeployError(err)
    } else {
      setDeployBuild(null)
      loadData()
    }
  }

  // ─── PCs con updates pendientes ───

  const pcsWithUpdates = pcs.filter(pc => pc.pendingUpdate)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Builds Unity</h1>
          <p className="text-sm text-gray-500 mt-1">
            {builds.length} build{builds.length !== 1 ? 's' : ''}
            {latestVersion && ` · Ultima: v${latestVersion}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-1" /> Actualizar
          </Button>
          <Button size="sm" onClick={() => setShowUploadModal(true)}>
            <Upload className="h-4 w-4 mr-1" /> Subir Build
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Estado de despliegues activos */}
      {pcsWithUpdates.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Despliegues activos ({pcsWithUpdates.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {pcsWithUpdates.map(pc => (
              <div key={pc.pcId} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${pc.online ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm font-medium text-gray-900">{pc.name || pc.pcId.slice(0, 12)}</span>
                  <span className="text-xs text-gray-400">
                    v{pc.appVersion || '?'} → v{pc.pendingUpdate!.version}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={updateStatusVariant(pc.pendingUpdate!.status)}>
                    {updateStatusLabel(pc.pendingUpdate!.status)}
                  </Badge>
                  {pc.pendingUpdate!.error && (
                    <span className="text-xs text-red-500" title={pc.pendingUpdate!.error}>
                      <AlertCircle className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de builds */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Builds disponibles
          </h2>
        </div>
        {builds.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Sin builds</h3>
            <p className="text-sm text-gray-500">Sube el primer build con el boton &quot;Subir Build&quot;</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {builds.map(build => (
              <div key={build.s3Key} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Package className="h-4 w-4 text-gray-300 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">v{build.version}</span>
                      {build.isLatest && <Badge variant="success">Ultima</Badge>}
                      <span className="text-xs text-gray-400">{formatSize(build.size)}</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {build.lastModified && formatDate(build.lastModified)}
                      {' · '}
                      {build.filename}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => openDeployModal(build)}>
                  <Rocket className="h-3.5 w-3.5 mr-1.5" />
                  Desplegar
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Subir Build Unity</h3>
              <button onClick={() => !isUploading && setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* File picker */}
              <div>
                <label className="text-sm font-medium text-gray-700">Archivo ZIP</label>
                {!uploadFile ? (
                  <label className="mt-1 flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Seleccionar archivo ZIP</p>
                    </div>
                    <input
                      type="file"
                      accept=".zip"
                      className="hidden"
                      onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    />
                  </label>
                ) : (
                  <div className="mt-1 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Package className="h-5 w-5 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{uploadFile.name}</p>
                      <p className="text-xs text-gray-400">{formatSize(uploadFile.size)}</p>
                    </div>
                    {!isUploading && (
                      <button onClick={() => { setUploadFile(null); setUploadSha256('') }} className="text-gray-400 hover:text-gray-600">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* SHA256 */}
              {uploadFile && (
                <div>
                  <label className="text-sm font-medium text-gray-700">SHA256</label>
                  <div className="mt-1 flex items-center gap-2">
                    {isHashing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        <span className="text-sm text-gray-400">Calculando hash...</span>
                      </>
                    ) : uploadSha256 ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-xs font-mono text-gray-500 truncate">{uploadSha256}</span>
                      </>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Version */}
              <div>
                <label className="text-sm font-medium text-gray-700">Version</label>
                <input
                  type="text"
                  value={uploadVersion}
                  onChange={e => setUploadVersion(e.target.value)}
                  placeholder="0.0.5"
                  disabled={isUploading}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
                />
              </div>

              {/* Notas */}
              <div>
                <label className="text-sm font-medium text-gray-700">Notas de release (opcional)</label>
                <textarea
                  value={uploadNotes}
                  onChange={e => setUploadNotes(e.target.value)}
                  placeholder="Descripcion de los cambios..."
                  rows={2}
                  disabled={isUploading}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
                />
              </div>

              {/* Progreso */}
              {isUploading && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Subiendo...</span>
                    <span className="text-sm font-medium text-gray-900">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{uploadError}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              {isUploading ? (
                <Button variant="outline" size="sm" onClick={handleAbortUpload}>
                  Cancelar Upload
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => setShowUploadModal(false)}>
                    Cerrar
                  </Button>
                  <Button
                    size="sm"
                    disabled={!uploadFile || !uploadVersion || !uploadSha256 || isHashing}
                    onClick={handleUpload}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Build
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de deploy */}
      {deployBuild && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Desplegar Build</h3>
              <p className="text-sm text-gray-500 mt-1">
                v{deployBuild.version} · {formatSize(deployBuild.size)}
              </p>
            </div>

            <div className="px-6 py-4 space-y-4">
              {deployError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{deployError}</p>
                </div>
              )}

              {/* Lista de PCs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">PCs destino</label>
                  <button onClick={selectAllOnline} className="text-xs text-primary hover:underline">
                    Seleccionar todas online
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {pcs.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Sin PCs registradas</p>
                  ) : pcs.map(pc => (
                    <label
                      key={pc.pcId}
                      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedPcIds.includes(pc.pcId) ? 'bg-primary/5' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPcIds.includes(pc.pcId)}
                        onChange={() => togglePC(pc.pcId)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {pc.name || pc.pcId.slice(0, 12)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-400">v{pc.appVersion || '?'}</span>
                        <span className={`h-2 w-2 rounded-full ${pc.online ? 'bg-green-400' : 'bg-gray-300'}`} />
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {selectedPcIds.length} seleccionada{selectedPcIds.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Schedule */}
              <div>
                <label className="text-sm font-medium text-gray-700">Horario de instalacion</label>
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
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setDeployBuild(null)} disabled={deploying}>
                Cancelar
              </Button>
              <Button
                size="sm"
                disabled={selectedPcIds.length === 0}
                isLoading={deploying}
                onClick={handleDeploy}
              >
                <Rocket className="h-4 w-4 mr-2" />
                Desplegar a {selectedPcIds.length} PC{selectedPcIds.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
