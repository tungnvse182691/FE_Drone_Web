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
  defectId?: string
  packageId?: string
  itemId?: string
  obligationId?: string
  canAssign?: boolean
  eligibilityKnown?: boolean
  policyRevisionId?: string
  isFastTrackEligible: boolean
  violationReason?: string
  assignedCrewId?: string
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
  rules?: Array<{code: string; unit: string; minimum: number; maximum: number}>
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
  history?: Array<{id:string;actorId:string;confirmedAtUtc:string;reason:string;provenance:string}>
  provenance?: string
  blockers?: string[]
  scopes?: Array<{obligationId: string; roadSectionId: string; locationVersion?: string; from: number; to: number; offsetFrom: number; offsetTo: number; scopeHash: string}>
  sources?: Array<{kind: string; id: string; version: string; from?: string; to?: string; provenance?: string}>
  etag?: string
}

export interface FastTrackTaskInput {
  sourceKind: string; surveyId: string | null; segmentSetId: string | null; layoutRevisionId: string | null; slabId: string | null
  mapPublicationId: string | null; crsProfileRevisionId: string | null
  requiredMeasurementType: number; measurementScope: string; dueAt: string; policyRevisionId: string
}

export interface DispatchPayload {
  projectId: string
  items: DefectItem[]
  task: FastTrackTaskInput
  defectIds: string[]
  crewName: string
  notes?: string
}
