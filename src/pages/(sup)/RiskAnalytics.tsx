import {businessError} from '../../utils/businessDisplay'
import {ReportingMetricsPanel,useProjectReporting} from './risk-analytics/ReportingMetricsPanel'
// @refresh reset
import React from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useRiskAnalyticsState } from './risk-analytics/useRiskAnalyticsState'
import { RiskHeader } from './risk-analytics/RiskHeader'
import { AsyncExportWorkerCard } from './risk-analytics/AsyncExportWorkerCard'
import { ExportRecordRow } from './risk-analytics/ExportRecordRow'
import { LegalAuditStrip } from './risk-analytics/LegalAuditStrip'
import { RiskDeteriorationSection } from './risk-analytics/RiskDeteriorationSection'
import { RiskModals } from './risk-analytics/RiskModals'

export const RiskAnalytics: React.FC = () => {
  const {
    bindReportingGeometry,apiError,detailError,exportBusy,held,journalError,
    projects,
    projectsConfig,
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
    rpt06Segments,
    activeSegmentId,
    activeSegment,
    mapContainerRef,
    mapLayer,
    setMapLayer,
    handleFocusSegment,
    handleZoomIn,
    handleZoomOut,
    handleFitBounds,
    handleToggleSort,
    handleCreateExportJob,
    handleCancelActiveJob,
    handleDeleteRecord,
    handleRetryRecord,
    handleDownloadFile,
    handleRefresh,
    resetFilters
  } = useRiskAnalyticsState()
  const reporting=useProjectReporting(selectedProject)
  React.useEffect(()=>{const g=reporting.geometry.value,f=reporting.filters;bindReportingGeometry(g?{...g,routes:g.routes.filter(r=>!f.routeVersionId||r.id===f.routeVersionId),segments:g.segments.filter(s=>(!f.routeVersionId||s.routeVersionId===f.routeVersionId)&&(!f.segmentSetId||s.segmentSetId===f.segmentSetId)&&(!f.segmentIds?.length||f.segmentIds.includes(s.id)))}:null)},[reporting.geometry.value,reporting.filters,bindReportingGeometry])

  return (
    <div className="space-y-6 pb-16 text-[#1E293B]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <span className="material-symbols-outlined text-[18px] text-[#C9A227] shrink-0">check_circle</span>
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header & Filter Controls */}
      {(apiError||journalError)&&<p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{businessError(apiError||journalError)}</p>}
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
        projects={projects}
        projectsConfig={projectsConfig}
      />

      {/* KPI METRICS (BỘ 4 THẺ CÓ ĐIỂM NHẤN THEO SPEC B2) */}
      <div className="space-y-5">
        <ReportingMetricsPanel project={selectedProject} data={reporting} />
        {/* ASYNC EXPORT WORKER QUEUE CARD */}
        <AsyncExportWorkerCard
          currentProject={currentProject}
          activeJob={activeJob}
          handleCancelActiveJob={handleCancelActiveJob}
          handleDownloadFile={handleDownloadFile}
          processedRecords={processedRecords}
          exportRecords={exportRecords}
          setSelectedRecordForDetail={setSelectedRecordForDetail}
          setIsPreviewModalOpen={setIsPreviewModalOpen}
        />
      </div>

      {/* RPT-06: GIS Risk Map & Deterioration Progression by Chainage Km */}
      <RiskDeteriorationSection
        loading={reporting.geometry.loading}
        error={reporting.geometry.error}
        warnings={reporting.geometry.value?.warnings}
        hasMapGeometry={!!reporting.geometry.value?.routes.some(r=>(!reporting.filters.routeVersionId||r.id===reporting.filters.routeVersionId)&&r.coordinates.length>1)}
        segments={rpt06Segments}
        activeSegmentId={activeSegmentId}
        activeSegment={activeSegment}
        mapContainerRef={mapContainerRef}
        mapLayer={mapLayer}
        setMapLayer={setMapLayer}
        onFocusSegment={handleFocusSegment}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitBounds={handleFitBounds}
        projectName={currentProject.name}
      />

      {/* DANH MỤC HỒ SƠ GIẢI TRÌNH ĐÃ KẾT XUẤT (BỌC THẺ BO 20PX, THEAD #F8F9FA, HÀNG HOVER) */}
      <div className="space-y-4">
        <div className="relative bg-white rounded-[20px] border border-[#E2E5E9] shadow-2xs overflow-hidden flex flex-col">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1E40AF] via-[#C9A227] to-slate-200" />
          
          {/* Table Header & Controls */}
          <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#EDEFF2]">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E40AF] ring-4 ring-[#1E40AF]/20" />
                <h2 className="font-sansation text-lg font-bold text-slate-900">
                  Danh mục hồ sơ giải trình đã kết xuất
                </h2>
                <span className="px-[12px] py-[3px] rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                  {processedRecords.length} / {exportRecords.length} gói lưu trữ
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Lịch sử lưu trữ hồ sơ hoàn công, biên bản đối chứng nghiệm thu và gói bằng chứng số phục vụ kiểm toán kỹ thuật
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              <button
                onClick={handleRefresh}
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-semibold text-xs transition border border-slate-200 cursor-pointer shadow-2xs"
              >
                <span className={`material-symbols-outlined text-[15px] ${isRefreshing ? 'animate-spin text-[#8C6D1F]' : 'text-slate-500'}`}>
                  refresh
                </span>
                <span>Làm mới danh sách</span>
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-[#EDEFF2] select-none">
                <tr>
                  <th
                    onClick={() => handleToggleSort('code')}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition"
                    title="Nhấn để sắp xếp theo Mã gói"
                  >
                    <div className="flex items-center gap-1">
                      <span>Mã hồ sơ</span>
                      <span className="material-symbols-outlined text-[14px] text-slate-400">
                        {sortField === 'code' ? (sortAsc ? 'arrow_upward' : 'arrow_downward') : 'swap_vert'}
                      </span>
                    </div>
                  </th>

                  <th className="py-3 px-4">Loại chứng từ</th>

                  <th
                    onClick={() => handleToggleSort('scope_display')}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition"
                    title="Nhấn để sắp xếp theo Phạm vi"
                  >
                    <div className="flex items-center gap-1">
                      <span>Lý trình đoạn tuyến</span>
                      <span className="material-symbols-outlined text-[14px] text-slate-400">
                        {sortField === 'scope_display' ? (sortAsc ? 'arrow_upward' : 'arrow_downward') : 'swap_vert'}
                      </span>
                    </div>
                  </th>

                  <th
                    onClick={() => handleToggleSort('as_of_timestamp')}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition"
                    title="Nhấn để sắp xếp theo Thời gian chốt"
                  >
                    <div className="flex items-center gap-1">
                      <span>Thời gian chốt</span>
                      <span className="material-symbols-outlined text-[14px] text-slate-400">
                        {sortField === 'as_of_timestamp' ? (sortAsc ? 'arrow_upward' : 'arrow_downward') : 'swap_vert'}
                      </span>
                    </div>
                  </th>

                  <th
                    onClick={() => handleToggleSort('file_size_mb')}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition"
                    title="Nhấn để sắp xếp theo Dung lượng"
                  >
                    <div className="flex items-center gap-1">
                      <span>Dung lượng &amp; Định dạng</span>
                      <span className="material-symbols-outlined text-[14px] text-slate-400">
                        {sortField === 'file_size_mb' ? (sortAsc ? 'arrow_upward' : 'arrow_downward') : 'swap_vert'}
                      </span>
                    </div>
                  </th>

                  <th
                    onClick={() => handleToggleSort('status')}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition"
                    title="Nhấn để sắp xếp theo Trạng thái"
                  >
                    <div className="flex items-center gap-1">
                      <span>Trạng thái</span>
                      <span className="material-symbols-outlined text-[14px] text-slate-400">
                        {sortField === 'status' ? (sortAsc ? 'arrow_upward' : 'arrow_downward') : 'swap_vert'}
                      </span>
                    </div>
                  </th>

                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDEFF2] text-slate-700 font-medium">
                {processedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 space-y-2">
                      <span className="material-symbols-outlined text-[36px] text-slate-300 mx-auto block">
                        folder_open
                      </span>
                      <p className="text-sm font-semibold text-slate-700">{apiError?'Chưa đọc được hồ sơ trong phạm vi quyền hiện tại':selectedProject==='ALL'?'Chọn dự án để đọc hồ sơ':'Không tìm thấy hồ sơ phù hợp với bộ lọc hiện tại'}</p>
                      <p className="text-xs text-slate-400">Hãy thử đổi dự án, điều chỉnh kỳ báo cáo hoặc nhấn "Đặt lại".</p>
                    </td>
                  </tr>
                ) : (
                  processedRecords.map((record) => (
                    <ExportRecordRow
                      key={record.id}
                      record={record}
                      onDownloadFile={handleDownloadFile}
                      onSelectDetail={setSelectedRecordForDetail}
                      onRetry={handleRetryRecord}
                      onDelete={handleDeleteRecord}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 bg-[#F8F9FA] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 border-t border-[#EDEFF2] font-semibold">
            <span>Hiển thị {processedRecords.length} trong tổng số {exportRecords.length} hồ sơ lưu trữ</span>
            <div className="flex items-center gap-1.5">
              <button
                disabled
                type="button"
                className="px-3 py-1 rounded-lg bg-white text-slate-400 border border-slate-200 cursor-not-allowed opacity-60 text-xs"
              >
                Trước
              </button>
              <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 font-mono text-slate-800 text-xs font-bold shadow-2xs">
                1 / {Math.max(1, Math.ceil(processedRecords.length / 10))}
              </span>
              <button
                type="button"
                className="px-3 py-1 rounded-lg bg-white text-slate-700 hover:text-slate-900 border border-slate-200 cursor-pointer text-xs font-semibold shadow-2xs"
              >
                Sau
              </button>
            </div>
          </div>
        </div>

        {/* LEGAL & SECURITY AUDIT STRIP */}
        <LegalAuditStrip />
      </div>

      {/* All Modal Windows */}
      <RiskModals
        busy={exportBusy} pending={!!held} received={!!held?.received} journalKey={held?.key} error={apiError||journalError} detailError={detailError}
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

