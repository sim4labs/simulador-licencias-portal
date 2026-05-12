/**
 * Highlights curados por versión. Opcional — si una versión no aparece aquí,
 * la página de changelog la muestra solo con su lista de commits.
 *
 * Llave: el `version` que emite `scripts/build-changelog.mjs` (semver sin "v",
 * o "unreleased").
 */

interface HighlightOverlay {
  title?: string
  highlights?: string[]
}

export const highlights: Record<string, HighlightOverlay> = {
  '0.9.0': {
    title: 'Release candidate — demo institucional',
    highlights: [
      'Portal ciudadano completo: examen teórico, agendado de citas, perfil obligatorio, costos dinámicos por tipo de licencia y QR de confirmación.',
      'Panel administrativo: trámites, calendario, métricas con gráficas, configuración de calificación, preguntas, licencias, usuarios e integraciones con tokens.',
      'Gestión de simuladores: PCs con tabs Resumen/Versiones/Calibración/Logs, builds Unity con upload + deploy, módulo de operaciones en vivo y release notes con test plan persistente.',
      'Verificación biométrica del kiosko: check-in con Face Liveness, kioskId estable, autocuración y regeneración de QR en sesión muerta.',
      'Auth dual Cognito (ciudadano + admin) con login username/password y redirect automático para sesiones activas.',
      'Migración a SSR-first del flujo público y a TanStack Query v5 en todo /admin/*.',
      'Integraciones externas: rotación de tokens, healthcheck en lista, probador de token y historial de llamadas.',
      'CI/CD: promoción automática main → stage vía GitHub Actions.',
    ],
  },
  '1.0.0': {
    title: 'Lanzamiento oficial a producción',
    highlights: [
      'Promoción del RC v0.9.0 a producción tras demo institucional aprobado.',
    ],
  },
}
