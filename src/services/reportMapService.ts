import fraudData from '../../data/fraud_list.json'
import { getReportRecords } from '@/services/reportService'
import type { ReportRecord } from '@/types/report'

export interface ReportMapPoint {
  id: string
  name: string
  city: string
  address: string
  description: string
  status: string
  lng: number
  lat: number
  source: 'sample' | 'report'
  createdAt?: string
}

interface FraudDataItem {
  id: string
  name: string
  city: string
  address: string
  description: string
  status: string
  lng: number
  lat: number
}

function getReportCity(report: ReportRecord) {
  const parts = report.location.split('/').map(item => item.trim()).filter(Boolean)
  return parts[1] || parts[0] || '未知城市'
}

export async function getSubmittedReportPoints(): Promise<ReportMapPoint[]> {
  try {
    const reports = await getReportRecords()
    return reports
      .filter(report => Boolean(report.mapPoint))
      .map(report => ({
        id: report.id,
        name: report.name,
        city: getReportCity(report),
        address: report.mapAddress || report.address,
        description: report.description,
        status: report.status,
        lng: report.mapPoint!.lng,
        lat: report.mapPoint!.lat,
        source: 'report',
        createdAt: report.createdAt,
      }))
  } catch {
    return []
  }
}

export async function getSubmittedReportRows() {
  try {
    const reports = await getReportRecords()
    return reports.map(report => ({
      id: report.id,
      name: report.name,
      city: getReportCity(report),
      address: report.address,
      status: report.status,
      description: report.description,
      createdAt: report.createdAt,
      location: report.mapPoint,
    }))
  } catch {
    return []
  }
}

export async function getAllReportMapPoints(): Promise<ReportMapPoint[]> {
  const samplePoints = (fraudData as FraudDataItem[]).map(item => ({
    id: item.id,
    name: item.name,
    city: item.city,
    address: item.address,
    description: item.description,
    status: item.status,
    lng: item.lng,
    lat: item.lat,
    source: 'sample' as const,
  }))

  return [...await getSubmittedReportPoints(), ...samplePoints]
}
