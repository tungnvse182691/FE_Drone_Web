import { severityLabel } from '../../../utils/severity'

const UNKNOWN_CONDITION = 'Chưa đủ thông tin để xác định điều kiện thi công'
// FT95 RoadCoverageResolver, RepairFtEligibility and RepairExecutionAuthorization.
const REASONS: Record<string, string> = {
  COVERAGE_AMBIGUOUS: 'Có nhiều xác nhận cùng phù hợp; chưa xác định được độ phủ áp dụng.',
  EXECUTION_ROADNOTHANDEDOVER: 'Chưa đủ căn cứ xác nhận tuyến đã bàn giao để thi công.',
  ROAD_HANDOVER_MAPPING_UNKNOWN: 'Chưa xác định được căn cứ bàn giao và độ phủ cho phép thi công.',
  POLICY_UNAVAILABLE: 'Chưa có chính sách áp dụng cho hạng mục.',
  PINNED_POLICY_SOURCE_MISMATCH: 'Nguồn chính sách không khớp với hạng mục.',
  ASSESSMENT_REQUIRED: 'Cần đánh giá trước khi xác định điều kiện thi công.',
  CURRENT_EXECUTION_AUTHORITY_DENIED: 'Chưa đủ quyền thi công hiện hành.',
  TEST_ONLY_SOURCE_NOT_EXECUTABLE: 'Hồ sơ thử nghiệm không được dùng để thi công.',
}

export function defectNotice(value?: string | null, context: 'defect' | 'read' | 'condition' = 'condition'): string {
  if (!value) return context === 'condition' ? UNKNOWN_CONDITION : 'Chưa có thông tin'
  if (/\b403\b|access_forbidden/.test(value)) return context === 'defect' ? 'Bạn không có quyền xem hồ sơ khiếm khuyết này.' : 'Chưa thể hiển thị thông tin do quyền truy cập.'
  if (context === 'defect' && /\b404\b|not_found/.test(value)) return 'Không tìm thấy hồ sơ khiếm khuyết trong CSDL.'
  const parts = value.split(';').map(v => v.trim()).filter(Boolean)
  return [...new Set(parts.map(part => {
    if (REASONS[part]) return REASONS[part]
    if (/^[A-Z][A-Z0-9_]+$/.test(part) || /HTTP|correlation|\b[A-Z][A-Z0-9]+_[A-Z0-9_]+\b|[0-9a-f]{8}-[0-9a-f-]{27,}|\b(?:GET|POST|API|Receipt|receipt)\b/.test(part)) return context === 'condition' ? UNKNOWN_CONDITION : 'Không thể tải thông tin. Vui lòng thử lại.'
    return part
  }))].join(' ')
}

export const defectSeverity = (value?: string) => severityLabel(value)
export const defectStatus = (value?: string | null) => ({
  READYTOASSIGN: 'Sẵn sàng giao việc có điều kiện', ASSIGNED: 'Đã giao Crew', INPROGRESS: 'Đang thi công', IN_PROGRESS: 'Đang thi công',
  SUBMITTED: 'Chờ PM rà soát', REVIEWED: 'Đã rà soát', CONFIRMED: 'Đã xác nhận', CANCELLED: 'Đã hủy',
  OPEN: 'Chờ xử lý', VERIFIED: 'Đã xác minh', RESOLVED: 'Đã hoàn thành', COMPLETED: 'Đã hoàn thành', CLOSED: 'Đã đóng',
  MEASURE_ONLY: 'Chỉ đo kiểm', CONDITIONAL_FT: 'Sửa nhanh có điều kiện', READY: 'Sẵn sàng',
} as Record<string, string>)[String(value || '').toUpperCase()] || 'Chưa có thông tin'


export const fastTrackTypeName = (code: string | null | undefined, names: Record<string, string>) => code && names[code] && names[code] !== code ? names[code] : 'Chưa có thông tin tên loại'
export const fastTrackTime = (value?: string) => {
  if (!value || !Number.isFinite(Date.parse(value))) return 'Chưa có thông tin thời gian'
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(value))
  const part = (type: string) => parts.find(p => p.type === type)?.value
  return `${part('day')}/${part('month')}/${part('year')} ${part('hour')}:${part('minute')}:${part('second')}`
}
export const fastTrackTrialLabel = (value?: string) => /TEST_ONLY/.test(value || '') ? 'Dữ liệu thử nghiệm' : /DEMO/.test(value || '') ? 'DEMO' : ''
export const fastTrackPolicyVersion = (value?: string, revision?: number) => `${revision != null ? `Lần ban hành ${revision}` : 'Phiên bản chính sách'}${fastTrackTrialLabel(value) ? ` · ${fastTrackTrialLabel(value)}` : ''}`
export const fastTrackCrewLabel = (row: { assignedCrew?: string; crewReadState?: string }) => row.assignedCrew || (row.crewReadState === 'forbidden' ? 'Chưa thể hiển thị do quyền truy cập' : row.crewReadState === 'error' ? 'Không tải được thông tin Crew' : 'Chưa có thông tin Crew')
