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
   * POST /survey-tasks/{taskId}/complete — PM xác nhận hoàn thành nhiệm vụ (BE develop c0c99ca, 200 + task COMPLETED).
   * Body {datasetId, assessmentId, reason}; If-Match = ETag của NHIỆM VỤ (không dùng ETag dataset/assessment).
   * assessmentId phải là đánh giá hiện hành của dataset (GET /datasets/{id}/coverage); BE yêu cầu mọi phân đoạn/dải của cả nhiệm vụ PASS.
   */
  async completeTask(projectId: string, taskId: string, input: { datasetId: string; assessmentId: string; reason: string }) {
    if (!input.datasetId) throw new Error('Chọn bản nộp bộ dữ liệu dùng để xác nhận.')
    if (!input.assessmentId) throw new Error('Bản nộp chưa có đánh giá hiện hành; tạo đánh giá bằng chứng trước khi hoàn tất.')
    if (!input.reason.trim()) throw new Error('Cần nhập lý do xác nhận hoàn tất.')
    const task = await surveyPlanningService.detail(projectId, taskId, 'TASK')
    if (task.status !== 'SUBMITTED') throw new Error('Nhiệm vụ không còn ở trạng thái đã nộp; không thể hoàn tất.')
    return (await apiClient.post(`/survey-tasks/${taskId}/complete`, { datasetId: input.datasetId, assessmentId: input.assessmentId, reason: input.reason.trim() }, { headers: headers(task.version) })).data
  },
  /**
   * POST /survey-plans/{planId}/complete — PM đóng kế hoạch (BE develop_ABC, 200 + plan COMPLETED).
   * Body {sources:[{taskId,datasetId,assessmentId}], reason}; If-Match = ETag của KẾ HOẠCH. PM chỉ rõ bản nộp từng nhiệm vụ (gốc + bổ sung);
   * assessmentId là đánh giá hiện hành pm-evidence-review.v1 của bản nộp đó; BE kiểm các nguồn phủ PASS toàn bộ scope đã ghim của kế hoạch.
   */
  async completePlan(projectId: string, planId: string, input: { sources: { taskId: string; datasetId: string; assessmentId: string }[]; reason: string }) {
    if (!input.sources.length) throw new Error('Chọn ít nhất một nguồn (nhiệm vụ + bản nộp) để đóng kế hoạch.')
    if (new Set(input.sources.map((x) => x.datasetId)).size !== input.sources.length) throw new Error('Mỗi bản nộp chỉ được chọn một lần.')
    if (!input.reason.trim()) throw new Error('Cần nhập lý do đóng kế hoạch.')
    const plan = await surveyPlanningService.detail(projectId, planId, 'PLAN')
    if (plan.status !== 'IN_PROGRESS') throw new Error('Kế hoạch không còn ở trạng thái đang thực hiện; không thể đóng.')
    return (await apiClient.post(`/survey-plans/${planId}/complete`, { sources: input.sources, reason: input.reason.trim() }, { headers: headers(plan.version) })).data
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
