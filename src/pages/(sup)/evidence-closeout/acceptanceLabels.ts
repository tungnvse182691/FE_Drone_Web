import type { PendingStep } from './types'

/** Nhãn bước đang chờ (theo RepairItemState của BE + trạng thái task). */
export const STEP_LABEL: Record<PendingStep, string> = {
  PM_REVIEW: 'Chờ PM đánh giá',
  SUPPLEMENT: 'Cần bổ sung hồ sơ',
  SUP_CONFIRM: 'Chờ Giám sát xác nhận',
  PM_CONFIRM: 'Chờ PM xác nhận cuối',
  CORRECTION: 'Cần sửa lại (hiệu chỉnh)',
  ACCEPTED: 'Đã nghiệm thu',
  CANCELLED: 'Đã hủy',
}

/** Trạng thái RepairItemState của BE → nhãn tiếng Việt (đủ 9 giá trị của enum). */
export const REPAIR_ITEM_STATE_LABEL: Record<string, string> = {
  AwaitingApproval: 'Chờ phê duyệt',
  ReadyToAssign: 'Sẵn sàng giao việc',
  Assigned: 'Đã giao việc',
  InProgress: 'Đang thi công',
  Submitted: 'Đã nộp kết quả',
  Reviewed: 'PM đã chấp nhận',
  Confirmed: 'Đã nghiệm thu',
  Cancelled: 'Đã hủy',
  CorrectionRequired: 'Cần sửa lại',
}
export const repairStateLabel = (s?: string | null) => (s ? REPAIR_ITEM_STATE_LABEL[s] || `Trạng thái ${s} (chưa có nhãn)` : 'Chưa có dữ liệu')

/** Lý do thiếu của bản nộp FIELD (missingReasons) → diễn giải. Không suy diễn thêm ngoài mã BE trả về. */
export const MISSING_REASON_LABEL: Record<string, string> = {
  AFTER_ATTEMPT_BINDING_UNAVAILABLE: 'BE chưa có cơ chế tự xác minh ảnh sau thi công gắn với lần thi công; PM/Giám sát đối chiếu thủ công',
  AFTER_CAPTURE_PROVENANCE_INSUFFICIENT: 'Nguồn gốc/thời điểm chụp ảnh sau chưa đủ',
  AFTER_EVIDENCE_MISSING: 'Thiếu ảnh sau thi công',
  EVIDENCE_MISSING: 'Thiếu bằng chứng ảnh',
  EVIDENCE_PENDING: 'Ảnh chưa được xác minh xong',
  EVIDENCE_UPLOAD_NOT_CREATED: 'Ảnh chưa được tải lên',
  POSITION_CHECKLIST_INSUFFICIENT: 'Checklist vị trí chưa đủ',
  LOCATION_PROOF_CONTRADICTORY: 'Bằng chứng vị trí mâu thuẫn',
  GPS_SOURCE_BINDING_UNAVAILABLE: 'BE chưa xác minh được GPS với hình học đã ghim',
}
export const missingReasonText = (code: string) => MISSING_REASON_LABEL[code] || code

/** Lỗi BE thường gặp ở luồng nghiệm thu → giải thích; mã gốc luôn được giữ trong câu. */
const CODE_HINT: Record<string, string> = {
  invalid_state_transition: 'Hạng mục chưa ở đúng trạng thái cho thao tác này (có thể chưa có PM chấp nhận hợp lệ hoặc dữ liệu đã đổi)',
  concurrency_conflict: 'Dữ liệu đã thay đổi so với lần đọc trước; tải lại rồi thao tác lại',
  precondition_failed: 'Phiên bản dữ liệu đã cũ; tải lại rồi thao tác lại',
  precondition_required: 'Thiếu điều kiện phiên bản (If-Match)',
  repair_review_source_insufficient: 'Bản nộp chưa đủ dữ liệu nguồn để PM chấp nhận',
  repair_review_evidence_source_conflict: 'Bằng chứng của bản nộp không khớp nguồn đã lưu',
  repair_review_after_evidence_required: 'PM chỉ chấp nhận được khi bản nộp có ảnh sau thi công',
  submission_lineage_conflict: 'Bản nộp hiện hành đã đổi (có bản mới hơn); tải lại để đọc bản mới',
  formal_intake_source_conflict: 'Nhiệm vụ không còn ở trạng thái đã nộp để review',
  accepted_review_source_conflict: 'Chưa có review ACCEPT hợp lệ của PM cho bản nộp hiện hành',
  supervisor_final_clock_source_conflict: 'Chưa có mốc chờ Giám sát xác nhận (PM chưa chấp nhận hợp lệ)',
  final_confirmation_source_conflict: 'BE từ chối xác nhận cuối do nguồn không khớp',
  access_forbidden: 'Không đủ quyền hoặc không đúng trách nhiệm hiện hành',
  current_review_assignee_required: 'Chỉ người được chỉ định phụ trách hiện hành mới thao tác được',
  repair_binding_not_current: 'Hạng mục không còn gắn với nhiệm vụ này',
  not_found: 'Không tìm thấy dữ liệu (đã đổi hoặc ngoài phạm vi)',
  validation_error: 'Dữ liệu gửi lên không hợp lệ',
}

/** Văn bản lỗi đọc được: HTTP status · mã · diễn giải · chi tiết BE · mã đối chiếu. Không gộp mọi lỗi thành "Repair request failed". */
export function beErrorText(err: unknown): string {
  const e = err as { response?: { status?: number; data?: any }; message?: string }
  const status = e?.response?.status
  const d = e?.response?.data
  if (!status) return e?.message || 'Lỗi không xác định'
  const code: string | undefined = typeof d?.code === 'string' ? d.code : undefined
  const generic = /^repair request failed$/i.test(String(d?.title || '')) || !d?.detail
  const parts = [`HTTP ${status}`]
  if (code) parts.push(code)
  if (code && CODE_HINT[code]) parts.push(CODE_HINT[code])
  if (d?.detail && !generic) parts.push(String(d.detail))
  else if (!code && d?.title) parts.push(String(d.title))
  if (d?.correlationId) parts.push(`Mã đối chiếu ${d.correlationId}`)
  return parts.join(' · ')
}

export const fmtTime = (iso?: string | null): string => {
  if (!iso) return 'Chưa có dữ liệu'
  const t = Date.parse(iso)
  return Number.isFinite(t) ? new Date(t).toLocaleString('vi-VN') : 'Chưa có dữ liệu'
}
export const NO_DATA = 'Chưa có dữ liệu'
