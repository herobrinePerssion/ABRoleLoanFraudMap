export type ReportStatus = '待初审' | '处理中' | '已反馈'

export interface ReportUpdate {
  time: string
  content: string
  operator?: string
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
