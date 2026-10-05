export type ItemApprovalStatus =
  | 'APPROVED'
  | 'REQUEST_EVIDENCE'
  | 'REQUEST_RECONSIDER'
  | 'REJECTED'
  | 'PENDING'

export interface RepairItemDetail {
  id: string
  item_code: string
  defect_code: string
  chainage: string
  lane_info: string
  defect_title: string
  defect_measurements: string
  solution_title: string
  solution_standard: string
  volume_display: string
  volume_sub: string
  area_m2: number
  status: ItemApprovalStatus
  status_label: string
  assigned_crew: string
  supervisor_notes?: string
  evidence_directives?: string[]
  feedback_type?: 'EVIDENCE' | 'RECONSIDER' | 'REJECT'
  image_url: string
  ortho_code: string
  gps_coords: string
  resolution: string
}

export const CREW_OPTIONS = [
  'Tổ thi công Asphalt 01',
  'Đội cơ giới Sửa chữa 02',
  'Đội bảo dưỡng Thường xuyên',
  'Tổ vá dặm cơ động Hoàng Hải'
]
