'use client'

import { useState, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { LICENSE_TYPE_NAMES, type Tramite } from '@/lib/tramite'
import { adminApi } from '@/lib/admin-api'
import { adminKeys, useAdminLicencias, useAdminTramites } from '@/lib/admin-queries'
import { DataTable } from '@/components/admin/DataTable'
import { Badge, statusVariant, statusLabel } from '@/components/admin/Badge'
import { Modal } from '@/components/admin/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/admin/Textarea'
import { Search, ClipboardEdit } from 'lucide-react'

// Etiquetas legibles para cada tipo de fault registrado por el simulador.
// `tone` controla el color del badge: rojo para activas que descuentan,
// azul "info" para pasivas (lo impactaron a él), amarillo para faltas leves.
const FAULT_LABELS: Record<string, { label: string; tone: 'red' | 'amber' | 'sky' | 'gray' }> = {
  'pedestrian-hit': { label: 'Atropello', tone: 'red' },
  'bicycle-collision': { label: 'Colisión con bicicleta', tone: 'red' },
  'vehicle-collision': { label: 'Colisión vehicular', tone: 'red' },
  'passive-vehicle-collision': { label: 'Lo impactaron', tone: 'sky' },
  'sign-collision': { label: 'Señalamiento', tone: 'gray' },
  'obstacle-collision': { label: 'Obstáculo', tone: 'gray' },
  'red-light': { label: 'Semáforo en rojo', tone: 'red' },
  'wrong-way': { label: 'Sentido contrario', tone: 'red' },
  'speeding': { label: 'Exceso de velocidad', tone: 'amber' },
  'dangerous-gear-change': { label: 'Cambio peligroso', tone: 'amber' },
  'gear-change-without-clutch': { label: 'Sin clutch', tone: 'amber' },
}

const FAULT_TONE_CLASSES: Record<'red' | 'amber' | 'sky' | 'gray', string> = {
  red: 'bg-red-50 text-red-700 border border-red-200',
  amber: 'bg-amber-50 text-amber-700 border border-amber-200',
  sky: 'bg-sky-50 text-sky-700 border border-sky-200',
  gray: 'bg-gray-50 text-gray-600 border border-gray-200',
}

function titleCaseFromType(t: string): string {
  return t.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function formatTimeFromSeconds(s: number): string {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  const min = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

export default function TramitesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [detailTramite, setDetailTramite] = useState<Tramite | null>(null)
  const [simModal, setSimModal] = useState<Tramite | null>(null)
  const [simScore, setSimScore] = useState('80')
  const [simPassed, setSimPassed] = useState(true)
  const [simFeedback, setSimFeedback] = useState('')

  const tramitesQuery = useAdminTramites()
  const licenciasQuery = useAdminLicencias()
  const tramites = tramitesQuery.data?.items ?? []
  const licenseTypes = licenciasQuery.data ?? []

  const filtered = useMemo(() => {
    return tramites.filter(t => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false
      if (typeFilter !== 'all' && t.licenseType !== typeFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const name = `${t.personalData.nombre} ${t.personalData.apellidoPaterno} ${t.personalData.apellidoMaterno}`.toLowerCase()
        if (!t.id.toLowerCase().includes(q) && !name.includes(q)) return false
      }
      return true
    })
  }, [tramites, statusFilter, typeFilter, search])

  const handleSimSubmit = async () => {
    if (!simModal) return
    const body = {
      passed: simPassed,
      score: parseInt(simScore) || 0,
      feedback: simFeedback.split('\n').filter(Boolean),
    }
    const { error } = await adminApi.registrarSimulador(simModal.id, body)
    if (!error) {
      qc.invalidateQueries({ queryKey: ['admin', 'tramites'] })
      qc.invalidateQueries({ queryKey: adminKeys.stats })
    }
    setSimModal(null)
    setSimScore('80')
    setSimPassed(true)
    setSimFeedback('')
  }

  const columns = [
    { key: 'id', header: 'ID', render: (t: Tramite) => <span className="font-mono text-xs">{t.id}</span> },
    {
      key: 'nombre', header: 'Nombre', render: (t: Tramite) => (
        <span className="font-medium">{t.personalData.nombre} {t.personalData.apellidoPaterno}</span>
      ),
    },
    {
      key: 'tipo', header: 'Tipo', render: (t: Tramite) => (
        <span className="text-xs">{t.licenseType ? (LICENSE_TYPE_NAMES[t.licenseType as keyof typeof LICENSE_TYPE_NAMES] || t.licenseType) : '—'}</span>
      ),
    },
    {
      key: 'status', header: 'Estado', render: (t: Tramite) => (
        <Badge variant={statusVariant[t.status]}>{statusLabel[t.status] || t.status}</Badge>
      ),
    },
    {
      key: 'cita', header: 'Cita', render: (t: Tramite) => (
        <span className="text-xs">{t.appointment ? `${t.appointment.date} ${t.appointment.time}` : '—'}</span>
      ),
    },
    {
      key: 'examen', header: 'Examen', render: (t: Tramite) => t.examResult ? (
        <Badge variant={t.examResult.passed ? 'success' : 'destructive'}>{t.examResult.score}%</Badge>
      ) : <span className="text-xs text-gray-400">—</span>,
    },
    {
      key: 'simulador', header: 'Simulador', render: (t: Tramite) => t.simulatorResult ? (
        <Badge variant={t.simulatorResult.passed ? 'success' : 'destructive'}>{t.simulatorResult.score}%</Badge>
      ) : <span className="text-xs text-gray-400">—</span>,
    },
    {
      key: 'acciones', header: 'Acciones', render: (t: Tramite) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setDetailTramite(t)}>Ver</Button>
          {t.status === 'cita-agendada' && !t.simulatorResult && (
            <Button variant="outline" size="sm" onClick={() => setSimModal(t)}>
              <ClipboardEdit className="h-3.5 w-3.5 mr-1" />Simulador
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Trámites</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por ID o nombre..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">Todos los status</option>
          {Object.entries(statusLabel).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="all">Todos los tipos</option>
          {licenseTypes.map(lt => (
            <option key={lt.licenseId} value={lt.licenseId}>{lt.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable columns={columns} data={filtered} keyExtractor={t => t.id} emptyMessage="No se encontraron trámites" />
      </div>

      {/* Detail modal */}
      <Modal open={!!detailTramite} onClose={() => setDetailTramite(null)} title="Detalle del Trámite">
        {detailTramite && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-gray-500">ID:</span> <span className="font-mono">{detailTramite.id}</span></div>
              <div><span className="text-gray-500">Estado:</span> <Badge variant={statusVariant[detailTramite.status]}>{statusLabel[detailTramite.status]}</Badge></div>
              <div className="col-span-2"><span className="text-gray-500">Nombre:</span> <span className="font-medium">{detailTramite.personalData.nombre} {detailTramite.personalData.apellidoPaterno} {detailTramite.personalData.apellidoMaterno}</span></div>
              <div><span className="text-gray-500">CURP:</span> <span className="font-mono text-xs">{detailTramite.personalData.curp}</span></div>
              <div><span className="text-gray-500">Teléfono:</span> {detailTramite.personalData.telefono}</div>
              <div><span className="text-gray-500">Email:</span> {detailTramite.personalData.email}</div>
              <div><span className="text-gray-500">Tipo:</span> <span className="capitalize">{detailTramite.licenseType || '—'}</span></div>
              <div><span className="text-gray-500">Cita:</span> {detailTramite.appointment ? `${detailTramite.appointment.date} ${detailTramite.appointment.time}` : '—'}</div>
              <div><span className="text-gray-500">Creado:</span> {new Date(detailTramite.createdAt).toLocaleString('es-MX')}</div>
            </div>
            {detailTramite.examResult && (
              <div className="pt-2 border-t">
                <p className="text-gray-500 mb-1">Examen Teórico:</p>
                <Badge variant={detailTramite.examResult.passed ? 'success' : 'destructive'}>
                  {detailTramite.examResult.passed ? 'Aprobado' : 'Reprobado'} — {detailTramite.examResult.score}%
                </Badge>
              </div>
            )}
            {detailTramite.simulatorResult && (
              <div className="pt-2 border-t">
                <p className="text-gray-500 mb-1">Simulador:</p>
                <Badge variant={detailTramite.simulatorResult.passed ? 'success' : 'destructive'}>
                  {detailTramite.simulatorResult.passed ? 'Aprobado' : 'Reprobado'} — {detailTramite.simulatorResult.score}%
                </Badge>
                {detailTramite.simulatorResult.faults && detailTramite.simulatorResult.faults.length > 0 ? (
                  <div className="mt-3 overflow-hidden rounded-md border border-gray-200">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 text-gray-500">
                        <tr>
                          <th className="px-2 py-1.5 text-left font-medium w-16">Min</th>
                          <th className="px-2 py-1.5 text-left font-medium">Tipo</th>
                          <th className="px-2 py-1.5 text-left font-medium">Descripción</th>
                          <th className="px-2 py-1.5 text-right font-medium w-16">Puntos</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {detailTramite.simulatorResult.faults.map((f, i) => {
                          const meta = FAULT_LABELS[f.type] ?? { label: titleCaseFromType(f.type), tone: 'gray' as const }
                          const ptsLabel = f.deduction === 0 ? '—' : `−${f.deduction}`
                          return (
                            <tr key={i} className="bg-white">
                              <td className="px-2 py-1.5 font-mono text-gray-500">{formatTimeFromSeconds(f.secondsFromStart)}</td>
                              <td className="px-2 py-1.5">
                                <span className={`inline-block rounded px-1.5 py-0.5 text-[11px] ${FAULT_TONE_CLASSES[meta.tone]}`}>
                                  {meta.label}
                                </span>
                              </td>
                              <td className="px-2 py-1.5 text-gray-700">{f.description}</td>
                              <td className={`px-2 py-1.5 text-right font-mono ${f.deduction === 0 ? 'text-gray-400' : 'text-red-600'}`}>{ptsLabel}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : detailTramite.simulatorResult.feedback.length > 0 ? (
                  // Fallback para trámites antiguos sin `faults` desglosados.
                  <ul className="mt-2 space-y-1 text-xs text-gray-600">
                    {detailTramite.simulatorResult.feedback.map((f, i) => (
                      <li key={i}>• {f}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Simulator result modal */}
      <Modal open={!!simModal} onClose={() => setSimModal(null)} title="Registrar Resultado de Simulador">
        {simModal && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Trámite <span className="font-mono font-medium">{simModal.id}</span> — {simModal.personalData.nombre} {simModal.personalData.apellidoPaterno}
            </p>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={simPassed} onChange={() => setSimPassed(true)} className="text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-green-700">Aprobado</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={!simPassed} onChange={() => setSimPassed(false)} className="text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-red-700">Reprobado</span>
              </label>
            </div>
            <Input
              label="Puntuación (0-100)"
              type="number"
              min={0}
              max={100}
              value={simScore}
              onChange={e => setSimScore(e.target.value)}
            />
            <Textarea
              label="Retroalimentación (una línea por observación)"
              placeholder="Ej: Buen control de velocidad&#10;Frenado tardío en curvas"
              value={simFeedback}
              onChange={e => setSimFeedback(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSimModal(null)}>Cancelar</Button>
              <Button onClick={handleSimSubmit}>Guardar Resultado</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
