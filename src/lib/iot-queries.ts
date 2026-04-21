import { useQuery, useQueryClient } from '@tanstack/react-query'
import { iotApi } from './iot-api'
import type { ApiResponse } from './api'

export const iotKeys = {
  devices: ['iot', 'devices'] as const,
  device: (thingName: string) => ['iot', 'device', thingName] as const,
  firmware: ['iot', 'firmware'] as const,
  jobs: (status?: string) => ['iot', 'jobs', status ?? 'all'] as const,
  job: (jobId: string) => ['iot', 'job', jobId] as const,
  stats: ['iot', 'stats'] as const,
}

function unwrap<T>(res: ApiResponse<T>): T {
  if (res.error) throw new Error(res.error)
  if (res.data === null) throw new Error('Respuesta vacía')
  return res.data
}

export function useIotDevices() {
  return useQuery({
    queryKey: iotKeys.devices,
    queryFn: () => iotApi.listDevices().then(unwrap),
    staleTime: 10_000,
    refetchInterval: 30_000,
  })
}

export function useIotDevice(thingName: string | undefined) {
  return useQuery({
    queryKey: thingName ? iotKeys.device(thingName) : ['iot', 'device', 'pending'],
    queryFn: () => iotApi.getDevice(thingName!).then(unwrap),
    enabled: !!thingName,
    staleTime: 5_000,
    refetchInterval: 15_000,
  })
}

export function useIotFirmware() {
  return useQuery({
    queryKey: iotKeys.firmware,
    queryFn: async () => {
      const res = await iotApi.listFirmware()
      if (res.error) throw new Error(res.error)
      return res.data
    },
    staleTime: 60_000,
  })
}

export function useIotJobs(status?: string) {
  return useQuery({
    queryKey: iotKeys.jobs(status),
    queryFn: () => iotApi.listJobs(status).then(unwrap),
    staleTime: 10_000,
    refetchInterval: 30_000,
  })
}

export function useIotStats() {
  return useQuery({
    queryKey: iotKeys.stats,
    queryFn: async () => {
      const res = await iotApi.getStats()
      if (res.error) throw new Error(res.error)
      if (!res.data) throw new Error('Respuesta vacía')
      return res.data
    },
    staleTime: 10_000,
    refetchInterval: 30_000,
  })
}

export function usePrefetchIot() {
  const qc = useQueryClient()
  return {
    devices: () => qc.prefetchQuery({
      queryKey: iotKeys.devices,
      queryFn: () => iotApi.listDevices().then(unwrap),
      staleTime: 10_000,
    }),
    firmware: () => qc.prefetchQuery({
      queryKey: iotKeys.firmware,
      queryFn: async () => {
        const res = await iotApi.listFirmware()
        if (res.error) throw new Error(res.error)
        return res.data
      },
      staleTime: 60_000,
    }),
  }
}
