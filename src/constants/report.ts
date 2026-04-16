import type { ReportStatus } from '@/types/report'

export const REPORT_STORAGE_KEY = 'ab-fraud-report-records'

export const REPORT_STATUS_STEP_INDEX: Record<ReportStatus, number> = {
  待初审: 1,
  处理中: 2,
  已反馈: 3,
}

export const REPORT_STATUS_TAG_TYPE: Record<ReportStatus, 'info' | 'warning' | 'success'> = {
  待初审: 'info',
  处理中: 'warning',
  已反馈: 'success',
}
