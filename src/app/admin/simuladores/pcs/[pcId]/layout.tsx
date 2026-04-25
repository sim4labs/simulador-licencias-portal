'use client'

import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

const TABS = [
  { href: '', label: 'Resumen' },
  { href: '/versiones', label: 'Versiones' },
  { href: '/calibracion', label: 'Calibración' },
  { href: '/logs', label: 'Logs' },
] as const

export default function PCLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const pathname = usePathname()
  const pcId = params?.pcId as string
  const base = `/admin/simuladores/pcs/${encodeURIComponent(pcId)}`

  return (
    <div className="space-y-4">
      <Link
        href="/admin/simuladores/pcs"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" /> PCs
      </Link>

      <nav className="flex gap-1 border-b border-gray-200">
        {TABS.map(t => {
          const href = `${base}${t.href}`
          const active = t.href === '' ? pathname === base : pathname.startsWith(href)
          return (
            <Link
              key={t.href}
              href={href}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                active
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t.label}
            </Link>
          )
        })}
      </nav>

      {children}
    </div>
  )
}
