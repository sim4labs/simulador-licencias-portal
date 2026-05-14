import type { Metadata } from 'next'
import { FileText, ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { adminDocumentos } from '@/lib/admin-documentos'

export const metadata: Metadata = {
  title: 'Documentos',
  robots: { index: false },
}

function formatFecha(iso: string) {
  // iso es YYYY-MM-DD; se construye en hora local para evitar corrimiento de día.
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function DocumentosPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
      <p className="mt-1 mb-6 text-sm text-gray-500">
        Documentación oficial del sistema. Los archivos se abren en una pestaña nueva.
      </p>

      <div className="space-y-4">
        {adminDocumentos.map((doc) => (
          <Card key={doc.id} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <div className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:flex">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">{doc.titulo}</h2>
                <p className="mt-1 text-sm text-gray-600">{doc.descripcion}</p>
                <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
                  <div className="flex gap-1">
                    <dt className="font-medium text-gray-600">Versión:</dt>
                    <dd>{doc.version}</dd>
                  </div>
                  <div className="flex gap-1">
                    <dt className="font-medium text-gray-600">Emisión:</dt>
                    <dd>{formatFecha(doc.fechaEmision)}</dd>
                  </div>
                  <div className="flex gap-1">
                    <dt className="font-medium text-gray-600">Audiencia:</dt>
                    <dd>{doc.audiencia}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-shrink-0 items-center justify-center gap-2 self-start rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              Abrir documento
              <ExternalLink className="h-4 w-4" />
            </a>
          </Card>
        ))}
      </div>
    </>
  )
}
