'use client'

import { Sidebar } from './Sidebar'
import { LogOut } from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
  onLogout: () => void
}

export function AdminLayout({ children, onLogout }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 h-16 bg-primary/95 flex items-center justify-between px-6"
        style={{ backgroundImage: 'url(/Flower-pattern.png)', backgroundRepeat: 'repeat', backgroundBlendMode: 'overlay' }}
      >
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">Admin Portal</h1>
          <p className="text-white/70 text-xs">Simulador de Licencias</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/30 text-white text-sm hover:bg-white/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </header>

      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:pl-64 pt-0">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
