import React from 'react'

export interface ApprovalStatsBarProps {
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
}

export const ApprovalStatsBar: React.FC<ApprovalStatsBarProps> = ({ stats }) => {
  return (
    <section className="bg-white border border-brand-border p-6 rounded-2xl shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Stacked Progress & Metric Pills */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-base text-slate-900">Tiến độ thẩm định kỹ thuật</span>
              <span className="font-mono text-xs bg-slate-100 px-3 py-0.5 rounded-full text-slate-700 font-semibold border border-slate-200">
                {stats.approved}/{stats.total} Hạng mục
              </span>
            </div>
            <span className="text-xs text-slate-600 font-medium">
              Tỷ lệ thông qua: <strong className="text-slate-900 font-bold">{stats.percent}%</strong>
            </span>
          </div>

          {/* Stacked Multi-Segment Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-3.5 flex overflow-hidden p-0.5 border border-slate-200">
            <div
              className="bg-brand-gold h-full rounded-l-full transition-all duration-300"
              style={{ width: `${stats.total > 0 ? (stats.approved / stats.total) * 100 : 0}%` }}
              title={`${stats.approved} Đã duyệt`}
            ></div>
            <div
              className="bg-[#0284C7] h-full transition-all duration-300"
              style={{ width: `${stats.total > 0 ? (stats.evidence / stats.total) * 100 : 0}%` }}
              title={`${stats.evidence} Cần bổ sung bằng chứng`}
            ></div>
            <div
              className="bg-[#DC2626] h-full rounded-r-full transition-all duration-300"
              style={{ width: `${stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0}%` }}
              title={`${stats.rejected} Từ chối`}
            ></div>
          </div>

          {/* Metric Pills Cluster (All rounded-full) */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-700 font-medium border border-brand-border">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              <span>
                Tổng: <strong>{stats.total}</strong> hạng mục
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF9E7] text-[#92700C] font-semibold border border-[#FDE68A]">
              <span className="w-2 h-2 rounded-full bg-brand-gold"></span>
              <span>
                Đã duyệt: <strong>{stats.approved}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F2FE] text-[#0284C7] font-semibold border border-[#BAE6FD]">
              <span className="w-2 h-2 rounded-full bg-[#0284C7]"></span>
              <span>
                Cần bằng chứng: <strong>{stats.evidence}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEE2E2] text-[#DC2626] font-semibold border border-[#FECACA]">
              <span className="w-2 h-2 rounded-full bg-[#DC2626]"></span>
              <span>
                Từ chối: <strong>{stats.rejected}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Technical Volume Breakdown (Zero Money / Zero VNĐ) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-brand-surfaceAlt border border-brand-border p-4 rounded-xl space-y-1">
            <span className="text-[11px] text-[#92700C] font-bold uppercase tracking-wider block">
              Tổng diện tích thi công đã duyệt:
            </span>
            <span className="text-xl font-black text-[#92700C] block">
              {stats.approvedArea} <span className="text-xs font-normal text-slate-500">m²</span>
            </span>
            <span className="text-[11px] text-slate-500 block">
              Trên tổng số {stats.totalProposedArea} m² đề xuất
            </span>
          </div>

          <div className="bg-brand-surfaceAlt border border-brand-border p-4 rounded-xl space-y-1">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
              Thời gian thi công dự kiến:
            </span>
            <span className="text-xl font-bold text-slate-900 block">
              4 <span className="text-xs font-normal text-slate-500">ngày</span>
            </span>
            <span className="text-[11px] text-slate-500 block">Thời hạn hoàn thành: 28/08/2026</span>
          </div>
        </div>
      </div>
    </section>
  )
}
