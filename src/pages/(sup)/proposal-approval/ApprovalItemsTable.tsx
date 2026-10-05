import React from 'react'
import {
  Search,
  ZoomIn,
  Info,
  RotateCcw,
  X,
  Check,
  AlertCircle,
  Clock,
  Camera,
  Construction,
  Lock
} from 'lucide-react'
import { RepairItemDetail, CREW_OPTIONS } from './types'
import { Tooltip } from '../../../components/ui/Tooltip'
import { TruncatedText } from '../../../components/ui/TruncatedText'

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
          Hiển thị {displayedItems.length} trên {filteredItems.length} hạng mục phù hợp
        </span>
      </div>

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
            {displayedItems.map((item) => {
              const isItemApproved = item.status === 'APPROVED'
              const isItemEvidence = item.status === 'REQUEST_EVIDENCE'
              const isItemReconsider = item.status === 'REQUEST_RECONSIDER'
              const isItemRejected = item.status === 'REJECTED'

              return (
                <tr
                  key={item.id}
                  className={`transition-colors hover:bg-slate-50/70 group ${
                    isItemEvidence || isItemReconsider ? 'bg-sky-50/20' : ''
                  }`}
                >
                  {/* Cột 1: Mã & Khuyết tật */}
                  <td className="py-3.5 px-3.5 align-top min-w-[150px]">
                    <div className="flex items-start gap-2.5">
                      <Tooltip content="Bấm để xem ảnh phóng to & thông số bay">
                        <div
                          onClick={() => onViewPhoto(item)}
                          className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 cursor-pointer relative group/img bg-slate-100"
                        >
                          <img
                            src={item.image_url}
                            alt=""
                            onError={(e) => {
                              e.currentTarget.src =
                                'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'
                            }}
                            className="w-full h-full object-cover group-hover/img:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <ZoomIn className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </Tooltip>
                      <div>
                        <span className="font-mono font-bold text-slate-900 block">{item.item_code}</span>
                        <span className="text-[11px] text-slate-500 font-medium font-mono block">
                          {item.defect_code}
                        </span>
                        {item.pilot_name && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {item.pilot_name.replace('Kỹ sư UAV ', '')} • {item.drone_model?.replace('DJI ', '') || 'M350'}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Cột 2: Vị trí & Lý trình */}
                  <td className="py-3.5 px-3 align-top whitespace-nowrap">
                    <span className="bg-slate-100 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold text-slate-800 border border-slate-200">
                      {item.chainage}
                    </span>
                    <span className="block text-slate-500 text-[11px] mt-1 font-medium">{item.lane_info}</span>
                  </td>

                  {/* Cột 3: Hư hại & Đo đạc */}
                  <td className="py-3.5 px-3 align-top min-w-[180px]">
                    <span className="font-semibold text-slate-900 block">{item.defect_title}</span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">{item.defect_measurements}</span>
                  </td>

                  {/* Cột 4: Phương án kỹ thuật (Truncation + Tooltip) */}
                  <td className="py-3.5 px-3 align-top min-w-[220px]">
                    <TruncatedText
                      text={item.solution_title}
                      lines={2}
                      className="text-slate-900 font-medium block"
                    />
                    <span className="text-slate-500 text-[11px] block mt-0.5">{item.solution_standard}</span>
                    {isItemEvidence && (
                      <div className="text-[#0284C7] text-[11px] font-semibold flex items-center gap-1 mt-1 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                        <Info className="w-3.5 h-3.5 shrink-0" />
                        <span>Đang yêu cầu bổ sung minh chứng</span>
                      </div>
                    )}
                    {isItemReconsider && (
                      <div className="text-amber-700 text-[11px] font-semibold flex items-center gap-1 mt-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                        <span>Yêu cầu PM xem xét lại giải pháp</span>
                      </div>
                    )}
                    {isItemRejected && item.supervisor_notes && (
                      <div className="text-rose-700 text-[11px] font-medium flex items-start gap-1 mt-1 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        <X className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{item.supervisor_notes}</span>
                      </div>
                    )}
                  </td>

                  {/* Cột 5: Khối lượng kỹ thuật */}
                  <td className="py-3.5 px-3 align-top text-right whitespace-nowrap">
                    <span className="font-mono font-bold text-slate-900 text-sm">{item.volume_display}</span>
                    <span className="text-[11px] text-slate-500 block">{item.volume_sub}</span>
                  </td>

                  {/* Cột 6: Trạng thái duyệt (100% Tiếng Việt) */}
                  <td className="py-3.5 px-3 align-top text-center whitespace-nowrap">
                    {isItemApproved && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EDF7ED] text-[#1B5E20] font-bold text-[11px] border border-emerald-200">
                        <Check className="w-3.5 h-3.5" />
                        Đã phê duyệt
                      </span>
                    )}
                    {isItemEvidence && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E0F2FE] text-[#0284C7] font-bold text-[11px] border border-sky-200">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Cần minh chứng
                      </span>
                    )}
                    {isItemReconsider && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-bold text-[11px] border border-amber-200">
                        <RotateCcw className="w-3.5 h-3.5" />
                        Xem xét lại
                      </span>
                    )}
                    {isItemRejected && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FEE2E2] text-[#DC2626] font-bold text-[11px] border border-rose-200">
                        <X className="w-3.5 h-3.5" />
                        Từ chối
                      </span>
                    )}
                    {item.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px] border border-slate-200">
                        <Clock className="w-3.5 h-3.5" />
                        Chờ thẩm định
                      </span>
                    )}
                  </td>

                  {/* Cột 7: Thao tác Thẩm định */}
                  <td className="py-3.5 px-3.5 align-top text-center whitespace-nowrap min-w-[140px]">
                    {isSupervisor ? (
                      <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-[#E2E5E9]">
                        <Tooltip content="Phê duyệt hạng mục này">
                          <button
                            onClick={() => onQuickApprove(item.id)}
                            type="button"
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                              isItemApproved
                                ? 'bg-[#EDF7ED] text-[#1B5E20] shadow-xs ring-1 ring-emerald-300'
                                : 'bg-white text-slate-500 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </Tooltip>

                        <Tooltip content="Yêu cầu bổ sung ảnh/thước đo thực địa">
                          <button
                            onClick={() => onOpenDecisionModal(item, 'EVIDENCE')}
                            type="button"
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                              isItemEvidence
                                ? 'bg-[#0284C7] text-white shadow-xs'
                                : 'bg-white text-slate-500 hover:text-[#0284C7] hover:bg-sky-50'
                            }`}
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                        </Tooltip>

                        <Tooltip content="Yêu cầu PM xem xét lại giải pháp">
                          <button
                            onClick={() => onOpenDecisionModal(item, 'RECONSIDER')}
                            type="button"
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                              isItemReconsider
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-white text-slate-500 hover:text-amber-700 hover:bg-amber-50'
                            }`}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </Tooltip>

                        <Tooltip content="Từ chối giải pháp kỹ thuật này">
                          <button
                            onClick={() => onOpenDecisionModal(item, 'REJECT')}
                            type="button"
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                              isItemRejected
                                ? 'bg-[#DC2626] text-white shadow-xs'
                                : 'bg-white text-slate-500 hover:text-[#DC2626] hover:bg-rose-50'
                            }`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </Tooltip>
                      </div>
                    ) : (
                      <Tooltip content="Quyền thẩm định và phê duyệt thuộc về Giám sát / Chủ đầu tư">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Giám sát thẩm duyệt</span>
                        </div>
                      </Tooltip>
                    )}
                  </td>

                  {/* Cột 8: Phân công Tổ thi công (Theo v2.2: Supervisor xem Read-only; Chỉ PM được phân công khi đã APPROVED) */}
                  <td className="py-3.5 px-3 align-top whitespace-nowrap">
                    {isSupervisor ? (
                      // Dành cho SUPERVISOR: Read-only, không thể chỉnh sửa tổ thi công của nhà thầu
                      item.assigned_crew ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                            <Construction className="w-3.5 h-3.5 text-[#C9A227]" />
                            <span>{item.assigned_crew}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 pl-1 font-medium">PM đã phân công</span>
                        </div>
                      ) : isItemApproved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/60">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Chờ PM giao việc</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-400 border border-slate-200">
                          <span>{isItemRejected ? 'Bị từ chối' : 'Chưa thẩm duyệt'}</span>
                        </span>
                      )
                    ) : (
                      // Dành cho PROJECT MANAGER (PM): Có thể chọn tổ thi công khi item đã APPROVED
                      isItemApproved ? (
                        <select
                          value={item.assigned_crew}
                          onChange={(e) => onCrewChange(item.id, e.target.value)}
                          className="w-48 bg-white border border-[#E2E5E9] text-slate-800 text-xs py-1.5 px-2.5 rounded-lg shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#C9A227] font-medium cursor-pointer"
                        >
                          {CREW_OPTIONS.map((crew) => (
                            <option key={crew} value={crew}>
                              {crew}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Tooltip content="Chỉ phân công đội thi công sau khi Giám sát đã phê duyệt phương án">
                          <div className="relative">
                            <select
                              disabled
                              className="w-48 bg-slate-100 text-slate-400 text-xs py-1.5 px-2.5 rounded-lg border border-[#E2E5E9] cursor-not-allowed font-medium"
                            >
                              <option>
                                {isItemRejected ? '-- Bị từ chối phương án --' : '-- Chưa thể phân công --'}
                              </option>
                            </select>
                          </div>
                        </Tooltip>
                      )
                    )}
                  </td>
                </tr>
              )
            })}

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
