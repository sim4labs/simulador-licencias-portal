'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { useAdminCitas } from '@/lib/admin-queries'
import { adaptTramite } from '@/lib/adapters'
import { CalendarView } from '@/components/admin/CalendarView'

export default function CalendarioPage() {
  const range = useMemo(() => {
    const now = new Date()
    return {
      desde: format(startOfMonth(now), 'yyyy-MM-dd'),
      hasta: format(endOfMonth(now), 'yyyy-MM-dd'),
    }
  }, [])
  const citasQuery = useAdminCitas(range)
  const tramites = useMemo(
    () => (citasQuery.data ?? []).map(adaptTramite),
    [citasQuery.data],
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendario de Citas</h1>
        <Link
          href="/admin/calendario/configuracion"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Horario operativo
        </Link>
      </div>
      <CalendarView tramites={tramites} />
    </div>
  )
}
