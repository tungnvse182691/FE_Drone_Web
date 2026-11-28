import { metricLabels } from '../../../api/services/projectReportingService'
import { reasonText } from './ReportingMetricsPanel'

export const dateLabel = (value?: string | null) => value ? new Date(value).toLocaleString('vi-VN') : 'Chưa có dữ liệu'
export const numberLabel = (value?: number | null) => value == null ? 'Chưa có dữ liệu' : value.toLocaleString('vi-VN')
export const availabilityLabel = (value: string) =>
  ({ AVAILABLE: 'Có dữ liệu', PARTIAL: 'Có dữ liệu một phần', UNAVAILABLE: 'Chưa có dữ liệu' })[value] || 'Chưa xác định'
export const availabilityTone = (value: string) => value === 'AVAILABLE' ? 'ok' : value === 'PARTIAL' ? 'warn' : 'neutral'
const labels: Record<string, string> = {
  Case: 'Hồ sơ vụ việc', Report: 'Phản ánh', Defect: 'Khiếm khuyết', Project: 'Dự án',
  RepairItem: 'Hạng mục sửa chữa', RepairObligation: 'Nghĩa vụ sửa chữa', RepairDecision: 'Quyết định sửa chữa',
  SurveyTask: 'Nhiệm vụ khảo sát', SurveyRequest: 'Yêu cầu khảo sát', SurveyDataVersion: 'Phiên bản dữ liệu khảo sát',
  DatasetAssessment: 'Đánh giá dữ liệu khảo sát', BaselineSelection: 'Đường cơ sở',
  GroundTruthMeasurement: 'Phép đo thực địa', RoadSegment: 'Phân đoạn', StoredFile: 'Tệp nguồn',
  SharedRoadPart: 'Phần đường dùng chung', DefectStatisticsSource: 'Nguồn thống kê khiếm khuyết',
  COMPLETE: 'Đầy đủ', PARTIAL: 'Một phần', UNKNOWN: 'Chưa xác định', KNOWN: 'Đã xác định',
  CONFIRMED: 'Đã xác nhận nghiệm thu', REPORTED_AWAITING_REVIEW: 'Crew đã báo sửa, chờ xem xét',
  UNREPAIRED: 'Chưa sửa', OPEN: 'Đang mở', RESOLVED: 'Đã xử lý', CLOSED: 'Đã đóng',
  VERIFIED: 'Đã xác minh', REJECTED: 'Đã từ chối', CONFIRMED_DEFECT: 'Đã xác nhận khiếm khuyết',
  AWAITING_EVIDENCE: 'Chờ bằng chứng', CONCLUDED: 'Đã kết luận', LINKED: 'Đã liên kết', UNASSIGNED: 'Chưa phân công',
  PLANNED: 'Đã lên kế hoạch', IN_FLIGHT: 'Đang bay', UPLOADED: 'Đã tải lên', PROCESSING: 'Đang xử lý',
  NEW_ASSIGNED: 'Mới phân công', COMPLETED: 'Đã hoàn thành', FAILED: 'Thất bại', Pending: 'Đang chờ',
  SURFACE: 'Mặt đường', LEFT_EDGE: 'Mép trái', RIGHT_EDGE: 'Mép phải',
  Length: 'Chiều dài', Width: 'Chiều rộng', Depth: 'Chiều sâu', Area: 'Diện tích',
  Offset: 'Độ lệch', Volume: 'Thể tích', CrackWidth: 'Bề rộng vết nứt', CrackLength: 'Chiều dài vết nứt',
  reportsReceived: 'Phản ánh tiếp nhận', casesByStatus: 'Hồ sơ vụ việc theo trạng thái',
  defectsByStatus: 'Khiếm khuyết theo trạng thái', projectDistinctDefects: 'Khiếm khuyết riêng biệt của dự án',
  matchedDistinctDefects: 'Khiếm khuyết đã đối chiếu danh tính', explicitSharedParts: 'Phần đường dùng chung đã xác nhận',
  segmentRelatedDefects: 'Khiếm khuyết liên quan từng phân đoạn', reporterEvidence: 'Bằng chứng từ người phản ánh',
  queued: 'Đang chờ', running: 'Đang xử lý', succeeded: 'Sẵn sàng tải', failed: 'Thất bại',
}
export const label = (value?: string | null) => value ? labels[value] || metricLabels[value] || value : 'Chưa có dữ liệu'
export const matchedDefectsLabel = (spatial: boolean) => spatial
  ? label('matchedDistinctDefects')
  : 'Khiếm khuyết trong tập đối chiếu'
export const unitLabel = (value?: string | null) => value === 'count' ? '' : value === 'percent' ? '%' : value === 'bytes' ? 'byte' : value || ''
export const explainReasons = (codes: string[]) => codes.map(code => ({
  REPORTER_EVIDENCE_ACCESS_NOT_AVAILABLE: 'Chưa có quyền đọc bằng chứng từ người phản ánh',
  QUANTITY_SOURCE_UNKNOWN: 'Chưa xác định nguồn khối lượng',
  REPAIR_OBLIGATION_INVENTORY_NOT_VERIFIED: 'Có khiếm khuyết chưa có nghĩa vụ sửa chữa trong dự án nên chưa xác minh được danh mục hạng mục.',
  DEFECT_SHARED_IDENTITY_OR_SCOPE_UNKNOWN: 'Có khiếm khuyết chưa có quan hệ nguồn thống kê hợp lệ cho danh tính phần dùng chung hoặc phạm vi.',
  STATISTICS_SOURCE_STALE: 'Phiên bản hoặc phạm vi của nguồn thống kê đã xác nhận không còn khớp dữ liệu hiện hành.',
  QUANTITY_VALUE_UNKNOWN: 'Nguồn thống kê đã có nhưng giá trị khối lượng chưa xác định.',
}[code] || reasonText([code]))).join(' · ')
