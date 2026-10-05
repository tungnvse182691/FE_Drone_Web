import React from 'react'
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react'

export interface ProposalFilterBarProps {
  searchTerm: string
  onSearchChange: (val: string) => void
  activeFilterTab: 'ALL' | 'SUBMITTED' | 'DECIDED' | 'DISPATCHED' | 'DRAFT'
  onTabChange: (tab: 'ALL' | 'SUBMITTED' | 'DECIDED' | 'DISPATCHED' | 'DRAFT') => void
  stats: {
    total: number
    draft: number
    submitted: number
    decided: number
    dispatched: number
  }
  onSetPage: (page: number) => void
  advRoute: string
  onRouteFilterChange: (route: string) => void
  advScale: string
  onScaleFilterChange: (scale: string) => void
  advContractor: string
  onContractorFilterChange: (contractor: string) => void
  onResetFilters: () => void
}

export const ProposalFilterBar: React.FC<ProposalFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  activeFilterTab,
  onTabChange,
  stats,
  onSetPage,
  advRoute,
  onRouteFilterChange,
  advScale,
  onScaleFilterChange,
  advContractor,
  onContractorFilterChange,
  onResetFilters,
}) => {
  return (
    <div className="space-y-4">
      {/* Search & Filter Tab Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              onSearchChange(e.target.value)
              onSetPage(1)
            }}
            placeholder="Tìm theo mã gói, tên công việc hoặc lý trình..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#C9A227] transition-all font-medium"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => onTabChange('ALL')}
            type="button"
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeFilterTab === 'ALL'
                ? 'bg-[#C9A227] text-white shadow-xs'
                : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Tất cả ({stats.total})
          </button>
          <button
            onClick={() => onTabChange('SUBMITTED')}
            type="button"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeFilterTab === 'SUBMITTED'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Chờ duyệt ({stats.submitted})
          </button>
          <button
            onClick={() => onTabChange('DECIDED')}
            type="button"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeFilterTab === 'DECIDED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Đã duyệt ({stats.decided})
          </button>
          <button
            onClick={() => onTabChange('DISPATCHED')}
            type="button"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeFilterTab === 'DISPATCHED'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Đang thi công ({stats.dispatched})
          </button>
          <button
            onClick={() => onTabChange('DRAFT')}
            type="button"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeFilterTab === 'DRAFT'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Bản nháp ({stats.draft})
          </button>
        </div>
      </div>

      {/* INLINE BỘ LỌC TRỰC TIẾP */}
      <div className="flex items-center gap-2.5 flex-wrap pt-1 text-xs">
        <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1 mr-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#C9A227]" />
          <span>Bộ lọc:</span>
        </span>

        {/* Tuyến đường */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <span className="text-slate-400 text-[11px] font-medium">Tuyến:</span>
          <select
            value={advRoute}
            onChange={(e) => {
              onRouteFilterChange(e.target.value)
              onSetPage(1)
            }}
            className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả tuyến đường</option>
            <option value="QL1A_PK04">QL1A - Giai đoạn 2 (Km 1024 - 1045)</option>
            <option value="QL1A_PK01">QL1A - Giai đoạn 1 (Km 1000 - 1024)</option>
            <option value="EXPR_NORTH_SOUTH">Đường nối Cao tốc Bắc - Nam</option>
          </select>
        </div>

        {/* Quy mô khiếm khuyết */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <span className="text-slate-400 text-[11px] font-medium">Quy mô:</span>
          <select
            value={advScale}
            onChange={(e) => {
              onScaleFilterChange(e.target.value)
              onSetPage(1)
            }}
            className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả quy mô</option>
            <option value="LARGE">Gói lớn (&gt; 10 khiếm khuyết)</option>
            <option value="MEDIUM">Gói vừa (5 - 10 khiếm khuyết)</option>
            <option value="SMALL">Gói nhỏ (&lt; 5 khiếm khuyết)</option>
          </select>
        </div>

        {/* Tổ đội thi công */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <span className="text-slate-400 text-[11px] font-medium">Đơn vị thi công:</span>
          <select
            value={advContractor}
            onChange={(e) => {
              onContractorFilterChange(e.target.value)
              onSetPage(1)
            }}
            className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả đơn vị thi công</option>
            <option value="Tổ vá dặm cơ giới 01">Tổ vá dặm cơ giới 01</option>
            <option value="Xí nghiệp Cầu Đường 4">Xí nghiệp Cầu Đường 4</option>
            <option value="Tổ duy tu bảo dưỡng đường bộ 03">Tổ duy tu bảo dưỡng 03</option>
            <option value="Đội cơ động">Đội cơ động khắc phục sự cố</option>
          </select>
        </div>

        {/* Reset filter button if any active */}
        {(advRoute !== 'ALL' || advScale !== 'ALL' || advContractor !== 'ALL') && (
          <button
            onClick={() => {
              onResetFilters()
              onSetPage(1)
            }}
            type="button"
            className="px-2.5 py-1.5 text-[#C9A227] hover:text-[#9E7B15] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ml-auto"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Đặt lại bộ lọc</span>
          </button>
        )}
      </div>
    </div>
  )
}
