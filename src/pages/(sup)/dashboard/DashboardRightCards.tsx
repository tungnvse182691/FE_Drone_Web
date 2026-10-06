import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  Clock,
  History,
  TrendingDown,
  ChevronRight,
  ArrowRight,
  Check
} from 'lucide-react'
import { MOCK_RECENT_ACTIVITIES } from './mockData'

export interface DashboardRightCardsProps {
  onNavigateAuditTrail: () => void
  onNavigateRiskAnalytics: () => void
}

export const DashboardRightCards: React.FC<DashboardRightCardsProps> = ({
  onNavigateAuditTrail,
  onNavigateRiskAnalytics
}) => {
  const navigate = useNavigate()

  return (
    <>
      {/* Card: Hiệu suất xử lý khiếm khuyết (MET-05 Cohort Completion & SLA) */}
            <div className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-4">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[#FEF9C3] text-[#92700C]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="font-sansation font-bold">Hiệu suất xử lý khiếm khuyết</span>
                </div>

                <span className="text-xs text-slate-500 font-medium">Chỉ số hoàn thành đúng hạn (SLA)</span>
                <div className="font-sansation text-3xl font-bold tracking-tight mt-1 mb-5 text-brand-gold">
                  88.5%
                </div>

                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-700">Đã nghiệm thu đóng hồ sơ</span>
                    <span className="font-bold text-brand-gold">156 điểm</span>
                  </div>
                  <div className="w-full rounded-full h-2 overflow-hidden bg-slate-100">
                    <div className="h-2 rounded-full bg-brand-gold" style={{ width: '86.6%' }}></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-700">Đang xử lý / Chờ nghiệm thu</span>
                    <span className="text-rose-600 font-bold">24 điểm</span>
                  </div>
                  <div className="w-full rounded-full h-2 overflow-hidden bg-slate-100">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: '13.4%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card: Hoạt động gần đây (Audit Trail - RPT-10) */}
            <div className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-200 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-sansation font-bold text-slate-900 text-sm">Hoạt động gần đây</h3>
                <span className="text-[11px] font-mono text-slate-400">RPT-10</span>
              </div>

              <div className="space-y-3.5">
                {MOCK_RECENT_ACTIVITIES.map((act: any) => (
                  <div key={act.id} className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                        act.type === 'ai'
                          ? 'bg-purple-100 text-purple-700'
                          : act.type === 'acceptance'
                          ? 'bg-emerald-100 text-emerald-700'
                          : act.type === 'proposal'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 rounded-xl p-3 bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            act.type === 'ai'
                              ? 'bg-purple-50 text-purple-800 border border-purple-200'
                              : act.type === 'acceptance'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : act.type === 'proposal'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {act.tag}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">{act.time}</span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">{act.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card: Chỉ số suy thoái mặt đường PCI theo đoạn tuyến */}
            <div className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-200">
              <h3 className="font-sansation font-bold text-slate-900 text-sm mb-3">
                Chỉ số chất lượng mặt đường (PCI)
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">QL1A (Km 1024 - Km 1045):</span>
                    <span className="font-bold text-emerald-600">78.5 (Tốt)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '78.5%' }} />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Cao tốc Bắc Nam XL-03:</span>
                    <span className="font-bold text-amber-600">64.2 (Trung bình)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '64.2%' }} />
                  </div>
                </div>

                <button
                  onClick={() => onNavigateRiskAnalytics()}
                  type="button"
                  className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs mt-2"
                >
                  <span>Xem bản đồ nhiệt &amp; rủi ro chuyên sâu</span>
                  <ArrowRight className="w-3.5 h-3.5 text-brand-gold" />
                </button>
              </div>
            </div>
    </>
  )
}
