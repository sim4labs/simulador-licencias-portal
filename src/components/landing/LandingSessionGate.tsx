'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Tramite } from '@/lib/tramite'
import { citizenApi } from '@/lib/citizen-api'
import { adaptTramite } from '@/lib/adapters'
import { getCurrentCitizen } from '@/lib/citizen-auth'
import { STEP_LABELS, STEP_ROUTES } from '@/lib/landing-content'

/**
 * Isla cliente de la landing pública:
 * 1. Si el visitante tiene sesión activa, redirige a /portal.
 * 2. Si no, intenta cargar un trámite activo anónimo y lo muestra como banner.
 */
export function LandingSessionGate() {
  const router = useRouter()
  const [activeTramite, setActiveTramite] = useState<Tramite | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const citizen = await getCurrentCitizen()
        if (citizen) {
          router.replace('/portal')
          return
        }
      } catch {
        // No session — show landing page
      }
      try {
        const { data } = await citizenApi.getTramiteActivo()
        if (cancelled) return
        if (data) {
          const t = adaptTramite(data)
          if (t.currentStep < 6) setActiveTramite(t)
        }
      } catch {
        // Not logged in — no active tramite banner
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [router])

  if (!activeTramite) return null

  return (
    <div className="mt-8 max-w-md mx-auto">
      <Link
        href={STEP_ROUTES[activeTramite.currentStep] || '/portal/solicitud'}
        className="block bg-white/15 backdrop-blur border border-white/30 rounded-xl px-6 py-4 text-white hover:bg-white/25 transition-colors"
      >
        <p className="text-sm text-white/80 mb-1">Tienes un trámite en curso</p>
        <p className="font-semibold">{activeTramite.id}</p>
        <p className="text-sm text-white/80 mt-1">
          Paso {activeTramite.currentStep}: {STEP_LABELS[activeTramite.currentStep]}
        </p>
        <span className="text-sm font-medium mt-2 inline-block underline">Continuar →</span>
      </Link>
    </div>
  )
}
