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
      <header
        className="sticky top-0 z-30 h-16 bg-primary/95 flex items-center justify-between px-4 sm:px-6"
        style={{
          backgroundImage: 'url(/Flower-pattern.png)',
          backgroundRepeat: 'repeat',
          backgroundBlendMode: 'overlay',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
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

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/30 text-white text-sm hover:bg-white/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </header>

      <div className="flex">
        <CitizenSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <main className="flex-1 lg:pl-64 pt-0">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
