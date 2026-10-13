import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { TriageCase } from './types'

export interface CitizenTriageChildRowProps {
  child: TriageCase
  masterCode: string
  masterProjectName: string
  isSelected: boolean
  isSupervisor?: boolean
  onSelectCase: (c: TriageCase) => void
  onUnlinkReport: (childId: string, e: React.MouseEvent) => void
}

export const CitizenTriageChildRow: React.FC<CitizenTriageChildRowProps> = ({
  child,
  masterCode,
  masterProjectName,
  isSelected,
  isSupervisor = false,
  onSelectCase,
  onUnlinkReport
}) => {
  return (
    <tr
      onClick={() => onSelectCase(child)}
      className={`bg-slate-50/70 border-l-2 border-l-slate-400 hover:bg-slate-100/70 transition-colors cursor-pointer ${
        isSelected ? 'bg-amber-50/40 ring-1 ring-brand-gold/40' : ''
      }`}
    >
      {!isSupervisor && (
        <td className="py-2 px-2.5 text-center">
          <Icon name="subdirectory_arrow_right" size={14} className="text-slate-400 inline" />
        </td>
      )}
      <td className="py-2 px-2.5">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            {isSupervisor && (
              <Icon name="subdirectory_arrow_right" size={14} className="text-slate-400 shrink-0" />
            )}
            <span className="font-mono font-bold text-xs text-slate-900">{child.code}</span>
            <span className="text-[9px] font-semibold bg-slate-200 text-slate-700 px-1 py-0.2 rounded">
              Đã gộp trùng
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[150px]">
            {child.reporter_name ? `${child.reporter_name}` : child.reporter_channel || child.source_label}
          </span>
        </div>
      </td>
      <td className="py-2 px-2 text-center">
        <div className="relative w-12 h-9 rounded overflow-hidden bg-slate-800 border border-slate-200 shrink-0 mx-auto">
          <img
            src={child.image_url}
            alt={child.defect_title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[7px] text-white text-center">
            ĐÃ GỘP
          </div>
        </div>
      </td>
      <td className="py-2 px-2.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-slate-800 font-medium truncate max-w-[200px]">
            Theo {masterProjectName}
          </span>
          <div className="flex items-center gap-1 text-[10px]">
            <span className="font-mono font-semibold text-slate-800">{child.stationing}</span>
            <span className="text-slate-500">• {child.lane}</span>
          </div>
        </div>
      </td>
      <td className="py-2 px-2.5 max-w-[220px]">
        <span className="font-medium text-xs text-slate-900 truncate block">
          {child.defect_title}
        </span>
        <p className="text-[10px] text-slate-500 italic truncate mt-0.5">
          "{child.description}"
        </p>
      </td>
      <td className="py-2 px-2 text-center whitespace-nowrap">
        <span className="text-[10px] font-semibold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
          {child.severity === 'CRITICAL'
            ? 'Khẩn cấp'
            : child.severity === 'HIGH'
            ? 'Cao'
            : child.severity === 'MEDIUM'
            ? 'Vừa'
            : 'Thấp'}
        </span>
      </td>
      <td className="py-2 px-2.5 whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
          <span>Gộp vào {masterCode}</span>
        </span>
      </td>
      <td className="py-2 px-2.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        {!isSupervisor ? (
          <button
            type="button"
            onClick={(e) => onUnlinkReport(child.id, e)}
            className="px-2 py-1 rounded bg-white hover:bg-red-50 text-red-600 hover:border-red-300 border border-slate-200 text-[10px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
            title="Tách khỏi Master Case thành hồ sơ riêng"
          >
            <Icon name="link_off" size={12} />
            <span>Tách</span>
          </button>
        ) : (
          <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            Đã gộp
          </span>
        )}
      </td>
    </tr>
  )
}
