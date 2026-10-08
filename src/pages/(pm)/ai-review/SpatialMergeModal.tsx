import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import type { TriageCase } from './types'

export interface SpatialMergeModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCase: TriageCase
  onExecuteMerge: () => void
}

export const SpatialMergeModal: React.FC<SpatialMergeModalProps> = ({
  isOpen,
  onClose,
  selectedCase,
  onExecuteMerge,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-brand-gold border border-amber-200">
              <Icon name="call_merge" size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">Gộp Phản Ánh Trùng Lặp Không Gian</h3>
              <p className="text-xs text-slate-500">Thuật toán Spatial Clustering bán kính R &le; 2.5 mét</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-brand-dark">Hồ sơ gốc tiếp nhận chính:</span>
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-mono font-bold text-[#8F7212]">
                {selectedCase.code} ({selectedCase.defect_title})
              </span>
              <span>
                {selectedCase.stationing} - {selectedCase.project_name}
              </span>
            </div>
          </div>

          <div>
            <span className="font-bold text-slate-700 block mb-1.5">
              Danh sách phản ánh vệ tinh lân cận sẽ gộp vào hồ sơ gốc:
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedCase.cluster_duplicates?.map((dup) => (
                <div
                  key={dup.code}
                  className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/40 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-brand-dark">{dup.code}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                        Cách tâm {dup.distance_m}m
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {dup.source} • {dup.reporter}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                    Sẽ gộp ảnh &amp; ghi chú
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
            <Icon name="warning" size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <span>
              Sau khi gộp, các hồ sơ phụ sẽ được chuyển sang trạng thái <strong>MERGED (Đã gộp trùng)</strong>, ảnh
              bằng chứng hiện trường sẽ được đính kèm vào Case gốc, tránh trùng lặp khối lượng kỹ thuật sửa chữa.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onExecuteMerge}
            className="px-4 py-2 text-xs font-bold bg-brand-gold hover:bg-[#B38E1F] text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Icon name="call_merge" size={16} />
            <span>Xác nhận Gộp 2 Phản Ánh</span>
          </button>
        </div>
      </div>
    </div>
  )
}
