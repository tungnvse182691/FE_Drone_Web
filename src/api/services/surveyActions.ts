import { apiClient } from '../client'
import { surveyPlanningService, type SurveyScope } from './surveyPlanningService'
import { canPostpone, taskActions } from '../../pages/(pm)/surveys/surveyActionAvailability'

const quote = (v: string) => (v.startsWith('"') ? v : `"${v}"`)
const headers = (version: string) => ({ 'Idempotency-Key': crypto.randomUUID(), 'If-Match': quote(version) })

/**
 * Thao tác PM trên kế hoạch/nhiệm vụ khảo sát (spec PM-06). BE mới (deploy/fe-handoff/SURVEY-V2-WEB-ACTIONS.md) đã
 * hỗ trợ Web cookie + CSRF cho cả bốn POST này; không còn dùng Bearer tạm.
 * If-Match = version đọc lại ngay trước khi gửi (GET /survey-plans|tasks/{id}).
 */
export const surveyActions = {
  /** POST /survey-plans/{planId}/postpone — body {reason}. */
  async postponePlan(projectId: string, planId: string, reason: string) {
    if (!reason.trim()) throw new Error('Cần nhập lý do hoãn.')
    const plan = await surveyPlanningService.detail(projectId, planId, 'PLAN')
    if (!canPostpone(plan.status)) throw new Error('Trạng thái kế hoạch đã thay đổi; không thể hoãn.')
    return (await apiClient.post(`/survey-plans/${planId}/postpone`, { reason: reason.trim() }, { headers: headers(plan.version) })).data
  },
  /** POST /survey-tasks/{taskId}/cancel — body {reason}. */
  async cancelTask(projectId: string, taskId: string, reason: string) {
    if (!reason.trim()) throw new Error('Cần nhập lý do hủy.')
    const task = await surveyPlanningService.detail(projectId, taskId, 'TASK')
    if (!taskActions(task.status, task.supplementTaskId).includes('cancel')) throw new Error('Trạng thái nhiệm vụ đã thay đổi; không thể hủy.')
    return (await apiClient.post(`/survey-tasks/${taskId}/cancel`, { reason: reason.trim() }, { headers: headers(task.version) })).data
  },
  /** POST /survey-tasks/{taskId}/reassign — body {operatorId, reason, dueAt?}. */
  async reassignTask(projectId: string, taskId: string, input: { operatorId: string; reason: string; dueAt?: string }) {
    if (!input.operatorId) throw new Error('Chọn Operator nhận nhiệm vụ.')
    if (!input.reason.trim()) throw new Error('Cần nhập lý do giao lại.')
    const task = await surveyPlanningService.detail(projectId, taskId, 'TASK')
    if (!taskActions(task.status, task.supplementTaskId).includes('reassign')) throw new Error('Nhiệm vụ không còn đủ điều kiện giao lại.')
    const body: Record<string, unknown> = { operatorId: input.operatorId, reason: input.reason.trim() }
    if (input.dueAt) body.dueAt = new Date(input.dueAt).toISOString()
    return (await apiClient.post(`/survey-tasks/${taskId}/reassign`, body, { headers: headers(task.version) })).data
  },
  /**
   * POST /survey-tasks/{taskId}/supplements — tạo nhiệm vụ bổ sung (201). Body {operatorId, reason, scope[]};
   * trả {id, status: SUPPLEMENT_REQUIRED, supplementTaskId, version}, header Location trỏ nhiệm vụ con.
   */
  async supplementTask(projectId: string, taskId: string, input: { operatorId: string; reason: string; scope: SurveyScope[] }) {
    if (!input.operatorId) throw new Error('Chọn Operator nhận nhiệm vụ bổ sung.')
    if (!input.reason.trim()) throw new Error('Cần nhập lý do bổ sung.')
    if (!input.scope.length || input.scope.some((s) => !s.segmentIds.length)) throw new Error('Chọn ít nhất một phân đoạn cần bổ sung.')
    const task = await surveyPlanningService.detail(projectId, taskId, 'TASK')
    if (!taskActions(task.status, task.supplementTaskId).includes('supplement')) throw new Error('Nhiệm vụ không còn đủ điều kiện bổ sung.')
    const res = await apiClient.post<{ id: string; status: string; supplementTaskId?: string | null; version: string }>(
      `/survey-tasks/${taskId}/supplements`,
      { operatorId: input.operatorId, reason: input.reason.trim(), scope: input.scope },
      { headers: headers(task.version) }
    )
    const location = (res.headers?.location as string | undefined) || ''
    const childId = res.data.supplementTaskId || location.split('/').pop() || ''
    if (!childId) throw new Error('BE không trả nhiệm vụ bổ sung (supplementTaskId/Location).')
    return { ...res.data, supplementTaskId: childId }
  },
}
