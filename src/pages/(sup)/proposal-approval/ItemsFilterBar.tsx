import React from 'react'
import { Icon } from '../../../components/ui/Icon'

export interface ItemsFilterBarProps {
  isSupervisor: boolean
  filterTab: 'ALL' | 'PENDING' | 'APPROVED' | 'REQUEST_EVIDENCE' | 'REJECTED'
  setFilterTab: (tab: 'ALL' | 'PENDING' | 'APPROVED' | 'REQUEST_EVIDENCE' | 'REJECTED') => void
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
  searchTerm: string
  setSearchTerm: (term: string) => void
  stats: {
    total: number
    approved: number
    evidence: number
    reconsider: number
    rejected: number
    pending: number
  }
  displayedCount: number
  filteredCount: number
}

export const ItemsFilterBar: React.FC<ItemsFilterBarProps> = ({
  isSupervisor,
  filterTab,
  setFilterTab,
  setCurrentPage,
  searchTerm,
  setSearchTerm,
  stats,
  displayedCount,
  filteredCount
}) => {
  return (
    <div className="space-y-3 font-body">
      {/* Table Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-base text-slate-900 font-headline">
            Danh sách hạng mục kỹ thuật trong gói đề xuất
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isSupervisor
              ? 'Thẩm định hồ sơ hư hỏng, khối lượng kỹ thuật và giải pháp do PM đề xuất'
              : 'Kiểm tra giải pháp kỹ thuật và phân công tổ thi công sau khi được phê duyệt'}
          </p>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs overflow-x-auto">
          <button
            onClick={() => {
              setFilterTab('ALL')
              setCurrentPage(1)
            }}
            type="button"
            className={`px-3 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap text-xs ${
              filterTab === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({stats.total})
          </button>
          <button
            onClick={() => {
              setFilterTab('PENDING')
              setCurrentPage(1)
            }}
            type="button"
            className={`px-3 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap text-xs ${
              filterTab === 'PENDING'
                ? 'bg-white text-[#2D3748] shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Chờ thẩm định ({stats.pending})
          </button>
          <button
            onClick={() => {
              setFilterTab('APPROVED')
              setCurrentPage(1)
            }}
            type="button"
            className={`px-3 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap text-xs ${
              filterTab === 'APPROVED'
                ? 'bg-white text-[#2F9E44] shadow-2xs font-bold'
                : 'text-slate-600 hover:text-[#2F9E44]'
            }`}
          >
            Đã duyệt ({stats.approved})
          </button>
          <button
            onClick={() => {
              setFilterTab('REQUEST_EVIDENCE')
              setCurrentPage(1)
            }}
            type="button"
            className={`px-3 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap text-xs ${
              filterTab === 'REQUEST_EVIDENCE'
                ? 'bg-white text-[#0284C7] shadow-2xs font-bold'
                : 'text-slate-600 hover:text-[#0284C7]'
            }`}
          >
            Cần minh chứng ({stats.evidence + stats.reconsider})
          </button>
          <button
            onClick={() => {
              setFilterTab('REJECTED')
              setCurrentPage(1)
            }}
            type="button"
            className={`px-3 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap text-xs ${
              filterTab === 'REJECTED'
                ? 'bg-white text-[#E5484D] shadow-2xs font-bold'
                : 'text-slate-600 hover:text-[#E5484D]'
            }`}
          >
            Từ chối ({stats.rejected})
          </button>
        </div>
      </div>

      {/* Search Row */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="relative w-full max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center">
            <Icon name="search" size={16} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Tìm theo mã hạng mục, hư hỏng, lý trình, giải pháp..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-gold transition-all"
          />
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline-block">
          Hiển thị {displayedCount} trên {filteredCount} hạng mục phù hợp
        </span>
      </div>
    </div>
  )
}
