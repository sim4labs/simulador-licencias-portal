'use client'

import Link from 'next/link'
import Image from 'next/image'
import { LogOut, User } from 'lucide-react'

interface CitizenLayoutProps {
  children: React.ReactNode
  citizenName: string
  onLogout: () => void
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export function CitizenLayout({ children, citizenName, onLogout }: CitizenLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/portal" className="flex items-center gap-3">
            <Image src="/Flower-logo.svg" alt="Tlaxcala" width={36} height={36} className="h-9 w-auto" />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 leading-tight">Portal Ciudadano</p>
              <p className="text-xs text-gray-500">Simulador de Licencias</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100">
              <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center">
                {citizenName ? (
                  <span className="text-xs font-semibold text-white">{getInitials(citizenName)}</span>
                ) : (
                  <User className="h-3.5 w-3.5 text-white" />
                )}
              </div>
              <span className="text-sm font-medium text-primary-700 hidden sm:inline max-w-[140px] truncate">
                {citizenName.split(' ')[0]}
              </span>
            </div>
            <button
              onClick={onLogout}
              title="Cerrar sesión"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 text-sm hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  )
}
