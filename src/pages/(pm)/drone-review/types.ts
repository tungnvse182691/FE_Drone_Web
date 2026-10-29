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
  isRecurrent?: boolean
  priorDefectCode?: string
  recurrenceReason?: string
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
  // Canonical Backend Candidate3 fields (AiCandidateFactsV1 & CandidateDecisionResponseDto)
  projectId?: string
  runId?: string
  datasetVersionId?: string
  modelVersionId?: string
  fixtureVersion?: string
  sourceVideoFileId?: string
  frameFileId?: string
  frameFileVersion?: string
  frameSha256?: string
  frameSizeBytes?: number
  frameMediaType?: string
  timestampMs?: number
  rawTypeCode?: 'CRACK' | 'POTHOLE' | string
  rawBbox?: { x: number; y: number; width: number; height: number }
  routeVersionId?: string
  segmentSetId?: string
  segmentId?: string | null
  geometryVersion?: string
  positionStatus?: string
  sourceVersion?: string
  disposition?: { decisionId: string; version: string } | null
  decisionKind?: 'KEEP_NEW' | 'LINK_EXISTING' | 'REJECT' | null
  defectId?: string | null
}
