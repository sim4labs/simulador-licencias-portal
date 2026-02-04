import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#582672',
}

export const metadata: Metadata = {
  title: {
    default: 'Simulador de Licencias - Gobierno de Tlaxcala',
    template: '%s | Simulador de Licencias',
  },
  description:
    'Portal oficial para agendar citas en el simulador de manejo para obtener tu licencia de conducir en el Estado de Tlaxcala.',
  icons: {
    icon: '/favicon.ico',
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
