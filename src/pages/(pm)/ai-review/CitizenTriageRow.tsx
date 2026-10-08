import React from 'react'
import { Icon } from '../../../components/ui/Icon'
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
            ? 'bg-amber-50/70 border-l-4 border-l-brand-gold'
            : isChecked
            ? 'bg-amber-50/30'
            : isMaster
            ? 'bg-purple-50/20 hover:bg-purple-50/50'
            : 'hover:bg-slate-50'
        }`}
      >
        {/* Checkbox */}
        <td className="py-2.5 px-2.5 text-center" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => onToggleSelectReport(item.id, e as any)}
            className="w-3.5 h-3.5 rounded text-brand-gold focus:ring-brand-gold accent-brand-gold cursor-pointer"
          />
        </td>

        {/* 1. Mã & Nguồn tiếp nhận */}
        <td className="py-2.5 px-2.5">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-xs text-brand-dark">{item.code}</span>
              {isMaster && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-900 border border-purple-200">
                  Nhóm gộp
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5 truncate max-w-[160px]">
              <Icon
                name={
                  item.source === 'DRONE_AI'
                    ? 'flight'
                    : item.source === 'CITIZEN'
                    ? 'smartphone'
                    : 'directions_car'
                }
                size={13}
                className={
                  item.source === 'DRONE_AI'
                    ? 'text-indigo-600 shrink-0'
                    : item.source === 'CITIZEN'
                    ? 'text-blue-600 shrink-0'
                    : 'text-amber-600 shrink-0'
                }
              />
              <span className="truncate">
                {item.source === 'DRONE_AI'
                  ? 'Drone AI quét tự động'
                  : item.source === 'CITIZEN'
                  ? item.reporter_name || 'Người dân báo'
                  : 'Đội tuần đường'}
              </span>
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">{item.time_ago}</span>
          </div>
        </td>

        {/* 2. Ảnh hiện trường (GPS) */}
        <td className="py-2.5 px-2 text-center">
          <div className="relative w-12 h-9 rounded overflow-hidden bg-slate-900 border border-slate-200 mx-auto group">
            <img
              src={item.image_url}
              alt={item.defect_title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
            />
            <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[7px] font-mono text-white text-center py-0.2">
              GPS OK
            </div>
          </div>
        </td>

        {/* 3. Dự án bảo hành & Vị trí tuyến (Rõ ràng Trục chính / Nhánh phụ của Dự án nào) */}
        <td className="py-2.5 px-2.5">
          <div className="flex flex-col gap-1">
            {/* Tên dự án */}
            {isUnassigned ? (
              <button
                type="button"
                onClick={(e) => onOpenTriageProject(item, e)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors w-fit cursor-pointer"
                title="Bấm để điều phối gán vào dự án (PA03)"
              >
                <Icon name="domain" size={12} className="text-amber-700" />
                <span>Chưa gán - Điều phối (PA03)</span>
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <span
                  className="font-bold text-xs text-slate-900 truncate max-w-[200px]"
                  title={item.project_name}
                >
                  {item.project_name}
                </span>
                <button
                  type="button"
                  onClick={(e) => onOpenTriageProject(item, e)}
                  className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                  title="Đổi dự án"
                >
                  <Icon name="edit" size={12} />
                </button>
              </div>
            )}

            {/* Nhãn phân loại tuyến & Lý trình */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded border whitespace-nowrap ${
                  item.stationing?.includes('Nhánh')
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {item.stationing?.includes('Nhánh') ? '[Nhánh Hải Vân]' : '[Trục chính]'}
              </span>
              <span className="font-mono text-xs font-semibold text-slate-800">
                {item.stationing?.replace(/\[.*?\]\s*/, '')}
              </span>
              <span className="text-[11px] text-slate-500 whitespace-nowrap">
                • {item.lane || 'Làn cơ giới'}
              </span>
            </div>
          </div>
        </td>

        {/* 4. Mô tả / Loại hư hỏng */}
        <td className="py-2.5 px-2.5 max-w-[220px]">
          <div className="flex flex-col">
            <span
              className="font-semibold text-xs text-slate-800 truncate"
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
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-100 hover:bg-purple-200 text-purple-900 text-[10px] font-bold cursor-pointer transition-colors mt-1 w-fit border border-purple-200"
              >
                <Icon name="link" size={12} className="text-purple-700" />
                <span>
                  {isExpanded ? 'Ẩn' : 'Xem'} {item.linked_report_ids?.length} báo cáo đã gộp
                </span>
                <Icon name={isExpanded ? 'expand_less' : 'expand_more'} size={12} />
              </button>
            )}
          </div>
        </td>

        {/* 5. Ưu tiên */}
        <td className="py-2.5 px-2 text-center whitespace-nowrap">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${
              item.severity === 'CRITICAL'
                ? 'bg-red-50 text-red-700 border-red-200'
                : item.severity === 'HIGH'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            {item.severity === 'CRITICAL'
              ? 'Khẩn cấp'
              : item.severity === 'HIGH'
              ? 'Cao'
              : item.severity === 'MEDIUM'
              ? 'Vừa'
              : 'Thấp'}
          </span>
        </td>

        {/* 6. Trạng thái */}
        <td className="py-2.5 px-2.5 whitespace-nowrap">
          <CitizenTriageStatusBadge
            status={item.status}
            conclusion={item.conclusion}
          />
        </td>

        {/* 7. Thao tác */}
        <td className="py-2.5 px-2.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => onSelectCase(item)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-gold hover:text-white text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Thẩm định</span>
              <Icon name="arrow_forward" size={13} />
            </button>
            {item.cluster_duplicates &&
              item.cluster_duplicates.length > 0 &&
              !item.cluster_duplicates.every((d) => d.is_merged) && (
                <button
                  type="button"
                  onClick={() => onOpenMergeModal(item)}
                  className="p-1 rounded-lg text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                  title={`Có ${item.cluster_duplicates.length} báo trùng lân cận. Bấm để gộp.`}
                >
                  <Icon name="call_merge" size={14} />
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
