import React from 'react'
import {
  Edit2,
  Trash2,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  Link as LinkIcon
} from 'lucide-react'
import { SegmentItem } from './types'

export interface SegmentsTableProps {
  segments: SegmentItem[]
  selectedSegmentId: string | null
  onSelectSegment: (seg: SegmentItem) => void
  onEditSegment: (seg: SegmentItem) => void
  onDeleteSegment: (id: string) => void
  onSnapSegment: (id: string) => void
  onOpenSplitModal: (seg: SegmentItem) => void
}

export const SegmentsTable: React.FC<SegmentsTableProps> = ({
  segments,
  selectedSegmentId,
  onSelectSegment,
  onEditSegment,
  onDeleteSegment,
  onSnapSegment,
  onOpenSplitModal,
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <th className="p-3">Phân đoạn</th>
            <th className="p-3">Lý trình</th>
            <th className="p-3">Chiều dài</th>
            <th className="p-3">Bề rộng</th>
            <th className="p-3">Số làn / Mặt đường</th>
            <th className="p-3">Trạng thái</th>
            <th className="p-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {segments.map((seg) => {
            const isSelected = selectedSegmentId === seg.id

            return (
              <tr
                key={seg.id}
                onClick={() => onSelectSegment(seg)}
                className={`transition-colors cursor-pointer ${
                  isSelected ? 'bg-amber-50/60 font-medium' : 'hover:bg-slate-50'
                }`}
              >
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className="font-bold text-slate-800">{seg.code}</span>
                  </div>
                </td>
                <td className="p-3 font-mono text-slate-700">
                  Km {seg.startKm.toFixed(3)} &rarr; Km {seg.endKm.toFixed(3)}
                </td>
                <td className="p-3 font-semibold text-slate-800">
                  {seg.lengthKm >= 1
                    ? `${seg.lengthKm.toFixed(2)} km`
                    : `${(seg.lengthKm * 1000).toFixed(0)} m`}
                </td>
                <td className="p-3 text-slate-700">{seg.roadWidthM}m</td>
                <td className="p-3 text-slate-600">
                  {seg.laneCount} làn • {seg.surfaceMaterial}
                </td>
                <td className="p-3">
                  {seg.hasGap ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Hở tiếp giáp</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Hợp lệ</span>
                    </span>
                  )}
                </td>
                <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    {seg.hasGap && (
                      <button
                        type="button"
                        onClick={() => onSnapSegment(seg.id)}
                        title="Nối tiếp giáp khép kín"
                        className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-700 cursor-pointer"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenSplitModal(seg)}
                      title="Tách phân đoạn"
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditSegment(seg)}
                      title="Sửa thông số"
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteSegment(seg.id)}
                      title="Xóa đoạn"
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
