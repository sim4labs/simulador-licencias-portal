'use client'

import { useState, useEffect, useCallback } from 'react'
import { adminApi, type AdminUser } from '@/lib/admin-api'
import { DataTable } from '@/components/admin/DataTable'
import { Modal } from '@/components/admin/Modal'
import { Badge } from '@/components/admin/Badge'
import { Plus, RotateCcw, ToggleLeft, ToggleRight, Copy, Check } from 'lucide-react'

export default function UsuariosPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal: crear admin
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ username: '', email: '', name: '' })
  const [creating, setCreating] = useState(false)

  // Modal: resultado (password temporal)
  const [showResult, setShowResult] = useState(false)
  const [resultPassword, setResultPassword] = useState('')
  const [resultMessage, setResultMessage] = useState('')
  const [copied, setCopied] = useState(false)

  // Modal: confirmar acción
  const [confirmAction, setConfirmAction] = useState<{
    type: 'toggle' | 'reset'
    user: AdminUser
  } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchAdmins = useCallback(async () => {
    setLoading(true)
    const { data, error } = await adminApi.listarAdmins()
    if (error) {
      setError(error)
    } else {
      setAdmins(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAdmins()
  }, [fetchAdmins])

  // ─── Crear admin ───
  const handleCreate = async () => {
    if (!createForm.username || !createForm.email || !createForm.name) return
    setCreating(true)
    const { data, error } = await adminApi.crearAdmin(createForm)
    setCreating(false)
    if (error) {
      setError(error)
      return
    }
    setShowCreate(false)
    setCreateForm({ username: '', email: '', name: '' })
    setResultPassword(data!.temporaryPassword)
    setResultMessage(`Admin "${data!.username}" creado exitosamente`)
    setShowResult(true)
    fetchAdmins()
  }

  // ─── Toggle estado ───
  const handleToggle = async (user: AdminUser) => {
    setActionLoading(true)
    const { error } = await adminApi.toggleAdminStatus(user.userId)
    setActionLoading(false)
    setConfirmAction(null)
    if (error) {
      setError(error)
      return
    }
    fetchAdmins()
  }

  // ─── Reset password ───
  const handleReset = async (user: AdminUser) => {
    setActionLoading(true)
    const { data, error } = await adminApi.resetAdminPassword(user.userId)
    setActionLoading(false)
    setConfirmAction(null)
    if (error) {
      setError(error)
      return
    }
    setResultPassword(data!.temporaryPassword)
    setResultMessage(`Password reseteado para "${user.username}"`)
    setShowResult(true)
  }

  // ─── Copiar al portapapeles ───
  const handleCopy = () => {
    navigator.clipboard.writeText(resultPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const columns = [
    {
      key: 'username',
      header: 'Username',
      render: (row: AdminUser) => (
        <span className="font-medium text-gray-900">{row.username}</span>
      ),
    },
    {
      key: 'name',
      header: 'Nombre',
      render: (row: AdminUser) => row.name,
    },
    {
      key: 'email',
      header: 'Email',
      render: (row: AdminUser) => row.email,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (row: AdminUser) => (
        <Badge variant={row.isActive ? 'success' : 'destructive'}>
          {row.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Creado',
      render: (row: AdminUser) => new Date(row.createdAt).toLocaleDateString('es-MX'),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (row: AdminUser) => (
        <div className="flex gap-2">
          <button
            onClick={() => setConfirmAction({ type: 'toggle', user: row })}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            title={row.isActive ? 'Desactivar' : 'Activar'}
          >
            {row.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setConfirmAction({ type: 'reset', user: row })}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            title="Resetear password"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3D1A50]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios Admin</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona los administradores del portal
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#3D1A50] text-white rounded-lg hover:bg-[#2D1240] text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Nuevo Admin
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Cerrar
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={admins}
        keyExtractor={(row) => row.userId}
        emptyMessage="No hay administradores registrados"
      />

      {/* Modal: Crear admin */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Crear Administrador">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={createForm.username}
              onChange={e => setCreateForm(f => ({ ...f, username: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#3D1A50] focus:border-transparent outline-none"
              placeholder="ej. jperez"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <input
              type="text"
              value={createForm.name}
              onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#3D1A50] focus:border-transparent outline-none"
              placeholder="ej. Juan Pérez"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={createForm.email}
              onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#3D1A50] focus:border-transparent outline-none"
              placeholder="ej. jperez@gobierno.mx"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !createForm.username || !createForm.email || !createForm.name}
              className="px-4 py-2 text-sm text-white bg-[#3D1A50] rounded-lg hover:bg-[#2D1240] disabled:opacity-50"
            >
              {creating ? 'Creando...' : 'Crear Admin'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Resultado con password */}
      <Modal
        open={showResult}
        onClose={() => { setShowResult(false); setCopied(false) }}
        title="Password Temporal"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{resultMessage}</p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Password temporal:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-lg font-mono font-bold text-gray-900 select-all">
                {resultPassword}
              </code>
              <button
                onClick={handleCopy}
                className="p-2 rounded-md hover:bg-gray-200 text-gray-500"
                title="Copiar"
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
            Guarda este password. No se podrá recuperar después de cerrar este diálogo.
          </p>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => { setShowResult(false); setCopied(false) }}
              className="px-4 py-2 text-sm text-white bg-[#3D1A50] rounded-lg hover:bg-[#2D1240]"
            >
              Entendido
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Confirmar acción */}
      <Modal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={
          confirmAction?.type === 'toggle'
            ? (confirmAction.user.isActive ? 'Desactivar Admin' : 'Activar Admin')
            : 'Resetear Password'
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {confirmAction?.type === 'toggle'
              ? `¿Estás seguro de ${confirmAction.user.isActive ? 'desactivar' : 'activar'} a "${confirmAction.user.username}"?`
              : `¿Resetear el password de "${confirmAction?.user.username}"? Se generará uno nuevo.`}
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setConfirmAction(null)}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (!confirmAction) return
                if (confirmAction.type === 'toggle') handleToggle(confirmAction.user)
                else handleReset(confirmAction.user)
              }}
              disabled={actionLoading}
              className="px-4 py-2 text-sm text-white bg-[#3D1A50] rounded-lg hover:bg-[#2D1240] disabled:opacity-50"
            >
              {actionLoading ? 'Procesando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
