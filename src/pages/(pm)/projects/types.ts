import { HubProject } from '../../../types/domain'

export type { HubProject }

export type ProjectFilterTab = 'ALL' | 'ACTIVE' | 'NEAR_EXPIRY' | 'PENDING_ALIGNMENT' | 'CLOSED'

export type ProjectViewMode = 'grid' | 'table'

export interface ProjectKpiStats {
  totalLength: string
  activeCount: number
  nearExpiryCount: number
  pendingAlignmentCount: number
  closedCount: number
}
