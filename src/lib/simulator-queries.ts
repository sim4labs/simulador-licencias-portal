import { useQuery, useQueryClient, useMutation, useInfiniteQuery } from '@tanstack/react-query'
import { simulatorApi } from './simulator-api'
import type { ApiResponse } from './api'

export const simulatorKeys = {
  simulators: ['simulator', 'list'] as const,
  simulator: (id: string) => ['simulator', 'detail', id] as const,
  pcs: ['simulator', 'pcs'] as const,
  pc: (pcId: string) => ['simulator', 'pc', pcId] as const,
  pcLogs: (pcId: string) => ['pc-logs', pcId] as const,
  simulatorSessions: (id: string, params: { desde?: string; hasta?: string; resultado?: string }) =>
    ['simulator', 'sessions', id, params] as const,
  simulatorStats: (id: string) => ['simulator', 'stats', id] as const,
  unityBuilds: ['simulator', 'unity-builds'] as const,
  releaseNotes: (s3Key: string) => ['simulator', 'release-notes', s3Key] as const,
  buildTestPlan: (version: string) => ['simulator', 'build-test-plan', version] as const,
}

function unwrap<T>(res: ApiResponse<T>): T {
  if (res.error) throw new Error(res.error)
  if (res.data === null) throw new Error('Respuesta vacía')
  return res.data
}

export function useSimulators(options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: simulatorKeys.simulators,
    queryFn: () => simulatorApi.listSimulators().then(unwrap),
    staleTime: 30_000,
    refetchInterval: options?.refetchInterval,
  })
}

export function useCancelSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sessionId, reason }: { sessionId: string; reason?: string }) =>
      simulatorApi.cancelSession(sessionId, reason).then(unwrap),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: simulatorKeys.simulators })
    },
  })
}

export function useUpdatePC() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ pcId, body }: { pcId: string; body: { name?: string; environment?: string } }) =>
      simulatorApi.updatePC(pcId, body).then(unwrap),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: simulatorKeys.pcs })
      qc.invalidateQueries({ queryKey: simulatorKeys.pc(vars.pcId) })
      qc.invalidateQueries({ queryKey: simulatorKeys.simulators })
    },
  })
}

export function useSimulator(id: string | undefined) {
  return useQuery({
    queryKey: id ? simulatorKeys.simulator(id) : ['simulator', 'detail', 'pending'],
    queryFn: () => simulatorApi.getSimulator(id!).then(unwrap),
    enabled: !!id,
    staleTime: 10_000,
    refetchInterval: 15_000,
  })
}

export function useSimulatorPCs() {
  return useQuery({
    queryKey: simulatorKeys.pcs,
    queryFn: () => simulatorApi.listPCs().then(unwrap),
    staleTime: 30_000,
    refetchInterval: 30_000,
  })
}

export function useSimulatorPC(pcId: string | undefined, options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: pcId ? simulatorKeys.pc(pcId) : ['simulator', 'pc', 'pending'],
    queryFn: () => simulatorApi.getPC(pcId!).then(unwrap),
    enabled: !!pcId,
    staleTime: 10_000,
    refetchInterval: options?.refetchInterval ?? 10_000,
  })
}

export function useSimulatorSessions(
  simulatorId: string | undefined,
  params: { desde?: string; hasta?: string; resultado?: string } = {},
) {
  return useQuery({
    queryKey: simulatorId
      ? simulatorKeys.simulatorSessions(simulatorId, params)
      : ['simulator', 'sessions', 'pending'],
    queryFn: () => simulatorApi.getSimulatorSessions(simulatorId!, params).then(unwrap),
    enabled: !!simulatorId,
    staleTime: 30_000,
  })
}

export function useSimulatorStats(simulatorId: string | undefined) {
  return useQuery({
    queryKey: simulatorId ? simulatorKeys.simulatorStats(simulatorId) : ['simulator', 'stats', 'pending'],
    queryFn: () => simulatorApi.getSimulatorStats(simulatorId!).then(unwrap),
    enabled: !!simulatorId,
    staleTime: 60_000,
  })
}

export function usePCLogs(pcId: string | undefined) {
  return useInfiniteQuery({
    queryKey: pcId ? simulatorKeys.pcLogs(pcId) : ['pc-logs', 'pending'],
    queryFn: ({ pageParam }) =>
      simulatorApi
        .listPCLogs(pcId!, { limit: 50, continuationToken: pageParam || undefined })
        .then(unwrap),
    initialPageParam: '' as string,
    getNextPageParam: (lastPage) => lastPage.nextContinuationToken ?? undefined,
    enabled: !!pcId,
    staleTime: 30_000,
  })
}

export function useUnityBuilds() {
  return useQuery({
    queryKey: simulatorKeys.unityBuilds,
    queryFn: () => simulatorApi.listUnityBuilds().then(unwrap),
    staleTime: 30_000,
  })
}

/**
 * Lazy load del markdown completo de release notes.
 * `enabled` por default está en true cuando se pasa un s3Key — los call sites
 * pueden controlar el fetch pasando `enabled: open` para que solo dispare
 * cuando el modal está abierto.
 */
export function useReleaseNotes(s3Key: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: s3Key ? simulatorKeys.releaseNotes(s3Key) : ['simulator', 'release-notes', 'pending'],
    queryFn: () => simulatorApi.getReleaseNotes(s3Key!).then(unwrap),
    enabled: !!s3Key && options?.enabled !== false,
    staleTime: 5 * 60_000, // 5 min — release notes son inmutables tras publicar
  })
}

/**
 * Lazy load del test plan de un build (items + state DDB + compareUrl).
 * 404 cuando el build no tiene `test-plan.json` en S3 — el modal degrada
 * a no mostrar la sección. `enabled` controla el fetch (típicamente `open`
 * del Dialog).
 */
export function useBuildTestPlan(version: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: version ? simulatorKeys.buildTestPlan(version) : ['simulator', 'build-test-plan', 'pending'],
    queryFn: () => simulatorApi.getBuildTestPlan(version!).then(unwrap),
    enabled: !!version && options?.enabled !== false,
    staleTime: 30_000,
    retry: (failureCount, err) => {
      // No reintentar 404 — la versión genuinamente no tiene test plan registrado
      if (err instanceof Error && /\b404\b|not found|no encontrad|no hay test plan/i.test(err.message)) return false
      return failureCount < 2
    },
  })
}

/**
 * Toggle de un test plan item con optimistic update.
 * El backend valida que el itemId exista en `test-plan.json` (cache 5min en
 * Lambda) y atribuye al usuario del JWT.
 */
export function useToggleTestPlanItem(version: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, checked }: { itemId: string; checked: boolean }) =>
      simulatorApi.toggleTestPlanItem(version, itemId, checked).then(unwrap),
    onMutate: async ({ itemId, checked }) => {
      const key = simulatorKeys.buildTestPlan(version)
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<{ items: { id: string; checked: boolean }[] }>(key)
      if (prev) {
        qc.setQueryData(key, {
          ...prev,
          items: prev.items.map(it => it.id === itemId ? { ...it, checked } : it),
        })
      }
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(simulatorKeys.buildTestPlan(version), ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: simulatorKeys.buildTestPlan(version) })
    },
  })
}

export function usePrefetchSimulator() {
  const qc = useQueryClient()
  return {
    simulators: () => qc.prefetchQuery({
      queryKey: simulatorKeys.simulators,
      queryFn: () => simulatorApi.listSimulators().then(unwrap),
      staleTime: 30_000,
    }),
    pcs: () => qc.prefetchQuery({
      queryKey: simulatorKeys.pcs,
      queryFn: () => simulatorApi.listPCs().then(unwrap),
      staleTime: 30_000,
    }),
    unityBuilds: () => qc.prefetchQuery({
      queryKey: simulatorKeys.unityBuilds,
      queryFn: () => simulatorApi.listUnityBuilds().then(unwrap),
      staleTime: 30_000,
    }),
  }
}
