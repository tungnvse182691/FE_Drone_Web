import React from 'react'
import {
  Smartphone,
  Car,
  Phone,
  Link2,
  ChevronDown,
  ChevronUp,
  Merge,
  Building2
} from 'lucide-react'
import { TriageCase } from './types'
import { CitizenTriageChildRow } from './CitizenTriageChildRow'
import { CitizenTriageStatusBadge } from './CitizenTriageStatusBadge'

export interface CitizenTriageRowProps {
  item: TriageCase
  selectedCaseId: string
  isChecked: boolean
  isMaster: boolean
  isExpanded: boolean
  childReports: TriageCase[]
  onSelectCase: (c: TriageCase) => void
  onToggleSelectReport: (id: string, e: React.MouseEvent) => void
  onToggleExpandMaster: (id: string, e: React.MouseEvent) => void
  onOpenTriageProject: (c: TriageCase, e?: React.MouseEvent) => void
  onOpenMergeModal: (c: TriageCase) => void
  onUnlinkReport: (childId: string, e: React.MouseEvent) => void
}

export const CitizenTriageRow: React.FC<CitizenTriageRowProps> = ({
  item,
  selectedCaseId,
  isChecked,
  isMaster,
  isExpanded,
  childReports,
  onSelectCase,
  onToggleSelectReport,
  onToggleExpandMaster,
  onOpenTriageProject,
  onOpenMergeModal,
  onUnlinkReport
}) => {
  const isSelected = item.id === selectedCaseId
  const isUnassigned = !item.project_id || item.project_id === ''

  return (
    <>
      <tr
        onClick={() => onSelectCase(item)}
        className={`cursor-pointer transition-colors ${
          isSelected
            ? 'bg-amber-50/70 border-l-4 border-l-[#C9A227]'
            : isChecked
            ? 'bg-amber-50/30'
            : isMaster
            ? 'bg-purple-50/20 hover:bg-purple-50/50'
            : 'hover:bg-slate-50'
        }`}
      >
        {/* Checkbox */}
        <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => onToggleSelectReport(item.id, e as any)}
            className="w-3.5 h-3.5 rounded text-[#C9A227] focus:ring-[#C9A227] accent-[#C9A227] cursor-pointer"
          />
        </td>

        {/* Code & Channel */}
        <td className="py-3 px-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-xs text-brand-dark">{item.code}</span>
              {isMaster && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
                  Nhóm gộp
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
              {item.source === 'CITIZEN' ? (
                <Smartphone className="w-3 h-3 text-blue-600" />
              ) : (
                <Car className="w-3 h-3 text-[#C9A227]" />
              )}
              <span>{item.reporter_channel || item.source_label}</span>
            </span>
          </div>
        </td>

        {/* Reporter & Contact */}
        <td className="py-3 px-3">
          <div className="flex flex-col">
            <span className="font-semibold text-xs text-slate-800">
              {item.reporter_name || 'Người dân'}
            </span>
            {item.reporter_phone && (
              <a
                href={`tel:${item.reporter_phone}`}
                onClick={(e) => e.stopPropagation()}
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-mono"
              >
                <Phone className="w-3 h-3" />
                <span>{item.reporter_phone}</span>
              </a>
            )}
            <span className="text-[10px] text-slate-400 mt-0.5">{item.time_ago}</span>
          </div>
        </td>

        {/* Photo Thumbnail with GPS */}
        <td className="py-3 px-3">
          <div className="relative w-14 h-11 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 shrink-0 group">
            <img
              src={item.image_url}
              alt={item.defect_title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
            <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[8px] font-mono text-white text-center py-0.2">
              GPS OK
            </div>
          </div>
        </td>

        {/* Chainage & Lane */}
        <td className="py-3 px-3">
          <div className="flex flex-col">
            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded w-fit border border-slate-200">
              {item.stationing}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5">{item.lane}</span>
          </div>
        </td>

        {/* Project Assignment (PA03) */}
        <td className="py-3 px-3">
          {isUnassigned ? (
            <button
              type="button"
              onClick={(e) => onOpenTriageProject(item, e)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors animate-pulse cursor-pointer"
              title="Bấm để điều phối gán vào dự án (PA03)"
            >
              <Building2 className="w-3 h-3 text-amber-700" />
              <span>Chưa gán - Điều phối</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <span
                className="font-semibold text-xs text-brand-dark truncate max-w-[140px]"
                title={item.project_name}
              >
                {item.project_name}
              </span>
              <button
                type="button"
                onClick={(e) => onOpenTriageProject(item, e)}
                className="text-[10px] text-slate-400 hover:text-slate-700 p-0.5 rounded"
                title="Đổi dự án khác"
              >
                ✎
              </button>
            </div>
          )}
        </td>

        {/* Defect Title & Description */}
        <td className="py-3 px-3 max-w-[210px]">
          <div className="flex flex-col">
            <span
              className="font-bold text-xs text-slate-800 truncate"
              title={item.defect_title}
            >
              {item.defect_title}
            </span>
            <p
              className="text-[11px] text-slate-500 truncate mt-0.5"
              title={item.description || item.defect_title}
            >
              {item.description || 'Chưa có mô tả chi tiết'}
            </p>
            {isMaster && (
              <button
                type="button"
                onClick={(e) => onToggleExpandMaster(item.id, e)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 hover:bg-purple-200 text-purple-900 text-[10px] font-bold cursor-pointer transition-colors mt-1 w-fit border border-purple-200"
              >
                <Link2 className="w-3 h-3 text-purple-700" />
                <span>
                  {isExpanded ? 'Ẩn' : 'Xem'} {item.linked_report_ids?.length} báo cáo đã gộp
                </span>
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        </td>

        {/* Severity */}
        <td className="py-3 px-3">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              item.severity === 'CRITICAL'
                ? 'bg-red-100 text-red-700 border border-red-200'
                : item.severity === 'HIGH'
                ? 'bg-amber-100 text-[#8F7212] border border-amber-200'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {item.severity}
          </span>
        </td>

        {/* Status */}
        <td className="py-3 px-3">
          <CitizenTriageStatusBadge
            status={item.status}
            conclusion={item.conclusion}
          />
        </td>

        {/* Quick Actions */}
        <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-end gap-1.5">
            {isUnassigned ? (
              <button
                type="button"
                onClick={(e) => onOpenTriageProject(item, e)}
                className="px-2.5 py-1 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-[11px] font-bold transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
              >
                <Building2 className="w-3 h-3" />
                <span>Điều phối</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSelectCase(item)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Thẩm định
              </button>
            )}
            {item.cluster_duplicates &&
              item.cluster_duplicates.length > 0 &&
              !item.cluster_duplicates.every((d) => d.is_merged) && (
                <button
                  type="button"
                  onClick={() => onOpenMergeModal(item)}
                  className="p-1 rounded-lg text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                  title={`Có ${item.cluster_duplicates.length} báo trùng lân cận. Bấm để gộp.`}
                >
                  <Merge className="w-3.5 h-3.5" />
                </button>
              )}
          </div>
        </td>
      </tr>

      {/* NESTED SUB-ROWS: Các báo cáo trùng đã gộp vào Master Case này */}
      {isMaster &&
        isExpanded &&
        childReports.map((child) => (
          <CitizenTriageChildRow
            key={`child-${child.id}`}
            child={child}
            masterCode={item.code}
            masterProjectName={item.project_name}
            isSelected={child.id === selectedCaseId}
            onSelectCase={onSelectCase}
            onUnlinkReport={onUnlinkReport}
          />
        ))}
    </>
  )
}
