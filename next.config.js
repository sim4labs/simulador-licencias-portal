/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      { source: '/solicitud', destination: '/portal/solicitud', permanent: true },
      { source: '/tipo-licencia', destination: '/portal/tipo-licencia', permanent: true },
      { source: '/examen', destination: '/portal/examen', permanent: true },
      { source: '/agendar', destination: '/portal/agendar', permanent: true },
      { source: '/confirmacion', destination: '/portal/confirmacion', permanent: true },
    ]
  },
}

module.exports = nextConfig
