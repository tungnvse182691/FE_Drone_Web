import React from 'react'
import {
  AlertTriangle,
  RefreshCw,
  Bot,
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
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Horizontal Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        <button
          type="button"
          onClick={() => onChangeTab('ALL')}
          className={`px-4 py-2 rounded-full font-semibold text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-[#C9A227] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
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
          className={`px-4 py-2 rounded-full font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'ACTION_REQUIRED'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Cần tôi xử lý</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'ACTION_REQUIRED' ? 'bg-white/25 text-white' : 'bg-amber-200 text-amber-900'
          }`}>
            {actionRequiredCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChangeTab('HANDOVER')}
          className={`px-4 py-2 rounded-full font-semibold text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'HANDOVER'
              ? 'bg-[#C9A227] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5 text-brand-gold" />
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
          className={`px-4 py-2 rounded-full font-semibold text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'AI_SYSTEM'
              ? 'bg-[#C9A227] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-purple-600" />
          <span>Tiến trình AI &amp; Drone</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'AI_SYSTEM' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {aiSystemCount}
          </span>
        </button>
      </div>

      {/* Search & Priority Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onChangeSearchQuery(e.target.value)}
            placeholder="Tìm mã phiếu, lý trình..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
          />
        </div>

        <select
          value={priorityFilter}
          onChange={(e) => onChangePriorityFilter(e.target.value as NotificationPriorityFilter)}
          className="h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
        >
          <option value="ALL">Mức độ: Tất cả</option>
          <option value="EMERGENCY">Khẩn cấp (EMERGENCY)</option>
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
          <span className={`w-2 h-2 rounded-full ${unreadOnly ? 'bg-[#C9A227]' : 'bg-slate-300'}`}></span>
          <span>Chưa đọc</span>
        </button>
      </div>
    </div>
  )
}
