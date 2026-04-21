/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Las rutas limpias del flujo ciudadano (/tipo-licencia, /solicitud,
  // /examen, /agendar, /confirmacion, etc.) se resuelven en src/middleware.ts
  // vía NextResponse.rewrite, que apunta internamente a /portal/<ruta>. No se
  // declaran aquí porque los redirects de next.config se aplican antes que el
  // middleware y chocarían con el rewrite (loop de redirect).
}

module.exports = nextConfig
