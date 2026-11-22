import React from 'react'
import { Icon } from '../../../components/ui/Icon'

export interface CitizenTriageStatusBadgeProps {
  status: string
  conclusion?: string | null
  /** Case đã OPEN lại sau khi có bổ sung (kết luận cũ nằm trong lịch sử). */
  reopened?: boolean
  /** PM đã ghi nhận KEEP_NEW/LINK_EXISTING (đọc lại từ BE). */
  decisionRecorded?: boolean
  /** Trạng thái Defect do BE trả — hiển thị riêng, không trộn vào trạng thái Case. */
  defectStatus?: string | null
  decisionReadError?: string
}

export const CitizenTriageStatusBadge: React.FC<CitizenTriageStatusBadgeProps> = ({
  status,
  conclusion,
  reopened,
  decisionRecorded,
  defectStatus,
  decisionReadError
}) => {
  if (status === 'PENDING') {
    const main = reopened
      ? { dot: 'bg-blue-500', text: 'text-blue-700', label: 'Đã mở lại do có bổ sung', pulse: true }
      : decisionRecorded
        ? { dot: 'bg-teal-500', text: 'text-teal-700', label: 'Đã ghi nhận', pulse: false }
        : { dot: 'bg-amber-500', text: 'text-amber-700', label: 'Chưa có quyết định', pulse: true }
    return (
      <span className="inline-flex flex-col gap-0.5">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${main.text}`}>
          <span className={`w-2 h-2 rounded-full shrink-0 ${main.dot} ${main.pulse ? 'animate-pulse' : ''}`} />
          <span>{main.label}</span>
        </span>
        {decisionRecorded && defectStatus && (
          <span className="text-[10px] text-slate-500 whitespace-nowrap">Defect: {defectStatus}</span>
        )}
        {decisionReadError && (
          <span role="alert" className="text-[10px] text-rose-700 max-w-[220px] whitespace-normal" title={decisionReadError}>Không đọc được quyết định từ máy chủ</span>
        )}
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
    const isOutOfScope = conclusion === 'OUT_OF_SCOPE'
    const isNoDefect = conclusion === 'NO_DEFECT'
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap ${
          isOutOfScope ? 'text-amber-800' : 'text-slate-600'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            isOutOfScope ? 'bg-amber-500' : 'bg-slate-400'
          }`}
        />
        <span>
          {isNoDefect
            ? 'Báo sai'
            : isOutOfScope
            ? 'Ngoài phạm vi'
            : 'Từ chối'}
        </span>
      </span>
    )
  }
  if (status === 'NEED_SURVEY') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 whitespace-nowrap">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
        <span>Cần đo đạc</span>
      </span>
    )
  }
  return null
}
