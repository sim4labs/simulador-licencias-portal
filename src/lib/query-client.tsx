'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function AdminQueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 15 * 60_000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        retry: 1,
      },
    },
  }))

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
