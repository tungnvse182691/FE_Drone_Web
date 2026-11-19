import React from 'react'
import { BarChart3, AlarmClock, TriangleAlert, Route as RouteIcon, TrendingUp, Bug } from 'lucide-react'

export interface DashboardTopMetricsProps {
  /** Số dự án ACTIVE (GET /projects); null khi chưa tải được. */
  totalActiveProjects: number | null
  /** Tổng chiều dài các tuyến hiện hành (mét) từ GET /projects/overviews; null nếu BE chưa đủ dữ liệu. */
  totalLengthMeters: number | null
  lengthIncomplete: boolean
  /** Số dự án có hồ sơ bảo hành hết hạn trong 30 ngày tới (từ warranties[].endDate); null khi chưa tải được. */
  expiringSoon: number | null
  /** Tổng số khiếm khuyết mở (OpenDefectMetric defect.open.v2); null nếu có dự án INCOMPLETE. */
  openDefects: number | null
  isLoading: boolean
}

const Card: React.FC<{ title: string; icon: React.ReactNode; tone: string; value: string; note: string; noteIcon: React.ReactNode }> = ({ title, icon, tone, value, note, noteIcon }) => (
  <div className="bg-white rounded-2xl p-5 flex flex-col justify-between shadow-2xs border border-slate-200">
    <div className="flex items-start justify-between">
      <span className="text-xs font-bold text-slate-700">{title}</span>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tone}`}>{icon}</div>
    </div>
    <div className="mt-4">
      <div className="font-sansation text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-600 font-medium">{noteIcon}<span>{note}</span></div>
    </div>
  </div>
)

export const DashboardTopMetrics: React.FC<DashboardTopMetricsProps> = ({ totalActiveProjects, totalLengthMeters, lengthIncomplete, expiringSoon, openDefects, isLoading }) => {
  const dash = isLoading ? '…' : '—'
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <Card title="Dự án đang bảo hành" icon={<BarChart3 className="w-4 h-4" />} tone="text-blue-600 bg-[#EAF4FB]"
        value={totalActiveProjects != null ? String(totalActiveProjects) : dash}
        note={totalLengthMeters != null ? `Tổng chiều dài tuyến hiện hành: ${(totalLengthMeters / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 3 })} km${lengthIncomplete ? ' (chưa đủ dự án)' : ''}` : 'Chưa có chiều dài tuyến từ máy chủ'}
        noteIcon={<RouteIcon className="w-3 h-3 text-slate-400" />} />
      <Card title="Dự án sắp hết hạn (≤30 ngày)" icon={<AlarmClock className="w-4 h-4" />} tone="text-rose-600 bg-red-50"
        value={expiringSoon != null ? String(expiringSoon) : dash}
        note="Theo ngày kết thúc hồ sơ bảo hành do máy chủ trả" noteIcon={<TriangleAlert className="w-3 h-3 text-slate-400" />} />
      <Card title="Khiếm khuyết đang mở" icon={<Bug className="w-4 h-4" />} tone="text-[#92700C] bg-[#FEF9C3]"
        value={openDefects != null ? String(openDefects) : dash}
        note="Trạng thái OPEN/VERIFIED (defect.open.v2)" noteIcon={<TrendingUp className="w-3 h-3 text-slate-400" />} />
    </div>
  )
}
