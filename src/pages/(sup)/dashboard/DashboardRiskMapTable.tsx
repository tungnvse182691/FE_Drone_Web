import React from 'react'
import { RiskPortfolioItem } from './types'
import { DashboardRiskMap } from './DashboardRiskMap'
import { DashboardRiskTable } from './DashboardRiskTable'

export interface DashboardRiskMapTableProps {
  mapContainerRef: React.RefObject<HTMLDivElement | null>
  mapLayer: 'satellite' | 'vector'
  setMapLayer: (l: 'satellite' | 'vector') => void
  activePinId: string
  activePinItem: RiskPortfolioItem | undefined
  filteredRiskItems: RiskPortfolioItem[]
  sortField: 'risk_level' | 'project_name' | 'chainage' | 'open_defects_count' | 'sla_status'
  sortAsc: boolean
  onToggleSort: (field: 'risk_level' | 'project_name' | 'chainage' | 'open_defects_count' | 'sla_status') => void
  onFocusPin: (item: RiskPortfolioItem) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onFitBounds: () => void
}

export const DashboardRiskMapTable: React.FC<DashboardRiskMapTableProps> = ({
  mapContainerRef,
  mapLayer,
  setMapLayer,
  activePinItem,
  filteredRiskItems,
  sortField,
  sortAsc,
  onToggleSort,
  onFocusPin,
  onZoomIn,
  onZoomOut,
  onFitBounds
}) => {
  return (
    <>
      <DashboardRiskMap
        mapContainerRef={mapContainerRef}
        mapLayer={mapLayer}
        setMapLayer={setMapLayer}
        activePinItem={activePinItem}
        filteredRiskItems={filteredRiskItems}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onFitBounds={onFitBounds}
      />

      <DashboardRiskTable
        filteredRiskItems={filteredRiskItems}
        sortField={sortField}
        sortAsc={sortAsc}
        onToggleSort={onToggleSort}
        onFocusPin={onFocusPin}
      />
    </>
  )
}
