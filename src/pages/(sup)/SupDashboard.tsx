import React from 'react'
import { useNavigate } from 'react-router-dom'
import 'maplibre-gl/dist/maplibre-gl.css'
import { CheckCircle2, AlertTriangle } from 'lucide-react'

import { RiskPortfolioItem } from './dashboard/types'
import { useSupDashboardState } from './dashboard/useSupDashboardState'
import { DashboardHeader } from './dashboard/DashboardHeader'
import { DashboardTopMetrics } from './dashboard/DashboardTopMetrics'
import { DashboardRiskMapTable } from './dashboard/DashboardRiskMapTable'
import { DashboardRightCards } from './dashboard/DashboardRightCards'
import { DashboardExportModal } from './dashboard/DashboardExportModal'

export type { RiskPortfolioItem } from './dashboard/types'

export const SupDashboard: React.FC = () => {
  const navigate = useNavigate()

  const {
    dashboardData,
    isLoading,
    loadError,
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

  // Toàn bộ số liệu lấy từ BE (GET /projects, /projects/{id}/reports/summary|timeline), lọc theo dự án đang chọn.
  const projects = dashboardData?.projects ?? []
  const scopedProjects = selectedProject === 'ALL' ? projects : projects.filter((p) => p.projectId === selectedProject)
  const scopedIds = new Set(scopedProjects.map((p) => p.projectId))
  const totalActiveProjects = dashboardData ? scopedProjects.filter((p) => p.status === 'ACTIVE').length : null

  const repairItems = { confirmed: 0, other: 0 }
  scopedProjects.forEach((p) => {
    dashboardData?.summaries[p.projectId]?.metrics.forEach((m) => {
      if (m.code !== 'repairItemsByStatus' || m.value == null) return
      if (m.dimensions.status === 'CONFIRMED') repairItems.confirmed += m.value
      else repairItems.other += m.value
    })
  })

  const activities = (dashboardData?.activities ?? [])
    .filter((a) => scopedIds.has(a.projectId))
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
    .slice(0, 5)

  const asOfText = dashboardData?.asOf
    ? new Date(dashboardData.asOf).toLocaleString('vi-VN', { hour12: false })
    : null
  const scopeLabel =
    selectedProject === 'ALL' ? `Toàn bộ ${projects.length} dự án` : scopedProjects[0]?.name || 'Dự án'

  const dashboardErrors = [
    loadError && `Không tải được dữ liệu dashboard: ${loadError}`,
    dashboardData?.errors.projects && `Danh sách dự án (GET /projects): ${dashboardData.errors.projects}`,
    dashboardData?.errors.summaries && `Báo cáo tổng hợp: ${dashboardData.errors.summaries}`,
    dashboardData?.errors.timeline && `Hoạt động gần đây: ${dashboardData.errors.timeline}`
  ].filter(Boolean) as string[]

  return (
    <div className="space-y-6 pb-12 font-sansation text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200 font-sansation">
          <CheckCircle2 className="w-5 h-5 text-brand-gold shrink-0" />
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
      {dashboardErrors.length > 0 && (
        <div role="alert" className="flex items-start gap-3 bg-red-50 text-rose-800 border border-rose-200 rounded-2xl px-5 py-3.5 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            {dashboardErrors.map((m) => (
              <p key={m}>{m}</p>
            ))}
          </div>
        </div>
      )}

      <DashboardHeader
        projects={projects}
        asOfText={asOfText}
        isLoading={isLoading}
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
              isLoading={isLoading}
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
              repairItems={dashboardData ? repairItems : null}
              activities={activities}
              isLoading={isLoading}
              onNavigateAuditTrail={() => navigate('/sup/audit-trail')}
              onNavigateRiskAnalytics={() => navigate('/sup/risk-analytics')}
            />
          </div>
        </div>
      </div>

      {/* Export Dossier Modal */}
      <DashboardExportModal
        scopeLabel={scopeLabel}
        asOfText={asOfText}
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
