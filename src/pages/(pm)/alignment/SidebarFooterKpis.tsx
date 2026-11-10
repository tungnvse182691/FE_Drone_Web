import React from 'react'
import { SegmentItem } from './types'

export interface SidebarFooterKpisProps {
  segmentCount?: number | null
  segmentCountMessage?: string
  segments: SegmentItem[]
  importedLengthKm: number
  alignmentStatus?: 'DRAFT' | 'PENDING_APPROVAL' | 'SUBMITTED' | 'REJECTED' | 'CONFIRMED'
}

export const SidebarFooterKpis: React.FC<SidebarFooterKpisProps> = ({
  segments,
  segmentCount = null, segmentCountMessage = 'Chưa chọn set',
  importedLengthKm,
  alignmentStatus = 'DRAFT'
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
              : 'Chưa có dữ liệu'}
          </span>
          <span className="text-[10px] text-slate-500">Tổng chiều dài</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-brand-dark font-mono">{segmentCount == null ? segmentCountMessage : `${segmentCount} đoạn`}</span>
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
            {!hasRoute ? 'Chưa có tuyến' : segments.some((s) => s.hasGap) ? 'Cảnh báo hở' : alignmentStatus === 'CONFIRMED' ? 'Đã xác nhận' : alignmentStatus === 'REJECTED' ? 'Đã từ chối' : alignmentStatus === 'SUBMITTED' ? 'Đã trình' : alignmentStatus === 'PENDING_APPROVAL' ? 'Chờ phê duyệt' : 'Chưa xác nhận'}
          </span>
          <span className="text-[10px] text-slate-500">
            {!hasRoute ? 'Chưa có dữ liệu' : segments.some((s) => s.hasGap) ? 'Cần khép kín' : alignmentStatus === 'CONFIRMED' ? 'Hình học đã khóa' : alignmentStatus === 'SUBMITTED' ? 'Chờ Giám sát xác nhận' : alignmentStatus === 'PENDING_APPROVAL' ? 'Chờ kiểm tra máy chủ' : 'Chờ kiểm tra máy chủ'}
          </span>
        </div>
      </div>
    </div>
  )
}
