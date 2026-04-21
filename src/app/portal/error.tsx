'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[portal] error boundary:', error)
  }, [error])

  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center">
      <h1 className="text-xl font-semibold text-gray-900 mb-2">
        Ocurrió un problema al cargar esta sección
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        Intenta de nuevo o vuelve al inicio del portal.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => reset()}
          className="px-4 py-2 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
        >
          Reintentar
        </button>
        <Link
          href="/portal"
          className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Ir al portal
        </Link>
      </div>
    </div>
  )
}
