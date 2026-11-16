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

const getEventDotStyle = (ev: AuditEvent) => {
  const act = `${ev.action_type || ''} ${ev.action_label_vi || ''}`.toLowerCase()
  if (act.includes('approve') || act.includes('accept') || act.includes('duyệt') || act.includes('nghiệm thu')) {
    return 'bg-[#047857] ring-[#047857]/20'
  }
  if (act.includes('reject') || act.includes('từ chối') || act.includes('lock') || act.includes('khóa')) {
    return 'bg-[#B91C1C] ring-[#B91C1C]/20'
  }
  if (act.includes('revision') || act.includes('sửa') || act.includes('cảnh báo')) {
    return 'bg-[#B45309] ring-[#B45309]/20'
  }
  if (act.includes('assign') || act.includes('giao') || act.includes('phân công') || act.includes('submit') || act.includes('trình')) {
    return 'bg-[#1E40AF] ring-[#1E40AF]/20'
  }
  return 'bg-[#C9A227] ring-[#C9A227]/20'
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
    <div className="w-full bg-white border-[1.5px] border-[#E2E5E9] rounded-[20px] overflow-hidden flex flex-col shadow-2xs relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1E40AF] via-[#C9A227] to-slate-200" />
      {/* Table Header Control (Không còn các mã code rác) */}
      <div className="p-4 bg-white border-b border-[#EDEFF2] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-amber-50 border border-amber-200 flex items-center justify-center text-[#C9A227] shrink-0">
            <span className="material-symbols-outlined text-[18px]">history</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">
                Dòng Sự Kiện Hoạt Động
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px] font-bold border border-slate-200">
                {filteredEvents.length} bản ghi
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Chuỗi sự kiện được ghi nhận theo thời gian thực trên trục dòng thời gian</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
          <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
          <span>Dòng sự kiện bất biến, không thể chỉnh sửa hay xóa</span>
        </div>
      </div>

      {/* Table Data (Header viết hoa theo DESIGN.md) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8F9FA] text-slate-700 font-semibold uppercase tracking-wider text-[12px] border-b border-[#EDEFF2]">
            <tr>
              <th className="py-3 px-4">DÒNG THỜI GIAN</th>
              <th className="py-3 px-3">TÁC NHÂN</th>
              <th className="py-3 px-3">HÀNH ĐỘNG</th>
              <th className="py-3 px-3">ĐỐI TƯỢNG &amp; LÝ TRÌNH</th>
              <th className="py-3 px-3">CHUYỂN TRẠNG THÁI</th>
              <th className="py-3 px-3">MÃ SỰ KIỆN</th>
              <th className="py-3 px-3 text-center">CHI TIẾT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDEFF2]">
            {paginatedEvents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  Không tìm thấy sự kiện nào trong khoảng thời gian đã chọn.
                </td>
              </tr>
            ) : (
              paginatedEvents.map((ev, idx) => {
                const isSelected = ev.id === selectedEventId
                const dotClass = getEventDotStyle(ev)
                return (
                  <tr
                    key={ev.id}
                    onClick={() => {
                      onSelectEventId(ev.id)
                      onOpenDetails?.(ev.id)
                    }}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/60 border-l-2 border-l-[#C9A227]'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* 1. Dòng thời gian với trục dọc mảnh #E2E5E9 và chấm màu */}
                    <td className="py-3.5 px-4 whitespace-nowrap relative">
                      <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center w-4 self-stretch shrink-0">
                          {/* Trục dọc mảnh #E2E5E9 */}
                          <span className={`absolute w-[1.5px] bg-[#E2E5E9] ${
                            idx === 0 ? 'top-1/2 bottom-[-16px]' : idx === paginatedEvents.length - 1 ? 'top-[-16px] bottom-1/2' : 'top-[-16px] bottom-[-16px]'
                          }`} />
                          {/* Chấm tròn 10px với vòng sáng ring-4 */}
                          <span className={`relative z-10 w-2.5 h-2.5 rounded-full ring-4 shadow-2xs ${dotClass}`} />
                        </div>
                        <span className="font-mono text-xs font-semibold text-slate-800">
                          {ev.occurred_at_local}
                        </span>
                      </div>
                    </td>

                    {/* 2. Actor */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {ev.actor_avatar ? (
                          <img
                            src={ev.actor_avatar}
                            alt={ev.actor_name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] border border-slate-200 shadow-2xs">
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
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${ev.action_badge_style}`}
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
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="text-slate-400 line-through text-[10px]">
                            {formatStatusVi(ev.from_status)}
                          </span>
                          <span className="material-symbols-outlined text-[13px] text-slate-400">arrow_forward</span>
                          <span className="font-bold text-slate-800">
                            {formatStatusVi(ev.to_status)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-emerald-700 font-bold text-[11px]">
                          {formatStatusVi(ev.to_status)}
                        </span>
                      )}
                    </td>

                    {/* 6. Event ID */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-[6px] border border-slate-200">
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
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition cursor-pointer shadow-2xs"
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
        <div className="p-3.5 bg-[#F8F9FA] border-t border-[#EDEFF2] flex items-center justify-between text-xs text-slate-500">
          <div>
            Trang {currentPage} / {totalPages} (Tổng số {filteredEvents.length} sự kiện)
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded-[6px] hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded-[6px] hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
