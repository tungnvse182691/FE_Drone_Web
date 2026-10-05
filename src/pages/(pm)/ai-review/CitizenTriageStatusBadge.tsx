import React from 'react'
import { CheckCircle2, Merge, X, Camera } from 'lucide-react'

export interface CitizenTriageStatusBadgeProps {
  status: string
  conclusion?: string | null
}

export const CitizenTriageStatusBadge: React.FC<CitizenTriageStatusBadgeProps> = ({
  status,
  conclusion
}) => {
  if (status === 'PENDING') {
    return (
      <span className="bg-amber-100 text-[#8F7212] text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-amber-200 w-fit">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
        <span>Chờ xử lý</span>
      </span>
    )
  }
  if (status === 'VERIFIED') {
    return (
      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-200 w-fit">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>Đã xác minh</span>
      </span>
    )
  }
  if (status === 'MERGED') {
    return (
      <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-purple-200 w-fit">
        <Merge className="w-3 h-3 text-purple-600" />
        <span>Đã gộp</span>
      </span>
    )
  }
  if (status === 'REJECTED') {
    return (
      <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-slate-200 w-fit">
        <X className="w-3 h-3 text-slate-500" />
        <span>{conclusion === 'NO_DEFECT' ? 'Báo sai' : 'Từ chối'}</span>
      </span>
    )
  }
  if (status === 'NEED_SURVEY') {
    return (
      <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-blue-200 w-fit">
        <Camera className="w-3 h-3 text-blue-600" />
        <span>Cần đo đạc</span>
      </span>
    )
  }
  return null
}
