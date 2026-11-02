// ==========================================
// ROADGUARD FAST TRACK (W08) - DOMAIN TYPES
// 100% Theo quy chuẩn Spec 17_10 & OpenAPI Canonical
// ==========================================

export interface ProjectOption {
  id: string
  name: string
  projectCode: string
}

export interface DefectItem {
  id: string
  code: string
  projectId: string
  projectName?: string
  defectTypeCode: string
  severity: string
  status: string
  reportedAt?: string
  version?: string
  isFastTrackEligible: boolean
  violationReason?: string
  assignedCrew?: string
}

export interface PolicyThresholdConfig {
  id?: string
  version: string
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  maxAreaM2: number
  maxDepthCm: number
  allowedSeverities: string[]
  activatedBy: string
  activatedAt: string
  appliedRoute: string
  description: string
  defectTypeCode?: string
  stopConditions?: string[]
  revision?: number
}

export interface PolicyHistoryItem {
  id?: string
  version: string
  displayName?: string
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  activatedBy: string
  activatedAt: string
  route: string
  maxArea: number
  maxDepth: number
}

export interface CrewTeam {
  id: string
  name: string
  leader: string
  role?: string
  isAvailable: boolean
}

export interface AuditLogItem {
  time: string
  user: string
  hash: string
  note: string
  title: string
}

// ==========================================
// ROAD COVERAGE SCHEMAS (API-175, API-176 - SUP-08)
// ==========================================
export interface RoadCoverageInputDto {
  scopeObligationId: string
  expectedScopeHash?: string
  handoverDocumentId: string
  handoverVersion: string
  sourceKind: 'WARRANTY' | 'MAINTENANCE_BASIS'
  sourceId?: string
  sourceVersion?: string
  applicableFromUtc: string
  applicableToUtc: string
  provenance: 'REAL_SOURCE' | 'TEST_ONLY'
  reason: string
  supersedesId?: string
}

export interface RoadCoverageFact {
  projectId: string
  projectName: string
  scopeObligationId: string
  scopeHash?: string
  fromKm: number
  toKm: number
  sourceKind: 'WARRANTY' | 'MAINTENANCE_BASIS'
  hasWarrantySource?: boolean
  handoverDocumentId?: string
  handoverVersion: string
  documentNo?: string
  applicableFromUtc: string
  applicableToUtc: string
  status: 'CONFIRMED' | 'PENDING'
  confirmedBy?: string
  confirmedAt?: string
  reason?: string
  sourceId?: string
  sourceVersion?: string
  etag?: string
}

export interface DispatchPayload {
  defectIds: string[]
  crewName: string
  notes?: string
}
