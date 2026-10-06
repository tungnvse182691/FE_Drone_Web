import React from 'react'
import { Check } from 'lucide-react'
import { PROJECTS_CONFIG } from './risk-analytics/mockData'
import { useRiskAnalyticsState } from './risk-analytics/useRiskAnalyticsState'
import { RiskHeader } from './risk-analytics/RiskHeader'
import { RiskMetricsGrid } from './risk-analytics/RiskMetricsGrid'
import { RiskExportsTable } from './risk-analytics/RiskExportsTable'
import { RiskModals } from './risk-analytics/RiskModals'

export const RiskAnalytics: React.FC = () => {
  const {
    selectedProject,
    setSelectedProject,
    selectedTimeRange,
    setSelectedTimeRange,
    selectedTrack,
    setSelectedTrack,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    sortField,
    setSortField,
    sortAsc,
    setSortAsc,
    isRefreshing,
    toastMessage,
    currentProject,
    activeJob,
    exportRecords,
    isExportModalOpen,
    setIsExportModalOpen,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    isTimeRangeModalOpen,
    setIsTimeRangeModalOpen,
    selectedRecordForDetail,
    setSelectedRecordForDetail,
    exportForm,
    setExportForm,
    showToast,
    processedRecords,
    handleToggleSort,
    handleCreateExportJob,
    handleCancelActiveJob,
    handleDeleteRecord,
    handleRetryRecord,
    handleDownloadFile,
    handleRefresh,
    resetFilters
  } = useRiskAnalyticsState()

  return (
    <div className="space-y-6 pb-16 text-[#1E293B]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Check className="w-5 h-5 text-[#C9A227] shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header & Filter Controls */}
      <RiskHeader
        currentProject={currentProject}
        isRefreshing={isRefreshing}
        handleRefresh={handleRefresh}
        setIsTimeRangeModalOpen={setIsTimeRangeModalOpen}
        setIsExportModalOpen={setIsExportModalOpen}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        selectedTimeRange={selectedTimeRange}
        setSelectedTimeRange={setSelectedTimeRange}
        selectedTrack={selectedTrack}
        setSelectedTrack={setSelectedTrack}
        sortField={sortField}
        setSortField={setSortField}
        sortAsc={sortAsc}
        setSortAsc={setSortAsc}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        resetFilters={resetFilters}
        showToast={showToast}
        projectsConfig={PROJECTS_CONFIG}
      />

      {/* KPI Metrics & Async Export Queue */}
      <RiskMetricsGrid
        currentProject={currentProject}
        activeJob={activeJob}
        handleCancelActiveJob={handleCancelActiveJob}
        handleDownloadFile={handleDownloadFile}
        processedRecords={processedRecords}
        exportRecords={exportRecords}
        setSelectedRecordForDetail={setSelectedRecordForDetail}
        setIsPreviewModalOpen={setIsPreviewModalOpen}
      />

      {/* Export Records Table & Legal Strip */}
      <RiskExportsTable
        processedRecords={processedRecords}
        exportRecords={exportRecords}
        sortField={sortField}
        sortAsc={sortAsc}
        handleToggleSort={handleToggleSort}
        handleRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        handleDownloadFile={handleDownloadFile}
        setSelectedRecordForDetail={setSelectedRecordForDetail}
        setIsPreviewModalOpen={setIsPreviewModalOpen}
        handleRetryRecord={handleRetryRecord}
        handleDeleteRecord={handleDeleteRecord}
      />

      {/* All Modal Windows */}
      <RiskModals
        isExportModalOpen={isExportModalOpen}
        setIsExportModalOpen={setIsExportModalOpen}
        exportForm={exportForm}
        setExportForm={setExportForm}
        handleCreateExportJob={handleCreateExportJob}
        isPreviewModalOpen={isPreviewModalOpen}
        setIsPreviewModalOpen={setIsPreviewModalOpen}
        selectedRecordForDetail={selectedRecordForDetail}
        handleDownloadFile={handleDownloadFile}
        isTimeRangeModalOpen={isTimeRangeModalOpen}
        setIsTimeRangeModalOpen={setIsTimeRangeModalOpen}
        showToast={showToast}
      />
    </div>
  )
}
