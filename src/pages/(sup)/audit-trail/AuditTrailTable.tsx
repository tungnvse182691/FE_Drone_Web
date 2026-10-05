import React from 'react'
import { History, Lock, ArrowRight, Code, ChevronLeft, ChevronRight } from 'lucide-react'
import { AuditEvent } from '../../../types/domain'

interface AuditTrailTableProps {
  filteredEvents: AuditEvent[]
  selectedEventId: string
  onSelectEventId: (id: string) => void
}

export const AuditTrailTable: React.FC<AuditTrailTableProps> = ({
  filteredEvents,
  selectedEventId,
  onSelectEventId
}) => {
  return (
    <div className="xl:col-span-8 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
      {/* Table Header Control */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-brand-gold" />
          <span className="text-sm font-bold text-slate-900">
            Dòng sự kiện hoạt động dự án (Timeline - FR-34)
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono text-[11px] font-semibold">
            {filteredEvents.length} bản ghi
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Chế độ kiểm toán pháp lý không thể sửa/xóa (US-29-AC-03, BR-45)</span>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200 font-semibold">
              <th className="py-3 px-4">Thời điểm (GMT+7)</th>
              <th className="py-3 px-3">Tác nhân thực hiện</th>
              <th className="py-3 px-3">Hành động nghiệp vụ</th>
              <th className="py-3 px-3">Đối tượng &amp; Lý trình</th>
              <th className="py-3 px-3">Chuyển trạng thái</th>
              <th className="py-3 px-3">Mã sự kiện</th>
              <th className="py-3 px-4 text-right">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  Không tìm thấy sự kiện kiểm toán nào khớp với tiêu chí lọc.
                </td>
              </tr>
            ) : (
              filteredEvents.map((ev) => {
                const isSelected = ev.id === selectedEventId
                return (
                  <tr
                    key={ev.id}
                    onClick={() => onSelectEventId(ev.id)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/70 border-l-4 border-l-brand-gold'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* 1. Timestamp (Theo giờ địa phương v2.2 Điều 11.3) */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono text-xs font-semibold text-slate-900">
                        {ev.occurred_at_local}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">
                        UTC: {ev.occurred_at.replace('T', ' ').substring(0, 19)}
                      </div>
                    </td>

                    {/* 2. Actor */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {ev.actor_avatar ? (
                          <img
                            src={ev.actor_avatar}
                            alt={ev.actor_name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-xs"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[11px]">
                            {ev.actor_name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col leading-tight">
                          <span className="font-semibold text-slate-900">
                            {ev.actor_name}
                          </span>
                          <span className="font-mono text-[10px] text-brand-goldDark font-semibold">
                            {ev.actor_role_label}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 3. Action Badge */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold ${ev.action_badge_style}`}
                      >
                        {ev.action_label_vi}
                      </span>
                    </td>

                    {/* 4. Target Entity & Location */}
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-900 truncate max-w-[170px]" title={ev.target_entity_name}>
                        {ev.target_entity_name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate max-w-[170px]" title={ev.target_location || ev.project_name}>
                        {ev.target_location || ev.project_name}
                      </div>
                    </td>

                    {/* 5. State Transition (from_status -> to_status) */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {ev.from_status ? (
                        <div className="flex items-center gap-1 font-mono text-[10px]">
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                            {ev.from_status}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">
                            {ev.to_status}
                          </span>
                        </div>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded font-mono text-[10px] font-semibold border border-emerald-200">
                          {ev.to_status}
                        </span>
                      )}
                    </td>

                    {/* 6. Event ID (Dedup ID theo US-29-AC-01) */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                        {ev.event_id}
                      </span>
                    </td>

                    {/* 7. Action Button */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectEventId(ev.id)
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
                          isSelected
                            ? 'bg-brand-gold text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <Code className="w-3.5 h-3.5" />
                        <span>Soi chi tiết</span>
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-col gap-0.5">
          <span className="text-slate-700 font-medium">
            Phạm vi dòng sự kiện: từ{' '}
            <code className="font-mono font-bold text-brand-goldDark">
              {filteredEvents[0]?.event_id || 'EV-START'}
            </code>{' '}
            đến{' '}
            <code className="font-mono font-bold text-brand-goldDark">
              {filteredEvents[filteredEvents.length - 1]?.event_id || 'EV-END'}
            </code>
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            Tuân thủ quy tắc lưu trữ BR-45 &amp; truy vết IncidentCaseHistory
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium transition-colors shadow-xs"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Trang trước</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium transition-colors shadow-xs"
          >
            <span>Trang kế tiếp</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
