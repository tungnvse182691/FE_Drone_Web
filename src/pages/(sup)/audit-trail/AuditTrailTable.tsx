import React, { useState } from 'react'
import { AuditEvent } from '../../../types/domain'

interface AuditTrailTableProps {
  filteredEvents: AuditEvent[]
  selectedEventId: string
  onSelectEventId: (id: string) => void
  onOpenDetails?: (id: string) => void
}

const PAGE_SIZE = 10

const formatStatusVi = (st?: string | null) => {
  if (!st) return ''
  switch (st) {
    case 'PENDING_APPROVAL':
      return 'Chờ duyệt'
    case 'APPROVED':
      return 'Đã duyệt'
    case 'DRAFT':
      return 'Bản nháp'
    case 'UNASSIGNED':
      return 'Chưa phân công'
    case 'ASSIGNED':
      return 'Đã phân công'
    case 'PENDING_INSPECTION':
      return 'Chờ nghiệm thu'
    case 'ACCEPTED':
      return 'Nghiệm thu đạt'
    case 'IN_PROGRESS':
      return 'Đang thi công'
    case 'RESOLVED':
      return 'Đã xử lý xong'
    case 'REVISION_REQUIRED':
      return 'Yêu cầu sửa lại'
    case 'PUBLISHED':
      return 'Đã công bố'
    case 'ACTIVE':
      return 'Đang lưu trữ'
    case 'LOCKED':
      return 'Khóa thanh tra'
    default:
      return st
  }
}

export const AuditTrailTable: React.FC<AuditTrailTableProps> = ({
  filteredEvents,
  selectedEventId,
  onSelectEventId,
  onOpenDetails
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE))

  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-xs">
      {/* Table Header Control (Không còn các mã code rác) */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-brand-gold">history</span>
          <span className="font-bold text-slate-800">
            Dòng Sự Kiện Hoạt Động
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px] font-semibold">
            {filteredEvents.length} bản ghi
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-500 text-[11px]">
          <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
          <span>Dòng sự kiện bất biến, không thể chỉnh sửa hay xóa</span>
        </div>
      </div>

      {/* Table Data (Header viết hoa theo DESIGN.md) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">THỜI ĐIỂM</th>
              <th className="py-2.5 px-3">TÁC NHÂN</th>
              <th className="py-2.5 px-3">HÀNH ĐỘNG</th>
              <th className="py-2.5 px-3">ĐỐI TƯỢNG &amp; LÝ TRÌNH</th>
              <th className="py-2.5 px-3">CHUYỂN TRẠNG THÁI</th>
              <th className="py-2.5 px-3">MÃ SỰ KIỆN</th>
              <th className="py-2.5 px-3 text-center">CHI TIẾT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedEvents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  Không tìm thấy sự kiện nào trong khoảng thời gian đã chọn.
                </td>
              </tr>
            ) : (
              paginatedEvents.map((ev) => {
                const isSelected = ev.id === selectedEventId
                return (
                  <tr
                    key={ev.id}
                    onClick={() => {
                      onSelectEventId(ev.id)
                      onOpenDetails?.(ev.id)
                    }}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/50 border-l-2 border-l-brand-gold'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* 1. Timestamp (Gọn gàng, thuần giờ Việt Nam, bỏ dòng UTC thừa) */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-xs font-semibold text-slate-800">
                      {ev.occurred_at_local}
                    </td>

                    {/* 2. Actor */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {ev.actor_avatar ? (
                          <img
                            src={ev.actor_avatar}
                            alt={ev.actor_name}
                            className="w-6 h-6 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                            {ev.actor_name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col leading-tight">
                          <span className="font-semibold text-slate-900">
                            {ev.actor_name}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {ev.actor_role_label}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 3. Action */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${ev.action_badge_style}`}
                      >
                        {ev.action_label_vi}
                      </span>
                    </td>

                    {/* 4. Target & Location */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-900 max-w-[180px] truncate" title={ev.target_entity_name}>
                        {ev.target_entity_name}
                      </div>
                      {ev.target_location && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {ev.target_location}
                        </div>
                      )}
                    </td>

                    {/* 5. Status Transition (Thuần Việt 100%) */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {ev.from_status ? (
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="text-slate-400 line-through text-[10px]">
                            {formatStatusVi(ev.from_status)}
                          </span>
                          <span className="material-symbols-outlined text-[13px] text-slate-400">arrow_forward</span>
                          <span className="font-bold text-slate-800">
                            {formatStatusVi(ev.to_status)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-emerald-700 font-semibold text-[11px]">
                          {formatStatusVi(ev.to_status)}
                        </span>
                      )}
                    </td>

                    {/* 6. Event ID */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {ev.event_id}
                      </span>
                    </td>

                    {/* 7. Action Button */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectEventId(ev.id)
                          onOpenDetails?.(ev.id)
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                        title="Xem chi tiết sự kiện"
                      >
                        <span className="material-symbols-outlined text-[15px] text-slate-500">visibility</span>
                        <span>Chi tiết</span>
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Trang {currentPage} / {totalPages} (Tổng số {filteredEvents.length} sự kiện)
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
