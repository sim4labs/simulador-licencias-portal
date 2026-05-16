import { apiRequest } from './api'

export type BugOrigin = 'portal-admin' | 'portal-ciudadano' | 'simulador-manejo'
export type BugStatus = 'open' | 'awaiting-verification' | 'verified'

export interface BugListItem {
  owner: string
  repo: string
  number: number
  title: string
  status: BugStatus
  origin: BugOrigin | null
  state: 'open' | 'closed'
  url: string
  createdAt: string
  updatedAt: string
  closedAt: string | null
  commentsCount: number
  authorLogin: string
}

export interface BugComment {
  id: number
  author: { login: string; avatarUrl?: string }
  body: string
  createdAt: string
  updatedAt: string
}

export interface BugEvent {
  event: string
  actor: { login: string; avatarUrl?: string } | null
  createdAt: string
  label?: string
  assignee?: string
  rename?: { from: string; to: string }
  source?: { number: number; title: string; url: string }
}

export interface BugDetail {
  owner: string
  repo: string
  number: number
  title: string
  body: string
  state: 'open' | 'closed'
  status: BugStatus
  origin: BugOrigin | null
  labels: string[]
  url: string
  createdAt: string
  updatedAt: string
  closedAt: string | null
  author: { login: string; avatarUrl?: string }
  assignees: Array<{ login: string; avatarUrl?: string }>
  comments: BugComment[]
  events: BugEvent[]
}

export interface CreatedBug {
  owner: string
  repo: string
  number: number
  url: string
  status: BugStatus
  title: string
  origin: BugOrigin
  createdAt: string
}

export interface UploadUrlResponse {
  uploadUrl: string
  publicUrl: string
  key: string
  expiresIn: number
}

export interface BugListFailure {
  repo: string
  status?: number
  message: string
}

export const bugsApi = {
  list(state: 'open' | 'closed' | 'all' = 'all') {
    return apiRequest<{ bugs: BugListItem[]; failures?: BugListFailure[] }>(
      `/admin/bugs?state=${state}`,
      { pool: 'admin' },
    )
  },

  detail(owner: string, repo: string, number: number) {
    return apiRequest<BugDetail>(`/admin/bugs/${owner}/${repo}/${number}`, { pool: 'admin' })
  },

  create(body: { origin: BugOrigin; title: string; description: string; imageUrls?: string[] }) {
    return apiRequest<CreatedBug>('/admin/bugs', { method: 'POST', body, pool: 'admin' })
  },

  comment(owner: string, repo: string, number: number, body: string) {
    return apiRequest<BugComment>(
      `/admin/bugs/${owner}/${repo}/${number}/comments`,
      { method: 'POST', body: { body }, pool: 'admin' },
    )
  },

  verify(owner: string, repo: string, number: number, note?: string) {
    return apiRequest<{ owner: string; repo: string; number: number; state: string; status: BugStatus; closedAt: string }>(
      `/admin/bugs/${owner}/${repo}/${number}/verify`,
      { method: 'POST', body: note ? { note } : {}, pool: 'admin' },
    )
  },

  uploadUrl(contentType: string) {
    return apiRequest<UploadUrlResponse>('/admin/bugs/upload-url', {
      method: 'POST',
      body: { contentType },
      pool: 'admin',
    })
  },
}

// Uploads a File to S3 via presigned PUT. Returns the public CDN URL.
export async function uploadBugImage(file: File): Promise<string> {
  const presign = await bugsApi.uploadUrl(file.type)
  if (presign.error || !presign.data) {
    throw new Error(presign.error ?? 'No se pudo solicitar URL de subida')
  }
  const putRes = await fetch(presign.data.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  if (!putRes.ok) {
    throw new Error(`Subida falló: ${putRes.status}`)
  }
  return presign.data.publicUrl
}
