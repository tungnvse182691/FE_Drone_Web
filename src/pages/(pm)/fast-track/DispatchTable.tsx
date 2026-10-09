import React from 'react'
import { AlertTriangle, CheckCircle2, AlertOctagon, Eye, Lock, ArrowRight, Trash2 } from 'lucide-react'
import { DefectItem, WorkMode, PolicyThresholdConfig } from './types'

export interface DispatchTableProps {
  workMode: WorkMode
  selectedDefectIds: string[]
  filteredDefects: DefectItem[]
  handleSelectAll: (checked: boolean) => void
  handleToggleSelect: (id: string) => void
  handleAssignCrew: (defectId: string, crew: string) => void
  setDetailDefect: (defect: DefectItem | null) => void
  hasViolationItem: boolean
  selectedItems: DefectItem[]
  currentPolicy: PolicyThresholdConfig
  onRemoveViolationItems?: () => void
  onNavigateProposals?: () => void
}

export const DispatchTable: React.FC<DispatchTableProps> = ({
  workMode,
  selectedDefectIds,
  filteredDefects,
  handleSelectAll,
  handleToggleSelect,
  handleAssignCrew,
  setDetailDefect,
  hasViolationItem,
  selectedItems,
  currentPolicy,
  onRemoveViolationItems,
  onNavigateProposals
}) => {
  // Chỉ đếm các item đạt chuẩn Fast Track để tính trạng thái Select All
  const eligibleDefects = filteredDefects.filter((d) => d.isFastTrackEligible)
  const isAllEligibleSelected =
    workMode === 'MEASURE_ONLY' &&
    eligibleDefects.length > 0 &&
    eligibleDefects.every((d) => selectedDefectIds.includes(d.id))

  return (
    <div className="space-y-4">
      {/* BẢNG CHỌN KHIẾM KHUYẾT (Defect Selection Table) */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left bg-white text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <th className="p-3 w-12 text-center">
                <input
                  type="checkbox"
                  disabled={workMode !== 'MEASURE_ONLY' || eligibleDefects.length === 0}
                  title={
                    workMode !== 'MEASURE_ONLY'
                      ? 'Chế độ Sửa nhanh/Khẩn cấp chỉ áp dụng cho 1 lỗi đơn lẻ (BR-08)'
                      : 'Chọn tất cả khiếm khuyết đạt chuẩn Fast Track'
                  }
                  checked={isAllEligibleSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer accent-brand-gold disabled:opacity-30 disabled:cursor-not-allowed"
                />
              </th>
              <th className="p-3">Mã Defect</th>
              <th className="p-3">Vị trí (Km / Tuyến / Làn)</th>
              <th className="p-3">Loại khiếm khuyết</th>
              <th className="p-3">Kích thước sơ bộ</th>
              <th className="p-3">Đánh giá Fast Track v2.1</th>
              <th className="p-3">Đội đo đạc phân công</th>
              <th className="p-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDefects.map((defect) => {
              const isChecked = selectedDefectIds.includes(defect.id)
              const isEligible = defect.isFastTrackEligible

              return (
                <tr
                  key={defect.id}
                  className={`transition-colors ${
                    !isEligible
                      ? 'bg-rose-50/30 hover:bg-rose-50/50 opacity-90'
                      : isChecked
                      ? 'bg-amber-50/30 hover:bg-amber-50/60'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center relative group">
                      <input
                        type={workMode === 'MEASURE_ONLY' ? 'checkbox' : 'radio'}
                        name="defect-selection"
                        disabled={workMode === 'INSPECT_AND_REPAIR' && !isEligible}
                        checked={isChecked}
                        onChange={() => handleToggleSelect(defect.id)}
                        className={`w-4 h-4 cursor-pointer accent-brand-gold ${
                          workMode === 'MEASURE_ONLY' ? 'rounded' : 'rounded-full'
                        } disabled:opacity-30 disabled:cursor-not-allowed`}
                      />
                      {!isEligible && workMode === 'INSPECT_AND_REPAIR' && (
                        <div className="absolute left-full ml-1 hidden group-hover:flex items-center px-2 py-1 bg-slate-900 text-white rounded text-[10px] font-medium whitespace-nowrap z-20 shadow-lg pointer-events-none">
                          <Lock className="w-3 h-3 text-rose-400 mr-1" />
                          Khóa: Đo & Sửa ngay chỉ áp dụng cho lỗi đạt chuẩn (BR-04)
                        </div>
                      )}
                      {!isEligible && workMode === 'EMERGENCY' && (
                        <div className="absolute left-full ml-1 hidden group-hover:flex items-center px-2 py-1 bg-rose-950 text-white rounded text-[10px] font-medium whitespace-nowrap z-20 shadow-lg pointer-events-none">
                          <AlertTriangle className="w-3 h-3 text-amber-400 mr-1" />
                          Khẩn cấp 24/7: Khắc phục tạm thông xe (Hậu kiểm sau)
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3 font-mono font-bold">
                    <span className={isEligible ? 'text-brand-dark' : 'text-rose-600'}>{defect.code}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                        {defect.stationing}
                      </span>
                      <span className="text-slate-500 text-[11px]">{defect.lane}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <span className={isEligible ? 'text-brand-gold' : 'text-rose-600'}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </span>
                      <span>{defect.type}</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono">
                    <span className={isEligible ? 'font-semibold text-slate-800' : 'font-bold text-rose-600'}>
                      {defect.areaM2} m²
                    </span>
                    <span className="text-slate-400 mx-1">/</span>
                    <span className={isEligible ? 'text-slate-700' : 'font-bold text-rose-600'}>
                      {defect.depthCm} cm
                    </span>
                  </td>
                  <td className="p-3">
                    {isEligible ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đạt chuẩn Fast Track</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                        <span>Vi phạm ngưỡng (Over-limit)</span>
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {isEligible ? (
                      <select
                        value={defect.assignedCrew}
                        onChange={(e) => handleAssignCrew(defect.id, e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer"
                      >
                        <option value="Tổ tuần tra số 01">Tổ tuần tra số 01</option>
                        <option value="Tổ đo đạc số 02">Tổ đo đạc số 02</option>
                        <option value="Tổ cơ động">Tổ cơ động 03</option>
                        <option value="Chưa chỉ định">Chưa chỉ định</option>
                      </select>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Chờ gom đợt (WF-07)</span>
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {!isEligible && onNavigateProposals && (
                        <button
                          onClick={onNavigateProposals}
                          type="button"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-[#8C6D1F] border border-amber-200 text-[11px] font-bold cursor-pointer transition-colors shadow-2xs whitespace-nowrap"
                          title="Đưa vào Gói đề xuất sửa chữa lớn (WF-07) để trình Supervisor thẩm duyệt"
                        >
                          <ArrowRight className="w-3 h-3" />
                          <span>Gom đợt duyệt</span>
                        </button>
                      )}
                      <button
                        onClick={() => setDetailDefect(defect)}
                        type="button"
                        className="p-1 rounded-lg text-slate-500 hover:text-brand-dark hover:bg-slate-100 cursor-pointer"
                        title="Xem chi tiết trắc địa"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* WARNING BANNER CHẶN KHI CÓ HẠNG MỤC VƯỢT NGƯỠNG */}
      {hasViolationItem && (
        <div className="p-4 rounded-xl bg-rose-50 border-l-4 border-rose-600 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0 text-rose-600 mt-0.5">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs">
              <h3 className="font-bold text-rose-800 text-sm flex items-center gap-2">
                <span>Chặn xuất quân: Phát hiện khiếm khuyết vi phạm ngưỡng chính sách Fast Track!</span>
              </h3>
              <p className="text-slate-700 leading-relaxed">
                Hệ thống phát hiện{' '}
                {selectedItems
                  .filter((d) => !d.isFastTrackEligible)
                  .map((d) => (
                    <span key={d.id} className="font-mono font-bold text-rose-700 mr-1.5">
                      {d.code} ({d.areaM2}m² / {d.depthCm}cm)
                    </span>
                  ))}
                vượt quá quy chuẩn của <strong className="font-semibold">{currentPolicy.version}</strong> (Diện tích &gt; {currentPolicy.maxAreaM2}m² hoặc Sâu &gt; {currentPolicy.maxDepthCm}cm). Theo quy định <strong className="text-rose-700">BR-04</strong>, các hư hỏng nặng này bắt buộc phải lập hồ sơ trình Supervisor duyệt.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {onRemoveViolationItems && (
              <button
                onClick={onRemoveViolationItems}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 font-bold rounded-lg border border-rose-300 shadow-2xs text-xs cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Loại bỏ lỗi vượt ngưỡng</span>
              </button>
            )}
            {onNavigateProposals && (
              <button
                onClick={onNavigateProposals}
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2D3748] hover:bg-[#1A1D20] text-white font-bold rounded-lg shadow-xs text-xs cursor-pointer transition-colors"
              >
                <span>Chuyển sang Gói đề xuất (WF-07)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
