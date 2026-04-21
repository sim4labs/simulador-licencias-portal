import { NextResponse, type NextRequest } from 'next/server'

/**
 * Rutas del flujo ciudadano que viven en src/app/portal/* pero cuya URL pública
 * queremos exponer sin el prefijo /portal para que el subdominio
 * portal.{env}.simuladores.mexicalab.com no duplique la palabra.
 *
 * Las rutas de portal con colisión top-level (resultados) o que representan
 * el dashboard autenticado (/portal/ sin subpath) quedan como están — no
 * intentamos reescribirlas para no romper la landing pública ni /resultados.
 */
const PORTAL_ALIASED_ROUTES = [
  'tipo-licencia',
  'solicitud',
  'examen',
  'agendar',
  'confirmacion',
  'historial',
  'perfil',
  'foto',
  'verificacion',
]

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const segments = pathname.split('/').filter(Boolean)
  const first = segments[0]

  // URL limpia (/tipo-licencia) → rewrite interno a /portal/tipo-licencia.
  // Next.js renderiza la página real sin cambiar la URL en el browser.
  if (first && PORTAL_ALIASED_ROUTES.includes(first)) {
    const url = request.nextUrl.clone()
    url.pathname = `/portal${pathname}`
    return NextResponse.rewrite(url)
  }

  // URL con prefijo legacy (/portal/tipo-licencia) → redirect 308 a la limpia.
  // Preserva query params; código existente con router.push('/portal/X') sigue
  // funcionando pero el browser termina mostrando /X.
  if (first === 'portal' && segments[1] && PORTAL_ALIASED_ROUTES.includes(segments[1])) {
    const url = request.nextUrl.clone()
    url.pathname = '/' + segments.slice(1).join('/')
    url.search = search
    return NextResponse.redirect(url, 308)
  }

  return NextResponse.next()
}

// Matcher: ejecuta middleware en todas las rutas HTML. Excluye assets y API
// internos para no agregar overhead a cada request de estáticos.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
