import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { ProjectKpiStats } from './types'

interface ProjectListKpisProps {
  kpiStats: ProjectKpiStats
}

interface KpiCardProps {
  label: string
  icon: string
  iconBox: string
  valueClass: string
  value: React.ReactNode
  unit?: string
  note?: string
}

/** Thẻ KPI: nhãn trên, số liệu một dòng, ghi chú (nếu có) tách dòng riêng cỡ nhỏ — đồng chiều cao ở mọi thẻ. */
const KpiCard: React.FC<KpiCardProps> = ({ label, icon, iconBox, valueClass, value, unit, note }) => (
  <div className="bg-white p-4 rounded-xl border border-brand-border shadow-2xs flex items-start gap-3.5 min-h-[88px]">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBox}`}>
      <Icon name={icon} size={20} />
    </div>
    <div className="flex flex-col min-w-0 flex-1">
      <span className="text-xs text-slate-500 truncate">{label}</span>
      <span className={`mt-0.5 flex items-baseline gap-1.5 whitespace-nowrap text-lg font-bold font-mono ${valueClass}`}>
        {value}
        {unit && <span className="text-xs font-normal text-slate-500 font-body">{unit}</span>}
      </span>
      {note && <span className="mt-1 text-[10px] leading-snug text-slate-500 font-body">{note}</span>}
    </div>
  </div>
)

export const ProjectListKpis: React.FC<ProjectListKpisProps> = ({ kpiStats }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 font-body">
      <KpiCard
        label="Tổng chiều dài"
        icon="alt_route"
        iconBox="bg-slate-100 text-brand-gold"
        valueClass="text-slate-900"
        value={kpiStats.totalLength}
        note={kpiStats.missingLength ? `${kpiStats.missingLength} dự án chưa có số liệu` : undefined}
      />
      <KpiCard
        label="Đang hoạt động"
        icon="check_circle"
        iconBox="bg-[#EDF7ED] text-[#1B5E20]"
        valueClass="text-slate-900"
        value={kpiStats.activeCount}
        unit="dự án"
      />
      <KpiCard
        label="Sắp hết hạn (<30d)"
        icon="warning"
        iconBox="bg-[#FEE2E2] text-rose-600"
        valueClass="text-rose-600"
        value={kpiStats.nearExpiryCount}
        unit="dự án"
        note={kpiStats.missingWarranty ? `${kpiStats.missingWarranty} dự án thiếu dữ liệu bảo hành` : undefined}
      />
      <KpiCard
        label="Chờ duyệt tuyến"
        icon="schedule"
        iconBox="bg-[#FEF3C7] text-[#D97706]"
        valueClass="text-[#D97706]"
        value={kpiStats.pendingAlignmentCount}
        unit="dự án"
        note={kpiStats.missingSubmission ? `${kpiStats.missingSubmission} dự án chưa đọc được hồ sơ` : undefined}
      />
      <KpiCard
        label="Đã đóng hồ sơ"
        icon="inventory_2"
        iconBox="bg-slate-100 text-slate-700"
        valueClass="text-slate-800"
        value={kpiStats.closedCount}
        unit="dự án"
      />
    </div>
  )
}
