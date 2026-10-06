import { ProposalWorkPackage } from '../../../types/domain'

export type { ProposalWorkPackage }

export interface UnassignedDefectItem {
  id: string
  code: string
  title: string
  stationing: string
  lane_detail: string
  severity_label: string
  selected: boolean
  area_m2: number
  depth_cm: number
}

export interface RouteSegmentOption {
  id: string
  code: string
  name: string
  chainage_start?: string
  chainage_end?: string
  chainage_display?: string
  startKm?: number
  endKm?: number
}

export interface RouteOption {
  id: string
  name: string
  code: string
  segments: RouteSegmentOption[]
}


