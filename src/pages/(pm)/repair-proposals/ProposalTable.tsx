import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  ChevronLeft,
  Info,
  FileText,
  FileCheck2,
} from 'lucide-react'
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
    <div className="bg-white rounded-2xl p-5 shadow-2xs border border-brand-border space-y-4">
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

      {/* Responsive Table vá»›i Sticky Cá»™t Äáº§u & Cá»™t Cuá»‘i */}
      <div className="overflow-x-auto w-full rounded-xl border border-slate-200 bg-white shadow-2xs custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs min-w-[1240px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 whitespace-nowrap sticky left-0 bg-slate-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                MÃ£ gÃ³i
              </th>
              <th className="py-3.5 px-4 min-w-[280px] max-w-[340px]">TÃªn gÃ³i cÃ´ng viá»‡c &amp; Pháº¡m vi lÃ½ trÃ¬nh</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Háº¡ng má»¥c lá»—i</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Khá»‘i lÆ°á»£ng dá»± kiáº¿n</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Thá»i gian thi cÃ´ng</th>
              <th className="py-3.5 px-4 whitespace-nowrap">NgÆ°á»i láº­p / NgÃ y trÃ¬nh</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Tráº¡ng thÃ¡i</th>
              <th className="py-3.5 px-4 min-w-[150px] whitespace-nowrap">Tiáº¿n Ä‘á»™ phÃª duyá»‡t</th>
              <th className="py-3.5 px-4 text-right whitespace-nowrap sticky right-0 bg-slate-50 z-20 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                Thao tÃ¡c
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedPackages.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">
                  KhÃ´ng tÃ¬m tháº¥y gÃ³i Ä‘á» xuáº¥t ká»¹ thuáº­t nÃ o phÃ¹ há»£p vá»›i bá»™ lá»c.
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
          Hiá»ƒn thá»‹{' '}
          <strong className="text-slate-800">
            {filteredPackages.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
            {Math.min(currentPage * pageSize, filteredPackages.length)}
          </strong>{' '}
          trÃªn tá»•ng sá»‘ <strong className="text-slate-800">{filteredPackages.length}</strong> gÃ³i Ä‘á» xuáº¥t (tá»•ng kho:{' '}
          {packages.length})
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onSetPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Trang trÆ°á»›c"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onSetPage(pageNum)}
              type="button"
              className={`w-8 h-8 rounded-full font-bold flex items-center justify-center transition-colors cursor-pointer text-xs ${
                currentPage === pageNum
                  ? 'bg-brand-gold text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => onSetPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Trang káº¿ tiáº¿p"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Menu TÃ¹y Chá»n */}
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
            className={`fixed z-50 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-left text-xs animate-in fade-in zoom-in-95 duration-150 max-h-[calc(100vh-32px)] overflow-y-auto ${
              activeMenu.openUpwards ? 'slide-in-from-bottom-2' : 'slide-in-from-top-2'
            }`}
          >
            <div className="px-3.5 py-1 mb-1 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                {activeMenu.pkg.code}
              </span>
              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[100px]">
                {activeMenu.pkg.route_name.split('â€¢')[0]}
              </span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(activeMenu.pkg.code)
                showToast(`ÄÃ£ sao chÃ©p mÃ£ gÃ³i [${activeMenu.pkg.code}] vÃ o bá»™ nhá»› táº¡m!`)
                setActiveMenu(null)
              }}
              className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium transition cursor-pointer"
            >
              <Info className="w-4 h-4 text-brand-gold" />
              <span>Sao chÃ©p mÃ£ gÃ³i</span>
            </button>
            <button
              onClick={() => {
                navigate(`${basePath}/proposals/${activeMenu.pkg.id}`)
                setActiveMenu(null)
              }}
              className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium transition cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Tháº©m Ä‘á»‹nh chi tiáº¿t</span>
            </button>
            <button
              onClick={() => {
                showToast(`Äang káº¿t xuáº¥t báº£ng ká»¹ thuáº­t chi tiáº¿t gÃ³i ${activeMenu.pkg.code}...`)
                setActiveMenu(null)
              }}
              className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium transition cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>Táº£i báº£ng danh má»¥c ká»¹ thuáº­t</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
