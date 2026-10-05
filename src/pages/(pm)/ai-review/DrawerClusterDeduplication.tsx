import React from 'react'
import { CheckCircle2, AlertTriangle, Merge } from 'lucide-react'
import type { TriageCase } from './types'

export interface DrawerClusterDeduplicationProps {
  selectedCase: TriageCase
  onToggleClusterItem: (code: string) => void
  onOpenMergeModal: (c: TriageCase) => void
}

export const DrawerClusterDeduplication: React.FC<DrawerClusterDeduplicationProps> = ({
  selectedCase,
  onToggleClusterItem,
  onOpenMergeModal,
}) => {
  if (!selectedCase.cluster_duplicates || selectedCase.cluster_duplicates.length === 0) {
    return null
  }

  if (selectedCase.cluster_duplicates.every((d) => d.is_merged)) {
    return (
      <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-3.5 shadow-2xs space-y-1.5 text-emerald-950 animate-in fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Đã hợp nhất cụm {selectedCase.cluster_duplicates.length} phản ánh lân cận (&lt; 2.5m)
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-600 text-white">
            Đã gộp
          </span>
        </div>
        <p className="text-[11px] text-emerald-700 leading-relaxed">
          Đã hợp nhất bằng chứng ảnh và mô tả từ {selectedCase.cluster_duplicates.map((d) => d.code).join(', ')} vào hồ sơ gốc này (BR-30, BR-31).
        </p>
      </div>
    )
  }

  return (
    <div className="bg-amber-50/80 rounded-xl border border-amber-200 p-3.5 shadow-2xs space-y-2">
      <div className="flex items-center justify-between text-amber-950">
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Phát hiện {selectedCase.cluster_duplicates.length} phản ánh lân cận (&lt; 2.5m)
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#C9A227] text-white">
          Gợi ý gộp
        </span>
      </div>

      <div className="space-y-1.5">
        {selectedCase.cluster_duplicates.map((dup) => (
          <label
            key={dup.code}
            className="flex items-start gap-2.5 p-2 rounded-lg bg-white border border-amber-200/60 cursor-pointer hover:bg-amber-50/50 transition-colors"
          >
            <input
              type="checkbox"
              checked={dup.selected}
              onChange={() => onToggleClusterItem(dup.code)}
              className="mt-1 w-3.5 h-3.5 rounded text-[#C9A227] focus:ring-[#C9A227] accent-[#C9A227]"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-brand-dark">{dup.code}</span>
                <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.2 rounded-full font-semibold">
                  Cách: {dup.distance_m}m
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {dup.source} • {dup.reporter}
              </p>
            </div>
          </label>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => onOpenMergeModal(selectedCase)}
          className="text-xs font-bold text-[#8F7212] hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          <Merge className="w-3.5 h-3.5" />
          <span>Tự động gộp dữ liệu ảnh &amp; mô tả vào Case gốc này</span>
        </button>
        <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
          Đã chọn: {selectedCase.cluster_duplicates.filter((d) => d.selected).length}/{selectedCase.cluster_duplicates.length}
        </span>
      </div>
    </div>
  )
}
