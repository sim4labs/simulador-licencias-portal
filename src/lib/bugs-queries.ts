import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bugsApi, type BugListItem, type BugDetail, type BugOrigin } from './bugs-api'
import type { ApiResponse } from './api'

export const bugsKeys = {
  list: (state: 'open' | 'closed' | 'all') => ['bugs', 'list', state] as const,
  detail: (owner: string, repo: string, number: number) =>
    ['bugs', 'detail', owner, repo, number] as const,
}

function unwrap<T>(res: ApiResponse<T>): T {
  if (res.error) throw new Error(res.error)
  if (res.data === null) throw new Error('Respuesta vacía')
  return res.data
}

export function useBugsList(state: 'open' | 'closed' | 'all' = 'all') {
  return useQuery({
    queryKey: bugsKeys.list(state),
    queryFn: async (): Promise<BugListItem[]> => {
      const res = unwrap(await bugsApi.list(state))
      return res.bugs
    },
    staleTime: 30_000,
  })
}

export function useBugDetail(owner: string, repo: string, number: number) {
  return useQuery({
    queryKey: bugsKeys.detail(owner, repo, number),
    queryFn: async (): Promise<BugDetail> => unwrap(await bugsApi.detail(owner, repo, number)),
    staleTime: 30_000,
    enabled: !!owner && !!repo && Number.isFinite(number),
  })
}

export function useCreateBug() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: {
      origin: BugOrigin
      title: string
      description: string
      imageUrls?: string[]
    }) => unwrap(await bugsApi.create(body)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bugs', 'list'] })
    },
  })
}

export function useAddBugComment(owner: string, repo: string, number: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: string) => unwrap(await bugsApi.comment(owner, repo, number, body)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bugsKeys.detail(owner, repo, number) })
      qc.invalidateQueries({ queryKey: ['bugs', 'list'] })
    },
  })
}

export function useVerifyBug(owner: string, repo: string, number: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (note?: string) => unwrap(await bugsApi.verify(owner, repo, number, note)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bugsKeys.detail(owner, repo, number) })
      qc.invalidateQueries({ queryKey: ['bugs', 'list'] })
    },
  })
}
