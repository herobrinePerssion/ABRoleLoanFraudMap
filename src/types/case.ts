export type CaseRiskLevel = '高' | '中' | '低'
export type CaseProgress = '待核验' | '立案中' | '已判决'

export interface FraudCase {
  id: string
  title: string
  city: string
  region: string
  scamType: string
  riskLevel: CaseRiskLevel
  progress: CaseProgress
  amountLoss: number
  publishedAt: string
  updatedAt: string
  summary: string
  pattern: string[]
  warningSignals: string[]
  suggestions: string[]
  timeline: Array<{ time: string; event: string }>
  sourceName: string
  sourceUrl: string
  credibility: '高' | '中'
}
