const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export const CURP_RE = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/

export interface IntegrationHealth {
  status: 'ok' | 'degraded' | 'unknown'
  environment?: string
  timestamp?: string
  checks?: {
    dynamodb?: { ok: boolean; latencyMs: number | null }
  }
  responseMs?: number
  httpStatus: number
}

export async function fetchIntegrationHealth(): Promise<IntegrationHealth> {
  try {
    const res = await fetch(`${API_BASE_URL}/integration/health`, { cache: 'no-store' })
    const text = await res.text()
    let body: Record<string, unknown> = {}
    try { body = JSON.parse(text) } catch { /* ignore */ }
    return {
      status: (body.status as 'ok' | 'degraded') || (res.ok ? 'ok' : 'degraded'),
      environment: body.environment as string | undefined,
      timestamp: body.timestamp as string | undefined,
      checks: body.checks as IntegrationHealth['checks'],
      responseMs: body.responseMs as number | undefined,
      httpStatus: res.status,
    }
  } catch {
    return { status: 'unknown', httpStatus: 0 }
  }
}

export interface IntegrationProbeResult {
  httpStatus: number
  elapsedMs: number
  body: unknown
  rawBody: string
  error?: string
}

export async function probeIntegrationTramite(params: {
  token: string
  curp: string
}): Promise<IntegrationProbeResult> {
  const started = performance.now()
  try {
    const res = await fetch(`${API_BASE_URL}/integration/tramites/${params.curp}`, {
      headers: { Authorization: `Bearer ${params.token}` },
      cache: 'no-store',
    })
    const rawBody = await res.text()
    let body: unknown = rawBody
    try { body = JSON.parse(rawBody) } catch { /* keep raw */ }
    return { httpStatus: res.status, elapsedMs: Math.round(performance.now() - started), body, rawBody }
  } catch (err) {
    return {
      httpStatus: 0,
      elapsedMs: Math.round(performance.now() - started),
      body: null,
      rawBody: '',
      error: err instanceof Error ? err.message : 'Error de red',
    }
  }
}

export function integrationApiBase(): string {
  return API_BASE_URL
}
