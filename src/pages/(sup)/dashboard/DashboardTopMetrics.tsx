import React from 'react'
import {
  BarChart3,
  AlarmClock,
  TriangleAlert,
  Route as RouteIcon,
  ShieldCheck,
  Clock,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Info
} from 'lucide-react'

export interface DashboardTopMetricsProps {
  /** Số dự án có status ACTIVE từ GET /projects; null khi chưa tải được. */
  totalActiveProjects: number | null
  isLoading: boolean
}

export const DashboardTopMetrics: React.FC<DashboardTopMetricsProps> = ({
  totalActiveProjects,
  isLoading
}) => {
  return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Dự án đang bảo hành */}
              <div className="bg-white rounded-2xl p-5 flex flex-col justify-between shadow-2xs border border-slate-200">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-slate-700">Dự án đang bảo hành</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-blue-600 bg-[#EAF4FB]">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="font-sansation text-3xl font-bold text-slate-900 tracking-tight">
                    {totalActiveProjects ?? (isLoading ? '…' : '—')}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-600 font-medium">
                    <TrendingUp className="w-3 h-3 text-slate-400" />
                    <span>Tổng chiều dài, số đoạn: Máy chủ chưa cung cấp dữ liệu này</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Dự án sắp hết hạn */}
              <div className="bg-white rounded-2xl p-5 flex flex-col justify-between shadow-2xs border border-slate-200">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-slate-700">Dự án sắp hết hạn</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-rose-600 bg-red-50">
                    <AlarmClock className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="font-sansation text-3xl font-bold text-slate-900 tracking-tight">—</div>
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-600">
                    <TriangleAlert className="w-3 h-3 text-slate-400" />
                    <span>Máy chủ chưa cung cấp dữ liệu này</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Đoạn đường chưa baseline (MET-09) */}
              <div className="bg-white rounded-2xl p-5 flex flex-col justify-between shadow-2xs border border-slate-200">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-slate-700 leading-snug">
                    Đoạn đường chưa baseline
                  </span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#92700C] bg-[#FEF9C3]">
                    <RouteIcon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="font-sansation text-3xl font-bold text-slate-900 tracking-tight">—</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-600">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <span>Máy chủ chưa cung cấp dữ liệu này</span>
                  </div>
                </div>
              </div>
            </div>

  )
}
