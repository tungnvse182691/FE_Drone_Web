import React from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, AlertTriangle } from 'lucide-react'

import type { SupDashboardData } from '../../api/services/supDashboardService'
import { useSupDashboardState } from './dashboard/useSupDashboardState'
import { DashboardHeader } from './dashboard/DashboardHeader'
import { DashboardTopMetrics } from './dashboard/DashboardTopMetrics'
import { DashboardRightCards } from './dashboard/DashboardRightCards'

export const SupDashboard: React.FC = () => {
  const navigate = useNavigate()

  const {
    dashboardData,
    isLoading,
    loadError,
    selectedProject,
    setSelectedProject,
    isRefreshing,
    toastMessage,
    setToastMessage,
    handleRefresh,
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

  const overviews = scopedProjects.map((p) => dashboardData?.overviews[p.projectId]).filter(Boolean) as NonNullable<SupDashboardData['overviews'][string]>[]
  const overviewsReady = !!dashboardData && !dashboardData.errors.overviews && overviews.length === scopedProjects.length
  const lengths = overviews.filter((o) => o.lengthAvailability === 'AVAILABLE' && typeof o.totalLengthMeters === 'number')
  const totalLengthMeters = overviewsReady && lengths.length > 0 ? lengths.reduce((s, o) => s + (o.totalLengthMeters as number), 0) : null
  const defectMetrics = overviews.map((o) => o.openDefects)
  const openDefects = overviewsReady && defectMetrics.every((m) => m?.availability === 'AVAILABLE' && typeof m.value === 'number') ? defectMetrics.reduce((s, m) => s + (m!.value as number), 0) : null
  const soon = Date.now() + 30 * 86400000
  const expiringSoon = overviewsReady ? overviews.filter((o) => (o.warranties || []).some((w) => w.endDate && Date.parse(w.endDate) >= Date.now() && Date.parse(w.endDate) <= soon)).length : null

  const asOfText = dashboardData?.asOf
    ? new Date(dashboardData.asOf).toLocaleString('vi-VN', { hour12: false })
    : null

  const dashboardErrors = [
    loadError && `Không tải được dữ liệu dashboard: ${loadError}`,
    dashboardData?.errors.projects && `Danh sách dự án (GET /projects): ${dashboardData.errors.projects}`,
    dashboardData?.errors.overviews && `Tổng quan dự án (GET /projects/overviews): ${dashboardData.errors.overviews}`,
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
        onResetFilters={resetFilters}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        isRefreshing={isRefreshing}
        handleRefresh={handleRefresh}
      />

      {/* Chỉ các thẻ có API BE: tổng quan dự án, báo cáo tổng hợp, hoạt động gần đây */}
      <div className="space-y-6">
        <DashboardTopMetrics
          totalActiveProjects={totalActiveProjects}
          totalLengthMeters={totalLengthMeters}
          lengthIncomplete={overviewsReady && lengths.length < scopedProjects.length}
          expiringSoon={expiringSoon}
          openDefects={openDefects}
          isLoading={isLoading}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
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
  )
}
