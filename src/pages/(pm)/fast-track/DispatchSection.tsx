import React from 'react'
import { Users2 } from 'lucide-react'
import { DefectItem, RouteConfig, PolicyThresholdConfig, WorkMode } from './types'
import { DispatchModeSelector } from './DispatchModeSelector'
import { DispatchFilters } from './DispatchFilters'
import { DispatchTable } from './DispatchTable'
import { DispatchMap } from './DispatchMap'
import { DispatchActionBar } from './DispatchActionBar'

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
  handleEmergencyDispatch
}) => {
  return (
    <div id="dispatch-table-section" className="bg-white rounded-2xl p-6 shadow-xs border border-brand-border space-y-6">
      {/* Header Dispatch */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-brand-gold">
            <Users2 className="w-5 h-5 text-brand-gold" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-brand-dark">Äiá»u phá»‘i & Giao viá»‡c Ä‘á»™i ngÅ© ká»¹ thuáº­t hiá»‡n trÆ°á»ng</h2>
            <p className="text-xs text-slate-500">
              PhÃª duyá»‡t lá»‡nh xuáº¥t quÃ¢n, lá»±a chá»n phÆ°Æ¡ng thá»©c thi cÃ´ng vÃ  quáº£n lÃ½ trÃ¡ch nhiá»‡m hiá»‡n trÆ°á»ng
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold shrink-0 border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse"></span>
          <span>{defects.length} khiáº¿m khuyáº¿t Ä‘ang chá» xá»­ lÃ½</span>
        </div>
      </div>

      {/* 3 Large Radio Tabs for Work Mode */}
      <DispatchModeSelector
        workMode={workMode}
        selectedDefectIds={selectedDefectIds}
        handleChangeWorkMode={handleChangeWorkMode}
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
        hasViolationItem={hasViolationItem}
        selectedItems={selectedItems}
        currentPolicy={currentPolicy}
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
        hasViolationItem={hasViolationItem}
      />
    </div>
  )
}
