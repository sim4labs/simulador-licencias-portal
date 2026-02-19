'use client'

import { useState, useEffect } from 'react'
import type { Tramite } from '@/lib/tramite'
import { adminApi } from '@/lib/admin-api'
import { adaptTramite } from '@/lib/adapters'
import { CalendarView } from '@/components/admin/CalendarView'

export default function CalendarioPage() {
  const [tramites, setTramites] = useState<Tramite[]>([])

  useEffect(() => {
    async function load() {
      const { data } = await adminApi.getCitas({})
      if (data) setTramites(data.map(adaptTramite))
    }
    load()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Calendario de Citas</h1>
      <CalendarView tramites={tramites} />
    </div>
  )
}
