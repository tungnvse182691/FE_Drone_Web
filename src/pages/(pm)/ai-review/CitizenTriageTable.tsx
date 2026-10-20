import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { TriageCase } from './types'
import { TriageCard } from './TriageCard'

export interface CitizenTriageTableProps {
  cases: TriageCase[]
  filteredCases: TriageCase[]
  selectedCase: TriageCase
  selectedReportIds: string[]
  collapseMergedRows: boolean
  expandedMasterIds: string[]
  isSupervisor?: boolean
  onSelectCase: (c: TriageCase) => void
  onToggleSelectReport: (id: string, e: React.MouseEvent) => void
  onSelectAllReports: () => void
  onToggleExpandMaster: (id: string, e: React.MouseEvent) => void
  onOpenTriageProject: (c: TriageCase, e?: React.MouseEvent) => void
  onOpenMergeModal: (c: TriageCase) => void
  onUnlinkReport: (childId: string, e: React.MouseEvent) => void
}

export const CitizenTriageTable: React.FC<CitizenTriageTableProps> = ({
  cases,
  filteredCases,
  selectedCase,
  selectedReportIds,
  collapseMergedRows,
  expandedMasterIds,
  isSupervisor = false,
  onSelectCase,
  onToggleSelectReport,
  onSelectAllReports,
  onToggleExpandMaster,
  onOpenTriageProject,
  onOpenMergeModal,
  onUnlinkReport
}) => {
  const displayCases = filteredCases.filter((c) => !collapseMergedRows || !c.master_case_id)

  return (
    <div className="space-y-4">
      {/* Checkbox chọn tất cả cho PM */}
      {!isSupervisor && displayCases.length > 0 && (
        <div className="flex items-center justify-between pb-1 px-1">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={displayCases.length > 0 && selectedReportIds.length === displayCases.length}
              onChange={onSelectAllReports}
              className="w-4 h-4 rounded text-brand-gold focus:ring-brand-gold accent-brand-gold cursor-pointer"
            />
            <span>Chọn tất cả ({displayCases.length} hồ sơ hiển thị)</span>
          </label>
          {selectedReportIds.length > 0 && (
            <span className="text-xs text-amber-800 font-semibold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Đã chọn {selectedReportIds.length} hồ sơ
            </span>
          )}
        </div>
      )}

      {/* CARD GRID: Chuyển toàn bộ danh sách bảng dày đặc sang lưới thẻ hiện đại */}
      {displayCases.length === 0 ? (
        <div className="bg-white border border-[#E2E5E9] rounded-[20px] p-12 text-center flex flex-col items-center justify-center space-y-2">
          <Icon name="inbox" size={36} className="text-slate-300" />
          <h4 className="text-sm font-bold text-slate-700">Không tìm thấy hồ sơ khiếm khuyết nào</h4>
          <p className="text-xs text-slate-400">
            Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm để xem kết quả khác
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {displayCases.map((item) => {
            const isChecked = selectedReportIds.includes(item.id)
            const isMaster = Boolean(item.linked_report_ids && item.linked_report_ids.length > 0)
            const isExpanded = expandedMasterIds.includes(item.id)

            const childReports = isMaster
              ? (item.linked_report_ids || [])
                  .map((code) => {
                    const cleanCode = code.replace(/^#/, '')
                    const found = cases.find(
                      (c) =>
                        c.id === code ||
                        c.code === code ||
                        c.code.replace(/^#/, '') === cleanCode ||
                        (c.master_case_id && c.master_case_id === item.id)
                    )
                    if (found) return found

                    // Fallback từ cluster_duplicates nếu case con chưa tồn tại dưới dạng TriageCase độc lập
                    const dup = item.cluster_duplicates?.find(
                      (d) => d.code === code || d.code.replace(/^#/, '') === cleanCode
                    )
                    if (dup) {
                      return {
                        id: `child-${cleanCode}`,
                        code: dup.code.startsWith('#') ? dup.code : `#${dup.code}`,
                        source: 'CITIZEN' as const,
                        source_label: dup.source || 'Citizen App',
                        source_detail: 'Phản ánh người dân lân cận đã được gộp vào hồ sơ',
                        reporter_name: dup.reporter || 'Người dân báo',
                        project_id: item.project_id,
                        project_name: item.project_name,
                        stationing: item.stationing,
                        lane: item.lane,
                        defect_title: `Phản ánh người dân lân cận (${dup.distance_m}m)`,
                        defect_type: item.defect_type,
                        severity: item.severity,
                        urgency: item.urgency,
                        time_ago: 'Đã gộp',
                        created_at: item.created_at,
                        status: 'MERGED' as const,
                        status_label: 'Đã gộp trùng',
                        master_case_id: item.id,
                        image_url: item.image_url,
                        gps: item.gps,
                        ai_confidence: 0,
                        area_sqm: item.area_sqm,
                        ai_area_sqm: item.ai_area_sqm,
                        max_depth_cm: item.max_depth_cm,
                        ai_depth_cm: item.ai_depth_cm,
                        pm_notes: `Bằng chứng lân cận đã gộp vào ${item.code}`
                      }
                    }
                    return null
                  })
                  .filter((c): c is TriageCase => Boolean(c))
              : []

            return (
              <TriageCard
                key={item.id}
                item={item}
                selectedCaseId={selectedCase.id}
                isChecked={isChecked}
                isMaster={isMaster}
                isExpanded={isExpanded}
                isSupervisor={isSupervisor}
                childReports={childReports}
                onSelectCase={onSelectCase}
                onToggleSelectReport={onToggleSelectReport}
                onToggleExpandMaster={onToggleExpandMaster}
                onOpenTriageProject={onOpenTriageProject}
                onOpenMergeModal={onOpenMergeModal}
                onUnlinkReport={onUnlinkReport}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
