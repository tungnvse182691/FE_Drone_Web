import React, { useEffect, useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { DefectItem, RouteConfig, PolicyThresholdConfig, WorkMode } from './types'
import { DispatchModeSelector } from './DispatchModeSelector'
import { DispatchFilters } from './DispatchFilters'
import { DispatchTable } from './DispatchTable'
import { DispatchMap } from './DispatchMap'
import { DispatchActionBar } from './DispatchActionBar'
import { fastTrackService } from '../../../api/services/fastTrackService'

interface DispatchSectionProps {
  defects: DefectItem[]
  filteredDefects: DefectItem[]
  selectedDefectIds: string[]
  workMode: WorkMode
  routeFilter: string
  crewFilter: string
  statusFilter: string
  currentPolicy: PolicyThresholdConfig
  currentRouteConfig: RouteConfig
  mapLayer: 'SATELLITE' | 'VECTOR'
  mapContainerRef: React.RefObject<HTMLDivElement | null>
  hasViolationItem: boolean
  surveyDistanceM: number
  selectedItems: DefectItem[]
  handleChangeWorkMode: (mode: WorkMode) => void
  handleRouteChange: (routeId: string) => void
  setCrewFilter: (crew: string) => void
  setStatusFilter: (status: string) => void
  handleSelectAll: (checked: boolean) => void
  handleToggleSelect: (id: string) => void
  handleAssignCrew: (defectId: string, crew: string) => void
  setDetailDefect: (defect: DefectItem | null) => void
  setMapLayer: (layer: 'SATELLITE' | 'VECTOR') => void
  setSelectedDefectIds: React.Dispatch<React.SetStateAction<string[]>>
  showToast: (msg: string) => void
  handleDispatchBatch: () => void
  handleRepairDirect: () => void
  handleEmergencyDispatch: () => void
  onRemoveViolationItems?: () => void
  onNavigateProposals?: () => void
  isSupervisor?: boolean
}

export const DispatchSection: React.FC<DispatchSectionProps> = ({
  defects,
  filteredDefects,
  selectedDefectIds,
  workMode,
  routeFilter,
  crewFilter,
  statusFilter,
  currentPolicy,
  currentRouteConfig,
  mapLayer,
  mapContainerRef,
  hasViolationItem,
  surveyDistanceM,
  selectedItems,
  handleChangeWorkMode,
  handleRouteChange,
  setCrewFilter,
  setStatusFilter,
  handleSelectAll,
  handleToggleSelect,
  handleAssignCrew,
  setDetailDefect,
  setMapLayer,
  setSelectedDefectIds,
  showToast,
  handleDispatchBatch,
  handleRepairDirect,
  handleEmergencyDispatch,
  onRemoveViolationItems,
  onNavigateProposals,
  isSupervisor = false
}) => {
  const [eligibilityMap, setEligibilityMap] = useState<
    Record<string, { eligible: boolean; missingReasons: string[]; loading: boolean }>
  >({})

  useEffect(() => {
    let isMounted = true
    const ids = filteredDefects.map((d) => d.id)
    if (ids.length === 0) return

    setEligibilityMap((prev) => {
      const next = { ...prev }
      let changed = false
      for (const d of filteredDefects) {
        if (!next[d.id]) {
          next[d.id] = {
            eligible: d.isFastTrackEligible ?? true,
            missingReasons: d.violationReason ? [d.violationReason] : [],
            loading: true
          }
          changed = true
        }
      }
      return changed ? next : prev
    })

    Promise.all(
      filteredDefects.map(async (d) => {
        const res = await fastTrackService.checkEligibility(d.id)
        return { id: d.id, res }
      })
    ).then((results) => {
      if (!isMounted) return
      setEligibilityMap((prev) => {
        const next = { ...prev }
        for (const { id, res } of results) {
          next[id] = {
            eligible: res.eligible,
            missingReasons: res.missingReasons || [],
            loading: false
          }
        }
        return next
      })
    })

    return () => {
      isMounted = false
    }
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
                ? 'Giám sát & Theo dõi đội ngũ kỹ thuật hiện trường'
                : 'Điều phối & Giao việc đội ngũ kỹ thuật hiện trường'}
            </h2>
            <p className="text-xs text-slate-500">
              {isSupervisor
                ? 'Theo dõi phân bổ hiện trường, lộ trình thực hiện và chất lượng thi công các ca cấp bách'
                : 'Phê duyệt lệnh xuất quân, lựa chọn phương thức thi công và quản lý trách nhiệm hiện trường'}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold shrink-0 border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse"></span>
          <span>{defects.length} khiếm khuyết đang chờ xử lý</span>
        </div>
      </div>

      {/* 3 Large Radio Tabs for Work Mode */}
      <DispatchModeSelector
        workMode={workMode}
        selectedDefectIds={selectedDefectIds}
        handleChangeWorkMode={handleChangeWorkMode}
        isSupervisor={isSupervisor}
      />

      {/* Filter Bar */}
      <DispatchFilters
        routeFilter={routeFilter}
        handleRouteChange={handleRouteChange}
        crewFilter={crewFilter}
        setCrewFilter={setCrewFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Table & Violation Warning */}
      <DispatchTable
        workMode={workMode}
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

      {/* MapLibre Container */}
      <DispatchMap
        currentRouteConfig={currentRouteConfig}
        mapLayer={mapLayer}
        setMapLayer={setMapLayer}
        mapContainerRef={mapContainerRef}
        selectedDefectIds={selectedDefectIds}
      />

      {/* Action Bar */}
      <DispatchActionBar
        selectedDefectIds={selectedDefectIds}
        surveyDistanceM={surveyDistanceM}
        selectedItems={selectedItems}
        setSelectedDefectIds={setSelectedDefectIds}
        showToast={showToast}
        workMode={workMode}
        handleDispatchBatch={handleDispatchBatch}
        handleRepairDirect={handleRepairDirect}
        handleEmergencyDispatch={handleEmergencyDispatch}
        hasViolationItem={effectiveHasViolation}
        isSupervisor={isSupervisor}
        eligibilityMap={eligibilityMap}
      />
    </div>
  )
}
