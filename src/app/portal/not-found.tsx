import Link from 'next/link'

export default function PortalNotFound() {
  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Página no encontrada</h1>
      <p className="text-sm text-gray-600 mb-6">
        La sección que buscas no existe o fue movida.
      </p>
      <Link
        href="/portal"
        className="inline-block px-4 py-2 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
      >
        Volver al portal
      </Link>
    </div>
  )
}
