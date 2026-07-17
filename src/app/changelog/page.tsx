import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ChangelogList } from '@/components/changelog/ChangelogList'

export const metadata: Metadata = {
  title: 'Historial de versiones',
  description: 'Versiones publicadas del Portal de Licencias del Estado de Tlaxcala.',
  robots: { index: false, follow: false },
}

export default function PublicChangelogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header
        className="sticky top-0 z-30 h-16 bg-primary/95 flex items-center justify-between px-4 sm:px-6"
        style={{
          backgroundImage: 'url(/Flower-logo.svg)',
          backgroundRepeat: 'repeat',
          backgroundBlendMode: 'overlay',
        }}
      >
        <Link href="/" className="flex items-center gap-3 text-white">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Inicio</span>
        </Link>
        <Image
          src="/Tlaxcala-logo.svg"
          alt="Gobierno de Tlaxcala"
          width={120}
          height={36}
          className="opacity-90"
        />
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <ChangelogList showCommits />
      </main>
    </div>
  )
}
