import React from 'react'
import {
  Inbox,
  Flame,
  Clock,
  ArrowRight
} from 'lucide-react'
import { NotificationItem } from './types'

interface NotificationsFeedProps {
  filteredNotifications: NotificationItem[]
  onMarkAsRead: (id: string, e?: React.MouseEvent) => void
  onNavigateAction: (item: NotificationItem) => void
}

export const NotificationsFeed: React.FC<NotificationsFeedProps> = ({
  filteredNotifications,
  onMarkAsRead,
  onNavigateAction
}) => {
  return (
    <div className="lg:col-span-8 space-y-3.5">
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-border p-12 text-center space-y-3">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="text-base font-bold text-slate-700">Không có thông báo phù hợp</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Hiện tại không có mục bàn giao hoặc cảnh báo nào trong bộ lọc này. Tất cả công việc đang trong tầm kiểm soát.
          </p>
        </div>
      ) : (
        filteredNotifications.map((item) => (
          <article
            key={item.id}
            onClick={() => onMarkAsRead(item.id)}
            className={`relative rounded-2xl p-5 border transition-all cursor-pointer ${
              !item.read
                ? 'bg-white border-brand-gold/40 shadow-xs hover:border-brand-gold hover:shadow-md'
                : 'bg-slate-50/70 border-slate-200 opacity-90 hover:opacity-100 hover:bg-white'
            }`}
          >
            {/* Unread Indicator Bar */}
            {!item.read && (
              <div className="absolute left-0 top-4 bottom-4 w-1 bg-brand-gold rounded-r-full"></div>
            )}

            <div className="flex flex-col gap-3">
              {/* Row 1: Badges, Meta, Timestamp */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Priority Tag */}
                  {item.priority === 'EMERGENCY' ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3 text-rose-600 animate-pulse" />
                      <span>KHẨN CẤP (EMERGENCY)</span>
                    </span>
                  ) : item.priority === 'HIGH' ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>ƯU TIÊN CAO</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      THÔNG THƯỜNG
                    </span>
                  )}

                  {/* Category Pill */}
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                    {item.categoryLabel}
                  </span>

                  {/* Resource Code */}
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                    {item.resourceId}
                  </span>

                  {/* Route Code */}
                  <span className="text-[11px] font-semibold text-[#8F7212]">
                    {item.routeCode}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.timeAgo}</span>
                </div>
              </div>

              {/* Row 2: Title & Message */}
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                  <span>{item.title}</span>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-brand-gold shrink-0" title="Chưa đọc"></span>
                  )}
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.message}
                </p>
              </div>

              {/* Row 3: Sender info & Quick Action Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="font-semibold text-slate-800">{item.sender}</span>
                  <span>•</span>
                  <span className="font-mono text-slate-600">{item.stationing}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* SLA remaining alert tag */}
                  {item.slaHoursRemaining !== undefined && (
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold flex items-center gap-1 ${
                      item.slaHoursRemaining < 2
                        ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      <Clock className="w-3 h-3" />
                      <span>SLA còn: {item.slaHoursRemaining}h</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onNavigateAction(item)
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-brand-gold hover:bg-[#B38E1F] text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))
      )}
    </div>
  )
}
