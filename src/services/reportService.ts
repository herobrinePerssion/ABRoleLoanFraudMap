import { REPORT_STORAGE_KEY } from '@/constants/report'
import type { ReportFormData, ReportRecord } from '@/types/report'

const API_BASE = import.meta.env.VITE_REPORT_API_BASE || ''

export function normalizeReportId(id: string) {
  return id.trim().toUpperCase()
}

export function generateReportId(date = new Date()) {
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const random = Math.floor(1000 + Math.random() * 9000)
  return `AB-${stamp}-${random}`
}

function getApiUrl(path: string) {
  return `${API_BASE}${path}`
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.message || 'request failed')
  }

  return data as T
}

async function requestFormJson<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    method: 'POST',
    body: formData,
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.message || 'request failed')
  }

  return data as T
}

export function getLocalReportRecords() {
  const raw = localStorage.getItem(REPORT_STORAGE_KEY)
  if (!raw) {
    return [] as ReportRecord[]
  }

  try {
    return JSON.parse(raw) as ReportRecord[]
  } catch {
    throw new Error('举报数据读取失败，请稍后重试')
  }
}

export function saveLocalReportRecord(record: ReportRecord) {
  const list = getLocalReportRecords()
  const nextList = [record, ...list.filter(item => item.id !== record.id)]
  localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(nextList))
}

export function findLocalReportById(id: string) {
  const reportId = normalizeReportId(id)
  if (!reportId) {
    return null
  }

  return getLocalReportRecords().find((item) => item.id === reportId) || null
}

export function createReportRecord(payload: ReportFormData): ReportRecord {
  const now = new Date()
  const id = generateReportId(now)

  return {
    id,
    name: payload.name.trim(),
    location: payload.location.join(' / '),
    address: payload.address.trim(),
    description: payload.description.trim(),
    companyAddress: payload.companyAddress?.trim(),
    detailAddress: payload.detailAddress?.trim(),
    floorRoom: payload.floorRoom?.trim(),
    mapPoint: payload.mapPoint || undefined,
    mapAddress: payload.mapAddress?.trim(),
    legalPersonName: payload.legalPersonName?.trim(),
    legalPersonId: payload.legalPersonId?.trim(),
    legalPersonPhone: payload.legalPersonPhone?.trim(),
    contactPhone: payload.contactPhone?.trim(),
    businessClues: payload.businessClues?.trim(),
    photoNames: payload.photoNames || [],
    attachments: [],
    status: '待初审' as ReportRecord['status'],
    createdAt: now.toISOString(),
    updates: [
      {
        time: now.toLocaleString(),
        content: '线索已提交，等待初审。请保留证据材料原件。',
      },
    ],
  }
}

export async function uploadReportFiles(reportId: string, files: File[]) {
  if (!files.length) {
    return null
  }

  const formData = new FormData()
  files.forEach(file => formData.append('files', file))

  const record = await requestFormJson<ReportRecord>(
    `/api/reports/${encodeURIComponent(reportId)}/files`,
    formData
  )
  saveLocalReportRecord(record)
  return record
}

export async function submitReport(payload: ReportFormData, files: File[] = []) {
  try {
    let record = await requestJson<ReportRecord>('/api/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if (files.length) {
      try {
        record = await uploadReportFiles(record.id, files) || record
      } catch {
        record = {
          ...record,
          photoNames: payload.photoNames || [],
        }
      }
    }

    saveLocalReportRecord(record)
    return record
  } catch {
    const record = createReportRecord(payload)
    saveLocalReportRecord(record)
    return record
  }
}

export async function getReportRecords() {
  try {
    const data = await requestJson<{ items: ReportRecord[] }>('/api/reports')
    data.items.forEach(saveLocalReportRecord)
    return data.items
  } catch {
    return getLocalReportRecords()
  }
}

export async function findReportById(id: string) {
  const reportId = normalizeReportId(id)
  if (!reportId) {
    return null
  }

  try {
    const record = await requestJson<ReportRecord>(`/api/reports/${encodeURIComponent(reportId)}`)
    saveLocalReportRecord(record)
    return record
  } catch {
    return findLocalReportById(reportId)
  }
}
