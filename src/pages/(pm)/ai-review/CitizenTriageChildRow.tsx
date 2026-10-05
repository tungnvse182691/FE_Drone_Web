import React from 'react'
import { CornerDownRight, Link2, Unlink } from 'lucide-react'
import { TriageCase } from './types'

export interface CitizenTriageChildRowProps {
  child: TriageCase
  masterCode: string
  masterProjectName: string
  isSelected: boolean
  onSelectCase: (c: TriageCase) => void
  onUnlinkReport: (childId: string, e: React.MouseEvent) => void
}

export const CitizenTriageChildRow: React.FC<CitizenTriageChildRowProps> = ({
  child,
  masterCode,
  masterProjectName,
  isSelected,
  onSelectCase,
  onUnlinkReport
}) => {
  return (
    <tr
      onClick={() => onSelectCase(child)}
      className={`bg-purple-50/50 border-l-4 border-l-purple-500 hover:bg-purple-100/70 transition-colors cursor-pointer ${
        isSelected ? 'ring-2 ring-purple-500 bg-purple-100' : ''
      }`}
    >
      <td className="py-2 px-3 text-center">
        <CornerDownRight className="w-4 h-4 text-purple-600 inline" />
      </td>
      <td className="py-2 px-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-xs text-purple-950">{child.code}</span>
            <span className="text-[9px] font-bold bg-purple-200 text-purple-900 px-1 py-0.2 rounded">
              Đã gộp trùng
            </span>
          </div>
          <span className="text-[10px] text-purple-800 mt-0.5">
            {child.reporter_channel || child.source_label}
          </span>
        </div>
      </td>
      <td className="py-2 px-3">
        <span className="font-semibold text-xs text-slate-800">{child.reporter_name}</span>
        {child.reporter_phone && (
          <span className="text-[10px] text-blue-600 block font-mono">
            {child.reporter_phone}
          </span>
        )}
      </td>
      <td className="py-2 px-3">
        <div className="relative w-12 h-9 rounded overflow-hidden bg-slate-900 border border-purple-200 shrink-0">
          <img
            src={child.image_url}
            alt={child.defect_title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 inset-x-0 bg-purple-950/80 text-[7px] text-white text-center">
            ĐÃ GỘP
          </div>
        </div>
      </td>
      <td className="py-2 px-3">
        <span className="font-mono text-[11px] font-bold text-slate-700">
          {child.stationing}
        </span>
        <span className="text-[10px] text-slate-500 block">{child.lane}</span>
      </td>
      <td className="py-2 px-3">
        <span className="text-[11px] text-purple-900 italic font-medium">
          Theo Master ({masterProjectName})
        </span>
      </td>
      <td className="py-2 px-3 max-w-[210px]">
        <span className="font-medium text-xs text-purple-950 truncate block">
          {child.defect_title}
        </span>
        <p className="text-[10px] text-slate-600 italic truncate mt-0.5">
          "{child.description}"
        </p>
      </td>
      <td className="py-2 px-3">
        <span className="text-[10px] font-semibold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
          {child.severity}
        </span>
      </td>
      <td className="py-2 px-3">
        <span className="bg-purple-200 text-purple-950 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit border border-purple-300">
          <Link2 className="w-3 h-3 text-purple-700" />
          <span>Gộp vào {masterCode}</span>
        </span>
      </td>
      <td className="py-2 px-3 text-right" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={(e) => onUnlinkReport(child.id, e)}
          className="px-2 py-1 rounded bg-white hover:bg-red-50 text-red-600 hover:border-red-300 border border-slate-200 text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ml-auto shadow-2xs"
          title="Tách khỏi Master Case thành hồ sơ riêng"
        >
          <Unlink className="w-3 h-3 text-red-500" />
          <span>Tách riêng</span>
        </button>
      </td>
    </tr>
  )
}
