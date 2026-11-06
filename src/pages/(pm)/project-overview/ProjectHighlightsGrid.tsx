import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { HubProject } from '../projects/types'

interface ProjectHighlightsGridProps {
  project: HubProject
  mainlineLengthKm?: number
  branchesLengthKm?: number
  branchesCount?: number
}

export const ProjectHighlightsGrid: React.FC<ProjectHighlightsGridProps> = ({
  project,
  mainlineLengthKm = 0,
  branchesLengthKm = 0,
  branchesCount = 0
}) => {
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-body">
    {[
      { title: 'Thời hạn bảo hành', icon: 'verified_user', rows: ['Ngày bàn giao', 'Ngày hết hạn', 'Thời gian bảo hành'] },
      { title: 'Khối lượng tuyến & Phân đoạn', icon: 'alt_route', rows: ['Trục chính', 'Tuyến phụ', 'Số đoạn tuyến'] },
      { title: 'Theo dõi xử lý', icon: 'assignment', rows: ['Hư hỏng đang mở', 'Gói sửa chữa', 'Kết quả xử lý'] }
    ].map(card => <div key={card.title} className="relative bg-white border-[1.5px] border-slate-200 rounded-[20px] p-5 shadow-2xs overflow-hidden flex flex-col gap-4">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#C9A227] to-slate-200" />
      <div className="flex justify-between items-start gap-3"><h2 className="min-w-0 flex-1 text-xs font-bold uppercase tracking-wide text-slate-700">{card.title}</h2><span className="shrink-0 bg-amber-50 text-[#8C6D1F] p-2 rounded-lg"><Icon name={card.icon} size={20} /></span></div>
      <p className="text-xl font-bold text-slate-500">Chưa cập nhật</p>
      <dl className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs">{card.rows.map(row => <div key={row} className="flex flex-wrap justify-between gap-2"><dt className="text-slate-500">{row}</dt><dd className="text-slate-600">Chưa cập nhật</dd></div>)}</dl>
    </div>)}
  </div>
}
