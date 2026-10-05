import React from 'react'
import {
  SplitSquareVertical,
  Sparkles,
  Plus
} from 'lucide-react'
import { SegmentItem } from './types'
import { SidebarSegmentCard } from './SidebarSegmentCard'

export interface SidebarSegmentsTabProps {
  segments: SegmentItem[]
  selectedSegmentId: string | null
  onSelectSegment: (seg: SegmentItem) => void
  splitDistance: number
  onSetSplitDistance: (val: number) => void
  splitSortOrder: 'asc' | 'desc'
  onSetSplitSortOrder: (val: 'asc' | 'desc') => void
  onApplyAutoSplit: () => void
  onOpenAddSegmentModal: () => void
  onSelectAllRoute: () => void
  currentKmPoints: number[]
  importedLengthKm: number
  slabLengthM: number
  onOpenSplitModal: (seg: SegmentItem) => void
  onEditSegment: (seg: SegmentItem) => void
  onDeleteSegment: (id: string) => void
  onSnapSegment: (id: string) => void
}

export const SidebarSegmentsTab: React.FC<SidebarSegmentsTabProps> = ({
  segments,
  selectedSegmentId,
  onSelectSegment,
  splitDistance,
  onSetSplitDistance,
  splitSortOrder,
  onSetSplitSortOrder,
  onApplyAutoSplit,
  onOpenAddSegmentModal,
  onSelectAllRoute,
  currentKmPoints,
  importedLengthKm,
  slabLengthM,
  onOpenSplitModal,
  onEditSegment,
  onDeleteSegment,
  onSnapSegment
}) => {
  const isAllSelected = selectedSegmentId === 'ALL'
  const totalLen = segments.reduce((sum, s) => sum + (s.lengthKm || 0), 0) || (importedLengthKm || 25.0)
  const minKm = currentKmPoints[0] || (segments[0]?.startKm ?? 1020.0)
  const maxKm = currentKmPoints[currentKmPoints.length - 1] || (segments[segments.length - 1]?.endKm ?? 1045.0)
  const slabLen = Math.max(1.0, slabLengthM || 5.0)
  const totalSlabsEst = Math.floor((totalLen * 1000) / slabLen) * 2

  return (
    <>
      {/* Quick Split Module */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
            <SplitSquareVertical className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Chia đoạn theo cự ly Km</span>
          </span>
          <span className="text-[11px] font-mono text-slate-500 font-semibold">
            Tuyến dài: {importedLengthKm >= 1 ? `${importedLengthKm.toFixed(2)} km` : `${(importedLengthKm * 1000).toFixed(0)} m`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="relative flex items-center">
            <input
              type="number"
              step="0.05"
              min="0.01"
              max="50"
              value={splitDistance}
              onChange={(e) => onSetSplitDistance(parseFloat(e.target.value) || 0.1)}
              className="w-full h-8.5 pl-3 pr-14 bg-white border border-slate-300 rounded-lg font-mono text-xs font-bold text-brand-dark focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
              placeholder="Nhập km..."
            />
            <span className="absolute right-2.5 text-[11px] text-slate-500 font-medium pointer-events-none">
              km/đoạn
            </span>
          </div>

          <select
            value={splitSortOrder}
            onChange={(e) => onSetSplitSortOrder(e.target.value as any)}
            className="h-8.5 px-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
          >
            <option value="asc">Km tăng dần</option>
            <option value="desc">Km giảm dần</option>
          </select>
        </div>

        {/* Nút chọn nhanh cự ly mẫu */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <span className="text-[10px] text-slate-400 font-semibold shrink-0">Mẫu:</span>
          {[0.2, 0.25, 0.5, 1.0, 2.5, 5.0].map((kmVal) => (
            <button
              key={kmVal}
              type="button"
              onClick={() => {
                onSetSplitDistance(kmVal)
                setTimeout(() => onApplyAutoSplit(), 50)
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer shrink-0 ${
                splitDistance === kmVal
                  ? 'bg-[#C9A227] text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-[#C9A227]'
              }`}
            >
              {kmVal >= 1 ? `${kmVal}km` : `${kmVal * 1000}m`}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <button
            type="button"
            onClick={onApplyAutoSplit}
            className="h-8.5 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Áp dụng chia đoạn</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddSegmentModal}
            className="h-8.5 rounded-lg border border-[#C9A227] text-[#8F7212] hover:bg-amber-50/60 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm đoạn mới</span>
          </button>
        </div>
      </div>

      {/* Segment List Stack */}
      <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-0.5">
        {/* MỤC TOÀN TUYẾN */}
        <div
          onClick={onSelectAllRoute}
          className={`p-3 rounded-xl border transition-all flex flex-col gap-2 cursor-pointer ${
            isAllSelected
              ? 'bg-amber-50/70 border-[#C9A227] ring-2 ring-[#C9A227]/40 shadow-xs'
              : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full shrink-0 shadow-2xs border border-white bg-[#C9A227] flex items-center justify-center text-[9px] text-white font-bold">
                ★
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-brand-dark">Toàn Tuyến Tuyến Đường</span>
                  <span className="text-[10px] font-mono font-bold text-[#8F7212] bg-amber-100/70 px-1.5 py-0.2 rounded border border-amber-200">
                    {segments.length} phân đoạn
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-[#8F7212]">
                  Km {minKm.toFixed(3)} - Km {maxKm.toFixed(3)}
                </span>
              </div>
            </div>

            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              isAllSelected
                ? 'bg-[#C9A227] text-white border-[#C9A227]'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {isAllSelected ? 'Đang chọn' : 'Toàn tuyến'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-slate-500 text-[11px]">
            <span className="bg-slate-100 px-2 py-0.5 rounded-full font-mono font-semibold text-slate-700">
              Tổng dài: {totalLen >= 1 ? `${totalLen.toFixed(2)} km` : `${Math.round(totalLen * 1000)} mét`}
            </span>
            <span className="bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-full font-mono font-bold">
              Quy mô: ~{totalSlabsEst.toLocaleString()} tấm BTXM
            </span>
            <span className="bg-slate-100 px-2 py-0.5 rounded-full">4 làn xe</span>
          </div>
        </div>

        {segments.map((seg) => (
          <SidebarSegmentCard
            key={seg.id}
            segment={seg}
            isSelected={seg.id === selectedSegmentId}
            onSelect={() => onSelectSegment(seg)}
            onSnap={() => onSnapSegment(seg.id)}
            onEdit={() => onEditSegment(seg)}
            onOpenSplit={() => onOpenSplitModal(seg)}
            onDelete={() => onDeleteSegment(seg.id)}
          />
        ))}
      </div>
    </>
  )
}
