import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { TriageCase } from './types'

export interface BatchActionBarProps {
  selectedReportIds: string[]
  cases: TriageCase[]
  onOpenLinkReportsModal: () => void
  onOpenTriageProject: (c: TriageCase, e?: React.MouseEvent) => void
  onClearSelectedReports: () => void
  onBulkVerify?: () => void
  onBulkNeedSurvey?: () => void
}

export const BatchActionBar: React.FC<BatchActionBarProps> = ({
  selectedReportIds,
  cases,
  onOpenLinkReportsModal,
  onOpenTriageProject,
  onClearSelectedReports,
  onBulkVerify,
  onBulkNeedSurvey
}) => {
  if (selectedReportIds.length === 0) return null

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-2.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-lg border border-amber-400 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-2">
        <Icon name="check_box" size={16} className="text-slate-950 font-bold" />
        <span className="text-xs font-bold">
          Đã chọn {selectedReportIds.length} khiếm khuyết
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {onBulkVerify && (
          <button
            type="button"
            onClick={onBulkVerify}
            className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            title="Xác nhận hàng loạt các khiếm khuyết đã chọn"
          >
            <Icon name="check_circle" size={14} />
            <span>Xác nhận hàng loạt</span>
          </button>
        )}
        {onBulkNeedSurvey && (
          <button
            type="button"
            onClick={onBulkNeedSurvey}
            className="px-3 py-1.5 rounded-lg bg-blue-700 text-white hover:bg-blue-800 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            title="Đánh dấu yêu cầu đo đạc/khảo sát lại hiện trường"
          >
            <Icon name="rule" size={14} />
            <span>Đánh dấu kiểm tra lại</span>
          </button>
        )}
        <button
          type="button"
          onClick={onOpenLinkReportsModal}
          disabled={selectedReportIds.length < 2}
          className="px-3 py-1.5 rounded-lg bg-slate-950 text-white hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          title={
            selectedReportIds.length < 2
              ? 'Chọn từ 2 phản ánh trở lên để liên kết báo trùng'
              : 'Liên kết báo trùng (PA04)'
          }
        >
          <Icon name="link" size={14} className="text-brand-gold" />
          <span>Liên kết báo trùng (PA04)</span>
        </button>
        <button
          type="button"
          onClick={() => {
            const first = cases.find((c) => selectedReportIds.includes(c.id))
            if (first) onOpenTriageProject(first)
          }}
          className="px-3 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors border border-amber-300"
        >
          <Icon name="domain" size={14} className="text-amber-700" />
          <span>Điều phối dự án (PA03)</span>
        </button>
        <button
          type="button"
          onClick={onClearSelectedReports}
          className="px-2.5 py-1.5 rounded-lg text-slate-800 hover:bg-amber-400 text-xs font-semibold cursor-pointer"
        >
          Bỏ chọn
        </button>
      </div>
    </div>
  )
}
