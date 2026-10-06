import React from 'react'
import { Grid, Layers, Sparkles } from 'lucide-react'
import { SlabItem } from './types'

export interface SlabsPanelProps {
  slabLengthM: number
  onSetSlabLengthM: (v: number) => void
  slabThicknessCm: number
  onSetSlabThicknessCm: (v: number) => void
  syncJointWithSlab: boolean
  onSetSyncJointWithSlab: (v: boolean) => void
  contractionSpacingM: number
  onSetContractionSpacingM: (v: number) => void
  expansionSpacingM: number
  onSetExpansionSpacingM: (v: number) => void
  expansionGapMm: number
  onSetExpansionGapMm: (v: number) => void
  slabs: SlabItem[]
  showToast: (msg: string) => void
}

export const SlabsPanel: React.FC<SlabsPanelProps> = ({
  slabLengthM,
  onSetSlabLengthM,
  slabThicknessCm,
  onSetSlabThicknessCm,
  syncJointWithSlab,
  onSetSyncJointWithSlab,
  contractionSpacingM,
  onSetContractionSpacingM,
  expansionSpacingM,
  onSetExpansionSpacingM,
  expansionGapMm,
  onSetExpansionGapMm,
  slabs,
  showToast
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-[#C9A227]" />
          <span className="font-bold text-slate-800">Cấu hình Tấm BTXM &amp; Khe nối</span>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
          {slabs.length} tấm mẫu
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-slate-600 block mb-1 font-medium">Chiều dài tấm (m):</label>
          <input
            type="number"
            step="0.1"
            value={slabLengthM}
            onChange={(e) => onSetSlabLengthM(parseFloat(e.target.value) || 5.0)}
            className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg font-mono font-semibold text-slate-800"
          />
        </div>
        <div>
          <label className="text-slate-600 block mb-1 font-medium">Bề dày tấm (cm):</label>
          <input
            type="number"
            value={slabThicknessCm}
            onChange={(e) => onSetSlabThicknessCm(parseInt(e.target.value) || 26)}
            className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg font-mono font-semibold text-slate-800"
          />
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-700 font-semibold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>Khe co giãn (Contraction Joint)</span>
          </span>
          <label className="flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer">
            <input
              type="checkbox"
              checked={syncJointWithSlab}
              onChange={(e) => onSetSyncJointWithSlab(e.target.checked)}
              className="accent-[#C9A227] rounded"
            />
            <span>Đồng bộ theo tấm</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-slate-500 block mb-1">Khoảng cách khe co (m):</label>
            <input
              type="number"
              step="0.5"
              value={contractionSpacingM}
              onChange={(e) => onSetContractionSpacingM(parseFloat(e.target.value) || 5.0)}
              disabled={syncJointWithSlab}
              className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg font-mono disabled:opacity-60 text-slate-800"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-500 block mb-1">Khoảng cách khe giãn (m):</label>
            <input
              type="number"
              step="5"
              value={expansionSpacingM}
              onChange={(e) => onSetExpansionSpacingM(parseFloat(e.target.value) || 50.0)}
              className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg font-mono text-slate-800"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-500">Bề rộng khe giãn nở:</span>
          <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
            <span>{expansionGapMm}</span>
            <span className="text-slate-400 font-normal">mm</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => showToast('Đã áp dụng thông số tấm BTXM & khe nối thành công!')}
        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
        <span>Cập nhật lưới tấm BTXM</span>
      </button>
    </div>
  )
}
