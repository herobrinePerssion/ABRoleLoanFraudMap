export type ReportStatus = '审核中' | '驳回' | '审核通过'

export interface ReportUpdate {
  time: string
  content: string
  operator?: string
}

export interface ReportAttachment {
  id: string
  name: string
  size: number
  type: string
  url: string
}

export interface ReportRecord {
  id: string
  name: string
  location: string
  address: string
  description: string
  companyAddress?: string
  detailAddress?: string
  floorRoom?: string
  mapPoint?: {
    lng: number
    lat: number
  }
  mapAddress?: string
  legalPersonName?: string
  legalPersonId?: string
  legalPersonPhone?: string
  contactPhone?: string
  businessClues?: string
  photoNames?: string[]
  attachments?: ReportAttachment[]
  status: ReportStatus
  createdAt: string
  updates: ReportUpdate[]
}

export interface ReportFormData {
  name: string
  location: string[]
  address: string
  description: string
  companyAddress?: string
  detailAddress?: string
  floorRoom?: string
  mapPoint?: {
    lng: number
    lat: number
  } | null
  mapAddress?: string
  legalPersonName?: string
  legalPersonId?: string
  legalPersonPhone?: string
  contactPhone?: string
  businessClues?: string
  photoNames?: string[]
}
