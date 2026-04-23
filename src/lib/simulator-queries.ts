import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { simulatorApi } from './simulator-api'
import type { ApiResponse } from './api'

export const simulatorKeys = {
  simulators: ['simulator', 'list'] as const,
  simulator: (id: string) => ['simulator', 'detail', id] as const,
  pcs: ['simulator', 'pcs'] as const,
  pc: (pcId: string) => ['simulator', 'pc', pcId] as const,
  simulatorSessions: (id: string, params: { desde?: string; hasta?: string; resultado?: string }) =>
    ['simulator', 'sessions', id, params] as const,
  simulatorStats: (id: string) => ['simulator', 'stats', id] as const,
  unityBuilds: ['simulator', 'unity-builds'] as const,
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

export function useUnityBuilds() {
  return useQuery({
    queryKey: simulatorKeys.unityBuilds,
    queryFn: () => simulatorApi.listUnityBuilds().then(unwrap),
    staleTime: 30_000,
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
