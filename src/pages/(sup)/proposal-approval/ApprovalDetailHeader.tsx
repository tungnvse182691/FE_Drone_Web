import React from 'react'
import { Icon } from '../../../components/ui/Icon'

export interface ApprovalDetailHeaderProps {
  packageCode: string
  packageName: string
  basePath: string
  stats: {
    total: number
    approved: number
    evidence: number
    reconsider: number
    rejected: number
    pending: number
    percent: number
    approvedArea: number
    totalProposedArea: number
  }
  isSupervisor: boolean
  routeDisplay?: string
  chainageDisplay?: string
  createdByName?: string
  createdAt?: string
  status?: string
  onNavigateHome: () => void
  onNavigateProposals: () => void
  onOpenBatchApprove: () => void
  onExportPdf: () => void
  onOpenDispatch: () => void
}

export const ApprovalDetailHeader: React.FC<ApprovalDetailHeaderProps> = ({
  packageCode,
  packageName,
  basePath: _basePath,
  stats,
  isSupervisor,
  routeDisplay,
  chainageDisplay,
  createdByName,
  createdAt,
  status,
  onNavigateHome,
  onNavigateProposals,
  onOpenBatchApprove,
  onExportPdf: _onExportPdf,
  onOpenDispatch
}) => {
  return (
    <>
      {/* 1. BREADCRUMB & WORKFLOW STEP IDENTIFIER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-body">
        <nav aria-label="Đường dẫn trang" className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <button
            onClick={onNavigateHome}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            Trang chủ
          </button>
          <Icon name="chevron_right" size={14} className="text-slate-400" />
          <button
            onClick={onNavigateProposals}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            Sửa chữa &amp; Đề xuất
          </button>
          <Icon name="chevron_right" size={14} className="text-slate-400" />
          <span className="font-semibold text-slate-900">Gói đề xuất {packageCode}</span>
        </nav>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onNavigateProposals}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <Icon name="arrow_back" size={14} />
            <span>Quay lại danh sách</span>
          </button>

          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <Icon name="shield" size={16} className="text-brand-gold" />
            <span>Quy trình kỹ thuật: WF-07 (Thẩm duyệt &amp; Điều phối)</span>
          </div>
        </div>
      </div>

      {/* 2. HEADER SECTION (Minimalism theo DESIGN.md) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 font-body">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center flex-wrap gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-headline">
                {packageName} ({packageCode})
              </h1>
              {status === 'DISPATCHED' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  <Icon name="local_shipping" size={14} className="text-blue-600" />
                  <span>ASSIGNED - Đã giao việc</span>
                </span>
              ) : status === 'DRAFT' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#F8F9FA] text-[#2D3748] border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  <span>DRAFT - Bản nháp</span>
                </span>
              ) : status === 'DECIDED' || (stats.total > 0 && stats.approved === stats.total) ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E9F7EC] text-[#2F9E44] border border-emerald-200">
                  <Icon name="check_circle" size={14} className="text-[#2F9E44]" />
                  <span>APPROVED - Đã phê duyệt {Math.round(stats.percent)}%</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEF3E2] text-[#F59E0B] border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-ping opacity-75"></span>
                  <span>SUBMITTED - Chờ Supervisor phê duyệt</span>
                </span>
              )}
            </div>

            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1">
                <Icon name="navigation" size={14} className="text-brand-gold" />
                <span>{routeDisplay || 'QL1A'} • {chainageDisplay || 'Km 1024 - Km 1045'}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1">
                <Icon name="person" size={14} className="text-slate-400" />
                <span>Lập bởi: {createdByName || 'PM Đỗ Quốc Hoàng'} • {createdAt || 'Hôm nay'}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 text-brand-gold font-medium">
                <Icon name="warning" size={14} />
                <span>WF-07</span>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center flex-wrap gap-2 shrink-0">
            {isSupervisor && (
              <button
                onClick={onOpenBatchApprove}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 transition-colors rounded-lg font-medium text-xs shadow-2xs cursor-pointer"
              >
                <Icon name="done_all" size={16} className="text-emerald-600" />
                <span>Duyệt nhanh tất cả mục</span>
              </button>
            )}

            {!isSupervisor && (
              <button
                onClick={onOpenDispatch}
                type="button"
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 transition-colors rounded-lg font-medium text-xs shadow-xs cursor-pointer ${
                  status === 'DISPATCHED'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-brand-gold hover:bg-brand-goldMuted text-white'
                }`}
              >
                <Icon name="local_shipping" size={16} />
                <span>
                  {status === 'DISPATCHED'
                    ? 'Đã giao việc (Xem / Điều chỉnh)'
                    : 'Giao việc cho đội thi công'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Role Guard Compliance Alert Banner */}
        <div className="flex items-start gap-2.5 bg-amber-50/50 border border-amber-200/60 p-3 rounded-lg text-xs text-slate-700">
          <Icon name="security" size={16} className="text-brand-gold shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <strong className="text-slate-900 font-semibold">Quy định thẩm quyền:</strong>{' '}
            Supervisor thẩm duyệt phương pháp kỹ thuật &amp; khối lượng thi công từng vị trí. PM phát lệnh giao việc hiện trường (Dispatch) cho các hạng mục đã được phê duyệt (
            <strong className="text-[#2F9E44]">APPROVED</strong>).
          </div>
        </div>
      </div>
    </>
  )
}
