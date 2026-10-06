import React from 'react'
import {
  Shield,
  CheckCircle2,
  Clock,
  History,
  AlertCircle
} from 'lucide-react'
import { CaseItem } from './types'

export interface StatusBarProps {
  currentItem: CaseItem
}

export const StatusBar: React.FC<StatusBarProps> = ({ currentItem }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Track badge */}
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold shadow-2xs border ${
          currentItem.track_type === 'APPROVAL_TRACK'
            ? 'bg-purple-100 text-purple-900 border-purple-200'
            : currentItem.track_type === 'FAST_TRACK'
            ? 'bg-sky-100 text-sky-900 border-sky-200'
            : 'bg-rose-100 text-rose-900 border-rose-200'
        }`}
      >
        <Shield className="w-3.5 h-3.5" />
        Nhánh:{' '}
        {currentItem.track_type === 'APPROVAL_TRACK'
          ? 'Phê duyệt tiêu chuẩn'
          : currentItem.track_type === 'FAST_TRACK'
          ? 'Xử lý cấp bách'
          : 'Điều phối trực tiếp'}
      </span>

      {/* Status badge */}
      {currentItem.status === 'ACCEPTED' && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          TRẠNG THÁI: {currentItem.status_label}
        </span>
      )}
      {currentItem.status === 'PENDING_INSPECTION' && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-200 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          TRẠNG THÁI: {currentItem.status_label}
        </span>
      )}
      {currentItem.status === 'REWORK_REQUIRED' && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-rose-100 text-rose-900 border border-rose-200 shadow-2xs">
          <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
          TRẠNG THÁI: YÊU CẦU SỬA LẠI (REWORK)
        </span>
      )}

      {/* Attempt badge */}
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-slate-200 text-slate-800 border border-slate-300 shadow-2xs">
        <History className="w-3 h-3" />
        Lần thi công: #{currentItem.attempt_number}
      </span>

      {/* SLA badge */}
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
        <Clock className="w-3.5 h-3.5 text-emerald-700" />
        SLA Nghiệm thu: Còn 18h
      </span>

      <span className="font-mono text-slate-500 text-[11px] px-3 py-1 bg-white rounded-full border border-slate-200 shadow-2xs">
        Mã băm SHA-256: 7B8F..A49
      </span>
    </div>
  )
}
