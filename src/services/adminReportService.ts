import type { ReportRecord, ReportStatus } from '@/types/report'

const API_BASE = import.meta.env.VITE_REPORT_API_BASE || ''
const ADMIN_ACCOUNT_STORAGE_KEY = 'ab-fraud-admin-account'

export interface AdminAccount {
  username: string
  password: string
}

function getApiUrl(path: string) {
  return `${API_BASE}${path}`
}

export function getAdminAccount(): AdminAccount {
  try {
    const raw = localStorage.getItem(ADMIN_ACCOUNT_STORAGE_KEY)
    return raw ? JSON.parse(raw) as AdminAccount : { username: 'abRoleAdmin', password: '' }
  } catch {
    return { username: 'abRoleAdmin', password: '' }
  }
}

export function saveAdminAccount(account: AdminAccount) {
  localStorage.setItem(ADMIN_ACCOUNT_STORAGE_KEY, JSON.stringify({
    username: account.username.trim(),
    password: account.password,
  }))
}

export function clearAdminAccount() {
  localStorage.removeItem(ADMIN_ACCOUNT_STORAGE_KEY)
}

async function adminRequest<T>(path: string, account: AdminAccount, init?: RequestInit): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-username': account.username,
      'x-admin-password': account.password,
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
  account: AdminAccount
  status?: ReportStatus | ''
  keyword?: string
}) {
  const search = new URLSearchParams()
  if (params.status) search.set('status', params.status)
  if (params.keyword?.trim()) search.set('keyword', params.keyword.trim())

  const query = search.toString()
  return adminRequest<{ items: ReportRecord[] }>(
    `/api/reports/admin${query ? `?${query}` : ''}`,
    params.account
  )
}

export async function reviewReport(params: {
  account: AdminAccount
  id: string
  status: ReportStatus
  feedback?: string
}) {
  return adminRequest<ReportRecord>(
    `/api/reports/admin/${encodeURIComponent(params.id)}`,
    params.account,
    {
      method: 'PATCH',
      body: JSON.stringify({
        status: params.status,
        feedback: params.feedback,
      }),
    }
  )
}

export async function deleteReport(params: {
  account: AdminAccount
  id: string
}) {
  return adminRequest<{ ok: boolean; id: string }>(
    `/api/reports/admin/${encodeURIComponent(params.id)}`,
    params.account,
    {
      method: 'DELETE',
    }
  )
}
