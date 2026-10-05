import React from 'react'
import { Route as RouteIcon, ChevronRight, Eye } from 'lucide-react'
import { Segment } from './types'

interface ProjectSegmentsTableProps {
  segments: Segment[]
  basePath: string
  onNavigate: (path: string) => void
  onViewSegment: (code: string) => void
}

export const ProjectSegmentsTable: React.FC<ProjectSegmentsTableProps> = ({
  segments,
  basePath,
  onNavigate,
  onViewSegment
}) => {
  return (
    <div className="bg-white border border-brand-border rounded-xl p-6 shadow-sm flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-brand-dark flex items-center gap-2">
            <RouteIcon className="w-5 h-5 text-[#C9A227]" />
            <span>Danh sách các phân đoạn tuyến chính (5 Segments)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân bổ lý trình, tình trạng mặt đường và số lượng khiếm khuyết theo từng cung đường.
          </p>
        </div>
        <button
          onClick={() => onNavigate(`${basePath}/projects/prj-ql1a-02/alignment`)}
          type="button"
          className="text-xs text-[#8F7212] hover:text-[#C9A227] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
        >
          <span>Xem bản đồ GIS phân đoạn (WF-02)</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Segments Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
              <th className="py-2.5 px-3">Mã đoạn</th>
              <th className="py-2.5 px-3">Phạm vi lý trình</th>
              <th className="py-2.5 px-3">Chiều dài</th>
              <th className="py-2.5 px-3">Tình trạng mặt đường</th>
              <th className="py-2.5 px-3">Khiếm khuyết mở</th>
              <th className="py-2.5 px-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {segments.map((seg) => (
              <tr
                key={seg.code}
                className={`hover:bg-slate-50/80 transition-colors ${
                  seg.status_type === 'WARNING' ? 'bg-red-50/30' : ''
                }`}
              >
                <td className="py-3 px-3 font-semibold text-[#8F7212] font-mono">
                  {seg.code}
                </td>
                <td className="py-3 px-3 font-mono font-medium text-slate-800">
                  {seg.stationing}
                </td>
                <td className="py-3 px-3 text-slate-600 font-medium">
                  {seg.length_km.toFixed(1)} km
                </td>
                <td className="py-3 px-3">
                  {seg.status_type === 'GOOD' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#C9A227]/15 text-[#8F7212] border border-[#C9A227]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]"></span>
                      {seg.status_label}
                    </span>
                  )}
                  {seg.status_type === 'WARNING' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700 border border-red-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                      {seg.status_label}
                    </span>
                  )}
                  {seg.status_type === 'REPAIRING' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                      {seg.status_label}
                    </span>
                  )}
                  {seg.status_type === 'NORMAL' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                      {seg.status_label}
                    </span>
                  )}
                  {seg.status_type === 'MONITORING' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      {seg.status_label}
                    </span>
                  )}
                </td>
                <td className="py-3 px-3 font-semibold">
                  <span className={seg.defects_count > 0 ? (seg.status_type === 'WARNING' ? 'text-red-600' : 'text-slate-800') : 'text-slate-400'}>
                    {seg.open_defects}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => onViewSegment(seg.code)}
                    className="p-1 hover:text-[#C9A227] text-slate-400 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                    title="Chi tiết"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
