import React from 'react'
import { FileCheck2, Wrench } from 'lucide-react'
import type { UnassignedDefectItem } from './types'

export interface ProposalBOQCardProps {
  unassignedDefects: UnassignedDefectItem[]
  handleToggleDefect: (id: string) => void
  handleUpdateDefectSolution: (id: string, solution: string) => void
  modalCalculations: { count: number; description: string }
}

const COMMON_SOLUTIONS = [
  'Cào bóc 5cm & thảm lại BTN C12.5 (TCVN 8819)',
  'Trám vá nhựa nguội khẩn cấp (TCVN 8819)',
  'Cắt rãnh & rót mastic chèn khe (AASHTO)',
  'Xử lý móng CPĐD + thảm 2 lớp (TCVN 8859)',
  'Bù vênh lu lèn thảm nhựa polime'
]

export const ProposalBOQCard: React.FC<ProposalBOQCardProps> = ({
  unassignedDefects,
  handleToggleDefect,
  handleUpdateDefectSolution,
  modalCalculations,
}) => {
  return (
    <div className="space-y-4">
      {/* Tiêu đề danh sách khiếm khuyết */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="font-bold text-slate-700 uppercase text-[11px] flex items-center gap-1.5">
            <span>Chọn các khiếm khuyết gom vào đợt sửa chữa ({unassignedDefects.length} điểm tồn đọng):</span>
          </label>
          <span className="text-[11px] text-brand-gold font-semibold">
            Đã chọn {modalCalculations.count} điểm
          </span>
        </div>

      {/* Danh sách các khiếm khuyết */}
      {unassignedDefects.length === 0 ? (
        <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
          Phân đoạn này hiện không có khiếm khuyết tồn đọng chưa gán gói.
        </div>
      ) : (
          <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-72 overflow-y-auto bg-white custom-scrollbar">
            {unassignedDefects.map((def) => {
              const defaultSolution =
                def.area_m2 >= 1.0
                  ? 'Cào bóc 5cm & thảm lại BTN C12.5 (TCVN 8819)'
                  : 'Trám vá nhựa nguội khẩn cấp (TCVN 8819)'
              const currentSolution = def.custom_solution ?? defaultSolution

              return (
                <div
                  key={def.id}
                  className={`p-3 transition-colors ${
                    def.selected ? 'bg-amber-50/30' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={def.selected}
                        onChange={() => handleToggleDefect(def.id)}
                        className="w-4 h-4 rounded text-brand-gold focus:ring-brand-gold border-slate-300 mt-0.5 cursor-pointer shrink-0"
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-slate-800 text-xs">{def.code}</span>
                          <span className="font-semibold text-slate-800 text-xs">{def.title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                            {def.stationing}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 mt-0.5 truncate">{def.lane_detail}</span>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-700 shrink-0 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {def.area_m2} m² (Sâu {def.depth_cm}cm)
                    </span>
                  </div>

                  {/* Vùng tự nhập phương án kỹ thuật riêng khi được tick chọn */}
                  {def.selected && (
                    <div className="mt-2.5 ml-7 p-2.5 bg-amber-50/70 border border-amber-200/90 rounded-xl space-y-2 animate-in fade-in duration-100">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-amber-950 uppercase flex items-center gap-1">
                          <Wrench className="w-3 h-3 text-brand-gold" />
                          <span>Phương án kỹ thuật xử lý (PM tự gõ hoặc chọn gợi ý)</span>
                        </label>
                        <span className="text-[9px] text-amber-800 font-medium">
                          Ánh xạ sang RepairItem chi tiết
                        </span>
                      </div>

                      {/* Ô Input cho phép PM gõ tự do bất kỳ phương án nào */}
                      <input
                        type="text"
                        value={currentSolution}
                        onChange={(e) => handleUpdateDefectSolution(def.id, e.target.value)}
                        placeholder="Nhập phương án kỹ thuật xử lý cụ thể..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold shadow-2xs"
                      />

                      {/* Các Chips gợi ý nhanh theo chuẩn TCVN */}
                      <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
                        <span className="text-[9px] text-slate-500 font-semibold shrink-0">Gợi ý nhanh:</span>
                        {COMMON_SOLUTIONS.map((sol) => (
                          <button
                            key={sol}
                            type="button"
                            onClick={() => handleUpdateDefectSolution(def.id, sol)}
                            className="px-2 py-0.5 bg-white hover:bg-amber-100/70 text-slate-700 hover:text-amber-950 border border-slate-200 hover:border-amber-300 rounded text-[10px] font-medium transition-colors cursor-pointer"
                          >
                            + {sol.split('(')[0].trim()}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Tổng kết khối lượng kỹ thuật */}
      <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-gold text-white flex items-center justify-center shrink-0">
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
          <span className="text-[10px] font-bold text-slate-500 uppercase">Khối lượng thi công kỹ thuật</span>
          <span className="font-mono text-base font-black text-[#8F7212]">
            {modalCalculations.description}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Bóc tách theo phương án kỹ thuật</span>
        </div>
      </div>
    </div>
  )
}

