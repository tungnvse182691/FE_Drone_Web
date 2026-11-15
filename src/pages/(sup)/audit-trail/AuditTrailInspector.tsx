import React from 'react'
import { AuditEvent } from '../../../types/domain'
import { ImageModalData } from './types'

interface AuditTrailInspectorProps {
  selectedEvent: AuditEvent
  copiedEventId: boolean
  onCopyEventId: (eventId: string) => void
  onSelectImage: (img: ImageModalData) => void
  onClose?: () => void
}

// Ảnh vector SVG dự phòng chuẩn kỹ thuật hiện trường (Không phụ thuộc mạng internet ngoài)
const FALLBACK_INSPECTION_IMG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240" fill="none"><rect width="400" height="240" fill="%23F8FAFC"/><rect x="20" y="20" width="360" height="200" rx="8" fill="%23F1F5F9" stroke="%23CBD5E1" stroke-width="1.5"/><line x1="20" y1="120" x2="380" y2="120" stroke="%2394A3B8" stroke-width="1.5" stroke-dasharray="6 6"/><circle cx="200" cy="120" r="24" fill="%23C9A227" fill-opacity="0.15" stroke="%23C9A227" stroke-width="2"/><circle cx="200" cy="120" r="4" fill="%23C9A227"/><text x="200" y="165" font-family="sans-serif" font-size="12" font-weight="700" fill="%23334155" text-anchor="middle">BIÊN BẢN KIỂM TRA HIỆN TRƯỜNG</text><text x="200" y="182" font-family="sans-serif" font-size="10" fill="%2364748B" text-anchor="middle">Tọa độ GPS &amp; Trắc địa mặt đường</text></svg>`

// Bảng chuyển đổi nhãn trường dữ liệu sang tiếng Việt chuẩn kỹ thuật công trình
const FIELD_LABEL_MAP: Record<string, string> = {
  status: 'Trạng thái hồ sơ',
  trang_thai: 'Trạng thái hồ sơ',
  total_defects: 'Tổng số hư hỏng',
  tong_hu_hong: 'Tổng số hư hỏng',
  repair_method: 'Phương án kỹ thuật',
  phuong_an: 'Phương án xử lý',
  hang_muc: 'Hạng mục thi công',
  approved_by: 'Người phê duyệt',
  nguoi_duyet: 'Người phê duyệt',
  submitted_by: 'Người trình duyệt',
  nguoi_trinh: 'Người trình duyệt',
  assigned_to: 'Đơn vị thực hiện',
  doi_thi_cong: 'Đội thi công',
  han_hoan_thanh: 'Hạn hoàn thành',
  ket_qua: 'Kết quả kiểm tra',
  muc_do: 'Mức độ hư hỏng',
  phien_ban: 'Phiên bản tim tuyến',
  locked_at: 'Thời điểm khóa pháp lý',
  thoi_diem_khoa: 'Thời điểm khóa hồ sơ',
  nguoi_dong: 'Người đóng hồ sơ',
  nguoi_khoa: 'Người kích hoạt khóa',
  ghi_chu: 'Ghi chú kỹ thuật'
}

// Bảng chuyển đổi giá trị trạng thái nghiệp vụ sang tiếng Việt
const VALUE_TEXT_MAP: Record<string, string> = {
  PENDING_APPROVAL: 'Chờ duyệt',
  APPROVED: 'Đã phê duyệt',
  DRAFT: 'Bản nháp',
  UNASSIGNED: 'Chưa phân công',
  ASSIGNED: 'Đã phân công',
  PENDING_INSPECTION: 'Chờ nghiệm thu',
  ACCEPTED: 'Nghiệm thu đạt',
  IN_PROGRESS: 'Đang thi công',
  RESOLVED: 'Đã xử lý xong',
  REVISION_REQUIRED: 'Yêu cầu sửa lại',
  PUBLISHED: 'Đã công bố',
  ACTIVE: 'Đang lưu trữ',
  LOCKED: 'Khóa thanh tra',
  'usr-sup-01': 'Kỹ sư Nguyễn Văn An (Giám sát)',
  'usr-pm-01': 'Đỗ Quốc Hoàng (Chỉ huy trưởng)',
  'usr-sys-01': 'Hệ thống tự động'
}

// Hàm định dạng giá trị trường sang văn bản trực quan
const formatValue = (key: string, val: unknown): string => {
  if (val === null || val === undefined) return 'Chưa phân công / Không có'
  if (typeof val === 'boolean') return val ? 'Đạt' : 'Không đạt'
  if (typeof val === 'number') {
    if (key.includes('defect') || key.includes('hu_hong')) return `${val} vị trí`
    return String(val)
  }
  if (typeof val === 'string') {
    if (VALUE_TEXT_MAP[val]) return VALUE_TEXT_MAP[val]
    // Định dạng chuỗi ngày ISO sang ngày giờ Việt Nam
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(val)) {
      try {
        const d = new Date(val)
        return d.toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch {
        return val
      }
    }
    return val
  }
  if (typeof val === 'object') {
    return Object.entries(val)
      .map(([k, v]) => `${FIELD_LABEL_MAP[k] || k}: ${v}`)
      .join(', ')
  }
  return String(val)
}

// Phân tách object trạng thái thành danh sách cặp { label, value }
const parseStateRecords = (data: unknown): { label: string; value: string }[] => {
  if (!data || typeof data !== 'object') return []
  return Object.entries(data as Record<string, unknown>).map(([k, v]) => ({
    label: FIELD_LABEL_MAP[k] || k.replace(/_/g, ' '),
    value: formatValue(k, v)
  }))
}

export const AuditTrailInspector: React.FC<AuditTrailInspectorProps> = ({
  selectedEvent,
  copiedEventId,
  onCopyEventId,
  onSelectImage,
  onClose
}) => {
  const beforeRecords = parseStateRecords(
    selectedEvent.before_state || (selectedEvent.from_status ? { trang_thai: selectedEvent.from_status } : null)
  )
  const afterRecords = parseStateRecords(
    selectedEvent.after_state || (selectedEvent.to_status ? { trang_thai: selectedEvent.to_status } : null)
  )

  return (
    <div className="w-full bg-white space-y-4 text-xs">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">
              Chi Tiết Sự Kiện
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              {selectedEvent.occurred_at_local.split(' ')[1]}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
            <span>Mã sự kiện:</span>
            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-semibold border border-slate-200">
              {selectedEvent.event_id}
            </span>
            <button
              type="button"
              onClick={() => onCopyEventId(selectedEvent.event_id)}
              className="p-0.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              title="Sao chép Mã sự kiện"
            >
              <span className="material-symbols-outlined text-[15px]">
                {copiedEventId ? 'check' : 'content_copy'}
              </span>
            </button>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Đóng chi tiết"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        )}
      </div>

      {/* Thông tin thực thể và tác nhân */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">Dự án:</span>
          <span className="font-semibold text-slate-900 text-right truncate max-w-[200px]" title={selectedEvent.project_name}>
            {selectedEvent.project_name}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">Thực thể:</span>
          <span className="font-mono font-bold text-slate-900 truncate max-w-[200px]" title={selectedEvent.target_entity_name}>
            {selectedEvent.target_entity_name}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">Lý trình:</span>
          <span className="font-mono text-slate-700 text-right truncate max-w-[200px]">
            {selectedEvent.target_location || 'Toàn dự án'}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
          <span className="text-slate-500 font-medium">Người thực hiện:</span>
          <div className="flex items-center gap-1.5">
            {selectedEvent.actor_avatar && (
              <img
                src={selectedEvent.actor_avatar}
                alt={selectedEvent.actor_name}
                className="w-4 h-4 rounded-full object-cover border border-slate-200"
              />
            )}
            <span className="font-semibold text-slate-900">
              {selectedEvent.actor_name}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              ({selectedEvent.actor_role_label})
            </span>
          </div>
        </div>

        {/* Căn cứ và lý do nghiệp vụ */}
        <div className="pt-1.5 border-t border-slate-200/80 space-y-1">
          <span className="text-slate-500 font-medium">Căn cứ &amp; Lý do thực hiện:</span>
          <div className="text-slate-700 italic leading-relaxed bg-white p-2 rounded border border-slate-200">
            "{selectedEvent.reason}"
          </div>
        </div>
      </div>

      {/* Ảnh chụp hiện trường nếu có */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">photo_camera</span>
            <span>
              Minh chứng hiện trường{' '}
              {selectedEvent.evidence_snapshot?.images?.length ? `(${selectedEvent.evidence_snapshot.images.length} ảnh)` : ''}
            </span>
          </span>
          {selectedEvent.evidence_snapshot?.images && selectedEvent.evidence_snapshot.images.length > 0 && (
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
              Tọa độ GPS hợp lệ
            </span>
          )}
        </div>

        {selectedEvent.evidence_snapshot?.images && selectedEvent.evidence_snapshot.images.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {selectedEvent.evidence_snapshot.images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => onSelectImage(img)}
                className="group relative rounded-lg overflow-hidden border border-slate-200 cursor-pointer bg-slate-100 hover:border-brand-gold transition-colors"
                title="Nhấn để xem ảnh phóng to"
              >
                <img
                  src={img.url}
                  alt={img.caption}
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = FALLBACK_INSPECTION_IMG
                  }}
                  className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex flex-col justify-end p-1.5 text-white">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] font-medium truncate leading-tight">
                      {img.caption}
                    </span>
                    <span className="material-symbols-outlined text-[14px] text-white/80 group-hover:text-white shrink-0">
                      zoom_in
                    </span>
                  </div>
                  <span className="text-[8px] font-mono text-slate-300">
                    GPS: {img.gps_coordinates.split(',')[0]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-2.5 px-3 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-400 text-[11px] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-slate-400">no_photography</span>
              <span>Thao tác hệ thống (Không kèm ảnh hiện trường)</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Bản ghi hệ thống</span>
          </div>
        )}
      </div>

      {/* Đối chiếu biến động dữ liệu Trước / Sau (Định dạng tiếng Việt chuẩn kỹ thuật, không dùng mã JSON) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-slate-500">compare_arrows</span>
            <span>Đối chiếu dữ liệu (Trước / Sau)</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Cột 1: Dữ liệu Trước */}
          <div className="rounded-lg bg-slate-50/90 border border-slate-200 p-2.5 space-y-1.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wide">
                Dữ liệu trước
              </span>
              <span className="text-[9px] bg-rose-50 text-rose-600 px-1 py-0.2 rounded border border-rose-200 font-semibold">
                Ban đầu
              </span>
            </div>

            {beforeRecords.length > 0 ? (
              <div className="space-y-1.5 pt-0.5">
                {beforeRecords.map((item, i) => (
                  <div key={i} className="flex flex-col text-[11px] leading-tight">
                    <span className="text-slate-400 font-medium text-[9px] uppercase">
                      {item.label}
                    </span>
                    <span className="font-semibold text-slate-700 break-words mt-0.5">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 italic pt-1">
                Khởi tạo lần đầu
              </div>
            )}
          </div>

          {/* Cột 2: Dữ liệu Sau */}
          <div className="rounded-lg bg-emerald-50/40 border border-emerald-200 p-2.5 space-y-1.5">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                Dữ liệu sau
              </span>
              <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1 py-0.2 rounded font-semibold">
                Cập nhật
              </span>
            </div>

            {afterRecords.length > 0 ? (
              <div className="space-y-1.5 pt-0.5">
                {afterRecords.map((item, i) => (
                  <div key={i} className="flex flex-col text-[11px] leading-tight">
                    <span className="text-emerald-700/80 font-medium text-[9px] uppercase">
                      {item.label}
                    </span>
                    <span className="font-semibold text-slate-900 break-words mt-0.5">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 italic pt-1">
                Không ghi nhận thay đổi
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chú thích lưu trữ */}
      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed flex items-start gap-1.5">
        <span className="material-symbols-outlined text-[16px] text-brand-gold shrink-0 mt-0.5">lock</span>
        <div>
          Hồ sơ dự án được lưu trữ tối thiểu đến hết thời hạn bảo hành cộng <strong>5 năm</strong>. Hồ sơ có đánh dấu khóa pháp lý không được phép xóa.
        </div>
      </div>
    </div>
  )
}
