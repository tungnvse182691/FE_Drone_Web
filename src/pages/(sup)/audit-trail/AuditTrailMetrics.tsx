import React from 'react'
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Metric 1: Tổng số sự kiện ghi nhận */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-semibold text-slate-700">Tổng sự kiện ghi nhận</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
            Bản ghi chính thức
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold text-slate-900 font-sansation">
            {calculatedStats.total_events}
          </span>
          <span className="text-xs text-slate-500 font-medium">sự kiện</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
          <span>Mã định danh duy nhất</span>
          <span className="text-slate-600 font-medium">Hồ sơ bất biến</span>
        </div>
      </div>

      {/* Metric 2: Số lần chuyển đổi trạng thái */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-semibold text-slate-700">Chuyển đổi trạng thái</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200">
            Tiến độ hồ sơ
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold text-slate-900 font-sansation">
            {calculatedStats.state_transitions}
          </span>
          <span className="text-xs text-slate-500 font-medium">lần thay đổi</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
          <span>Lưu vết biến động hồ sơ</span>
          <span className="text-slate-600 font-medium">Trước → Sau</span>
        </div>
      </div>

      {/* Metric 3: Quyết định phê duyệt & nghiệm thu */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-semibold text-slate-700">
            {isSupervisor ? 'Quyết định của Giám sát' : 'Quyết định thẩm duyệt'}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
            Phê duyệt &amp; Nghiệm thu
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold text-slate-900 font-sansation">
            {calculatedStats.approval_decisions}
          </span>
          <span className="text-xs text-slate-500 font-medium">quyết định chính thức</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
          <span>Kiểm soát chéo 4 mắt</span>
          <span className="text-emerald-700 font-medium">Hợp lệ</span>
        </div>
      </div>
    </div>
  )
}
