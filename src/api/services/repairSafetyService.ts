import { apiClient } from '../client'

// Biện pháp an toàn thi công (spec PM-09): PM giao cho Crew phụ trách; lắp đặt/kiểm tra/xác nhận cảnh báo do Crew thực hiện (mobile, không thuộc web).
export interface SafetyView {
  id: string; projectId: string; defectId: string; formalObligationId: string; safetyObligationId: string; responsibleActorId: string
  installedAt?: string | null; firstCheckDueAt?: string | null; currentCheckId?: string | null; version: string
  checks?: { id: string; at: string; result: string; findings?: string }[]
  warnings?: { id: string; sourceCheckId: string; originalDueAt?: string; reason?: string }[]
  acknowledgements?: { id: string; warningId: string; at: string; afterOriginalDue: boolean }[]
}
export interface CoverageScope { obligationId: string; from: number; to: number; offsetFrom: number; offsetTo: number }
const GUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
const quote = (v: string) => (v.startsWith('"') ? v : `"${v}"`)
const base = (p: string, pk: string, item: string) => `/projects/${p}/repair-packages/${pk}/items/${item}/safety-measures`

export const repairSafetyService = {
  /** GET /projects/{p}/road-coverage — nghĩa vụ trong dự án (dùng để chọn nghĩa vụ an toàn tạm thời). */
  async scopes(projectId: string): Promise<CoverageScope[]> {
    const { data } = await apiClient.get<{ scopes?: CoverageScope[] }>(`/projects/${projectId}/road-coverage`)
    if (!Array.isArray(data?.scopes)) throw new Error('BE trả phạm vi nghĩa vụ sai contract.')
    return data.scopes
  },
  /** GET …/safety-measures/{measureId}. */
  async read(projectId: string, packageId: string, itemId: string, measureId: string): Promise<SafetyView> {
    if (!GUID.test(measureId.trim())) throw new Error('Mã biện pháp an toàn phải là GUID.')
    const { data } = await apiClient.get<SafetyView>(`${base(projectId, packageId, itemId)}/${measureId.trim()}`)
    if (data?.id !== measureId.trim().toLowerCase() || !data.version) throw new Error('BE trả biện pháp an toàn sai ID/version.')
    return data
  },
  /** POST …/safety-measures — PM giao biện pháp an toàn cho Crew đang được giao hạng mục; If-Match = version hạng mục. */
  async create(projectId: string, packageId: string, itemId: string, input: { formalRepairObligationId: string; safetyObligationId: string; responsibleActorId: string; checkSchedule: string; replacementCondition: string; removalCondition: string; reason: string }): Promise<SafetyView> {
    if (!input.safetyObligationId || !input.responsibleActorId) throw new Error('Chọn nghĩa vụ an toàn tạm thời và Crew phụ trách.')
    if (!input.checkSchedule.trim() || !input.replacementCondition.trim() || !input.removalCondition.trim() || !input.reason.trim()) throw new Error('Cần nhập lịch kiểm tra, điều kiện thay thế, điều kiện gỡ bỏ và lý do.')
    const item = await apiClient.get(`/projects/${projectId}/repair-packages/${packageId}/items/${itemId}`)
    const version = item.headers?.etag || (item.data?.version ? quote(item.data.version) : '')
    if (!version) throw new Error('BE không trả version hạng mục.')
    const body = { ...input, checkSchedule: input.checkSchedule.trim(), replacementCondition: input.replacementCondition.trim(), removalCondition: input.removalCondition.trim(), reason: input.reason.trim() }
    const { data } = await apiClient.post<SafetyView>(base(projectId, packageId, itemId), body, { headers: { 'Idempotency-Key': crypto.randomUUID(), 'If-Match': version } })
    return data
  },
}
