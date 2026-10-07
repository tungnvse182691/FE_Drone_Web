import React from 'react'
import {
  SplitSquareVertical,
  AlertTriangle,
  Link2,
  Check,
  Edit2,
  Trash2
} from 'lucide-react'
import { SegmentItem } from './types'

export interface SidebarSegmentCardProps {
  segment: SegmentItem
  isSelected: boolean
  onSelect: () => void
  onSnap: () => void
  onEdit: () => void
  onOpenSplit: () => void
  onDelete: () => void
}

export const SidebarSegmentCard: React.FC<SidebarSegmentCardProps> = ({
  segment,
  isSelected,
  onSelect,
  onSnap,
  onEdit,
  onOpenSplit,
  onDelete
}) => {
  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-xl border transition-all flex flex-col gap-2 cursor-pointer ${
        isSelected
          ? 'bg-amber-50/50 border-brand-gold ring-2 ring-brand-gold/40 shadow-xs'
          : segment.hasGap
          ? 'bg-amber-50/30 border-amber-300 hover:border-amber-400'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            style={{ backgroundColor: segment.color }}
            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs border border-white"
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-brand-dark">{segment.code}</span>
            <span className="font-mono text-xs font-bold text-[#8F7212]">
              Km {segment.startKm.toFixed(3)} - Km {segment.endKm.toFixed(3)}
            </span>
          </div>
        </div>

        {segment.hasGap ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-amber-50 text-amber-800 border-amber-300 flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            {segment.statusText}
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
            {segment.statusText}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-slate-500 text-[11px]">
        <span className="bg-slate-100 px-2 py-0.5 rounded-full font-mono font-semibold text-slate-700">
          Dài: {segment.lengthKm >= 1 ? `${segment.lengthKm.toFixed(2)} km` : `${Math.round(segment.lengthKm * 1000)} mét`}
        </span>
        <span className="bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-full font-mono font-bold">
          Rộng: {segment.roadWidthM || 8.0}m (±{((segment.roadWidthM || 8.0) / 2).toFixed(1)}m)
        </span>
        <span className="bg-slate-100 px-2 py-0.5 rounded-full">{segment.laneCount} làn</span>
        <span className="bg-slate-100 px-2 py-0.5 rounded-full">{segment.surfaceMaterial}</span>
      </div>

      {/* Cảnh báo khoảng hở & Nút nối tiếp giáp */}
      {segment.hasGap && (
        <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-200 text-xs mt-1">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            {segment.gapDistance && segment.gapDistance > 0
              ? `Hở ${segment.gapDistance}m so với đoạn trước`
              : `Chồng lấn ${Math.abs(segment.gapDistance || 0)}m`}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onSnap()
            }}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-[10px] font-bold shadow-2xs cursor-pointer flex items-center gap-1 transition-all active:scale-95"
            title="Khép kín khoảng hở với phân đoạn liền trước"
          >
            <Link2 className="w-3 h-3" />
            <span>Nối tiếp giáp</span>
          </button>
        </div>
      )}

      <div className="flex items-center justify-between pt-1 text-slate-500 text-xs border-t border-slate-100 mt-0.5">
        {segment.hasGap ? (
          <span className="flex items-center gap-1 text-[11px] text-amber-700 font-medium">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Chưa khép kín
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
            <Check className="w-3 h-3 text-emerald-600" />
            Tiếp giáp khép kín
          </span>
        )}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="p-1.5 hover:bg-amber-100/60 rounded-md text-slate-500 hover:text-[#8F7212] transition-colors cursor-pointer"
            title="Chỉnh sửa lý trình & thông số"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onOpenSplit()
            }}
            className="p-1.5 hover:bg-sky-100/60 rounded-md text-slate-500 hover:text-sky-700 transition-colors cursor-pointer"
            title="Tách phân đoạn này tại mốc Km"
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-1.5 hover:bg-rose-100/60 rounded-md text-slate-500 hover:text-rose-700 transition-colors cursor-pointer"
            title="Xóa phân đoạn"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
