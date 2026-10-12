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
    <section className="bg-white border border-slate-200 p-5 rounded-xl shadow-2xs font-body">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left: Stacked Progress & Metric Pills */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 font-headline">Tiến độ thẩm định kỹ thuật</span>
              <span className="font-mono text-xs bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-700 font-medium border border-slate-200">
                {stats.approved}/{stats.total} Hạng mục
              </span>
            </div>
            <span className="text-xs text-slate-500">
              Tỷ lệ thông qua: <strong className="text-slate-900 font-bold">{stats.percent}%</strong>
            </span>
          </div>

          {/* Stacked Multi-Segment Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 flex overflow-hidden border border-slate-200">
            <div
              className="bg-[#2F9E44] h-full transition-all duration-300"
              style={{ width: `${stats.total > 0 ? (stats.approved / stats.total) * 100 : 0}%` }}
              title={`${stats.approved} Đã duyệt`}
            ></div>
            <div
              className="bg-[#0284C7] h-full transition-all duration-300"
              style={{ width: `${stats.total > 0 ? (stats.evidence / stats.total) * 100 : 0}%` }}
              title={`${stats.evidence} Cần bổ sung bằng chứng`}
            ></div>
            <div
              className="bg-[#E5484D] h-full transition-all duration-300"
              style={{ width: `${stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0}%` }}
              title={`${stats.rejected} Từ chối`}
            ></div>
          </div>

          {/* Metric Pills Cluster */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>
                Tổng: <strong>{stats.total}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E9F7EC] text-[#2F9E44] font-medium border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-[#2F9E44]"></span>
              <span>
                Đã duyệt: <strong>{stats.approved}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E0F2FE] text-[#0284C7] font-medium border border-sky-200">
              <span className="w-2 h-2 rounded-full bg-[#0284C7]"></span>
              <span>
                Cần bằng chứng: <strong>{stats.evidence}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FDECEC] text-[#E5484D] font-medium border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-[#E5484D]"></span>
              <span>
                Từ chối: <strong>{stats.rejected}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Technical Volume Breakdown (Zero Money / Zero VNĐ) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-[#F8F9FA] border border-slate-200 p-3.5 rounded-lg space-y-0.5">
            <span className="text-[11px] text-brand-gold font-bold uppercase tracking-wider block">
              Diện tích đã duyệt:
            </span>
            <span className="text-lg font-bold text-slate-900 block font-headline">
              {stats.approvedArea} <span className="text-xs font-normal text-slate-500">m²</span>
            </span>
            <span className="text-[11px] text-slate-500 block">
              Trên tổng số {stats.totalProposedArea} m² đề xuất
            </span>
          </div>

          <div className="bg-[#F8F9FA] border border-slate-200 p-3.5 rounded-lg space-y-0.5">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
              Thời gian dự kiến:
            </span>
            <span className="text-lg font-bold text-slate-900 block font-headline">
              3-4 <span className="text-xs font-normal text-slate-500">ngày</span>
            </span>
            <span className="text-[11px] text-slate-500 block">Theo định mức TCVN 8819</span>
          </div>
        </div>
      </div>
    </section>
  )
}
