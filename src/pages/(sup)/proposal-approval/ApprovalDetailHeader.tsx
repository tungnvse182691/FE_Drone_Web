import React from 'react'
import {
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Milestone,
  User,
  AlertTriangle,
  CheckCheck,
  FileDown,
  Truck,
  CheckCircle2
} from 'lucide-react'

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
  onNavigateHome,
  onNavigateProposals,
  onOpenBatchApprove,
  onExportPdf,
  onOpenDispatch
}) => {
  return (
    <>
      {/* 1. BREADCRUMB & WORKFLOW STEP IDENTIFIER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <nav aria-label="Đường dẫn trang" className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <button
            onClick={onNavigateHome}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            Trang chủ
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button
            onClick={onNavigateProposals}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            Sửa chữa &amp; Đề xuất
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-900">Gói đề xuất {packageCode}</span>
        </nav>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onNavigateProposals}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E5E9] hover:bg-slate-100 text-slate-700 rounded-full text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại danh sách</span>
          </button>

          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
            <span>Quy trình kỹ thuật: WF-07 (Thẩm duyệt &amp; Điều phối)</span>
          </div>
        </div>
      </div>

      {/* 2. HEADER SECTION (Stitch 10 High Architectural Contrast) */}
      <div className="bg-white border border-[#E2E5E9] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center flex-wrap gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-sansation">
                {packageName} ({packageCode})
              </h1>
              {stats.approved === stats.total ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>DECIDED - Đã phê duyệt 100%</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] border border-amber-200 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[#D97706] animate-ping opacity-75"></span>
                  <span>SUBMITTED - Chờ Supervisor phê duyệt</span>
                </span>
              )}
            </div>

            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 font-medium">
              <span className="inline-flex items-center gap-1.5">
                <Milestone className="w-4 h-4 text-[#C9A227]" />
                <span>Tuyến QL1A • Đoạn Km 1024 - Km 1045</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-500" />
                <span>Lập bởi PM Lê Tuấn • 25/08/2026</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5 text-[#C9A227] font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>Mức độ ưu tiên: Khẩn cấp cấp II</span>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5 shrink-0">
            {isSupervisor && (
              <button
                onClick={onOpenBatchApprove}
                type="button"
                className="inline-flex items-center gap-1.5 px-4 h-10 bg-white border border-[#E2E5E9] text-slate-800 hover:bg-slate-50 transition-colors rounded-xl font-bold text-xs shadow-2xs cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                <span>Duyệt nhanh tất cả mục hợp lệ</span>
              </button>
            )}

            <button
              onClick={onExportPdf}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 h-10 bg-white border border-[#E2E5E9] text-slate-800 hover:bg-slate-50 transition-colors rounded-xl font-bold text-xs shadow-2xs cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-slate-600" />
              <span>Xuất hồ sơ gói (PDF)</span>
            </button>

            {!isSupervisor && (
              <div className="relative group">
                <button
                  onClick={onOpenDispatch}
                  type="button"
                  className="inline-flex items-center gap-1.5 px-4 h-10 bg-[#C9A227] text-white hover:bg-[#B38E1F] transition-all rounded-xl font-bold text-xs shadow-xs cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Giao việc cho đội thi công (Dispatch)</span>
                </button>
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 text-white text-[11px] p-2.5 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-20 font-medium">
                  Đã sẵn sàng giao {stats.approved}/{stats.total} hạng mục kỹ thuật đã có phê duyệt chính thức từ
                  Supervisor.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Role Guard Compliance Alert Banner */}
        <div className="flex items-start gap-3 bg-amber-50/60 border border-amber-200/80 p-3.5 rounded-xl text-xs text-slate-700">
          <ShieldAlert className="w-5 h-5 text-[#C9A227] shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <strong className="text-slate-900 font-bold">Quy định thẩm quyền kỹ thuật:</strong>{' '}
            Supervisor chịu trách nhiệm phê duyệt giải pháp vật liệu, phương pháp kỹ thuật &amp; khối lượng thi công từng
            vị trí hỏng hóc. PM chỉ được phát lệnh hiện trường (Dispatch) cho các hạng mục đã hoàn tất phê duyệt (
            <strong className="text-emerald-700 font-bold">APPROVED</strong>).
          </div>
        </div>
      </div>
    </>
  )
}
