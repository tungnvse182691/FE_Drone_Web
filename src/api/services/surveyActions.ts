import { apiClient } from '../client'
import { surveyPlanningService } from './surveyPlanningService'

const quote = (v: string) => (v.startsWith('"') ? v : `"${v}"`)
const headers = (version: string) => ({ 'Idempotency-Key': crypto.randomUUID(), 'If-Match': quote(version) })

/**
 * Thao tác PM trên kế hoạch/nhiệm vụ khảo sát (spec PM-06). Các route này BE chưa mở cookie web nên đi qua
 * Bearer tạm [TEMP-BEARER] (src/api/devFileBearer.ts) cho tới khi BE gắn [WebCookieEligible].
 * If-Match = version đọc lại ngay trước khi gửi (GET /survey-plans|tasks/{id}).
 */
export const surveyActions = {
  /** POST /survey-plans/{planId}/postpone — body {reason}. */
  async postponePlan(projectId: string, planId: string, reason: string) {
    if (!reason.trim()) throw new Error('Cần nhập lý do hoãn.')
    const plan = await surveyPlanningService.detail(projectId, planId, 'PLAN')
    return (await apiClient.post(`/survey-plans/${planId}/postpone`, { reason: reason.trim() }, { headers: headers(plan.version) })).data
  },
  /** POST /survey-tasks/{taskId}/cancel — body {reason}. */
  async cancelTask(projectId: string, taskId: string, reason: string) {
    if (!reason.trim()) throw new Error('Cần nhập lý do hủy.')
    const task = await surveyPlanningService.detail(projectId, taskId, 'TASK')
    return (await apiClient.post(`/survey-tasks/${taskId}/cancel`, { reason: reason.trim() }, { headers: headers(task.version) })).data
  },
  /** POST /survey-tasks/{taskId}/reassign — body {operatorId, reason, dueAt?}. */
  async reassignTask(projectId: string, taskId: string, input: { operatorId: string; reason: string; dueAt?: string }) {
    if (!input.operatorId) throw new Error('Chọn Operator nhận nhiệm vụ.')
    if (!input.reason.trim()) throw new Error('Cần nhập lý do giao lại.')
    const task = await surveyPlanningService.detail(projectId, taskId, 'TASK')
    const body: Record<string, unknown> = { operatorId: input.operatorId, reason: input.reason.trim() }
    if (input.dueAt) body.dueAt = new Date(input.dueAt).toISOString()
    return (await apiClient.post(`/survey-tasks/${taskId}/reassign`, body, { headers: headers(task.version) })).data
  },
}
