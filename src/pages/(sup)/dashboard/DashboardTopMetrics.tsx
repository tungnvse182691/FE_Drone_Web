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
  totalActiveProjects: number
  expiringProjectsCount: number
  pendingBaselineKm: number
}

export const DashboardTopMetrics: React.FC<DashboardTopMetricsProps> = ({
  totalActiveProjects,
  expiringProjectsCount,
  pendingBaselineKm
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
                  <div className="font-sansation text-3xl font-bold text-slate-900 tracking-tight">5</div>
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-600 font-medium">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                      293.8 km
                    </span>
                    <span>tổng chiều dài</span>
                    <span className="text-slate-300">•</span>
                    <span>156 đoạn</span>
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
                  <div className="font-sansation text-3xl font-bold text-slate-900 tracking-tight">1</div>
                  <div className="flex items-center gap-1.5 mt-2 text-[11px]">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-rose-700 bg-red-50 border border-rose-200">
                      <TriangleAlert className="w-3 h-3" />
                      <span>Cảnh báo: &lt; 30 ngày (Cao tốc Diễn Châu: còn 25 ngày)</span>
                    </span>
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
                    <span className="font-sansation text-3xl font-bold text-slate-900 tracking-tight">12</span>
                    <span className="text-xs font-semibold text-slate-600">đoạn</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-600">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <span>Thuộc 4 dự án (Cần bay khảo sát gốc)</span>
                  </div>
                </div>
              </div>
            </div>

  )
}
