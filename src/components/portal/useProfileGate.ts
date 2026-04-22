'use client'

import { useCallback, useEffect, useState } from 'react'
import { citizenApi } from '@/lib/citizen-api'

/**
 * Hook que encapsula el chequeo "perfil completo" antes de una acción.
 *
 * Uso:
 *   const { modalOpen, setModalOpen, gate } = useProfileGate()
 *   <button onClick={gate(() => router.push('/agendar'))}>Iniciar</button>
 *   <ProfileRequiredModal open={modalOpen} onClose={() => setModalOpen(false)} />
 */
export function useProfileGate() {
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    citizenApi.getPerfil().then(({ data }) => {
      if (!cancelled) setProfileComplete(data?.profileComplete === true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const gate = useCallback(
    (action: () => void) => {
      return (e?: React.MouseEvent) => {
        if (profileComplete === true) {
          action()
          return
        }
        // Si todavía no sabemos (null), también bloqueamos para evitar race
        // — el modal mostrará el CTA correcto cuando se abra.
        e?.preventDefault?.()
        setModalOpen(true)
      }
    },
    [profileComplete]
  )

  return { profileComplete, modalOpen, setModalOpen, gate }
}
