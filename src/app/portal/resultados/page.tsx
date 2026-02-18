'use client'

import { ResultadosContent } from '@/components/portal/ResultadosContent'

export default function PortalResultadosPage() {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <ResultadosContent basePath="/portal" />
      </div>
    </div>
  )
}
