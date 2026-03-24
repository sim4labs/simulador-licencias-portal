'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Calendar, FileText, HelpCircle, CreditCard, Cpu, Users, BarChart3, Download, ClipboardCheck, Monitor, Box } from 'lucide-react'

const navSections = [
  {
    title: 'Principal',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/calendario', label: 'Calendario', icon: Calendar },
      { href: '/admin/tramites', label: 'Trámites', icon: FileText },
      { href: '/admin/metrics', label: 'Métricas', icon: BarChart3 },
    ],
  },
  {
    title: 'Simuladores',
    items: [
      { href: '/admin/simuladores', label: 'Simuladores', icon: Box },
      { href: '/admin/simuladores/pcs', label: 'PCs', icon: Monitor },
      { href: '/admin/iot', label: 'Controladores', icon: Cpu },
      { href: '/admin/iot/firmware', label: 'Firmware', icon: Download },
    ],
  },
  {
    title: 'Configuración',
    items: [
      { href: '/admin/scoring', label: 'Calificación', icon: ClipboardCheck },
      { href: '/admin/preguntas', label: 'Preguntas', icon: HelpCircle },
      { href: '/admin/licencias', label: 'Licencias', icon: CreditCard },
      { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
    ],
  },
]

// Collect all hrefs, sorted longest first, to find the most specific match
const allHrefs = navSections.flatMap(s => s.items.map(i => i.href)).sort((a, b) => b.length - a.length)

function getActiveHref(pathname: string): string {
  return allHrefs.find(href =>
    pathname === href || (href !== '/admin' && pathname.startsWith(href + '/'))
  ) || '/admin'
}

export function Sidebar() {
  const pathname = usePathname()
  const activeHref = getActiveHref(pathname)

  return (
    <aside className="fixed top-16 bottom-0 left-0 w-64 bg-[#EBEBED] border-r border-[#DCDCE0] flex-col hidden lg:flex">
      <div className="px-6 py-5 flex justify-center">
        <Image src="/Tlaxcala-logo.svg" alt="Gobierno de Tlaxcala" width={160} height={48} />
      </div>
      <nav className="flex-1 px-3 py-2 space-y-6">
        {navSections.map(section => (
          <div key={section.title}>
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-[#4B5563]">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map(item => {
                const isActive = activeHref === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
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
}
