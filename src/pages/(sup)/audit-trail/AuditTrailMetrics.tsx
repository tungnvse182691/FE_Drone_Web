import React from 'react'
import { Card } from '../../../components/ui/Card'
import { History, CheckCircle2, Layers, ArrowRight, ShieldCheck } from 'lucide-react'
import { CalculatedStats } from './types'

interface AuditTrailMetricsProps {
  calculatedStats: CalculatedStats
  isSupervisor: boolean
}

export const AuditTrailMetrics: React.FC<AuditTrailMetricsProps> = ({
  calculatedStats,
  isSupervisor
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Metric 1: Tổng số sự kiện bền vững ghi nhận trong scope */}
      <Card className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tổng sự kiện ghi nhận (Durable Events)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
                {calculatedStats.total_events}
              </span>
              <span className="text-xs text-slate-500 font-medium">sự kiện trong scope</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
            <History className="w-6 h-6" />
          </div>
        </div>
        <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-semibold">Mỗi sự kiện có Event ID độc nhất</span>
            <span className="text-slate-500 font-normal">(Dedup theo US-29-AC-01)</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">
            Không sửa / không xóa để che giấu lịch sử (US-29-AC-03)
          </span>
        </div>
      </Card>

      {/* Metric 2: Số lần chuyển đổi trạng thái hồ sơ/đợt sửa */}
      <Card className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Chuyển đổi trạng thái (State Transitions)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
                {calculatedStats.state_transitions}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
                From → To Status
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
            <Layers className="w-6 h-6" />
          </div>
        </div>
        <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium">
            <ArrowRight className="w-4 h-4 text-brand-gold" />
            <span>Ghi nhận chi tiết vào IncidentCaseHistory</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500 truncate">
            {isSupervisor
              ? 'Duyệt đợt sửa, từ chối gói, nghiệm thu hoàn công'
              : 'Trình duyệt đợt sửa, phân công đội thi công'}
          </span>
        </div>
      </Card>

      {/* Metric 3: Quyết định thẩm duyệt của Supervisor */}
      <Card className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Quyết định thẩm duyệt (Supervisor Actions)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
                0{calculatedStats.approval_decisions}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                Duyệt / Từ chối
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
        <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">Thẩm tra giải pháp kỹ thuật &amp; biên bản thi công</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">
            Lưu trữ bảo hành tối thiểu +5 năm (BR-45 &amp; UAT-10)
          </span>
        </div>
      </Card>
    </div>
  )
}
