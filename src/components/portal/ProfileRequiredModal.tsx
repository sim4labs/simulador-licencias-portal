'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { UserCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ProfileRequiredModalProps {
  open: boolean
  onClose: () => void
  returnTo?: string
}

export function ProfileRequiredModal({ open, onClose, returnTo }: ProfileRequiredModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const href = returnTo ? `/perfil?returnTo=${encodeURIComponent(returnTo)}` : '/perfil'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
          <UserCircle className="w-6 h-6 text-primary-600" />
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Completa tu perfil
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Necesitamos tus datos personales (CURP, RFC, domicilio, tipo de sangre, etc.) para registrar cualquier trámite de licencia. Te tomará menos de 2 minutos.
        </p>

        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Ahora no
          </Button>
          <Link href={href} onClick={onClose}>
            <Button className="w-full sm:w-auto">
              Ir a mi perfil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
