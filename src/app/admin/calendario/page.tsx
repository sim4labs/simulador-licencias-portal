'use client'

import { useState, useEffect } from 'react'
import { getAllTramites, type Tramite } from '@/lib/tramite'
import { CalendarView } from '@/components/admin/CalendarView'

export default function CalendarioPage() {
  const [tramites, setTramites] = useState<Tramite[]>([])

  useEffect(() => {
    setTramites(getAllTramites().filter(t => !!t.appointment))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Calendario de Citas</h1>
      <CalendarView tramites={tramites} />
    </div>
  )
}
