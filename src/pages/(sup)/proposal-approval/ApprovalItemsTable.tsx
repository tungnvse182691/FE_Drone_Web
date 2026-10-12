import React from 'react'
import { Icon } from '../../../components/ui/Icon'
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
    <section className="bg-white border border-slate-200 rounded-xl shadow-2xs p-5 space-y-4 font-body">
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
      <div className="overflow-x-auto w-full rounded-lg border border-slate-200 bg-white shadow-2xs">
        <table className="w-full text-left text-xs border-collapse min-w-[1050px]">
          <thead className="bg-[#F8F9FA] border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-2.5 px-3 min-w-[150px]">Mã &amp; Hư hỏng</th>
              <th className="py-2.5 px-3 whitespace-nowrap min-w-[130px]">Vị trí &amp; Lý trình</th>
              <th className="py-2.5 px-3 min-w-[170px]">Hư hại &amp; Đo đạc</th>
              <th className="py-2.5 px-3 min-w-[200px]">Phương án kỹ thuật</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap min-w-[110px]">Khối lượng</th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap min-w-[120px]">Trạng thái duyệt</th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap min-w-[130px]">
                {isSupervisor ? 'Thao tác Thẩm định' : 'Thẩm định'}
              </th>
              <th className="py-2.5 px-3 whitespace-nowrap min-w-[180px]">
                {isSupervisor ? 'Đội thi công (Dự kiến)' : 'Phân công tổ thi công'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
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
                <td colSpan={8} className="py-10 text-center text-slate-400">
                  <Icon name="error" size={32} className="mx-auto mb-1 text-slate-300" />
                  <p className="font-semibold text-slate-600">Không có hạng mục nào phù hợp!</p>
                  <p className="text-xs text-slate-400 mt-0.5">Vui lòng thay đổi từ khóa hoặc chọn tab khác.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination / Summary Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-600">
        <div>
          Hiển thị <span className="font-bold text-slate-900">{displayedItems.length}</span> trên{' '}
          <span className="font-bold text-slate-900">{filteredItems.length}</span> hạng mục
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            type="button"
            className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs cursor-pointer"
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
                className={`w-7 h-7 rounded text-xs transition cursor-pointer font-medium ${
                  currentPage === p
                    ? 'bg-brand-gold text-white font-bold'
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
            className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs cursor-pointer"
          >
            Sau
          </button>
        </div>
      </div>
    </section>
  )
}
export default ApprovalItemsTable
