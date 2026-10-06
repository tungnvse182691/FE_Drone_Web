import React from 'react'
import { Search } from 'lucide-react'

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
    <div className="space-y-4">
      {/* Table Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-lg text-slate-900 font-sansation">
            Danh sách hạng mục kỹ thuật trong gói đề xuất
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isSupervisor
              ? 'Thẩm định cao độ, hồ sơ hư hỏng, định mức và phương án kỹ thuật do PM đề xuất'
              : 'Kiểm tra cao độ, khối lượng bóc tách và phân công tổ thi công cơ giới sau khi được phê duyệt'}
          </p>
        </div>

        {/* Quick Filter Pills (Rounded Full) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-[#E2E5E9] text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => {
              setFilterTab('ALL')
              setCurrentPage(1)
            }}
            type="button"
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
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
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'PENDING'
                ? 'bg-white text-amber-800 shadow-2xs font-bold'
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
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'APPROVED'
                ? 'bg-white text-[#1B5E20] shadow-2xs font-bold'
                : 'text-[#1B5E20] hover:bg-white/50'
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
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'REQUEST_EVIDENCE'
                ? 'bg-white text-[#0284C7] shadow-2xs font-bold'
                : 'text-[#0284C7] hover:bg-white/50'
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
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'REJECTED'
                ? 'bg-white text-[#DC2626] shadow-2xs font-bold'
                : 'text-[#DC2626] hover:bg-white/50'
            }`}
          >
            Từ chối ({stats.rejected})
          </button>
        </div>
      </div>

      {/* Search Row */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Tìm theo mã hạng mục, hư hỏng, lý trình, giải pháp..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#C9A227] transition-all font-medium"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
          Hiển thị {displayedCount} trên {filteredCount} hạng mục phù hợp
        </span>
      </div>
    </div>
  )
}
