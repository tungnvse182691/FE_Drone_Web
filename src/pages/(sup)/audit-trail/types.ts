export type TimeFilter = '24h' | '7d' | '30d' | 'all'
export type ExportFormat = 'PDF' | 'CSV'

export interface ImageModalData {
  url: string
  caption: string
  captured_at: string
  gps_coordinates: string
}

export interface AuditProjectOption {
  id: string
  name: string
  code: string
}

export interface CalculatedStats {
  total_events: number
  state_transitions: number
  approval_decisions: number
}
