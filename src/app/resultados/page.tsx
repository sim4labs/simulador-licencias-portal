'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ResultadosContent } from '@/components/portal/ResultadosContent'

export default function ResultadosPage() {
  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/Flower-logo.svg"
              alt="Gobierno del Estado de Tlaxcala"
              width={50}
              height={50}
              className="h-12 w-auto"
              priority
            />
          </Link>
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
            Volver al inicio
          </Link>
        </div>
      </header>

      <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <ResultadosContent />
        </div>
      </div>
    </main>
  )
}
