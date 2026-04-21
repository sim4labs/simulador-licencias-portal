'use client'

import { useMemo } from 'react'
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Calendario de Citas</h1>
      <CalendarView tramites={tramites} />
    </div>
  )
}
