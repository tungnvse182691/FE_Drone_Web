import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storageHelper'

export interface IncidentCaseItem {
  id: string
  code: string
  source: 'CITIZEN' | 'PATROL' | 'HOTLINE'
  source_label: string
  reporter_name: string
  reporter_phone: string
  created_at: string
  stationing: string
  lane: string
  project_id: string
  project_name: string
  defect_title: string
  description: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'PENDING' | 'TRIAGED' | 'VERIFIED' | 'REJECTED' | 'NEED_SURVEY'
  image_url: string
  gps: { lat: number; lng: number }
  ai_confidence: number
  ai_detected_type: string
  merged_into_id?: string
  merged_count?: number
  is_master?: boolean
  conclusion?: 'DEFECT_FOUND' | 'NO_DEFECT' | 'OUT_OF_SCOPE'
  conclusion_reason?: string
  pm_notes?: string
  published_to_citizen?: boolean
  published_at?: string
  survey_assignment?: {
    mode: 'MEASURE_ONLY' | 'DRONE_RESURVEY'
    reason: string
    assigned_crew: string
    sla_hours: number
    created_at: string
  }
}

export const triageService = {
  getCases(): IncidentCaseItem[] {
    return getFromStorage<IncidentCaseItem[]>(STORAGE_KEYS.TRIAGE_CASES, [])
  },

  saveCases(cases: IncidentCaseItem[]): void {
    saveToStorage(STORAGE_KEYS.TRIAGE_CASES, cases)
  },

  updateCase(caseId: string, updates: Partial<IncidentCaseItem>): IncidentCaseItem | null {
    const list = this.getCases()
    let updatedItem: IncidentCaseItem | null = null
    const updated = list.map((c) => {
      if (c.id === caseId || c.code === caseId) {
        updatedItem = { ...c, ...updates }
        return updatedItem
      }
      return c
    })
    if (updatedItem) {
      this.saveCases(updated)
    }
    return updatedItem
  }
}
