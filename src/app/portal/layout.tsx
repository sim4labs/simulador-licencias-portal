import type { Metadata } from 'next'
import { PortalAuthGate } from '@/components/portal/PortalAuthGate'

export const metadata: Metadata = {
  title: {
    default: 'Portal Ciudadano',
    template: '%s | Portal Ciudadano',
  },
  description:
    'Gestiona tu trámite de licencia de conducir: selecciona tipo, presenta el examen teórico, agenda tu cita y consulta resultados.',
  robots: { index: false, follow: false },
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalAuthGate>{children}</PortalAuthGate>
}
