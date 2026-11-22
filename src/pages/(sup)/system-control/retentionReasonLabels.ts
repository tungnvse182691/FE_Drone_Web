// Giải thích `inventoryReasonCodes` / `reasonCodes` của retention theo handoff BE
// (deploy/fe-handoff/ASSIGN-RETENTION-FIELD.md mục 3). `inventoryComplete` do BE tự tổng hợp; FE không có nút ép "đầy đủ".
// Mã không có trong bảng vẫn hiển thị nguyên mã, không đoán nghĩa.
interface Reason { text: string; owner: string }

const EXACT: Record<string, Reason> = {
  LEGACY_DATASET_MANIFEST_UNRESOLVED: { text: 'Manifest dataset lịch sử không đọc được hoặc fileId sai/trùng/thiếu', owner: 'BE / chủ dữ liệu xác minh nguồn lịch sử' },
  OBLIGATION_SCOPE_UNRESOLVED: { text: 'Tệp chưa gắn dự án/nghĩa vụ rõ ràng', owner: 'Hoàn thiện liên kết nguồn bằng workflow thật (triage/link Report, đính kèm biên bản bàn giao)' },
  WARRANTY_OBLIGATION_MISSING: { text: 'Dự án được tham chiếu chưa có bảo hành để tính thời hạn lưu trữ', owner: 'Giám sát tạo bảo hành ở thẻ Bảo hành của trang Tổng quan dự án (không dùng căn cứ lưu trữ thay bảo hành)' },
  WARRANTY_OBLIGATION_UNRESOLVED: { text: 'Bảo hành thiếu ngày, ngày kết thúc trước ngày bắt đầu, hoặc phạm vi chưa xác định', owner: 'Chủ dữ liệu xác minh hồ sơ bảo hành' },
  LIFECYCLE_EVIDENCE_PROVENANCE_UNRESOLVED: { text: 'Checksum minh chứng vòng đời không còn khớp tệp', owner: 'BE / chủ dữ liệu điều tra' },
  PAVEMENT_SOURCE_CONTENT_VERSION_UNRESOLVED: { text: 'Nội dung/phiên bản nguồn mặt đường không khớp', owner: 'BE / chủ dữ liệu đối chiếu bố trí đã công bố' },
  EXPORT_COMPLETION_UNRESOLVED: { text: 'Bản xuất hồ sơ chưa có xác nhận hoàn tất', owner: 'Kiểm tra trạng thái/worker xuất hồ sơ' },
  OTHER_SCOPE_OBLIGATIONS: { text: 'Tệp có tham chiếu từ dự án khác', owner: 'Giám sát đối chiếu toàn bộ nghĩa vụ; không làm mất tham chiếu chéo dự án' },
}

const PATTERNS: Array<[RegExp, Reason]> = [
  [/_REFERENCE_INVENTORY_UNAVAILABLE$/, { text: 'Thiếu nguồn kiểm kê tham chiếu phía BE', owner: 'BE kiểm tra bộ đọc kiểm kê (FE không có API đặt trạng thái đầy đủ)' }],
  [/_INVENTORY_INCOMPLETE$/, { text: 'Một bộ đọc kiểm kê tự báo chưa đầy đủ', owner: 'BE đối chiếu các mã chi tiết kèm theo' }],
  [/_PROVENANCE_UNRESOLVED$/, { text: 'Nguồn gốc bằng chứng (phiên/nhiệm vụ/bản nộp/sửa chữa) thiếu hoặc sai', owner: 'BE kiểm tra tham chiếu cụ thể; nghiệp vụ dùng đúng quy trình FIELD/sửa chữa/tải lên' }],
]

export function describeRetentionReason(code: string): { code: string; text: string; owner: string } | { code: string; text: null; owner: null } {
  const hit = EXACT[code] || PATTERNS.find(([re]) => re.test(code))?.[1]
  return hit ? { code, text: hit.text, owner: hit.owner } : { code, text: null, owner: null }
}
