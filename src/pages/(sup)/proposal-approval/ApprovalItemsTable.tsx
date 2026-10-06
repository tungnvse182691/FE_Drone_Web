import React from 'react'
import { AlertCircle } from 'lucide-react'
import { RepairItemDetail } from './types'
import { ItemsFilterBar } from './ItemsFilterBar'
import { ItemsTableRow } from './ItemsTableRow'

export interface ApprovalItemsTableProps {
  items: RepairItemDetail[]
  filteredItems: RepairItemDetail[]
  displayedItems: RepairItemDetail[]
  filterTab: 'ALL' | 'PENDING' | 'APPROVED' | 'REQUEST_EVIDENCE' | 'REJECTED'
  setFilterTab: (tab: 'ALL' | 'PENDING' | 'APPROVED' | 'REQUEST_EVIDENCE' | 'REJECTED') => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  currentPage: number
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
  totalPages: number
  stats: {
    total: number
    approved: number
    evidence: number
    reconsider: number
    rejected: number
    pending: number
    percent: number
    approvedArea: number
    totalProposedArea: number
  }
  onViewPhoto: (item: RepairItemDetail) => void
  onQuickApprove: (itemId: string) => void
  onOpenDecisionModal: (item: RepairItemDetail, type: 'EVIDENCE' | 'RECONSIDER' | 'REJECT') => void
  onCrewChange: (itemId: string, newCrew: string) => void
  isSupervisor?: boolean
}

export const ApprovalItemsTable: React.FC<ApprovalItemsTableProps> = ({
  filteredItems,
  displayedItems,
  filterTab,
  setFilterTab,
  searchTerm,
  setSearchTerm,
  currentPage,
  setCurrentPage,
  totalPages,
  stats,
  onViewPhoto,
  onQuickApprove,
  onOpenDecisionModal,
  onCrewChange,
  isSupervisor = true
}) => {
  return (
    <section className="bg-white border border-[#E2E5E9] rounded-2xl shadow-sm p-6 space-y-4">
      {/* Table Header & Search Filter Bar */}
      <ItemsFilterBar
        isSupervisor={isSupervisor}
        filterTab={filterTab}
        setFilterTab={setFilterTab}
        setCurrentPage={setCurrentPage}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        stats={stats}
        displayedCount={displayedItems.length}
        filteredCount={filteredItems.length}
      />

      {/* Responsive Table Container */}
      <div className="overflow-x-auto w-full rounded-xl border border-slate-200 bg-white shadow-2xs custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse min-w-[1050px]">
          <thead className="bg-[#F8F9FA] border-y border-[#E2E5E9] text-slate-500 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-3.5 rounded-l-lg min-w-[150px]">
                Mã &amp; Hư hỏng
              </th>
              <th className="py-3 px-3.5 whitespace-nowrap min-w-[130px]">Vị trí &amp; Lý trình</th>
              <th className="py-3 px-3.5 min-w-[180px]">Hư hại &amp; Đo đạc</th>
              <th className="py-3 px-3.5 min-w-[200px]">Phương án kỹ thuật</th>
              <th className="py-3 px-3.5 text-right whitespace-nowrap min-w-[110px]">Khối lượng</th>
              <th className="py-3 px-3.5 text-center whitespace-nowrap min-w-[120px]">Trạng thái duyệt</th>
              <th className="py-3 px-3.5 text-center whitespace-nowrap min-w-[140px]">
                {isSupervisor ? 'Thao tác Thẩm định' : 'Thẩm định'}
              </th>
              <th className="py-3 px-3.5 rounded-r-lg whitespace-nowrap min-w-[180px]">
                {isSupervisor ? 'Đội thi công (Dự kiến / Đã giao)' : 'Phân công tổ thi công'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E5E9]">
            {displayedItems.map((item) => (
              <ItemsTableRow
                key={item.id}
                item={item}
                isSupervisor={isSupervisor}
                onViewPhoto={onViewPhoto}
                onQuickApprove={onQuickApprove}
                onOpenDecisionModal={onOpenDecisionModal}
                onCrewChange={onCrewChange}
              />
            ))}

            {displayedItems.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-slate-600">Không có hạng mục nào phù hợp với bộ lọc!</p>
                  <p className="text-xs text-slate-400 mt-1">Vui lòng thay đổi từ khóa hoặc chọn tab khác.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination / Summary Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E2E5E9] text-xs text-slate-600">
        <div>
          Hiển thị <span className="font-bold text-slate-900">{displayedItems.length}</span> trên{' '}
          <span className="font-bold text-slate-900">{filteredItems.length}</span> hạng mục được lập kế hoạch
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            type="button"
            className="px-2.5 py-1.5 rounded-lg border border-[#E2E5E9] bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium cursor-pointer"
          >
            Trước
          </button>
          {Array.from({ length: totalPages }).map((_, idx) => {
            const p = idx + 1
            return (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                type="button"
                className={`w-8 h-8 rounded-full font-bold text-xs transition cursor-pointer ${
                  currentPage === p
                    ? 'bg-[#C9A227] text-white shadow-2xs'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                {p}
              </button>
            )
          })}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            type="button"
            className="px-2.5 py-1.5 rounded-lg border border-[#E2E5E9] bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium cursor-pointer"
          >
            Sau
          </button>
        </div>
      </div>
    </section>
  )
}
export default ApprovalItemsTable
