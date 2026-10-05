import { RoleCode } from '../../../types/enums'

export interface NotificationItem {
  id: string
  category: 'ACTION_REQUIRED' | 'HANDOVER' | 'AI_SYSTEM' | 'FIELD_CREW'
  categoryLabel: string
  title: string
  message: string
  resourceType: 'REPAIR_PROPOSAL' | 'FIELD_TASK' | 'DEFECT' | 'SURVEY_MISSION' | 'ACCEPTANCE_DOSSIER'
  resourceId: string
  routeCode: string
  stationing: string
  sender: string
  senderRole: string
  recipientRole: RoleCode | 'ALL'
  priority: 'EMERGENCY' | 'HIGH' | 'NORMAL'
  slaHoursRemaining?: number // Số giờ còn lại trước khi vi phạm SLA
  slaType?: 'SLA-EMERG-2h' | 'SLA-FT-24h' | 'SLA-APPR-48h' | 'SLA-ACCEPT-72h'
  read: boolean
  occurredAt: string
  timeAgo: string
  actionUrl: string
  actionLabel: string
}

export type NotificationCategoryTab = 'ALL' | 'ACTION_REQUIRED' | 'HANDOVER' | 'AI_SYSTEM' | 'FIELD_CREW'

export type NotificationPriorityFilter = 'ALL' | 'EMERGENCY' | 'HIGH' | 'NORMAL'

export interface AudioModeConfig {
  emergencySiren: boolean
  slaChime: boolean
  handoverPing: boolean
}
