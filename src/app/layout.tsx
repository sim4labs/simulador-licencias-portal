import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#582672',
}

export const metadata: Metadata = {
  title: {
    default: 'Simulador de Licencias - Gobierno de Tlaxcala',
    template: '%s | Simulador de Licencias Tlaxcala',
  },
  description:
    'Portal oficial para agendar citas en el simulador de manejo para obtener tu licencia de conducir en el Estado de Tlaxcala.',
  applicationName: 'Simulador de Licencias Tlaxcala',
  icons: { icon: '/favicon.ico' },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    title: 'Simulador de Licencias - Gobierno de Tlaxcala',
    description:
      'Agenda tu cita para la prueba en el simulador de manejo y obtén tu licencia de conducir en Tlaxcala.',
    siteName: 'Simulador de Licencias Tlaxcala',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Licencias - Gobierno de Tlaxcala',
    description:
      'Agenda tu cita para la prueba en el simulador de manejo y obtén tu licencia de conducir en Tlaxcala.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
