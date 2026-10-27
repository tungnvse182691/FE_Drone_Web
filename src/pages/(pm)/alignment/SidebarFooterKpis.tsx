import React from 'react'
import { SegmentItem } from './types'

export interface SidebarFooterKpisProps {
  segments: SegmentItem[]
  importedLengthKm: number
}

export const SidebarFooterKpis: React.FC<SidebarFooterKpisProps> = ({
  segments,
  importedLengthKm
}) => {
  const totalLen = segments.reduce((sum, s) => sum + (s.lengthKm || 0), 0)
  const displayLen = totalLen > 0 ? totalLen : (importedLengthKm || 0.0)
  const hasRoute = displayLen > 0

  return (
    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-brand-dark font-mono">
            {displayLen >= 1
              ? `${displayLen.toFixed(displayLen >= 10 ? 1 : 2)} km`
              : displayLen > 0
              ? `${Math.round(displayLen * 1000)} mét`
              : '0 km'}
          </span>
          <span className="text-[10px] text-slate-500">Tổng chiều dài</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-brand-dark font-mono">{segments.length} đoạn</span>
          <span className="text-[10px] text-slate-500">Phân đoạn</span>
        </div>
        <div className="flex flex-col">
          <span
            className={`text-sm font-bold font-mono ${
              !hasRoute
                ? 'text-slate-400'
                : segments.some((s) => s.hasGap)
                ? 'text-amber-600 animate-pulse'
                : 'text-emerald-600'
            }`}
          >
            {!hasRoute ? 'Chưa có tuyến' : segments.some((s) => s.hasGap) ? 'Cảnh báo hở' : 'Đạt chuẩn'}
          </span>
          <span className="text-[10px] text-slate-500">
            {!hasRoute ? '0.00 km' : segments.some((s) => s.hasGap) ? 'Cần khép kín' : 'Sẵn sàng duyệt'}
          </span>
        </div>
      </div>
    </div>
  )
}
