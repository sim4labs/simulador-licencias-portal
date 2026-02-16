'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Calendar, FileText, HelpCircle, CreditCard } from 'lucide-react'

const navSections = [
  {
    title: 'Principal',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/calendario', label: 'Calendario', icon: Calendar },
      { href: '/admin/tramites', label: 'Trámites', icon: FileText },
    ],
  },
  {
    title: 'Configuración',
    items: [
      { href: '/admin/preguntas', label: 'Preguntas', icon: HelpCircle },
      { href: '/admin/licencias', label: 'Licencias', icon: CreditCard },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

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
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
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
