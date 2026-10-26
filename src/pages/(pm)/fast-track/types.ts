import { PolicyThresholdConfig } from '../../../types/domain'

export type { PolicyThresholdConfig }

export interface RouteConfig {
  id: string
  name: string
  code: string
  stationRange: string
  center: [number, number]
  zoom: number
  coords: [number, number][]
}

export interface DefectItem {
  id: string
  code: string
  routeId: string
  routeName?: string
  stationing: string
  kmValue: number
  lane: string
  type: string
  areaM2: number
  depthCm: number
  isFastTrackEligible: boolean
  violationReason?: string
  assignedCrew: string
  gps: { lat: number; lng: number }
  image: string
  aiConfidence: number
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
  maxPerimeter?: number
  slaHours: number
}

export type WorkMode = 'MEASURE_ONLY' | 'INSPECT_AND_REPAIR' | 'EMERGENCY'

export interface CrewTeam {
  id: string
  name: string
  leader: string
  memberCount: number
  equipment: string
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
  fromKm: number
  toKm: number
  sourceKind: 'WARRANTY' | 'MAINTENANCE_BASIS'
  handoverVersion: string
  applicableFromUtc: string
  applicableToUtc: string
  status: 'CONFIRMED' | 'PENDING'
  confirmedBy?: string
  confirmedAt?: string
  reason?: string
}
