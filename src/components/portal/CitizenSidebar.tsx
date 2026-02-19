'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  CalendarDays,
  ClipboardList,
  UserCircle,
  X,
} from 'lucide-react'

const navSections = [
  {
    title: 'Mi Trámite',
    items: [
      { href: '/portal', label: 'Inicio', icon: LayoutDashboard, exact: true },
      { href: '/portal/historial', label: 'Mis Trámites', icon: FileText },
    ],
  },
  {
    title: 'Servicios',
    items: [
      { href: '/portal/examen', label: 'Examen Teórico', icon: BookOpen },
      { href: '/portal/agendar', label: 'Administrar Citas', icon: CalendarDays },
      { href: '/portal/resultados', label: 'Mis Resultados', icon: ClipboardList },
    ],
  },
  {
    title: 'Mi Cuenta',
    items: [
      { href: '/portal/perfil', label: 'Mi Perfil', icon: UserCircle },
    ],
  },
]

interface CitizenSidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function CitizenSidebar({ mobileOpen, onMobileClose }: CitizenSidebarProps) {
  const pathname = usePathname()

  const nav = (
    <aside className={cn(
      'fixed top-16 bottom-0 left-0 w-64 bg-[#EBEBED] border-r border-[#DCDCE0] flex-col z-40',
      mobileOpen ? 'flex' : 'hidden lg:flex'
    )}>
      <div className="px-6 py-5 flex justify-center">
        <Image src="/Tlaxcala-logo.svg" alt="Gobierno de Tlaxcala" width={160} height={48} />
      </div>
      <nav className="flex-1 px-3 py-2 space-y-6 overflow-y-auto">
        {navSections.map(section => (
          <div key={section.title}>
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-[#4B5563]">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map(item => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onMobileClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-r-lg border-l-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'border-[#3D1A50] bg-[#EDE7F1] text-[#3D1A50]'
                        : 'border-transparent text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onMobileClose}>
          <button
            onClick={onMobileClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/90 text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      {nav}
    </>
  )
}
