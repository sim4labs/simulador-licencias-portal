'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Eye, EyeOff } from 'lucide-react'

const ADMIN_PIN = '1234'

interface AdminAuthProps {
  onAuthenticated: () => void
}

export function AdminAuth({ onAuthenticated }: AdminAuthProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [showPin, setShowPin] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin === ADMIN_PIN) {
      localStorage.setItem('adminPin', pin)
      onAuthenticated()
    } else {
      setError('PIN incorrecto')
      setPin('')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#EDE7F1]">
      <Image src="/Tlaxcala-logo.svg" alt="Gobierno de Tlaxcala" width={200} height={60} className="mb-8" />
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">Acceso Administrativo</h1>
          <p className="text-sm text-gray-500 mt-1 text-center">Portal de Administración — Gobierno de Tlaxcala</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="w-full">
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                placeholder="PIN de acceso"
                value={pin}
                onChange={e => { setPin(e.target.value); setError('') }}
                maxLength={10}
                autoFocus
                className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${error ? 'border-destructive focus-visible:ring-destructive' : 'border-input'}`}
                aria-invalid={!!error}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                tabIndex={-1}
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={!pin}>
            Ingresar
          </Button>
        </form>
      </div>
    </div>
  )
}
