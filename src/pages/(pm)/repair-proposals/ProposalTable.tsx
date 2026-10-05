import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Eye,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  Construction,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  Info,
  FileText,
  FileCheck2,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react'
import { ProposalWorkPackage } from './types'
import { Tooltip } from '../../../components/ui/Tooltip'
import { TruncatedText } from '../../../components/ui/TruncatedText'

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

  return (
    <div className="bg-white rounded-2xl p-5 shadow-2xs border border-brand-border space-y-4">
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

      {/* INLINE BỘ LỌC TRỰC TIẾP (Thay thế hoàn toàn Modal Bộ lọc nâng cao theo yêu cầu người dùng) */}
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

      {/* Responsive Table với Sticky Cột Đầu & Cột Cuối */}
      <div className="overflow-x-auto w-full rounded-xl border border-slate-200 bg-white shadow-2xs custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs min-w-[1240px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              {/* Sticky Column: Cột Mã gói */}
              <th className="py-3.5 px-4 whitespace-nowrap sticky left-0 bg-slate-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                Mã gói
              </th>
              <th className="py-3.5 px-4 min-w-[280px] max-w-[340px]">Tên gói công việc &amp; Phạm vi lý trình</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Hạng mục lỗi</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Khối lượng dự kiến</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Thời gian thi công</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Người lập / Ngày trình</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Trạng thái</th>
              <th className="py-3.5 px-4 min-w-[150px] whitespace-nowrap">Tiến độ phê duyệt</th>
              {/* Sticky Column: Cột Thao tác */}
              <th className="py-3.5 px-4 text-right whitespace-nowrap sticky right-0 bg-slate-50 z-20 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.08)]">
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
              paginatedPackages.map((pkg) => {
                const approvalRatio = pkg.total_items > 0 ? (pkg.approved_items / pkg.total_items) * 100 : 0

                return (
                  <tr key={pkg.id} className="hover:bg-amber-50/20 transition-colors group">
                    {/* Sticky Column: Mã gói */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap sticky left-0 bg-white group-hover:bg-amber-50/40 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-800">{pkg.code}</span>
                      </div>
                    </td>

                    {/* Tên gói công việc & Lý trình (Xử lý tràn chữ với Tooltip) */}
                    <td className="py-3.5 px-4 max-w-[340px]">
                      <div className="flex flex-col gap-0.5">
                        <TruncatedText
                          text={pkg.title}
                          lines={1}
                          className="font-bold text-brand-dark hover:text-brand-gold cursor-pointer transition-colors text-xs"
                        />
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <span className="font-medium text-slate-700">{pkg.route_name}</span>
                          <span>•</span>
                          <span className="font-mono text-[#8F7212] font-semibold">{pkg.chainage_display}</span>
                          <span>•</span>
                          <span>{pkg.segments_count} phân đoạn</span>
                        </div>
                      </div>
                    </td>

                    {/* Hạng mục lỗi */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{pkg.defect_count} điểm lỗi</span>
                        <span className="text-[11px] text-slate-500">{pkg.defect_summary}</span>
                      </div>
                    </td>

                    {/* Khối lượng kỹ thuật dự kiến */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{pkg.technical_scope}</span>
                        <span className="text-[11px] text-slate-500">{pkg.material_scope}</span>
                      </div>
                    </td>

                    {/* Thời gian thi công */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{pkg.duration_days} ngày</span>
                        <span className="text-[11px] text-slate-500">{pkg.date_range}</span>
                      </div>
                    </td>

                    {/* Người lập / Ngày trình */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {pkg.created_by_initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800 text-[11px]">{pkg.created_by_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{pkg.created_at}</span>
                        </div>
                      </div>
                    </td>

                    {/* Trạng thái 100% Tiếng Việt Chuẩn */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {pkg.status === 'SUBMITTED' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                          <span>Chờ phê duyệt</span>
                        </span>
                      )}
                      {pkg.status === 'DECIDED' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Đã phê duyệt</span>
                        </span>
                      )}
                      {pkg.status === 'DISPATCHED' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          <Construction className="w-3 h-3 text-blue-600" />
                          <span>Đang thi công</span>
                        </span>
                      )}
                      {pkg.status === 'DRAFT' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span>Bản nháp</span>
                        </span>
                      )}
                    </td>

                    {/* Tiến độ phê duyệt */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 w-32">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-700">
                            {pkg.approved_items}/{pkg.total_items} điểm
                          </span>
                          <span className="font-mono text-slate-500 font-bold">{Math.round(approvalRatio)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              approvalRatio === 100
                                ? 'bg-emerald-500'
                                : approvalRatio > 0
                                ? 'bg-[#C9A227]'
                                : 'bg-slate-300'
                            }`}
                            style={{ width: `${approvalRatio}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Sticky Column: Thao tác */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-amber-50/40 z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                      <div className="flex items-center justify-end gap-1.5 relative">
                        {/* Vai trò Supervisor */}
                        {isSupervisor && pkg.status === 'SUBMITTED' && (
                          <Tooltip content="Kỹ sư Giám sát phê duyệt nhanh gói đề xuất này">
                            <button
                              onClick={() => onQuickApprove(pkg.id, pkg.code)}
                              type="button"
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Phê duyệt</span>
                            </button>
                          </Tooltip>
                        )}

                        {isSupervisor && pkg.status === 'DECIDED' && (
                          <Tooltip content="Theo dõi tiến độ tổ thi công ngoài hiện trường">
                            <button
                              onClick={() => {
                                showToast(`Gói [${pkg.code}] đã được phê duyệt hợp lệ. Đang chuyển hướng kiểm tra hiện trường.`)
                                navigate(`${basePath}/proposals/${pkg.id}`)
                              }}
                              type="button"
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Theo dõi thi công</span>
                            </button>
                          </Tooltip>
                        )}

                        {/* Vai trò PM */}
                        {isPM && pkg.status === 'DRAFT' && (
                          <>
                            <Tooltip content="Khóa và trình nộp hồ sơ lên Giám sát">
                              <button
                                onClick={() => onSubmitDraft(pkg.id, pkg.code)}
                                type="button"
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#C9A227] hover:bg-[#B38E1F] text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Trình duyệt</span>
                              </button>
                            </Tooltip>
                            <Tooltip content="Xóa bản nháp này">
                              <button
                                onClick={() => onDeleteDraft(pkg.id, pkg.code)}
                                type="button"
                                className="p-1.5 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </Tooltip>
                          </>
                        )}

                        {/* Nút xem chi tiết / thẩm định */}
                        <Tooltip content={isSupervisor ? 'Thẩm định kỹ thuật chi tiết' : 'Xem chi tiết hồ sơ gói'}>
                          <button
                            onClick={() => navigate(`${basePath}/proposals/${pkg.id}`)}
                            type="button"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            <span>{isSupervisor ? 'Thẩm định' : 'Xem hồ sơ'}</span>
                          </button>
                        </Tooltip>

                        {/* Nút Menu tùy chọn */}
                        <Tooltip content="Tùy chọn khác">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (activeMenu?.pkg.id === pkg.id) {
                                setActiveMenu(null)
                                return
                              }
                              const rect = e.currentTarget.getBoundingClientRect()
                              const spaceBelow = window.innerHeight - rect.bottom
                              const spaceAbove = rect.top
                              // Nếu khoảng trống phía dưới < 210px (menu cao ~180px) thì mở vươn lên trên
                              const openUpwards = spaceBelow < 210 && spaceAbove > 140

                              setActiveMenu({
                                pkg,
                                openUpwards,
                                right: Math.max(16, window.innerWidth - rect.right),
                                top: openUpwards ? undefined : rect.bottom + 6,
                                bottom: openUpwards ? window.innerHeight - rect.top + 6 : undefined
                              })
                            }}
                            type="button"
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                              activeMenu?.pkg.id === pkg.id
                                ? 'bg-slate-200 text-slate-800'
                                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                )
              })
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
          trên tổng số <strong className="text-slate-800">{filteredPackages.length}</strong> gói đề xuất (tổng kho:{' '}
          {packages.length})
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onSetPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Trang trước"
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
                  ? 'bg-[#C9A227] text-white shadow-xs'
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
            title="Trang kế tiếp"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Menu Tùy Chọn - Fixed position hoàn toàn không bao giờ bị cắt bởi overflow container */}
      {activeMenu && (
        <>
          {/* Backdrop trong suốt bắt click outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setActiveMenu(null)}
          />
          {/* Dropdown Menu nổi lên trên toàn bộ trang - Tự động định vị trên/dưới an toàn */}
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
                {activeMenu.pkg.route_name.split('•')[0]}
              </span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(activeMenu.pkg.code)
                showToast(`Đã sao chép mã gói [${activeMenu.pkg.code}] vào bộ nhớ tạm!`)
                setActiveMenu(null)
              }}
              className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium transition cursor-pointer"
            >
              <Info className="w-4 h-4 text-[#C9A227]" />
              <span>Sao chép mã gói</span>
            </button>
            <button
              onClick={() => {
                navigate(`${basePath}/proposals/${activeMenu.pkg.id}`)
                setActiveMenu(null)
              }}
              className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium transition cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Thẩm định chi tiết</span>
            </button>
            <button
              onClick={() => {
                showToast(`Đang kết xuất bảng kỹ thuật chi tiết gói ${activeMenu.pkg.code}...`)
                setActiveMenu(null)
              }}
              className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium transition cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>Tải bảng danh mục kỹ thuật</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
