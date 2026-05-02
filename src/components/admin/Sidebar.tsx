'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { usePrefetchAdmin } from '@/lib/admin-queries'
import { usePrefetchIot } from '@/lib/iot-queries'
import { usePrefetchSimulator } from '@/lib/simulator-queries'
import { currentVersion } from '@/data/changelog'
import { useBackendVersion } from '@/lib/version-api'
import { LayoutDashboard, Calendar, FileText, HelpCircle, CreditCard, Users, BarChart3, ClipboardCheck, Monitor, Box, Upload, KeyRound, Activity, History, Tag } from 'lucide-react'

type AdminPrefetchKey = 'stats' | 'tramites' | 'licencias' | 'users' | 'preguntas' | 'scoringConfig'
type IotPrefetchKey = 'devices' | 'firmware'
type SimPrefetchKey = 'simulators' | 'pcs' | 'unityBuilds'

type NavItem = {
  href: string
  label: string
  icon: any
  prefetchAdmin?: AdminPrefetchKey
  prefetchIot?: IotPrefetchKey
  prefetchSim?: SimPrefetchKey
}

const navSections: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'Principal',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, prefetchAdmin: 'stats' },
      { href: '/admin/calendario', label: 'Calendario', icon: Calendar },
      { href: '/admin/tramites', label: 'Trámites', icon: FileText, prefetchAdmin: 'tramites' },
      { href: '/admin/metrics', label: 'Métricas', icon: BarChart3 },
    ],
  },
  {
    title: 'Simuladores',
    items: [
      { href: '/admin/simuladores/operaciones', label: 'Operaciones', icon: Activity, prefetchSim: 'simulators' },
      { href: '/admin/simuladores', label: 'Simuladores', icon: Box, prefetchSim: 'simulators' },
      { href: '/admin/simuladores/pcs', label: 'PCs', icon: Monitor, prefetchSim: 'pcs' },
      { href: '/admin/simuladores/builds', label: 'Builds Unity', icon: Upload, prefetchSim: 'unityBuilds' },
    ],
  },
  {
    title: 'Configuración',
    items: [
      { href: '/admin/scoring', label: 'Calificación', icon: ClipboardCheck, prefetchAdmin: 'scoringConfig' },
      { href: '/admin/preguntas', label: 'Preguntas', icon: HelpCircle, prefetchAdmin: 'preguntas' },
      { href: '/admin/licencias', label: 'Licencias', icon: CreditCard, prefetchAdmin: 'licencias' },
      { href: '/admin/usuarios', label: 'Usuarios', icon: Users, prefetchAdmin: 'users' },
      { href: '/admin/integraciones', label: 'Integraciones', icon: KeyRound },
      { href: '/admin/changelog', label: 'Historial', icon: History },
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
  const prefetchAdmin = usePrefetchAdmin()
  const prefetchIot = usePrefetchIot()
  const prefetchSim = usePrefetchSimulator()
  const fe = currentVersion()
  const { data: be } = useBackendVersion()
  const feLabel = fe === 'unreleased' ? 'rc' : `v${fe}`
  const beLabel = be ? (be.version === 'unreleased' ? 'rc' : `v${be.version}`) : '…'

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
                const warmup = () => {
                  if (item.prefetchAdmin) prefetchAdmin[item.prefetchAdmin]()
                  if (item.prefetchIot) prefetchIot[item.prefetchIot]()
                  if (item.prefetchSim) prefetchSim[item.prefetchSim]()
                }
                const hasPrefetch = !!(item.prefetchAdmin || item.prefetchIot || item.prefetchSim)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onMouseEnter={hasPrefetch ? warmup : undefined}
                    onFocus={hasPrefetch ? warmup : undefined}
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
      <Link
        href="/admin/changelog"
        className="px-4 py-3 border-t border-[#DCDCE0] text-xs text-[#4B5563] hover:bg-gray-200 flex items-center justify-between gap-2"
        title={be ? `Backend ${be.tag ?? be.commit} · built ${new Date(be.builtAt).toLocaleString()}` : 'Ver historial de versiones'}
      >
        <span className="font-mono whitespace-nowrap">
          FE <span className="text-[#3D1A50]">{feLabel}</span>
          <span className="text-gray-400"> · </span>
          BE <span className="text-[#3D1A50]">{beLabel}</span>
        </span>
        <Tag className="h-3 w-3 flex-shrink-0 text-gray-400" />
      </Link>
    </aside>
  )
}
