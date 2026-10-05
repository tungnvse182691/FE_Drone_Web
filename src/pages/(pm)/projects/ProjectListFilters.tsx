import React from 'react'
import {
  Search,
  Grid,
  Table as TableIcon
} from 'lucide-react'
import { ProjectFilterTab, ProjectViewMode } from './types'

interface ProjectListFiltersProps {
  filterTab: ProjectFilterTab
  onSelectFilterTab: (tab: ProjectFilterTab) => void
  scopedCount: number
  activeCount: number
  nearExpiryCount: number
  pendingAlignmentCount: number
  searchQuery: string
  onChangeSearchQuery: (query: string) => void
  viewMode: ProjectViewMode
  onChangeViewMode: (mode: ProjectViewMode) => void
}

export const ProjectListFilters: React.FC<ProjectListFiltersProps> = ({
  filterTab,
  onSelectFilterTab,
  scopedCount,
  activeCount,
  nearExpiryCount,
  pendingAlignmentCount,
  searchQuery,
  onChangeSearchQuery,
  viewMode,
  onChangeViewMode
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
      {/* State Pills / Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
        <button
          type="button"
          onClick={() => onSelectFilterTab('ALL')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
            filterTab === 'ALL'
              ? 'bg-[#C9A227] text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <span>Tất cả</span>
          <span className="px-1.5 py-0.2 rounded-full bg-black/10 text-[10px] font-mono">{scopedCount}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectFilterTab('ACTIVE')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
            filterTab === 'ACTIVE'
              ? 'bg-[#1B5E20] text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#1B5E20]"></span>
          <span>Đang bảo hành</span>
          <span className="text-[11px] font-mono text-slate-500">{activeCount}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectFilterTab('NEAR_EXPIRY')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
            filterTab === 'NEAR_EXPIRY'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>Sắp hết hạn</span>
          <span className="text-[11px] font-mono text-slate-500">{nearExpiryCount}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectFilterTab('PENDING_ALIGNMENT')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
            filterTab === 'PENDING_ALIGNMENT'
              ? 'bg-[#D97706] text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#D97706]"></span>
          <span>Chờ duyệt tuyến</span>
          <span className="text-[11px] font-mono text-slate-500">{pendingAlignmentCount}</span>
        </button>
      </div>

      {/* Quick Search & View Toggle */}
      <div className="flex items-center gap-2 flex-1 md:max-w-md justify-end">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onChangeSearchQuery(e.target.value)}
            placeholder="Tìm theo tên dự án, mã PRJ, hoặc PM phụ trách..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 text-slate-800 placeholder-slate-400 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C9A227] transition"
          />
        </div>

        <div className="shrink-0 flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => onChangeViewMode('grid')}
            className={`p-1.5 rounded-md transition cursor-pointer ${
              viewMode === 'grid' ? 'bg-white text-[#C9A227] shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Dạng lưới"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onChangeViewMode('table')}
            className={`p-1.5 rounded-md transition cursor-pointer ${
              viewMode === 'table' ? 'bg-white text-[#C9A227] shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Dạng bảng"
          >
            <TableIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
