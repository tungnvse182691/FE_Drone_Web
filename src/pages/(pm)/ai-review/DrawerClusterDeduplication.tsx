import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import type { TriageCase } from './types'

export interface DrawerClusterDeduplicationProps {
  selectedCase: TriageCase
  onToggleClusterItem: (code: string) => void
  onOpenMergeModal: (c: TriageCase) => void
  isSupervisor?: boolean
}

export const DrawerClusterDeduplication: React.FC<DrawerClusterDeduplicationProps> = ({
  selectedCase,
  onToggleClusterItem,
  onOpenMergeModal,
  isSupervisor = false,
}) => {
  if (!selectedCase.cluster_duplicates || selectedCase.cluster_duplicates.length === 0) {
    return null
  }

  if (selectedCase.cluster_duplicates.every((d) => d.is_merged)) {
    return null
  }

  return (
    <div className="bg-amber-50/80 rounded-xl border border-amber-200 p-3.5 shadow-2xs space-y-2">
      <div className="flex items-center justify-between text-amber-950">
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <Icon name="warning" size={16} className="text-amber-600 shrink-0" />
          <span>
            Phát hiện {selectedCase.cluster_duplicates.length} phản ánh lân cận (&lt; 2.5m)
          </span>
        </div>
        {!isSupervisor ? (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-brand-gold text-white">
            Gợi ý gộp
          </span>
        ) : (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Chế độ xem
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        {selectedCase.cluster_duplicates.map((dup) => (
          <div
            key={dup.code}
            className={`flex items-start gap-2.5 p-2 rounded-lg bg-white border border-amber-200/60 ${
              !isSupervisor ? 'cursor-pointer hover:bg-amber-50/50' : ''
            } transition-colors`}
            onClick={!isSupervisor ? () => onToggleClusterItem(dup.code) : undefined}
          >
            {!isSupervisor ? (
              <input
                type="checkbox"
                checked={dup.selected}
                onChange={() => onToggleClusterItem(dup.code)}
                className="mt-1 w-3.5 h-3.5 rounded text-brand-gold focus:ring-brand-gold accent-brand-gold cursor-pointer"
              />
            ) : (
              <Icon name="location_on" size={16} className="mt-0.5 text-slate-400 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-brand-dark">{dup.code}</span>
                <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-semibold">
                  Cách: {dup.distance_m}m
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {dup.source} • {dup.reporter}
              </p>
            </div>
          </div>
        ))}
      </div>

      {!isSupervisor ? (
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => onOpenMergeModal(selectedCase)}
            className="text-xs font-bold text-[#8F7212] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <Icon name="call_merge" size={14} />
            <span>Tự động gộp dữ liệu ảnh &amp; mô tả vào hồ sơ gốc này</span>
          </button>
          <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
            Đã chọn: {selectedCase.cluster_duplicates.filter((d) => d.selected).length}/{selectedCase.cluster_duplicates.length}
          </span>
        </div>
      ) : (
        <div className="pt-1 text-[11px] text-slate-500 flex items-center gap-1.5">
          <Icon name="info" size={14} className="text-slate-400 shrink-0" />
          <span>Thẩm quyền gộp/tách phản ánh trùng do Chỉ huy trưởng (PM) phụ trách thẩm định.</span>
        </div>
      )}
    </div>
  )
}
