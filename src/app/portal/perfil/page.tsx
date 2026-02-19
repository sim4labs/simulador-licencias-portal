'use client'

import { useEffect, useState } from 'react'
import { UserCircle, Mail, Shield, Calendar } from 'lucide-react'
import { getCurrentCitizen } from '@/lib/citizen-auth'
import { citizenApi } from '@/lib/citizen-api'

interface Perfil {
  userId: string
  email: string
  name: string
}

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const session = await getCurrentCitizen()
      if (session) {
        const { data } = await citizenApi.getPerfil()
        if (data) setPerfil(data)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!perfil) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">No se pudo cargar el perfil.</p>
      </div>
    )
  }

  const fields = [
    { label: 'Nombre completo', value: perfil.name, icon: UserCircle },
    { label: 'Correo electrónico', value: perfil.email, icon: Mail },
    { label: 'ID de usuario', value: perfil.userId, icon: Shield },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-500 mt-1">Información de tu cuenta</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Avatar header */}
        <div className="px-6 py-8 bg-gradient-to-r from-primary-600 to-primary-accent flex items-center gap-5"
          style={{
            backgroundImage: 'url(/Flower-pattern.png)',
            backgroundRepeat: 'repeat',
            backgroundBlendMode: 'overlay',
          }}
        >
          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {perfil.name
                .split(' ')
                .slice(0, 2)
                .map((w) => w[0])
                .join('')
                .toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{perfil.name}</h2>
            <p className="text-white/70 text-sm">{perfil.email}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="divide-y divide-gray-100">
          {fields.map((field) => (
            <div key={field.label} className="px-6 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                <field.icon className="w-5 h-5 text-gray-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">{field.label}</p>
                <p className="text-sm font-medium text-gray-900 truncate">{field.value}</p>
              </div>
            </div>
          ))}
          <div className="px-6 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Miembro desde</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Seguridad</h3>
        <p className="text-sm text-gray-500 mb-4">
          Tu cuenta está protegida con tu correo electrónico y contraseña a través de un sistema de autenticación seguro.
        </p>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 w-fit">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-medium text-emerald-700">Cuenta verificada</span>
        </div>
      </div>
    </div>
  )
}
