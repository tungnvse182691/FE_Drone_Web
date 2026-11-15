import { AuditEvent } from '../../types/domain'
import { projectReportingService } from './projectReportingService'
import { projectService } from './projectService'

export interface AuditFilterParams {
  projectId?: string
  actorRole?: string
  actionType?: string
  entityType?: string
  searchKeyword?: string
  timeFilter?: '24h' | '7d' | '30d' | 'all'
}
export interface AuditProjectOption { id: string; name: string; code: string }
export const AUDIT_PROJECT_OPTIONS: AuditProjectOption[] = []

const summaries: Record<string, string> = {
  survey_task_created: 'Đã tạo nhiệm vụ khảo sát', survey_task_accept: 'Đã tiếp nhận nhiệm vụ khảo sát',
  survey_dataset_submitted: 'Đã nộp dữ liệu khảo sát'
}
// Reporting timeline is the implemented read surface, not a complete audit dump.
export const auditService = {
  async getAuditSnapshot(params: AuditFilterParams = {}, signal?: AbortSignal) {
    const projects = await projectService.fetchProjects()
    const selected = projects.filter(p => !params.projectId || params.projectId === 'all' || p.id === params.projectId)
    const events: AuditEvent[] = []
    let partial = false
    for (const project of selected) {
      const result = await projectReportingService.timeline(project.id, {}, signal)
      partial ||= result.availability.availability !== 'AVAILABLE'
      for (const row of result.items) events.push({
        id: `${project.id}:${row.eventId}`, event_id: row.eventId,
        occurred_at: row.occurredAt,
        occurred_at_local: new Date(row.occurredAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        project_id: project.id, project_name: project.name,
        actor_id: '', actor_name: row.actorDisplay || 'Chưa có tên người thực hiện',
        actor_role: '' as AuditEvent['actor_role'], actor_role_label: 'Chưa có thông tin vai trò',
        action_type: row.action as AuditEvent['action_type'], action_label_vi: summaries[row.action] || 'Sự kiện nghiệp vụ từ nguồn báo cáo',
        action_badge_style: 'bg-slate-50 text-slate-700 border-slate-200',
        target_entity_type: row.source.type as AuditEvent['target_entity_type'],
        target_entity_id: row.source.id, target_entity_name: summaries[row.action] || 'Sự kiện nghiệp vụ từ nguồn báo cáo',
        to_status: '', reason: 'Nguồn không cung cấp lý do riêng.', after_state: {}
      })
    }
    events.sort((a, b) => Date.parse(b.occurred_at) - Date.parse(a.occurred_at))
    return { events, partial }
  },
  async getAuditEvents(params: AuditFilterParams = {}) { return (await this.getAuditSnapshot(params)).events },
  async exportAuditTrail(_format: 'PDF' | 'CSV', _projectId = 'all'): Promise<{fileName: string; rowCount: number}> {
    throw new Error('Backend chưa có API xuất riêng nhật ký. Xuất hồ sơ PDF tại Báo cáo KPI.')
  }
}
