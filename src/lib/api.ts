import { getCitizenIdToken } from './citizen-auth'
import { getAdminIdToken } from './admin-auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

type Pool = 'citizen' | 'admin' | 'public'

interface ApiOptions {
  method?: string
  body?: unknown
  pool?: Pool
  headers?: Record<string, string>
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  status: number
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, pool = 'public', headers = {} } = options

  const requestHeaders: Record<string, string> = {
    ...headers,
  }

  if (body) {
    requestHeaders['Content-Type'] = 'application/json'
  }

  if (pool !== 'public') {
    const token = pool === 'citizen'
      ? await getCitizenIdToken()
      : await getAdminIdToken()

    if (!token) {
      return { data: null, error: 'No autenticado', status: 401 }
    }
    requestHeaders['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (response.status === 204) {
      return { data: {} as T, error: null, status: 204 }
    }

    const data = await response.json()

    if (!response.ok) {
      return {
        data: null,
        error: data.message || data.error || `Error ${response.status}`,
        status: response.status,
      }
    }

    return { data, error: null, status: response.status }
  } catch (err) {
    console.error('[API]', endpoint, err)
    return {
      data: null,
      error: 'Error de conexión. Verifica tu internet',
      status: 0,
    }
  }
}
