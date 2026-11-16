import { apiClient } from '../client'
import { fieldTaskReadService } from './fieldTaskReadService'

export type TaskAction = 'assign' | 'reassign' | 'cancel'
export interface TaskActionInput {
  reason: string
  /** Bắt buộc với assign/reassign (Crew nhận việc). */
  assignedToUserId?: string
  /** Chỉ cần khi nhiệm vụ đã bắt đầu (BE: handover_facts_required). */
  handover?: { performedPortionState: 'NONE' | 'PARTIAL' | 'CAPTURED_INTAKE' | 'UNKNOWN'; summary: string }
}

const quote = (v: string) => (v.startsWith('"') ? v : `"${v}"`)

export const fieldTaskActions = {
  /**
   * PM giao/giao lại/hủy nhiệm vụ đo hiện trường (MEASURE_ONLY):
   * POST /projects/{projectId}/field-inspection-tasks/{taskId}/{assign|reassign|cancel}
   * Header: Idempotency-Key, If-Match = version nhiệm vụ. BE từ chối nhiệm vụ sửa chữa (repair_binding_required).
   */
  async run(projectId: string, taskId: string, action: TaskAction, input: TaskActionInput) {
    if (!input.reason.trim()) throw new Error('Cần nhập lý do.')
    if (action !== 'cancel' && !input.assignedToUserId) throw new Error('Chọn Crew nhận việc.')
    const task = await fieldTaskReadService.detail(projectId, taskId)
    if (!task.version) throw new Error('BE không trả version của nhiệm vụ.')
    const body: Record<string, unknown> = { reason: input.reason.trim() }
    if (action !== 'cancel') body.assignedToUserId = input.assignedToUserId
    if (task.firstStartOriginId) {
      if (!input.handover || !input.handover.summary.trim()) throw new Error('Nhiệm vụ đã bắt đầu: cần nhập tóm tắt bàn giao phần việc đã làm.')
      body.handover = {
        performedPortionState: input.handover.performedPortionState,
        summary: input.handover.summary.trim(),
        startOriginId: task.firstStartOriginId,
        submissionIds: task.latestSubmissionId ? [task.latestSubmissionId] : [],
        recipientUserId: action === 'cancel' ? null : input.assignedToUserId,
      }
    }
    const res = await apiClient.post(
      `/projects/${projectId}/field-inspection-tasks/${taskId}/${action}`,
      body,
      { headers: { 'Idempotency-Key': crypto.randomUUID(), 'If-Match': quote(task.version) } }
    )
    return res.data
  },

  /**
   * PM quyết định xử lý nhiệm vụ đo bị ảnh hưởng bởi thay đổi hình học:
   * POST /projects/{p}/field-inspection-tasks/{t}/location-impact-decisions (Idempotency-Key, If-Match = version nhiệm vụ).
   * action: VERIFY | CONTINUE | STOP | REASSIGN; REASSIGN cần Crew nhận; nhiệm vụ đã bắt đầu cần handover.
   */
  async locationImpact(projectId: string, taskId: string, input: { impactId: string; action: 'VERIFY' | 'CONTINUE' | 'STOP' | 'REASSIGN'; reason: string; assignedToUserId?: string; handover?: TaskActionInput['handover'] }) {
    if (!input.impactId) throw new Error('Chọn đánh giá ảnh hưởng hình học.')
    if (!input.reason.trim()) throw new Error('Cần nhập lý do.')
    if (input.action === 'REASSIGN' && !input.assignedToUserId) throw new Error('Chọn Crew nhận việc.')
    const task = await fieldTaskReadService.detail(projectId, taskId)
    if (!task.version) throw new Error('BE không trả version của nhiệm vụ.')
    const body: Record<string, unknown> = { impactId: input.impactId, action: input.action, reason: input.reason.trim() }
    if (input.action === 'REASSIGN') body.assignedToUserId = input.assignedToUserId
    if (task.firstStartOriginId && (input.action === 'REASSIGN' || input.action === 'STOP')) {
      if (!input.handover || !input.handover.summary.trim()) throw new Error('Nhiệm vụ đã bắt đầu: cần nhập tóm tắt bàn giao phần việc đã làm.')
      body.handover = {
        performedPortionState: input.handover.performedPortionState,
        summary: input.handover.summary.trim(),
        startOriginId: task.firstStartOriginId,
        submissionIds: task.latestSubmissionId ? [task.latestSubmissionId] : [],
        recipientUserId: input.action === 'REASSIGN' ? input.assignedToUserId : null,
      }
    }
    return (await apiClient.post(`/projects/${projectId}/field-inspection-tasks/${taskId}/location-impact-decisions`, body, { headers: { 'Idempotency-Key': crypto.randomUUID(), 'If-Match': quote(task.version) } })).data
  },
}
