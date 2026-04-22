'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/admin-api'
import { adminKeys, useAdminLicencias } from '@/lib/admin-queries'
import type { LicenciaResponse } from '@/lib/adapters'
import { formatMXN } from '@/lib/utils'
import { Modal } from '@/components/admin/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/admin/Textarea'
import { Badge } from '@/components/admin/Badge'
import { Pencil, Bike, Car, Bus, Truck, UserCog, UserPlus, Ambulance, CheckCircle, type LucideIcon } from 'lucide-react'

const VIGENCIA_OPTIONS = ['1 año', '2 años', '3 años', '5 años'] as const

const ICON_MAP: Record<string, LucideIcon> = { Bike, Car, Bus, Truck, UserCog, UserPlus, Ambulance }

function LicenseIcon({ name, size = 24 }: { name: string; size?: number }) {
  const Icon = ICON_MAP[name]
  if (!Icon) return null
  return <Icon size={size} />
}

export default function LicenciasPage() {
  const qc = useQueryClient()
  const licenciasQuery = useAdminLicencias()
  const licenseTypes = licenciasQuery.data ?? []
  const [editModal, setEditModal] = useState(false)
  const [editing, setEditing] = useState<LicenciaResponse | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editRequirements, setEditRequirements] = useState('')
  const [editCosto, setEditCosto] = useState<number | ''>('')
  const [editVigencia, setEditVigencia] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)

  const openEdit = (lt: LicenciaResponse) => {
    setEditing(lt)
    setEditName(lt.name)
    setEditDescription(lt.description)
    setEditRequirements((lt.requirements || []).join('\n'))
    setEditCosto(typeof lt.costo === 'number' ? lt.costo : '')
    setEditVigencia(lt.vigencia ?? '')
    setSaveError(null)
    setEditModal(true)
  }

  const handleSave = async () => {
    if (!editing) return
    if (editCosto === '' || Number(editCosto) <= 0) {
      setSaveError('El costo es obligatorio y debe ser mayor a 0 (MXN).')
      return
    }
    if (!editVigencia) {
      setSaveError('La vigencia es obligatoria.')
      return
    }
    setSaveError(null)
    await adminApi.actualizarLicencia(editing.licenseId, {
      name: editName,
      description: editDescription,
      requirements: editRequirements.split('\n').filter(Boolean),
      costo: Number(editCosto),
      vigencia: editVigencia,
    })
    qc.invalidateQueries({ queryKey: adminKeys.licencias })
    setEditModal(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tipos de Licencia</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {licenseTypes.map(lt => {
          const questionCount = lt.questionCount || 0
          return (
            <div
              key={lt.licenseId}
              className="bg-white/60 backdrop-blur-sm border border-white/80 shadow-lg rounded-xl overflow-hidden hover:bg-white/80 hover:shadow-xl transition-all"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <LicenseIcon name={lt.icon} size={24} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{lt.name}</h2>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <Badge variant="primary">{questionCount} preguntas</Badge>
                        {typeof lt.costo === 'number' && lt.costo > 0 && (
                          <Badge variant="secondary">
                            {formatMXN(lt.costo)}
                            {lt.vigencia ? ` · ${lt.vigencia}` : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => openEdit(lt)}
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-sm text-gray-600 mt-3">{lt.description}</p>

                <div className="border-t border-gray-100 mt-4 pt-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Requisitos</h3>
                  <ul className="space-y-1.5">
                    {(lt.requirements || []).map((r, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary/60 mt-0.5 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Editar Tipo de Licencia">
        {editing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <LicenseIcon name={editing.icon} size={20} />
              </div>
              <span className="font-mono">{editing.licenseId}</span>
            </div>
            <Input label="Nombre" value={editName} onChange={e => setEditName(e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Costo en MXN *"
                type="number"
                min={1}
                max={100000}
                step={50}
                required
                value={editCosto}
                onChange={e => setEditCosto(e.target.value === '' ? '' : Number(e.target.value))}
                helperText="Obligatorio. Se muestra al ciudadano en el landing."
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vigencia *</label>
                <select
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={editVigencia}
                  onChange={e => setEditVigencia(e.target.value)}
                >
                  <option value="" disabled>Selecciona...</option>
                  {VIGENCIA_OPTIONS.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            {saveError && (
              <p className="text-sm text-destructive">{saveError}</p>
            )}
            <Textarea
              label="Descripcion"
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              rows={3}
            />
            <Textarea
              label="Requisitos (uno por linea)"
              value={editRequirements}
              onChange={e => setEditRequirements(e.target.value)}
              rows={6}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditModal(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Guardar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
