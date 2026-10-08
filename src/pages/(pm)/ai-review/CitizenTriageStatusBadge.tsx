import React from 'react'
import { Icon } from '../../../components/ui/Icon'

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
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 whitespace-nowrap">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
        <span>Chờ xác minh</span>
      </span>
    )
  }
  if (status === 'VERIFIED') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 whitespace-nowrap">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        <span>Đã xác minh</span>
      </span>
    )
  }
  if (status === 'MERGED') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 whitespace-nowrap">
        <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
        <span>Đã gộp trùng</span>
      </span>
    )
  }
  if (status === 'REJECTED') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 whitespace-nowrap">
        <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
        <span>{conclusion === 'NO_DEFECT' ? 'Báo sai (No Defect)' : 'Từ chối'}</span>
      </span>
    )
  }
  if (status === 'NEED_SURVEY') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 whitespace-nowrap">
        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
        <span>Cần đo đạc</span>
      </span>
    )
  }
  return null
}
