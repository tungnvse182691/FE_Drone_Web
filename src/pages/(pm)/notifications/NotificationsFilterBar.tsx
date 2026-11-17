import React, { useEffect, useRef, useState } from 'react'
import {
  Search
} from 'lucide-react'
import { NotificationCategoryTab, NotificationPriorityFilter } from './types'

interface NotificationsFilterBarProps {
  activeTab: NotificationCategoryTab
  onChangeTab: (tab: NotificationCategoryTab) => void
  totalCount: number
  actionRequiredCount: number
  handoverCount: number
  aiSystemCount: number
  searchQuery: string
  onChangeSearchQuery: (query: string) => void
  priorityFilter: NotificationPriorityFilter
  onChangePriorityFilter: (filter: NotificationPriorityFilter) => void
  unreadOnly: boolean
  onToggleUnreadOnly: () => void
}

export const NotificationsFilterBar: React.FC<NotificationsFilterBarProps> = ({
  activeTab,
  onChangeTab,
  totalCount,
  actionRequiredCount,
  handoverCount,
  aiSystemCount,
  searchQuery,
  onChangeSearchQuery,
  priorityFilter,
  onChangePriorityFilter,
  unreadOnly,
  onToggleUnreadOnly
}) => {
  const tabsRef = useRef<HTMLDivElement>(null)
  const [fade, setFade] = useState({ left: false, right: false })
  const updateFade = () => {
    const el = tabsRef.current
    if (!el) return
    setFade({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 })
  }
  useEffect(() => {
    const el = tabsRef.current
    if (!el) return
    el.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
    updateFade()
    const ro = new ResizeObserver(updateFade)
    ro.observe(el)
    return () => ro.disconnect()
  }, [activeTab])
  return (
    <div className="flex flex-col 2xl:flex-row items-stretch 2xl:items-center justify-between gap-3">
      {/* Horizontal Category Tabs (cuộn ngang trong khung, mép mờ khi còn tab bị che) */}
      <div className="relative min-w-0">
      {fade.left && <div aria-hidden className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-[#F8F9FA] to-transparent" />}
      {fade.right && <div aria-hidden className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-[#F8F9FA] to-transparent" />}
      <div ref={tabsRef} onScroll={updateFade} className="flex items-center gap-2 overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => onChangeTab('ALL')}
          data-active={activeTab === 'ALL'}
          className={`shrink-0 px-5 py-[11px] rounded-[16px] font-semibold text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-[#C9A227] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-[#E2E5E9] hover:border-[#C9A227]'
          }`}
        >
          <span>Tất cả</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {totalCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChangeTab('ACTION_REQUIRED')}
          data-active={activeTab === 'ACTION_REQUIRED'}
          className={`shrink-0 px-5 py-[11px] rounded-[16px] font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'ACTION_REQUIRED'
              ? 'bg-[#C9A227] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-[#E2E5E9] hover:border-[#C9A227]'
          }`}
        >
          <span>Cần tôi xử lý</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'ACTION_REQUIRED' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {actionRequiredCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChangeTab('HANDOVER')}
          data-active={activeTab === 'HANDOVER'}
          className={`shrink-0 px-5 py-[11px] rounded-[16px] font-semibold text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'HANDOVER'
              ? 'bg-[#C9A227] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-[#E2E5E9] hover:border-[#C9A227]'
          }`}
        >
          <span>Bàn giao PM ↔ Giám sát</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'HANDOVER' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {handoverCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChangeTab('AI_SYSTEM')}
          data-active={activeTab === 'AI_SYSTEM'}
          className={`shrink-0 px-5 py-[11px] rounded-[16px] font-semibold text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'AI_SYSTEM'
              ? 'bg-[#C9A227] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-[#E2E5E9] hover:border-[#C9A227]'
          }`}
        >
          <span>Tiến trình AI &amp; Thiết bị bay</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'AI_SYSTEM' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {aiSystemCount}
          </span>
        </button>
      </div>
      </div>

      {/* Search & Priority Controls */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onChangeSearchQuery(e.target.value)}
            placeholder="Tìm mã phiếu, lý trình..."
            className="w-full h-9 pl-8 pr-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-gold"
          />
        </div>

        <select
          value={priorityFilter}
          onChange={(e) => onChangePriorityFilter(e.target.value as NotificationPriorityFilter)}
          className="h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
        >
          <option value="ALL">Mức độ: Tất cả</option>
          <option value="EMERGENCY">Khẩn cấp</option>
          <option value="HIGH">Ưu tiên cao (SLA)</option>
          <option value="NORMAL">Thông thường</option>
        </select>

        <button
          type="button"
          onClick={onToggleUnreadOnly}
          className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
            unreadOnly
              ? 'bg-amber-50 text-[#8F7212] border-amber-300'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${unreadOnly ? 'bg-brand-gold' : 'bg-slate-300'}`}></span>
          <span>Chưa đọc</span>
        </button>
      </div>
    </div>
  )
}
