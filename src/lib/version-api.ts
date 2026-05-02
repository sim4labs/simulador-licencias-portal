'use client'

import { useEffect, useState } from 'react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export interface BackendVersion {
  version: string // "0.9.0" o "unreleased"
  tag: string | null // "v0.9.0" o null
  commit: string
  dirty: boolean
  builtAt: string // ISO
  env?: string
}

/** GET /version del backend (público, sin auth, cache 60s). */
export async function fetchBackendVersion(): Promise<BackendVersion> {
  const res = await fetch(`${API_BASE_URL}/version`, { cache: 'force-cache' })
  if (!res.ok) throw new Error(`/version returned ${res.status}`)
  return res.json()
}

/**
 * Hook minimalista que pide /version una vez por mount. Sirve tanto en el
 * admin (dentro de AdminQueryProvider) como en el portal ciudadano (sin él).
 */
export function useBackendVersion() {
  const [data, setData] = useState<BackendVersion | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchBackendVersion()
      .then((v) => {
        if (!cancelled) setData(v)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)))
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { data, error }
}
