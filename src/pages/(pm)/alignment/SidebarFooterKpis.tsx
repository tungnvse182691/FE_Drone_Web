import React from 'react'
import { ShieldCheck } from 'lucide-react'
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
  const displayLen = totalLen > 0 ? totalLen : (importedLengthKm || 25.0)

  return (
    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2 text-center pb-2 border-b border-slate-200">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-brand-dark font-mono">
            {displayLen >= 1
              ? `${displayLen.toFixed(displayLen >= 10 ? 1 : 2)} km`
              : `${Math.round(displayLen * 1000)} mét`}
          </span>
          <span className="text-[10px] text-slate-500">Tổng chiều dài</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-brand-dark font-mono">{segments.length} đoạn</span>
          <span className="text-[10px] text-slate-500">Phân đoạn</span>
        </div>
        <div className="flex flex-col">
          <span className={`text-sm font-bold font-mono ${segments.some((s) => s.hasGap) ? 'text-amber-600 animate-pulse' : 'text-emerald-600'}`}>
            {segments.some((s) => s.hasGap) ? 'Cảnh báo hở' : 'Đạt chuẩn'}
          </span>
          <span className="text-[10px] text-slate-500">
            {segments.some((s) => s.hasGap) ? 'Cần khép kín' : 'Sẵn sàng duyệt'}
          </span>
        </div>
      </div>

      <div className="flex items-start gap-1.5 text-slate-500 text-[11px] leading-relaxed">
        <ShieldCheck className="w-3.5 h-3.5 text-brand-gold shrink-0 mt-0.5" />
        <span>
          Trạng thái <strong>CONFIRMED</strong> sẽ gắn hàm băm SHA-256 bất biến phục vụ nghiệm thu bảo hành.
        </span>
      </div>
    </div>
  )
}
