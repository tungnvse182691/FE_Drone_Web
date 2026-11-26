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
import type { SupDashboardActivity } from '../../../api/services/supDashboardService'

export interface DashboardRightCardsProps {
  /** Tổng hạng mục sửa chữa theo repairItemsByStatus (CONFIRMED / còn lại) từ BE; null khi chưa tải được. */
  repairItems: { confirmed: number; other: number } | null
  /** Sự kiện gần đây từ GET /projects/{id}/reports/timeline. */
  activities: SupDashboardActivity[]
  isLoading: boolean
  onNavigateAuditTrail: () => void
  onNavigateRiskAnalytics: () => void
}

export const DashboardRightCards: React.FC<DashboardRightCardsProps> = ({
  repairItems,
  activities,
  isLoading,
  onNavigateAuditTrail,
  onNavigateRiskAnalytics
}) => {
  const navigate = useNavigate()
  const repairTotal = repairItems ? repairItems.confirmed + repairItems.other : 0
  const pct = (n: number) => (repairTotal > 0 ? `${((n / repairTotal) * 100).toFixed(1)}%` : '0%')

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
                  —
                </div>
                <p className="text-[11px] text-slate-500 -mt-3 mb-4">Máy chủ chưa cung cấp dữ liệu này</p>

                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-700">Đã nghiệm thu đóng hồ sơ</span>
                    <span className="font-bold text-brand-gold">{repairItems ? `${repairItems.confirmed} hạng mục` : '—'}</span>
                  </div>
                  <div className="w-full rounded-full h-2 overflow-hidden bg-slate-100">
                    <div className="h-2 rounded-full bg-brand-gold" style={{ width: repairItems ? pct(repairItems.confirmed) : '0%' }}></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-700">Đang xử lý / Chờ nghiệm thu</span>
                    <span className="text-rose-600 font-bold">{repairItems ? `${repairItems.other} hạng mục` : '—'}</span>
                  </div>
                  <div className="w-full rounded-full h-2 overflow-hidden bg-slate-100">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: repairItems ? pct(repairItems.other) : '0%' }}></div>
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
                {activities.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">
                    {isLoading ? 'Đang tải hoạt động từ máy chủ...' : 'Không có hoạt động nào trong CSDL.'}
                  </p>
                )}
                {activities.map((act) => {
                  const actType: string = 'default'
                  return (
                  <div key={act.eventId} className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                        actType === 'ai'
                          ? 'bg-purple-100 text-purple-700'
                          : actType === 'acceptance'
                          ? 'bg-emerald-100 text-emerald-700'
                          : actType === 'proposal'
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
                            actType === 'ai'
                              ? 'bg-purple-50 text-purple-800 border border-purple-200'
                              : actType === 'acceptance'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : actType === 'proposal'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {act.action}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">{new Date(act.occurredAt).toLocaleString('vi-VN', { hour12: false })}</span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">{act.summary} · {act.projectCode}{act.actorDisplay ? ` · ${act.actorDisplay}` : ''}</p>
                    </div>
                  </div>
                  )
                })}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100">
                <button
                  onClick={onNavigateAuditTrail}
                  type="button"
                  className="w-full text-center text-xs font-semibold text-brand-gold hover:underline cursor-pointer flex items-center justify-center gap-1 py-1"
                >
                  <span>Xem toàn bộ nhật ký kiểm toán (RPT-10)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card: Chỉ số suy thoái mặt đường PCI theo đoạn tuyến */}
            <div className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-200">
              <h3 className="font-sansation font-bold text-slate-900 text-sm mb-3">
                Chỉ số chất lượng mặt đường (PCI)
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 font-medium">
                  Máy chủ chưa cung cấp dữ liệu này
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
