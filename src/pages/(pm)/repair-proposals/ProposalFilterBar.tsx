import React from 'react'
import { Icon } from '../../../components/ui/Icon'

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
    <div className="space-y-3 font-body">
      {/* Search & Filter Tab Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center">
            <Icon name="search" size={16} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              onSearchChange(e.target.value)
              onSetPage(1)
            }}
            placeholder="Tìm theo mã gói, tên công việc hoặc lý trình..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-gold transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => onTabChange('ALL')}
            type="button"
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeFilterTab === 'ALL'
                ? 'bg-brand-gold text-white font-bold'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Tất cả ({stats.total})
          </button>
          <button
            onClick={() => onTabChange('SUBMITTED')}
            type="button"
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeFilterTab === 'SUBMITTED'
                ? 'bg-amber-500 text-white font-bold'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Chờ duyệt ({stats.submitted})
          </button>
          <button
            onClick={() => onTabChange('DECIDED')}
            type="button"
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeFilterTab === 'DECIDED'
                ? 'bg-[#2F9E44] text-white font-bold'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Đã duyệt ({stats.decided})
          </button>
          <button
            onClick={() => onTabChange('DISPATCHED')}
            type="button"
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeFilterTab === 'DISPATCHED'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Đã giao việc ({stats.dispatched})
          </button>
          <button
            onClick={() => onTabChange('DRAFT')}
            type="button"
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeFilterTab === 'DRAFT'
                ? 'bg-[#2D3748] text-white font-bold'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Bản nháp ({stats.draft})
          </button>
        </div>
      </div>

      {/* INLINE BỘ LỌC TRỰC TIẾP */}
      <div className="flex items-center gap-2 flex-wrap pt-0.5 text-xs">
        <span className="text-slate-500 font-medium text-[11px] uppercase tracking-wider flex items-center gap-1 mr-1">
          <Icon name="filter_alt" size={14} className="text-brand-gold" />
          <span>Bộ lọc:</span>
        </span>

        {/* Tuyến đường */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
          <span className="text-slate-400 text-[11px]">Tuyến:</span>
          <select
            value={advRoute}
            onChange={(e) => {
              onRouteFilterChange(e.target.value)
              onSetPage(1)
            }}
            className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả tuyến đường</option>
            <option value="QL1A_PK04">QL1A - Giai đoạn 2</option>
            <option value="ROUTE_EXP_01">Đường nối Cao tốc Bắc - Nam</option>
          </select>
        </div>

        {/* Quy mô */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
          <span className="text-slate-400 text-[11px]">Quy mô:</span>
          <select
            value={advScale}
            onChange={(e) => {
              onScaleFilterChange(e.target.value)
              onSetPage(1)
            }}
            className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả quy mô</option>
            <option value="LARGE">&gt; 100 m² (Quy mô lớn)</option>
            <option value="MEDIUM">50 - 100 m² (Vừa)</option>
            <option value="SMALL">&lt; 50 m² (Cục bộ)</option>
          </select>
        </div>

        {/* Đơn vị thi công */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
          <span className="text-slate-400 text-[11px]">Đơn vị:</span>
          <select
            value={advContractor}
            onChange={(e) => {
              onContractorFilterChange(e.target.value)
              onSetPage(1)
            }}
            className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả đơn vị</option>
            <option value="Đội thi công sửa chữa Hoàng Hải 01">Đội Hoàng Hải 01</option>
            <option value="Tổ cơ động sửa chữa BTXM 02">Tổ BTXM 02</option>
            <option value="Tổ thi công Asphalt 01">Tổ Asphalt 01</option>
          </select>
        </div>

        {/* Nút reset nếu đang filter */}
        {(advRoute !== 'ALL' || advScale !== 'ALL' || advContractor !== 'ALL') && (
          <button
            onClick={onResetFilters}
            type="button"
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-red-600 transition-colors cursor-pointer px-2 py-1"
          >
            <Icon name="sync" size={13} />
            <span>Đặt lại</span>
          </button>
        )}
      </div>
    </div>
  )
}
export default ProposalFilterBar
