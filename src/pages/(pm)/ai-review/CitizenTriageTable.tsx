import React from 'react'
import { TriageCase } from './types'
import { CitizenTriageRow } from './CitizenTriageRow'

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
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            {!isSupervisor && (
              <th className="py-2.5 px-2.5 w-9 text-center">
                <input
                  type="checkbox"
                  checked={filteredCases.length > 0 && selectedReportIds.length === filteredCases.length}
                  onChange={onSelectAllReports}
                  className="w-3.5 h-3.5 rounded text-brand-gold focus:ring-brand-gold accent-brand-gold cursor-pointer"
                  title="Chọn tất cả"
                />
              </th>
            )}
            <th className="py-2.5 px-2.5 w-44">MÃ &amp; NGUỒN TIẾP NHẬN</th>
            <th className="py-2.5 px-2 w-16 text-center">ẢNH (GPS)</th>
            <th className="py-2.5 px-2.5 min-w-[220px]">DỰ ÁN &amp; VỊ TRÍ TUYẾN</th>
            <th className="py-2.5 px-2.5 min-w-[200px]">LOẠI HƯ HỎNG &amp; MÔ TẢ</th>
            <th className="py-2.5 px-2 w-20 text-center">ƯU TIÊN</th>
            <th className="py-2.5 px-2.5 w-28">TRẠNG THÁI</th>
            <th className="py-2.5 px-2.5 w-24 text-right">THAO TÁC</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filteredCases
            .filter((c) => !collapseMergedRows || !c.master_case_id)
            .map((item) => {
              const isSelected = item.id === selectedCase.id
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
                <CitizenTriageRow
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
        </tbody>
      </table>
    </div>
  )
}
