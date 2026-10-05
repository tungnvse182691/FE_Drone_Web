export interface AIDetectionItem {
  id: string
  code: string
  stationing: string
  lane: string
  type: string
  severityLevel: string
  confidence: number
  description: string
  metrics: {
    area?: string
    depth?: string
    length?: string
    crackWidth?: string
    reviewer?: string
    dismissReason?: string
  }
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  defectCode?: string
  kmValue: number
  bbox: {
    top: string
    left: string
    width: string
    height: string
    label: string
    dims: string
    borderColor: string
    isDashed?: boolean
  }
}
