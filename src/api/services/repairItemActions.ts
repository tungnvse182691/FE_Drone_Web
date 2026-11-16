import { apiClient } from '../client'

const quote = (v: unknown) => { const t = String(v ?? ''); return t.startsWith('"') ? t : `"${t}"` }
const base = (p: string, pkg: string, id: string) => `/projects/${p}/repair-packages/${pkg}/items/${id}`

async function current(p: string, pkg: string, id: string) {
  const res = await apiClient.get<any>(base(p, pkg, id))
  const version = res.headers?.['etag'] || res.data?.version
  if (!version) throw new Error('BE không trả ETag/version của hạng mục.')
  return { item: res.data, version: quote(version) }
}

async function post(p: string, pkg: string, id: string, suffix: string, body: unknown) {
  const { version } = await current(p, pkg, id)
  const res = await apiClient.post(`${base(p, pkg, id)}/${suffix}`, body, {
    headers: { 'Idempotency-Key': crypto.randomUUID(), 'If-Match': version },
  })
  return res.data
}

export type CorrectionResult = 'UNREPAIRED' | 'REPORTED_AWAITING_REVIEW' | 'CONFIRMED'

/** Thao tác vòng đời hạng mục sửa chữa (spec PM-09). Mọi lỗi từ BE được ném ra để giao diện hiển thị. */
export const repairItemActions = {
  /** PM hủy hạng mục: POST .../items/{id}/cancellations. Hạng mục đã bắt đầu thi công cần bản bàn giao (BE trả handover_facts_required). */
  cancel: (p: string, pkg: string, id: string, reason: string) => post(p, pkg, id, 'cancellations', { reason }),

  /** PM tạo hạng mục Normal kế tiếp từ hạng mục đã hủy/cần hiệu chỉnh: POST .../items/{id}/normal-successors. */
  continueNormally: (p: string, pkg: string, id: string, input: { repairPlan: string; checklistVersion: string; reason: string }) =>
    post(p, pkg, id, 'normal-successors', input),

  /** Giám sát/PM hiệu chỉnh quyết định hiệu lực: POST .../items/{id}/corrections (thay thế quyết định hiện hành). */
  async correct(p: string, pkg: string, id: string, input: { result: CorrectionResult; reason: string; basisText?: string }) {
    const { item } = await current(p, pkg, id)
    if (!item.effectiveDecisionId) throw new Error('Hạng mục chưa có quyết định hiệu lực để hiệu chỉnh.')
    // BE bắt buộc căn cứ (basis.text) và mảng tham chiếu bằng chứng (được phép rỗng).
    if (!input.basisText?.trim()) throw new Error('Cần nhập căn cứ hiệu chỉnh.')
    return post(p, pkg, id, 'corrections', {
      supersedesDecisionId: item.effectiveDecisionId,
      result: input.result,
      reason: input.reason,
      basis: { text: input.basisText.trim(), evidenceReferenceIds: [] },
    })
  },

  /** PM yêu cầu xem xét lại kết quả: POST .../items/{id}/review-requests. */
  requestReview: (p: string, pkg: string, id: string, reason: string) => post(p, pkg, id, 'review-requests', { reason }),
}
