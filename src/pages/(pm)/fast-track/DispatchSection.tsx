import React, { useEffect, useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { DefectItem, PolicyThresholdConfig, ProjectOption, CrewTeam } from './types'
import { DispatchMap } from './DispatchMap'
import { DispatchModeSelector } from './DispatchModeSelector'
import { DispatchFilters } from './DispatchFilters'
import { DispatchTable } from './DispatchTable'
import { DispatchActionBar } from './DispatchActionBar'
import { fastTrackService } from '../../../api/services/fastTrackService'

interface DispatchSectionProps {
  projects: ProjectOption[]
  selectedProjectId: string
  onProjectChange: (id: string) => void
  crews: CrewTeam[]
  defects: DefectItem[]
  filteredDefects: DefectItem[]
  selectedDefectIds: string[]
  crewFilter: string
  statusFilter: string
  currentPolicy: PolicyThresholdConfig | null
  hasViolationItem: boolean
  selectedItems: DefectItem[]
  setCrewFilter: (crew: string) => void
  setStatusFilter: (status: string) => void
  handleSelectAll: (checked: boolean) => void
  handleToggleSelect: (id: string) => void
  handleAssignCrew: (defectId: string, crew: string) => void
  setDetailDefect: (defect: DefectItem | null) => void
  setSelectedDefectIds: React.Dispatch<React.SetStateAction<string[]>>
  showToast: (msg: string) => void
  onRemoveViolationItems?: () => void
  onNavigateProposals?: () => void
  onOpenDispatchModal?: () => void
  isSupervisor?: boolean
}

export const DispatchSection: React.FC<DispatchSectionProps> = ({
  projects,
  selectedProjectId,
  onProjectChange,
  crews,
  defects,
  filteredDefects,
  selectedDefectIds,
  crewFilter,
  statusFilter,
  currentPolicy,
  hasViolationItem,
  selectedItems,
  setCrewFilter,
  setStatusFilter,
  handleSelectAll,
  handleToggleSelect,
  handleAssignCrew,
  setDetailDefect,
  setSelectedDefectIds,
  showToast,
  onRemoveViolationItems,
  onNavigateProposals,
  onOpenDispatchModal,
  isSupervisor = false
}) => {
  const [eligibilityMap, setEligibilityMap] = useState<
    Record<string, { eligible: boolean; missingReasons: string[]; loading: boolean }>
  >({})

  useEffect(() => {
    // Cập nhật trạng thái kỹ thuật đối soát theo chính sách Fast Track
    setEligibilityMap(() => {
      const next: Record<string, { eligible: boolean; missingReasons: string[]; loading: boolean }> = {}
      for (const d of filteredDefects) {
        next[d.id] = {
          eligible: d.isFastTrackEligible ?? true,
          missingReasons: d.violationReason ? [d.violationReason] : [],
          loading: false
        }
      }
      return next
    })
  }, [filteredDefects])

  const apiHasViolation = selectedItems.some((d) => {
    const el = eligibilityMap[d.id]
    return el ? !el.eligible : !d.isFastTrackEligible
  })
  const effectiveHasViolation = hasViolationItem || apiHasViolation

  return (
    <div id="dispatch-table-section" className="bg-white rounded-[20px] p-6 shadow-2xs border border-[#E2E5E9] space-y-6">
      {/* Header Dispatch */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#C9A227] shadow-2xs">
            <Icon name="groups" size={22} className="text-[#C9A227]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1A1D20]">
              {isSupervisor
                ? 'Giám sát & Theo dõi khiếm khuyết xử lý nhanh'
                : 'Điều phối & Phân công đội thi công khẩn cấp'}
            </h2>
            <p className="text-xs text-slate-500">
              {isSupervisor
                ? 'Theo dõi danh sách khiếm khuyết, đối soát tiêu chuẩn xử lý nhanh và kiểm tra tính hợp lệ'
                : 'Phát lệnh xử lý nhanh, phân công đội thi công hiện trường và xác nhận hoàn thành'}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold shrink-0 border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse"></span>
          <span>{filteredDefects.length} khiếm khuyết trong CSDL</span>
        </div>
      </div>

      {/* Filter Bar */}
      <DispatchFilters
        projects={projects}
        selectedProjectId={selectedProjectId}
        onProjectChange={onProjectChange}
        crews={crews}
        crewFilter={crewFilter}
        setCrewFilter={setCrewFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <DispatchModeSelector />
      <DispatchMap />

      {/* Table & Violation Warning */}
      <DispatchTable
        selectedDefectIds={selectedDefectIds}
        filteredDefects={filteredDefects}
        handleSelectAll={handleSelectAll}
        handleToggleSelect={handleToggleSelect}
        handleAssignCrew={handleAssignCrew}
        setDetailDefect={setDetailDefect}
        hasViolationItem={effectiveHasViolation}
        selectedItems={selectedItems}
        currentPolicy={currentPolicy}
        onRemoveViolationItems={onRemoveViolationItems}
        onNavigateProposals={onNavigateProposals}
        isSupervisor={isSupervisor}
        eligibilityMap={eligibilityMap}
      />

      {/* Action Bar */}
      <DispatchActionBar
        selectedDefectIds={selectedDefectIds}
        selectedItems={selectedItems}
        setSelectedDefectIds={setSelectedDefectIds}
        showToast={showToast}
        onOpenDispatchModal={onOpenDispatchModal}
        hasViolationItem={effectiveHasViolation}
        isSupervisor={isSupervisor}
        eligibilityMap={eligibilityMap}
      />
    </div>
  )
}
