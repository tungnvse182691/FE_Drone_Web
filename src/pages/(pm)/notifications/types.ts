import { RoleCode } from '../../../types/enums'

/** Thông báo = NotificationDto (BE): id, message, resourceId, read, occurredAt, version, priority (HIGH/NORMAL/UNKNOWN do máy chủ tính theo hạn bắt buộc). */
export interface NotificationItem {
  id: string
  category: 'UNKNOWN'
  categoryLabel: string
  title: string
  message: string
  resourceType: 'UNKNOWN'
  resourceId: string
  routeCode: string
  stationing: string
  sender: string
  senderRole: string
  recipientRole: RoleCode | 'ALL'
  priority: 'UNKNOWN' | 'HIGH' | 'NORMAL'
  read: boolean
  occurredAt: string
  timeAgo: string
  actionUrl: string
  scope?: { projectId?: string | null; sourceKind?: string | null; sourceId: string; eventType?: string | null; classification?: string | null; title?: string | null; senderKind?: string | null; deadlines?: Array<{ clockId?: string | null; dueAt?: string | null; completedAt?: string | null }> | null }
  version?: string
  actionLabel: string
}

export type NotificationPriorityFilter = 'ALL' | 'HIGH' | 'NORMAL' | 'UNKNOWN'
