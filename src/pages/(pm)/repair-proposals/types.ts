import { ProposalWorkPackage, RepairItemDetail } from '../../../types/domain'

export type { ProposalWorkPackage, RepairItemDetail }
export interface ProposalCreateApi {fields:{mode:'NORMAL'|'FAST_TRACK';fromMeters:string;toMeters:string;offsetFromMeters:string;offsetToMeters:string;checklistVersion:string};onChange:(key:keyof ProposalCreateApi['fields'],value:string)=>void;error:string;busy:boolean;locked:boolean;onResumeOriginal?:()=>void}

export interface UnassignedDefectItem {
  id: string
  code: string
  title: string
  defect_type_code?: string
  stationing?: string
  lane_detail?: string
  severity?: string
  severity_label?: string
  status?: string
  status_label?: string
  version?: string
  selected: boolean
  area_m2: number
  depth_cm: number
  length_m?: number
  custom_solution?: string
  standard?: string
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


