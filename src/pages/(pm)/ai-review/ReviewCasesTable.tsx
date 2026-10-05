import React from 'react'
import {
  Search,
  CheckSquare,
  Link2,
  Building2,
  RotateCcw,
  Smartphone,
  Car,
  Plane,
  Phone,
  Merge,
  Camera,
  X,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CornerDownRight,
  Unlink,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react'
import type { TriageCase, ViewSourceMode } from './types'

export interface ReviewCasesTableProps {
  viewSourceMode: ViewSourceMode
  cases: TriageCase[]
  filteredCases: TriageCase[]
  selectedCase: TriageCase
  onSelectCase: (c: TriageCase) => void
  selectedReportIds: string[]
  onToggleSelectReport: (id: string, e: React.MouseEvent) => void
  onSelectAllReports: () => void
  collapseMergedRows: boolean
  setCollapseMergedRows: (val: boolean) => void
  expandedMasterIds: string[]
  onToggleExpandMaster: (id: string, e: React.MouseEvent) => void
  searchQuery: string
  setSearchQuery: (val: string) => void
  onOpenTriageProject: (c: TriageCase, e?: React.MouseEvent) => void
  onOpenLinkReportsModal: () => void
  onUnlinkReport: (childId: string, e: React.MouseEvent) => void
  onOpenMergeModal: (c: TriageCase) => void
  onResetTriageData: () => void
  onClearSelectedReports: () => void
}

export const ReviewCasesTable: React.FC<ReviewCasesTableProps> = ({
  viewSourceMode,
  cases,
  filteredCases,
  selectedCase,
  onSelectCase,
  selectedReportIds,
  onToggleSelectReport,
  onSelectAllReports,
  collapseMergedRows,
  setCollapseMergedRows,
  expandedMasterIds,
  onToggleExpandMaster,
  searchQuery,
  setSearchQuery,
  onOpenTriageProject,
  onOpenLinkReportsModal,
  onUnlinkReport,
  onOpenMergeModal,
  onResetTriageData,
  onClearSelectedReports,
}) => {
  return (
    <div className="flex-1 w-full bg-white rounded-xl border border-brand-border shadow-2xs p-4 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Floating Batch Action Bar when items selected */}
        {selectedReportIds.length > 0 && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-lg border border-amber-400 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-slate-950 font-bold" />
              <span className="text-xs font-bold">
                Đã chọn {selectedReportIds.length} phản ánh hiện trường
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={onOpenLinkReportsModal}
                disabled={selectedReportIds.length < 2}
                className="px-3 py-1.5 rounded-lg bg-slate-950 text-white hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                title={
                  selectedReportIds.length < 2
                    ? 'Chọn từ 2 phản ánh trở lên để liên kết báo trùng'
                    : 'Liên kết báo trùng (PA04)'
                }
              >
                <Link2 className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Liên kết báo trùng (Link Reports - PA04)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const first = cases.find((c) => selectedReportIds.includes(c.id))
                  if (first) onOpenTriageProject(first)
                }}
                className="px-3 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors border border-amber-300"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-700" />
                <span>Điều phối vào dự án (PA03)</span>
              </button>
              <button
                type="button"
                onClick={onClearSelectedReports}
                className="px-2.5 py-1.5 rounded-lg text-slate-800 hover:bg-amber-400 text-xs font-semibold cursor-pointer"
              >
                Bỏ chọn
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-base text-brand-dark">
              {viewSourceMode === 'CITIZEN_TRIAGE'
                ? 'Bảng Phản Ánh Người Dân & Tuần Đường (Cần Triage & Link)'
                : viewSourceMode === 'DRONE_AI'
                ? 'Danh Sách Lỗi Do Drone AI Tự Động Quét Phát Hiện'
                : 'Toàn Bộ Hồ Sơ Khiếm Khuyết Chờ Phân Loại'}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span>
                Hiển thị {filteredCases.length} / {cases.length} hồ sơ
              </span>
              {viewSourceMode === 'CITIZEN_TRIAGE' && (
                <>
                  <span>•</span>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={collapseMergedRows}
                      onChange={(e) => setCollapseMergedRows(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-[#C9A227] focus:ring-[#C9A227] accent-[#C9A227]"
                    />
                    <span>Gộp báo trùng theo cây (Master-Tree)</span>
                  </label>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={onResetTriageData}
                    className="text-slate-500 hover:text-brand-dark hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    title="Đặt lại dữ liệu mẫu phản ánh ban đầu"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Đặt lại dữ liệu</span>
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã, người gửi, SĐT, lý trình..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
            />
          </div>
        </div>

        {/* View Mode 1: CITIZEN_TRIAGE Dedicated Table */}
        {viewSourceMode === 'CITIZEN_TRIAGE' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-8">
                    <input
                      type="checkbox"
                      checked={filteredCases.length > 0 && selectedReportIds.length === filteredCases.length}
                      onChange={onSelectAllReports}
                      className="w-3.5 h-3.5 rounded text-[#C9A227] focus:ring-[#C9A227] accent-[#C9A227] cursor-pointer"
                      title="Chọn tất cả"
                    />
                  </th>
                  <th className="py-2.5 px-3">Mã &amp; Kênh Gửi</th>
                  <th className="py-2.5 px-3">Người Báo &amp; SĐT</th>
                  <th className="py-2.5 px-3">Hiện Trường (GPS)</th>
                  <th className="py-2.5 px-3">Lý Trình &amp; Làn</th>
                  <th className="py-2.5 px-3">Dự Án Bảo Hành (PA03)</th>
                  <th className="py-2.5 px-3">Mô Tả / Loại Hư Hại</th>
                  <th className="py-2.5 px-3">Ưu Tiên</th>
                  <th className="py-2.5 px-3">Trạng Thái</th>
                  <th className="py-2.5 px-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases
                  .filter((c) => !collapseMergedRows || !c.master_case_id)
                  .map((item) => {
                    const isSelected = item.id === selectedCase.id
                    const isChecked = selectedReportIds.includes(item.id)
                    const isUnassigned = !item.project_id || item.project_id === ''
                    const isMaster = Boolean(item.linked_report_ids && item.linked_report_ids.length > 0)
                    const isExpanded = expandedMasterIds.includes(item.id)
                    const childReports = isMaster
                      ? cases.filter(
                          (c) =>
                            c.master_case_id === item.id ||
                            (item.linked_report_ids && item.linked_report_ids.includes(c.code))
                        )
                      : []

                    return (
                      <React.Fragment key={item.id}>
                        <tr
                          onClick={() => onSelectCase(item)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-amber-50/70 border-l-4 border-l-[#C9A227]'
                              : isChecked
                              ? 'bg-amber-50/30'
                              : isMaster
                              ? 'bg-purple-50/20 hover:bg-purple-50/50'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => onToggleSelectReport(item.id, e as any)}
                              className="w-3.5 h-3.5 rounded text-[#C9A227] focus:ring-[#C9A227] accent-[#C9A227] cursor-pointer"
                            />
                          </td>

                          {/* Code & Channel */}
                          <td className="py-3 px-3">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-xs text-brand-dark">{item.code}</span>
                                {isMaster && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
                                    Master
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                {item.source === 'CITIZEN' ? (
                                  <Smartphone className="w-3 h-3 text-blue-600" />
                                ) : (
                                  <Car className="w-3 h-3 text-[#C9A227]" />
                                )}
                                <span>{item.reporter_channel || item.source_label}</span>
                              </span>
                            </div>
                          </td>

                          {/* Reporter & Contact */}
                          <td className="py-3 px-3">
                            <div className="flex flex-col">
                              <span className="font-semibold text-xs text-slate-800">
                                {item.reporter_name || 'Người dân'}
                              </span>
                              {item.reporter_phone && (
                                <a
                                  href={`tel:${item.reporter_phone}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-mono"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>{item.reporter_phone}</span>
                                </a>
                              )}
                              <span className="text-[10px] text-slate-400 mt-0.5">{item.time_ago}</span>
                            </div>
                          </td>

                          {/* Photo Thumbnail with GPS */}
                          <td className="py-3 px-3">
                            <div className="relative w-14 h-11 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 shrink-0 group">
                              <img
                                src={item.image_url}
                                alt={item.defect_title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                              <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[8px] font-mono text-white text-center py-0.2">
                                GPS OK
                              </div>
                            </div>
                          </td>

                          {/* Chainage & Lane */}
                          <td className="py-3 px-3">
                            <div className="flex flex-col">
                              <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded w-fit border border-slate-200">
                                {item.stationing}
                              </span>
                              <span className="text-[11px] text-slate-500 mt-0.5">{item.lane}</span>
                            </div>
                          </td>

                          {/* Project Assignment (PA03) */}
                          <td className="py-3 px-3">
                            {isUnassigned ? (
                              <button
                                type="button"
                                onClick={(e) => onOpenTriageProject(item, e)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors animate-pulse cursor-pointer"
                                title="Bấm để điều phối gán vào dự án (PA03)"
                              >
                                <Building2 className="w-3 h-3 text-amber-700" />
                                <span>Chưa gán - Điều phối</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="font-semibold text-xs text-brand-dark truncate max-w-[140px]"
                                  title={item.project_name}
                                >
                                  {item.project_name}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => onOpenTriageProject(item, e)}
                                  className="text-[10px] text-slate-400 hover:text-slate-700 p-0.5 rounded"
                                  title="Đổi dự án khác"
                                >
                                  ✎
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Defect Title & Description */}
                          <td className="py-3 px-3 max-w-[210px]">
                            <div className="flex flex-col">
                              <span
                                className="font-bold text-xs text-slate-800 truncate"
                                title={item.defect_title}
                              >
                                {item.defect_title}
                              </span>
                              <p
                                className="text-[11px] text-slate-500 truncate mt-0.5"
                                title={item.description || item.defect_title}
                              >
                                {item.description || 'Chưa có mô tả chi tiết'}
                              </p>
                              {isMaster && (
                                <button
                                  type="button"
                                  onClick={(e) => onToggleExpandMaster(item.id, e)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 hover:bg-purple-200 text-purple-900 text-[10px] font-bold cursor-pointer transition-colors mt-1 w-fit border border-purple-200"
                                >
                                  <Link2 className="w-3 h-3 text-purple-700" />
                                  <span>
                                    {isExpanded ? 'Ẩn' : 'Xem'} {item.linked_report_ids?.length} báo cáo đã gộp
                                  </span>
                                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Severity */}
                          <td className="py-3 px-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.severity === 'CRITICAL'
                                  ? 'bg-red-100 text-red-700 border border-red-200'
                                  : item.severity === 'HIGH'
                                  ? 'bg-amber-100 text-[#8F7212] border border-amber-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {item.severity}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3">
                            {item.status === 'PENDING' && (
                              <span className="bg-amber-100 text-[#8F7212] text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-amber-200 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                                <span>Chờ xử lý</span>
                              </span>
                            )}
                            {item.status === 'VERIFIED' && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-200 w-fit">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Đã xác minh</span>
                              </span>
                            )}
                            {item.status === 'MERGED' && (
                              <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-purple-200 w-fit">
                                <Merge className="w-3 h-3 text-purple-600" />
                                <span>Đã gộp</span>
                              </span>
                            )}
                            {item.status === 'REJECTED' && (
                              <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-slate-200 w-fit">
                                <X className="w-3 h-3 text-slate-500" />
                                <span>{item.conclusion === 'NO_DEFECT' ? 'Báo sai' : 'Từ chối'}</span>
                              </span>
                            )}
                            {item.status === 'NEED_SURVEY' && (
                              <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-blue-200 w-fit">
                                <Camera className="w-3 h-3 text-blue-600" />
                                <span>Cần đo đạc</span>
                              </span>
                            )}
                          </td>

                          {/* Quick Actions */}
                          <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {isUnassigned ? (
                                <button
                                  type="button"
                                  onClick={(e) => onOpenTriageProject(item, e)}
                                  className="px-2.5 py-1 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-[11px] font-bold transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                                >
                                  <Building2 className="w-3 h-3" />
                                  <span>Điều phối</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => onSelectCase(item)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                                >
                                  Thẩm định
                                </button>
                              )}
                              {item.cluster_duplicates &&
                                item.cluster_duplicates.length > 0 &&
                                !item.cluster_duplicates.every((d) => d.is_merged) && (
                                  <button
                                    type="button"
                                    onClick={() => onOpenMergeModal(item)}
                                    className="p-1 rounded-lg text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                                    title={`Có ${item.cluster_duplicates.length} báo trùng lân cận. Bấm để gộp.`}
                                  >
                                    <Merge className="w-3.5 h-3.5" />
                                  </button>
                                )}
                            </div>
                          </td>
                        </tr>

                        {/* NESTED SUB-ROWS: Các báo cáo trùng đã gộp vào Master Case này */}
                        {isMaster &&
                          isExpanded &&
                          childReports.map((child) => (
                            <tr
                              key={`child-${child.id}`}
                              onClick={() => onSelectCase(child)}
                              className={`bg-purple-50/50 border-l-4 border-l-purple-500 hover:bg-purple-100/70 transition-colors cursor-pointer ${
                                child.id === selectedCase.id ? 'ring-2 ring-purple-500 bg-purple-100' : ''
                              }`}
                            >
                              <td className="py-2 px-3 text-center">
                                <CornerDownRight className="w-4 h-4 text-purple-600 inline" />
                              </td>
                              <td className="py-2 px-3">
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-bold text-xs text-purple-950">{child.code}</span>
                                    <span className="text-[9px] font-bold bg-purple-200 text-purple-900 px-1 py-0.2 rounded">
                                      Đã gộp trùng
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-purple-800 mt-0.5">
                                    {child.reporter_channel || child.source_label}
                                  </span>
                                </div>
                              </td>
                              <td className="py-2 px-3">
                                <span className="font-semibold text-xs text-slate-800">{child.reporter_name}</span>
                                {child.reporter_phone && (
                                  <span className="text-[10px] text-blue-600 block font-mono">
                                    {child.reporter_phone}
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-3">
                                <div className="relative w-12 h-9 rounded overflow-hidden bg-slate-900 border border-purple-200 shrink-0">
                                  <img
                                    src={child.image_url}
                                    alt={child.defect_title}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute bottom-0 inset-x-0 bg-purple-950/80 text-[7px] text-white text-center">
                                    ĐÃ GỘP
                                  </div>
                                </div>
                              </td>
                              <td className="py-2 px-3">
                                <span className="font-mono text-[11px] font-bold text-slate-700">
                                  {child.stationing}
                                </span>
                                <span className="text-[10px] text-slate-500 block">{child.lane}</span>
                              </td>
                              <td className="py-2 px-3">
                                <span className="text-[11px] text-purple-900 italic font-medium">
                                  Theo Master ({item.project_name})
                                </span>
                              </td>
                              <td className="py-2 px-3 max-w-[210px]">
                                <span className="font-medium text-xs text-purple-950 truncate block">
                                  {child.defect_title}
                                </span>
                                <p className="text-[10px] text-slate-600 italic truncate mt-0.5">
                                  "{child.description}"
                                </p>
                              </td>
                              <td className="py-2 px-3">
                                <span className="text-[10px] font-semibold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                  {child.severity}
                                </span>
                              </td>
                              <td className="py-2 px-3">
                                <span className="bg-purple-200 text-purple-950 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit border border-purple-300">
                                  <Link2 className="w-3 h-3 text-purple-700" />
                                  <span>Gộp vào {item.code}</span>
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={(e) => onUnlinkReport(child.id, e)}
                                  className="px-2 py-1 rounded bg-white hover:bg-red-50 text-red-600 hover:border-red-300 border border-slate-200 text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ml-auto shadow-2xs"
                                  title="Tách khỏi Master Case thành hồ sơ riêng"
                                >
                                  <Unlink className="w-3 h-3 text-red-500" />
                                  <span>Tách riêng</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    )
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          /* View Mode 2: DRONE_AI or ALL (Card Queue View) */
          <div>
            {/* Table Header Row */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 rounded-lg mb-2">
              <span className="col-span-2">Mã Case</span>
              <span className="col-span-2">Nguồn Dữ Liệu</span>
              <span className="col-span-3">Vị Trí &amp; Lý Trình</span>
              <span className="col-span-2">Loại Hư Hại</span>
              <span className="col-span-1">Ưu Tiên</span>
              <span className="col-span-2 text-right">Trạng Thái</span>
            </div>

            <div className="space-y-2">
              {filteredCases.map((item) => {
                const isSelected = item.id === selectedCase.id
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectCase(item)}
                    className={`p-3.5 rounded-xl cursor-pointer transition-all flex flex-col md:grid md:grid-cols-12 gap-3 items-start md:items-center border ${
                      isSelected
                        ? 'bg-amber-50/60 border-[#C9A227] shadow-sm ring-1 ring-[#C9A227]/30'
                        : 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-2xs'
                    }`}
                  >
                    {/* Code */}
                    <div className="md:col-span-2 flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          isSelected
                            ? 'bg-[#C9A227]'
                            : item.status === 'MERGED'
                            ? 'bg-blue-400'
                            : 'bg-slate-300'
                        }`}
                      ></span>
                      <span className="font-mono font-bold text-xs text-brand-dark">{item.code}</span>
                    </div>

                    {/* Source */}
                    <div className="md:col-span-2 flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 font-medium text-[11px] px-2.5 py-0.5 rounded-full ${
                          item.source === 'DRONE_AI'
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : item.source === 'CITIZEN'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-[#8F7212] border border-amber-200'
                        }`}
                      >
                        {item.source === 'DRONE_AI' && <Plane className="w-3 h-3 text-slate-500" />}
                        {item.source === 'CITIZEN' && <Smartphone className="w-3 h-3 text-blue-600" />}
                        {item.source === 'PATROL' && <Car className="w-3 h-3 text-[#C9A227]" />}
                        <span>{item.source_label}</span>
                      </span>
                    </div>

                    {/* Location & Chainage */}
                    <div className="md:col-span-3 flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-xs text-brand-dark">{item.project_name}</span>
                        {item.cluster_duplicates && item.cluster_duplicates.length > 0 && (
                          <span
                            className="text-amber-600"
                            title={`Có ${item.cluster_duplicates.length} phản ánh trùng lân cận`}
                          >
                            <AlertTriangle className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[11px] font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">
                          {item.stationing}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">({item.lane})</span>
                      </div>
                    </div>

                    {/* Defect Title & Time */}
                    <div className="md:col-span-2 flex flex-col">
                      <span className="text-xs font-medium text-brand-dark truncate">{item.defect_title}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{item.time_ago}</span>
                    </div>

                    {/* Severity */}
                    <div className="md:col-span-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.severity === 'CRITICAL'
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : item.severity === 'HIGH'
                            ? 'bg-amber-100 text-[#8F7212] border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="md:col-span-2 flex justify-end w-full md:w-auto">
                      {item.status === 'PENDING' && (
                        <span className="bg-amber-100 text-[#8F7212] text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                          <span>Chờ xác minh</span>
                        </span>
                      )}
                      {item.status === 'VERIFIED' && (
                        <span className="bg-emerald-100 text-emerald-800 text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Đã xác minh</span>
                        </span>
                      )}
                      {item.status === 'NEED_SURVEY' && (
                        <span className="bg-blue-100 text-blue-800 text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-blue-200">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span>Cần đo đạc</span>
                        </span>
                      )}
                      {item.status === 'MERGED' && (
                        <span className="bg-purple-100 text-purple-800 text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-purple-200">
                          <Merge className="w-3 h-3 text-purple-600" />
                          <span>Đã gộp trùng</span>
                        </span>
                      )}
                      {item.status === 'REJECTED' && (
                        <span className="bg-slate-100 text-slate-600 text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-slate-200">
                          <X className="w-3 h-3 text-slate-500" />
                          <span>Báo sai</span>
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100 text-xs">
        <span className="text-slate-500">
          Trang 1 / 3 (Tổng số {filteredCases.length} bản ghi)
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-100 transition-colors disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="w-7 h-7 rounded-lg text-xs font-bold bg-[#C9A227] text-white shadow-2xs"
          >
            1
          </button>
          <button
            type="button"
            className="w-7 h-7 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            2
          </button>
          <button
            type="button"
            className="w-7 h-7 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            3
          </button>
          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
