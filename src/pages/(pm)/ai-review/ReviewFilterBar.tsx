import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import type { TriageCase, ActiveTabFilter } from './types'

export interface ReviewFilterBarProps {
  cases: TriageCase[]
  activeTab: ActiveTabFilter
  setActiveTab: (tab: ActiveTabFilter) => void
  pendingCount: number
  mergedCount: number
  surveyCount: number
  criticalCount: number
  sourceFilter: string
  setSourceFilter: (val: string) => void
  lineTypeFilter: string
  setLineTypeFilter: (val: string) => void
  projectFilter: string
  setProjectFilter: (val: string) => void
  priorityFilter: string
  setPriorityFilter: (val: string) => void
  setSearchQuery: (val: string) => void
  showToast: (msg: string) => void
}

export const ReviewFilterBar: React.FC<ReviewFilterBarProps> = ({
  cases,
  activeTab,
  setActiveTab,
  pendingCount,
  mergedCount,
  surveyCount,
  criticalCount,
  sourceFilter,
  setSourceFilter,
  lineTypeFilter,
  setLineTypeFilter,
  projectFilter,
  setProjectFilter,
  priorityFilter,
  setPriorityFilter,
  setSearchQuery,
  showToast,
}) => {
  return (
    <div className="bg-white rounded-xl border border-brand-border shadow-2xs p-4 space-y-3">
      {/* 1. Horizontal Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('ALL')}
          type="button"
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-brand-dark text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tất cả <span className="ml-1 opacity-70">({cases.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('PENDING')}
          type="button"
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'PENDING'
              ? 'bg-brand-gold text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Icon name="schedule" size={14} />
          <span>Chờ xác minh</span>
          <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">{pendingCount}</span>
        </button>
        <button
          onClick={() => setActiveTab('MERGED')}
          type="button"
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'MERGED'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Đã gộp trùng <span className="ml-1 opacity-70">({mergedCount})</span>
        </button>
        <button
          onClick={() => setActiveTab('NEED_SURVEY')}
          type="button"
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'NEED_SURVEY'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Cần đo đạc <span className="ml-1 opacity-70">({surveyCount})</span>
        </button>
        <button
          onClick={() => setActiveTab('CRITICAL')}
          type="button"
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'CRITICAL'
              ? 'bg-red-600 text-white shadow-xs'
              : 'bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          <Icon name="warning" size={14} />
          <span>Khẩn cấp</span>
          <span className="ml-0.5 bg-red-700 text-white px-1.5 py-0.2 rounded-full text-[10px]">{criticalCount}</span>
        </button>
      </div>

      {/* 2. 5-Column Filter Selectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-1 border-t border-slate-100">
        {/* Cột 1: Nguồn tiếp nhận */}
        <div className="flex flex-col">
          <label className="text-[11px] font-semibold text-slate-500 mb-1">Nguồn tiếp nhận</label>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-gold font-medium"
          >
            <option value="ALL">Tất cả nguồn</option>
            <option value="DRONE_AI">Drone AI quét tự động</option>
            <option value="CITIZEN">Người dân phản ánh</option>
            <option value="PATROL">Đội tuần tra hiện trường</option>
          </select>
        </div>

        {/* Cột 2: Phạm vi tuyến đường (Trục chính vs Tuyến nhánh) */}
        <div className="flex flex-col">
          <label className="text-[11px] font-semibold text-slate-500 mb-1">Phạm vi tuyến</label>
          <select
            value={lineTypeFilter}
            onChange={(e) => setLineTypeFilter(e.target.value)}
            className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-gold font-medium"
          >
            <option value="ALL">Tất cả phạm vi</option>
            <option value="MAIN_LINE">[Trục chính] Tuyến QL1A</option>
            <option value="BRANCH_LINE">[Tuyến nhánh] Nhánh Hải Vân</option>
          </select>
        </div>

        {/* Cột 3: Mức độ ưu tiên */}
        <div className="flex flex-col">
          <label className="text-[11px] font-semibold text-slate-500 mb-1">Mức độ ưu tiên</label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-gold font-medium"
          >
            <option value="ALL">Mọi cấp độ</option>
            <option value="CRITICAL">Khẩn cấp</option>
            <option value="HIGH">Cao</option>
            <option value="MEDIUM">Vừa</option>
            <option value="LOW">Bình thường</option>
          </select>
        </div>

        {/* Cột 4: Tuyến quốc lộ / Dự án */}
        <div className="flex flex-col">
          <label className="text-[11px] font-semibold text-slate-500 mb-1">Dự án bảo hành</label>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-gold font-medium"
          >
            <option value="ALL">Tất cả dự án</option>
            <option value="QL1A - Giai đoạn 2 (Km 1020 - Km 1045)">QL1A - Giai đoạn 2</option>
            <option value="Cao tốc Bắc Nam">Cao tốc Bắc Nam</option>
            <option value="QL1A - Tuyến mở rộng">QL1A - Tuyến mở rộng</option>
          </select>
        </div>

        {/* Cột 5: Đặt lại bộ lọc */}
        <div className="flex items-end">
          <button
            onClick={() => {
              setSourceFilter('ALL')
              setLineTypeFilter('ALL')
              setProjectFilter('ALL')
              setPriorityFilter('ALL')
              setSearchQuery('')
              setActiveTab('ALL')
              showToast('Đã đặt lại toàn bộ bộ lọc')
            }}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer"
            title="Đặt lại bộ lọc"
            type="button"
          >
            <Icon name="refresh" size={14} className="text-slate-500" />
            <span>Đặt lại bộ lọc</span>
          </button>
        </div>
      </div>
    </div>
  )
}
