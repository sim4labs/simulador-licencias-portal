import { useQuery, keepPreviousData, useQueryClient } from '@tanstack/react-query'
import { adminApi } from './admin-api'
import type { ApiResponse } from './api'
import { adaptTramite } from './adapters'

export const adminKeys = {
  stats: ['admin', 'stats'] as const,
  tramites: (params: { status?: string; tipo?: string; search?: string; limit?: number; cursor?: string } = {}) =>
    ['admin', 'tramites', params] as const,
  tramite: (id: string) => ['admin', 'tramite', id] as const,
  citas: (params: { fecha?: string; desde?: string; hasta?: string }) =>
    ['admin', 'citas', params] as const,
  licencias: ['admin', 'licencias'] as const,
  preguntas: (params: { cat?: string; dif?: string } = {}) =>
    ['admin', 'preguntas', params] as const,
  users: ['admin', 'users'] as const,
  scoringConfig: ['admin', 'scoring-config'] as const,
  metrics: (period: string) => ['admin', 'metrics', period] as const,
  integrationTokens: ['admin', 'integration-tokens'] as const,
  integrationTokenCalls: (tokenId: string, limit: number) =>
    ['admin', 'integration-tokens', tokenId, 'calls', limit] as const,
}

function unwrap<T>(res: ApiResponse<T>): T {
  if (res.error) throw new Error(res.error)
  if (res.data === null) throw new Error('Respuesta vacía')
  return res.data
}

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats,
    queryFn: () => adminApi.getStats().then(unwrap),
    staleTime: 30_000,
  })
}

export function useAdminTramites(params: {
  status?: string
  tipo?: string
  search?: string
  limit?: number
  cursor?: string
} = {}) {
  return useQuery({
    queryKey: adminKeys.tramites(params),
    queryFn: async () => {
      const res = unwrap(await adminApi.listarTramites(params))
      return {
        items: res.items.map(adaptTramite),
        nextCursor: res.nextCursor,
      }
    },
    staleTime: 10_000,
    placeholderData: keepPreviousData,
  })
}

export function useAdminLicencias() {
  return useQuery({
    queryKey: adminKeys.licencias,
    queryFn: () => adminApi.listarLicencias().then(unwrap),
    staleTime: 5 * 60_000,
  })
}

export function useAdminCitas(params: { fecha?: string; desde?: string; hasta?: string }) {
  return useQuery({
    queryKey: adminKeys.citas(params),
    queryFn: () => adminApi.getCitas(params).then(unwrap),
    staleTime: 30_000,
    enabled: Boolean(params.fecha || params.desde || params.hasta),
  })
}

export function useAdminUsers() {
  return useQuery({
    queryKey: adminKeys.users,
    queryFn: () => adminApi.listarAdmins().then(unwrap),
    staleTime: 60_000,
  })
}

export function useAdminPreguntas(params: { cat?: string; dif?: string } = {}) {
  return useQuery({
    queryKey: adminKeys.preguntas(params),
    queryFn: () => adminApi.listarPreguntas(params).then(unwrap),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })
}

export function useAdminScoringConfig() {
  return useQuery({
    queryKey: adminKeys.scoringConfig,
    queryFn: () => adminApi.getScoringConfig().then(unwrap),
    staleTime: 5 * 60_000,
  })
}

export function useAdminMetrics(period: string = '24h') {
  return useQuery({
    queryKey: adminKeys.metrics(period),
    queryFn: () => adminApi.getMetrics(period).then(unwrap),
    staleTime: 60_000,
  })
}

export function useAdminIntegrationTokens() {
  return useQuery({
    queryKey: adminKeys.integrationTokens,
    queryFn: () => adminApi.listIntegrationTokens().then(unwrap),
    staleTime: 60_000,
  })
}

export function useAdminIntegrationTokenCalls(tokenId: string, limit = 100) {
  return useQuery({
    queryKey: adminKeys.integrationTokenCalls(tokenId, limit),
    queryFn: () => adminApi.getIntegrationTokenCalls(tokenId, limit).then(unwrap),
    staleTime: 30_000,
    enabled: !!tokenId,
  })
}

// Prefetch en hover desde el Sidebar — warmup de caché antes del click.
export function usePrefetchAdmin() {
  const qc = useQueryClient()
  return {
    stats: () => qc.prefetchQuery({
      queryKey: adminKeys.stats,
      queryFn: () => adminApi.getStats().then(unwrap),
      staleTime: 30_000,
    }),
    tramites: () => qc.prefetchQuery({
      queryKey: adminKeys.tramites({}),
      queryFn: async () => {
        const res = unwrap(await adminApi.listarTramites())
        return { items: res.items.map(adaptTramite), nextCursor: res.nextCursor }
      },
      staleTime: 10_000,
    }),
    licencias: () => qc.prefetchQuery({
      queryKey: adminKeys.licencias,
      queryFn: () => adminApi.listarLicencias().then(unwrap),
      staleTime: 5 * 60_000,
    }),
    users: () => qc.prefetchQuery({
      queryKey: adminKeys.users,
      queryFn: () => adminApi.listarAdmins().then(unwrap),
      staleTime: 60_000,
    }),
    preguntas: () => qc.prefetchQuery({
      queryKey: adminKeys.preguntas(),
      queryFn: () => adminApi.listarPreguntas().then(unwrap),
      staleTime: 60_000,
    }),
    scoringConfig: () => qc.prefetchQuery({
      queryKey: adminKeys.scoringConfig,
      queryFn: () => adminApi.getScoringConfig().then(unwrap),
      staleTime: 5 * 60_000,
    }),
  }
}
