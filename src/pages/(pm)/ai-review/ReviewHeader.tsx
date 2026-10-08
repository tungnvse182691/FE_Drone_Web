import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/ui/Icon'
import type { TriageCase } from './types'

export interface ReviewHeaderProps {
  basePath: string
  isSupervisor: boolean
  cases: TriageCase[]
  pendingCount: number
  selectedReportIds: string[]
  selectedCase: TriageCase
  onOpenLinkReportsModal: () => void
  onNavigateFastTrack: (c: TriageCase) => void
  showToast: (msg: string) => void
}

export const ReviewHeader: React.FC<ReviewHeaderProps> = ({
  basePath,
  isSupervisor,
  cases,
  pendingCount,
  selectedReportIds,
  selectedCase,
  onOpenLinkReportsModal,
  onNavigateFastTrack,
  showToast,
}) => {
  const navigate = useNavigate()

  return (
    <div className="space-y-3">
      {/* Top Breadcrumb & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="hover:text-brand-dark cursor-pointer" onClick={() => navigate(`${basePath}/dashboard`)}>
            Trang chủ
          </span>
          <Icon name="chevron_right" size={14} className="text-slate-400" />
          <span className="font-semibold text-brand-gold">Hộp thư tiếp nhận &amp; Sàng lọc lỗi</span>
        </nav>
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Đồng bộ cảm biến GIS: 25/08/2026</span>
        </div>
      </div>

      {/* Page Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
              Hộp Thư Tiếp Nhận &amp; Sàng Lọc Lỗi
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
              {pendingCount} ca chờ xác minh
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Sàng lọc khiếm khuyết từ Drone AI và phản ánh hiện trường theo quy chuẩn TCVN
          </p>
        </div>

        {/* Right Quick Actions */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => showToast('Đang xuất danh sách hồ sơ Triage ra file Excel TCVN...')}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Icon name="download" size={16} className="text-slate-500" />
            <span>Xuất báo cáo Excel</span>
          </button>
          {selectedReportIds.length >= 2 && (
            <button
              onClick={onOpenLinkReportsModal}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 border border-amber-400 shadow-sm animate-pulse cursor-pointer"
            >
              <Icon name="link" size={16} />
              <span>Liên kết báo trùng ({selectedReportIds.length})</span>
            </button>
          )}
          <button
            onClick={() => onNavigateFastTrack(selectedCase)}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-gold hover:bg-[#B38E1F] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <span>Điều phối xử lý nhanh</span>
            <Icon name="chevron_right" size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
