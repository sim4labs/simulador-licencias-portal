'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogOut, Menu, User } from 'lucide-react'
import { CitizenSidebar } from './CitizenSidebar'

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
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header — matches admin style */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between overflow-hidden bg-gradient-to-r from-primary-700 to-primary-800 px-4 shadow-sm sm:px-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[url('/Flower-logo.svg')] bg-[length:76px_76px] bg-repeat opacity-[0.08]"
        />

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
            className="-ml-2 flex min-h-11 min-w-11 items-center justify-center rounded-md text-white/90 transition-colors hover:bg-white/15 hover:text-white lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/portal" className="flex items-center gap-2">
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">Portal Ciudadano</h1>
              <p className="text-white/70 text-xs">Simulador de Licencias</p>
            </div>
          </Link>
        </div>

        <div className="relative z-10 flex items-center gap-2 sm:gap-3">
          <div className="flex min-h-11 items-center gap-2.5 rounded-full border border-white/40 bg-primary-900/70 px-2 sm:px-3 shadow-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/25">
              {citizenName ? (
                <span className="text-xs font-semibold text-white">{getInitials(citizenName)}</span>
              ) : (
                <User className="h-3.5 w-3.5 text-white" />
              )}
            </div>
            <span className="text-sm font-medium text-white hidden sm:inline max-w-[140px] truncate">
              {citizenName.split(' ')[0]}
            </span>
          </div>
          <button
            onClick={onLogout}
            aria-label="Cerrar sesión"
            className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md border border-white/50 bg-primary-900/70 px-3 text-sm font-medium text-white shadow-sm transition-colors hover:border-white/70 hover:bg-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-800"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </header>

      <div className="flex">
        <CitizenSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <main className="flex-1 min-w-0 lg:pl-64 pt-0">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
