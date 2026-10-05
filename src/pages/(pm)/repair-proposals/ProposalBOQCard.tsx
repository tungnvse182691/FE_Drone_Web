import React from 'react'
import { Check, FileCheck2 } from 'lucide-react'
import type { UnassignedDefectItem } from './types'

export interface ProposalBOQCardProps {
  unassignedDefects: UnassignedDefectItem[]
  handleToggleDefect: (id: string) => void
  modalCalculations: { count: number; description: string }
}

export const ProposalBOQCard: React.FC<ProposalBOQCardProps> = ({
  unassignedDefects,
  handleToggleDefect,
  modalCalculations,
}) => {
  return (
    <div className="space-y-4">
      {/* Danh sách khiếm khuyết trong phân đoạn */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-700 uppercase text-[11px]">
            Chọn các hư hỏng gom vào đợt sửa chữa ({unassignedDefects.length} điểm tồn đọng):
          </label>
          <span className="text-[11px] text-[#C9A227] font-semibold">
            Đã chọn {modalCalculations.count} điểm
          </span>
        </div>

        {unassignedDefects.length === 0 ? (
          <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
            Phân đoạn này hiện không có khiếm khuyết tồn đọng chưa gán gói.
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-56 overflow-y-auto bg-white custom-scrollbar">
            {unassignedDefects.map((def) => (
              <label
                key={def.id}
                className={`p-3 flex items-center justify-between hover:bg-amber-50/30 transition-colors cursor-pointer ${
                  def.selected ? 'bg-amber-50/50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={def.selected}
                    onChange={() => handleToggleDefect(def.id)}
                    className="w-4 h-4 rounded text-[#C9A227] focus:ring-[#C9A227] border-slate-300"
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800">{def.code}</span>
                      <span className="font-semibold text-slate-700">{def.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                        {def.stationing}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-0.5">{def.lane_detail}</span>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-slate-700 shrink-0 ml-3 bg-slate-100 px-2 py-0.5 rounded">
                  {def.area_m2} m² (Sâu {def.depth_cm}cm)
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Summary Technical Scope Calculation / BOQ Box */}
      <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#C9A227] text-white flex items-center justify-center shrink-0">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs text-amber-950">Tổng kết kỹ thuật tự động</span>
            <span className="text-[11px] text-amber-900">
              Đã chọn: <strong>{modalCalculations.count} hạng mục khiếm khuyết</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-end">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Khối lượng thi công ước tính (BOQ)</span>
          <span className="font-mono text-base font-black text-[#8F7212]">
            {modalCalculations.description}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Bóc tách theo phương án kỹ thuật</span>
        </div>
      </div>
    </div>
  )
}
