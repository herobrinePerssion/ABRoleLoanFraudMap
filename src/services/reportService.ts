import { REPORT_STORAGE_KEY } from '@/constants/report'
import type { ReportFormData, ReportRecord } from '@/types/report'

export function normalizeReportId(id: string) {
  return id.trim().toUpperCase()
}

export function generateReportId(date = new Date()) {
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const random = Math.floor(1000 + Math.random() * 9000)
  return `AB-${stamp}-${random}`
}

export function getReportRecords() {
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

export function saveReportRecord(record: ReportRecord) {
  const list = getReportRecords()
  list.unshift(record)
  localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(list))
}

export function findReportById(id: string) {
  const reportId = normalizeReportId(id)
  if (!reportId) {
    return null
  }

  const list = getReportRecords()
  return list.find((item) => item.id === reportId) || null
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
    status: '待初审',
    createdAt: now.toISOString(),
    updates: [
      {
        time: now.toLocaleString(),
        content: '线索已提交，等待初审。请保留证据材料原件。',
      },
    ],
  }
}
