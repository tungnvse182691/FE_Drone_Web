import React from 'react'
import { AlertTriangle, CheckCircle2, AlertOctagon, Eye } from 'lucide-react'
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
  currentPolicy
}) => {
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
                  disabled={workMode !== 'MEASURE_ONLY'}
                  title={workMode !== 'MEASURE_ONLY' ? 'Chế độ Sửa nhanh/Khẩn cấp chỉ áp dụng cho 1 lỗi đơn lẻ (BR-08)' : 'Chọn tất cả'}
                  checked={workMode === 'MEASURE_ONLY' && selectedDefectIds.length === filteredDefects.length && filteredDefects.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer accent-[#C9A227] disabled:opacity-30 disabled:cursor-not-allowed"
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
                      ? 'bg-rose-50/40 hover:bg-rose-50/70'
                      : isChecked
                      ? 'bg-amber-50/30 hover:bg-amber-50/60'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="p-3 text-center">
                    <input
                      type={workMode === 'MEASURE_ONLY' ? 'checkbox' : 'radio'}
                      name="defect-selection"
                      checked={isChecked}
                      onChange={() => handleToggleSelect(defect.id)}
                      className={`w-4 h-4 cursor-pointer accent-[#C9A227] ${workMode === 'MEASURE_ONLY' ? 'rounded' : 'rounded-full'}`}
                    />
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
                      <span className={isEligible ? 'text-[#C9A227]' : 'text-rose-600'}>
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
                    <select
                      value={defect.assignedCrew}
                      onChange={(e) => handleAssignCrew(defect.id, e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer"
                    >
                      <option value="Tổ tuần tra số 01">Tổ tuần tra số 01</option>
                      <option value="Tổ đo đạc số 02">Tổ đo đạc số 02</option>
                      <option value="Tổ cơ động bảo dưỡng 03">Tổ cơ động 03</option>
                      <option value="Chưa chỉ định">Chưa chỉ định</option>
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setDetailDefect(defect)}
                      type="button"
                      className="p-1 rounded-lg text-slate-500 hover:text-brand-dark hover:bg-slate-100 cursor-pointer"
                      title="Xem chi tiết trắc địa"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* WARNING BANNER / INSPECTION BOX NẾU CÓ MỤC VI PHẠM */}
      {hasViolationItem && (
        <div className="p-4 rounded-xl bg-rose-50/80 border-l-4 border-rose-600 border border-rose-200 flex items-start gap-3 shadow-2xs animate-in fade-in duration-200">
          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0 text-rose-600 mt-0.5">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1 text-xs">
            <h3 className="font-bold text-rose-700 text-sm flex items-center gap-2">
              <span>Cảnh báo vi phạm chính sách Fast Track (Phát hiện hạng mục vượt ngưỡng)</span>
            </h3>
            <p className="text-slate-700 leading-relaxed">
              Phát hiện khiếm khuyết vượt ngưỡng của <strong className="font-semibold">{currentPolicy.version}</strong>:{' '}
              {selectedItems
                .filter((d) => !d.isFastTrackEligible)
                .map((d) => (
                  <span key={d.id} className="font-mono font-bold text-rose-700 mr-2">
                    {d.code} ({d.areaM2}m² / {d.depthCm}cm - {d.violationReason || 'Vượt ngưỡng'})
                  </span>
                ))}
              . Ở chế độ{' '}
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                Gom lô đo đạc
              </span>
              , đội Crew chỉ được phép đo kiểm tra trắc địa và ghi nhận hồ sơ hoàn công,{' '}
              <span className="text-rose-700 font-bold underline">nghiêm cấm lập lệnh Sửa ngay</span> cho các hạng mục này.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
