import React from 'react'
import { useNavigate } from 'react-router-dom'
import 'maplibre-gl/dist/maplibre-gl.css'
import { CheckCircle2 } from 'lucide-react'

import { RiskPortfolioItem } from './dashboard/types'
import { REGION_PROJECTS } from './dashboard/mockData'
import { useSupDashboardState } from './dashboard/useSupDashboardState'
import { DashboardHeader } from './dashboard/DashboardHeader'
import { DashboardTopMetrics } from './dashboard/DashboardTopMetrics'
import { DashboardRiskMapTable } from './dashboard/DashboardRiskMapTable'
import { DashboardRightCards } from './dashboard/DashboardRightCards'
import { DashboardExportModal } from './dashboard/DashboardExportModal'

export type { RiskPortfolioItem } from './dashboard/types'
export { REGION_PROJECTS } from './dashboard/mockData'

export const SupDashboard: React.FC = () => {
  const navigate = useNavigate()

  const {
    selectedMonth,
    setSelectedMonth,
    selectedRegion,
    selectedProject,
    setSelectedProject,
    isRefreshing,
    toastMessage,
    setToastMessage,
    sortField,
    sortAsc,
    handleToggleSort,
    handleRegionChange,
    isExportModalOpen,
    setIsExportModalOpen,
    exportFormat,
    setExportFormat,
    isExporting,
    activePinId,
    mapLayer,
    setMapLayer,
    mapContainerRef,
    showToast,
    handleRefresh,
    filteredRiskItems,
    activePinItem,
    handleZoomIn,
    handleZoomOut,
    handleFitBounds,
    handleFocusPin,
    handleTriggerExport,
    resetFilters
  } = useSupDashboardState()

  // KPI Metrics (5 dự án bảo hành, 1 dự án sắp hết hạn)
  const totalActiveProjects = 5
  const expiringProjectsCount = 1
  const pendingBaselineKm = 14.5

  return (
    <div className="space-y-6 pb-12 font-sansation text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200 font-sansation">
          <CheckCircle2 className="w-5 h-5 text-[#C9A227] shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header & Filter Controls Bar */}
      <DashboardHeader
        showToast={showToast}
        onResetFilters={resetFilters}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedRegion={selectedRegion}
        handleRegionChange={handleRegionChange}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        isRefreshing={isRefreshing}
        handleRefresh={handleRefresh}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main Dashboard Grid */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Sub-Column (8 cols): KPIs + Map + Risk Table */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            <DashboardTopMetrics
              totalActiveProjects={totalActiveProjects}
              expiringProjectsCount={expiringProjectsCount}
              pendingBaselineKm={pendingBaselineKm}
            />

            <DashboardRiskMapTable
              mapContainerRef={mapContainerRef}
              mapLayer={mapLayer}
              setMapLayer={setMapLayer}
              activePinId={activePinId}
              activePinItem={activePinItem}
              filteredRiskItems={filteredRiskItems}
              sortField={sortField}
              sortAsc={sortAsc}
              onToggleSort={handleToggleSort}
              onFocusPin={handleFocusPin}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onFitBounds={handleFitBounds}
            />
          </div>

          {/* Right Sub-Column (4 cols): SLA, Audit Trail, PCI */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <DashboardRightCards
              onNavigateAuditTrail={() => navigate('/sup/audit-trail')}
              onNavigateRiskAnalytics={() => navigate('/sup/risk-analytics')}
            />
          </div>
        </div>
      </div>

      {/* Export Dossier Modal */}
      <DashboardExportModal
        selectedProject={selectedProject}
        selectedMonth={selectedMonth}
        isExportModalOpen={isExportModalOpen}
        setIsExportModalOpen={setIsExportModalOpen}
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
        isExporting={isExporting}
        onTriggerExport={handleTriggerExport}
        filteredCount={filteredRiskItems.length}
      />
    </div>
  )
}
