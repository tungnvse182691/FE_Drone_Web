export interface Segment {
  code: string
  stationing: string
  length_km: number
  status_label: string
  status_type: 'GOOD' | 'WARNING' | 'REPAIRING' | 'NORMAL' | 'MONITORING'
  open_defects: string
  defects_count: number
}

export interface ProjectMember {
  id: string
  name: string
  role_code: 'SUPERVISOR' | 'PM' | 'CREW_LEAD' | 'DRONE_PILOT'
  role_title: string
  role_badge: string
  avatar: string
  is_online?: boolean
  authority: string
  contact: string
  equipment?: string
  unit: string
}
