'use client'

import { useState, useEffect, useMemo } from 'react'
import { getAllTramites, type Tramite } from '@/lib/tramite'
import { enterSimulatorResult, getLicenseTypes } from '@/lib/admin'
import { DataTable } from '@/components/admin/DataTable'
import { Badge, statusVariant, statusLabel } from '@/components/admin/Badge'
import { Modal } from '@/components/admin/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/admin/Textarea'
import { Search, ClipboardEdit } from 'lucide-react'

export default function TramitesPage() {
  const [tramites, setTramites] = useState<Tramite[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [detailTramite, setDetailTramite] = useState<Tramite | null>(null)
  const [simModal, setSimModal] = useState<Tramite | null>(null)
  const [simScore, setSimScore] = useState('80')
  const [simPassed, setSimPassed] = useState(true)
  const [simFeedback, setSimFeedback] = useState('')

  const licenseTypes = useMemo(() => getLicenseTypes(), [])

  useEffect(() => {
    setTramites(getAllTramites())
  }, [])

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

  const handleSimSubmit = () => {
    if (!simModal) return
    const result = enterSimulatorResult(simModal.id, {
      passed: simPassed,
      score: parseInt(simScore) || 0,
      feedback: simFeedback.split('\n').filter(Boolean),
    })
    if (result) {
      setTramites(prev => prev.map(t => t.id === result.id ? result : t))
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
        <span className="capitalize text-xs">{t.licenseType || '—'}</span>
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
            <option key={lt.id} value={lt.id}>{lt.name}</option>
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
                {detailTramite.simulatorResult.feedback.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-gray-600">
                    {detailTramite.simulatorResult.feedback.map((f, i) => (
                      <li key={i}>• {f}</li>
                    ))}
                  </ul>
                )}
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
