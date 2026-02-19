'use client'

import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/admin-api'
import type { LicenciaResponse } from '@/lib/adapters'
import { Modal } from '@/components/admin/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/admin/Textarea'
import { Badge } from '@/components/admin/Badge'
import { Pencil, Bike, Car, Bus, Truck, CheckCircle, type LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = { Bike, Car, Bus, Truck }

function LicenseIcon({ name, size = 24 }: { name: string; size?: number }) {
  const Icon = ICON_MAP[name]
  if (!Icon) return null
  return <Icon size={size} />
}

export default function LicenciasPage() {
  const [licenseTypes, setLicenseTypes] = useState<LicenciaResponse[]>([])
  const [editModal, setEditModal] = useState(false)
  const [editing, setEditing] = useState<LicenciaResponse | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editRequirements, setEditRequirements] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await adminApi.listarLicencias()
      if (data) setLicenseTypes(data)
    }
    load()
  }, [])

  const openEdit = (lt: LicenciaResponse) => {
    setEditing(lt)
    setEditName(lt.name)
    setEditDescription(lt.description)
    setEditRequirements(lt.requirements.join('\n'))
    setEditModal(true)
  }

  const handleSave = async () => {
    if (!editing) return
    await adminApi.actualizarLicencia(editing.licenseId, {
      name: editName,
      description: editDescription,
      requirements: editRequirements.split('\n').filter(Boolean),
    })
    const { data } = await adminApi.listarLicencias()
    if (data) setLicenseTypes(data)
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
                      <Badge variant="primary" className="mt-1">{questionCount} preguntas</Badge>
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
                    {lt.requirements.map((r, i) => (
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
