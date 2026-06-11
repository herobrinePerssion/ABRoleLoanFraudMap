import type { ReportStatus } from '@/types/report'

export const REPORT_STORAGE_KEY = 'ab-fraud-report-records'

export const REPORT_STATUS_STEP_INDEX: Record<ReportStatus, number> = {
  审核中: 1,
  驳回: 2,
  审核通过: 3,
}

export const REPORT_STATUS_TAG_TYPE: Record<ReportStatus, 'info' | 'warning' | 'success' | 'danger'> = {
  审核中: 'warning',
  驳回: 'danger',
  审核通过: 'success',
}
