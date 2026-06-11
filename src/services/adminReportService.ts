import type { ReportRecord, ReportStatus } from '@/types/report'

const API_BASE = import.meta.env.VITE_REPORT_API_BASE || ''
const ADMIN_TOKEN_STORAGE_KEY = 'ab-fraud-admin-token'

function getApiUrl(path: string) {
  return `${API_BASE}${path}`
}

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || ''
}

export function saveAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token.trim())
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY)
}

async function adminRequest<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.message || 'admin request failed')
  }

  return data as T
}

export async function getAdminReports(params: {
  token: string
  status?: ReportStatus | ''
  keyword?: string
}) {
  const search = new URLSearchParams()
  if (params.status) search.set('status', params.status)
  if (params.keyword?.trim()) search.set('keyword', params.keyword.trim())

  const query = search.toString()
  return adminRequest<{ items: ReportRecord[] }>(
    `/api/reports/admin${query ? `?${query}` : ''}`,
    params.token
  )
}

export async function reviewReport(params: {
  token: string
  id: string
  status: ReportStatus
  feedback?: string
}) {
  return adminRequest<ReportRecord>(
    `/api/reports/admin/${encodeURIComponent(params.id)}`,
    params.token,
    {
      method: 'PATCH',
      body: JSON.stringify({
        status: params.status,
        feedback: params.feedback,
      }),
    }
  )
}
