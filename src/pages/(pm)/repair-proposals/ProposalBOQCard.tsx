import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import type { UnassignedDefectItem } from './types'

export interface ProposalBOQCardProps {
  unassignedDefects: UnassignedDefectItem[]
  handleToggleDefect: (id: string) => void
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
  modalCalculations,
}) => {
  return (
    <div className="space-y-4">
      {/* Tiêu đề danh sách khiếm khuyết */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="font-bold text-slate-700 uppercase text-[11px] flex items-center gap-1.5">
            <span>Chọn một khiếm khuyết gốc cho package ({unassignedDefects.length} khiếm khuyết OPEN):</span>
          </label>
          <span className="text-[11px] text-brand-gold font-semibold">
            Đã chọn {modalCalculations.count} điểm
          </span>
        </div>

      {/* Danh sách các khiếm khuyết */}
      {unassignedDefects.length === 0 ? (
        <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
          Chưa có khiếm khuyết OPEN trong danh mục dự án.
        </div>
      ) : (
          <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-72 overflow-y-auto bg-white custom-scrollbar">
            {unassignedDefects.map((def) => {
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
                          {Boolean(def.stationing) && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                              {def.stationing}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                          {Boolean(def.lane_detail) && (
                            <>
                              <span>{def.lane_detail}</span>
                              <span>•</span>
                            </>
                          )}
                          <span>Trạng thái: <strong className="text-slate-700">{def.status_label || def.status || 'Chưa xử lý'}</strong></span>
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-700 shrink-0 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {def.area_m2 && def.area_m2 > 0
                        ? `${def.area_m2} m²${def.depth_cm && def.depth_cm > 0 ? ` (Sâu ${def.depth_cm}cm)` : ''}`
                        : (def.severity_label || (def.severity ? `Mức độ ${def.severity}` : 'Chưa có nguồn mức độ'))}
                    </span>
                  </div>
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
            <Icon name="fact_check" className="text-base" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs text-amber-950">Tóm tắt lựa chọn kỹ thuật</span>
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

