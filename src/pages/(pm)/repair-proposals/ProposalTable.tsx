import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/ui/Icon'
import { ProposalWorkPackage } from './types'
import { ProposalFilterBar } from './ProposalFilterBar'
import { ProposalTableRow } from './ProposalTableRow'

export interface ProposalTableProps {
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
  packages: ProposalWorkPackage[]
  paginatedPackages: ProposalWorkPackage[]
  filteredPackages: ProposalWorkPackage[]
  currentPage: number
  totalPages: number
  pageSize: number
  onSetPage: (page: number) => void
  basePath: string
  isSupervisor: boolean
  isPM: boolean
  onSubmitDraft: (id: string, code: string) => void
  onDeleteDraft: (id: string, code: string) => void
  onQuickApprove: (id: string, code: string) => void
  showToast: (msg: string) => void

  // Inline Filter Props
  advRoute: string
  onRouteFilterChange: (route: string) => void
  advScale: string
  onScaleFilterChange: (scale: string) => void
  advContractor: string
  onContractorFilterChange: (contractor: string) => void
  onResetFilters: () => void
}

export const ProposalTable: React.FC<ProposalTableProps> = ({
  searchTerm,
  onSearchChange,
  activeFilterTab,
  onTabChange,
  stats,
  packages,
  paginatedPackages,
  filteredPackages,
  currentPage,
  totalPages,
  pageSize,
  onSetPage,
  basePath,
  isSupervisor,
  isPM,
  onSubmitDraft,
  onDeleteDraft,
  onQuickApprove,
  showToast,
  advRoute,
  onRouteFilterChange,
  advScale,
  onScaleFilterChange,
  advContractor,
  onContractorFilterChange,
  onResetFilters,
}) => {
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState<{
    pkg: ProposalWorkPackage
    openUpwards: boolean
    top?: number
    bottom?: number
    right: number
  } | null>(null)

  useEffect(() => {
    if (!activeMenu) return
    const handleClose = () => setActiveMenu(null)
    window.addEventListener('scroll', handleClose, true)
    window.addEventListener('resize', handleClose)
    return () => {
      window.removeEventListener('scroll', handleClose, true)
      window.removeEventListener('resize', handleClose)
    }
  }, [activeMenu])

  const handleToggleMenu = (pkg: ProposalWorkPackage, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (activeMenu?.pkg.id === pkg.id) {
      setActiveMenu(null)
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const openUpwards = spaceBelow < 210 && spaceAbove > 140

    setActiveMenu({
      pkg,
      openUpwards,
      right: Math.max(16, window.innerWidth - rect.right),
      top: openUpwards ? undefined : rect.bottom + 6,
      bottom: openUpwards ? window.innerHeight - rect.top + 6 : undefined
    })
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-2xs border border-slate-200 space-y-4 font-body">
      {/* Search & Filter Component */}
      <ProposalFilterBar
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        activeFilterTab={activeFilterTab}
        onTabChange={onTabChange}
        stats={stats}
        onSetPage={onSetPage}
        advRoute={advRoute}
        onRouteFilterChange={onRouteFilterChange}
        advScale={advScale}
        onScaleFilterChange={onScaleFilterChange}
        advContractor={advContractor}
        onContractorFilterChange={onContractorFilterChange}
        onResetFilters={onResetFilters}
      />

      {/* Responsive Table với Sticky Cột Đầu & Cột Cuối */}
      <div className="overflow-x-auto w-full rounded-lg border border-slate-200 bg-white shadow-2xs">
        <table className="w-full text-left border-collapse text-xs min-w-[1240px]">
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-2.5 px-3 whitespace-nowrap sticky left-0 bg-[#F8F9FA] z-20">
                Mã gói
              </th>
              <th className="py-2.5 px-3 min-w-[280px] max-w-[340px]">Tên gói công việc &amp; Phạm vi lý trình</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Hạng mục lỗi</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Khối lượng dự kiến</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Thời gian thi công</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Người lập / Ngày trình</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Trạng thái</th>
              <th className="py-2.5 px-3 min-w-[140px] whitespace-nowrap">Tiến độ phê duyệt</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap sticky right-0 bg-[#F8F9FA] z-20 min-w-[200px]">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedPackages.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">
                  Không tìm thấy gói đề xuất kỹ thuật nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              paginatedPackages.map((pkg) => (
                <ProposalTableRow
                  key={pkg.id}
                  pkg={pkg}
                  basePath={basePath}
                  isSupervisor={isSupervisor}
                  isPM={isPM}
                  onSubmitDraft={onSubmitDraft}
                  onDeleteDraft={onDeleteDraft}
                  onQuickApprove={onQuickApprove}
                  showToast={showToast}
                  isMenuActive={activeMenu?.pkg.id === pkg.id}
                  onToggleMenu={handleToggleMenu}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination / Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500">
        <span>
          Hiển thị{' '}
          <strong className="text-slate-800">
            {filteredPackages.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
            {Math.min(currentPage * pageSize, filteredPackages.length)}
          </strong>{' '}
          trên tổng số <strong className="text-slate-800">{filteredPackages.length}</strong> gói đề xuất
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onSetPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            type="button"
            className="w-7 h-7 rounded flex items-center justify-center text-slate-600 border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Trang trước"
          >
            <Icon name="chevron_left" size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onSetPage(pageNum)}
              type="button"
              className={`w-7 h-7 rounded font-medium flex items-center justify-center transition-colors cursor-pointer text-xs ${
                currentPage === pageNum
                  ? 'bg-brand-gold text-white font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => onSetPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            type="button"
            className="w-7 h-7 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Trang kế tiếp"
          >
            <Icon name="chevron_right" size={16} />
          </button>
        </div>
      </div>

      {/* Floating Menu Tùy Chọn */}
      {activeMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setActiveMenu(null)}
          />
          <div
            style={{
              ...(activeMenu.openUpwards
                ? { bottom: `${activeMenu.bottom}px` }
                : { top: `${activeMenu.top}px` }),
              right: `${activeMenu.right}px`
            }}
            className={`fixed z-50 w-52 bg-white rounded-lg shadow-xl border border-slate-200 py-1 text-left text-xs ${
              activeMenu.openUpwards ? 'slide-in-from-bottom-2' : 'slide-in-from-top-2'
            }`}
          >
            <div className="px-3 py-1 mb-1 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                {activeMenu.pkg.code}
              </span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(activeMenu.pkg.code)
                showToast(`Đã sao chép mã gói [${activeMenu.pkg.code}]!`)
                setActiveMenu(null)
              }}
              className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-normal transition cursor-pointer"
            >
              <Icon name="content_copy" size={14} className="text-slate-500" />
              <span>Sao chép mã gói</span>
            </button>
            <button
              onClick={() => {
                navigate(`${basePath}/proposals/${activeMenu.pkg.id}`)
                setActiveMenu(null)
              }}
              className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-normal transition cursor-pointer"
            >
              <Icon name="visibility" size={14} className="text-slate-500" />
              <span>Thẩm định chi tiết</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
export default ProposalTable
