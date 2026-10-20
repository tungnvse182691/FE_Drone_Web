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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* KPI 1: Hiệu quả xử lý hư hỏng (#1E40AF Blue) */}
          <div className="relative rounded-[20px] border-[1.5px] border-[#1E40AF]/25 bg-gradient-to-b from-[#1E40AF]/[0.04] via-white/50 to-white p-5 shadow-2xs overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(30,64,175,0.15)] flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1E40AF] to-blue-200" />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1E40AF] ring-4 ring-[#1E40AF]/20" />
                  <span className="font-bold text-xs tracking-wider text-slate-700 uppercase">
                    Hiệu quả xử lý hư hỏng
                  </span>
                </div>
                <span className="px-[10px] py-[3px] rounded-full bg-blue-50 text-[#1E40AF] text-[11px] font-bold border border-blue-200">
                  {currentProject.met01_change}
                </span>
              </div>
              <div className="pt-1">
                <span className="font-sansation text-3xl font-bold tracking-tight text-slate-900">
                  {currentProject.met01_ratio}%
                </span>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  {currentProject.met01_completed_text}
                </p>
              </div>
            </div>

            <div className="pt-4 space-y-1.5 border-t border-slate-100 mt-3">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#1E40AF] h-full rounded-full transition-all duration-700"
                  style={{ width: `${currentProject.met01_ratio}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>Tiến độ cam kết SLA</span>
                <span className="font-semibold text-slate-800">Mục tiêu: ≥ {currentProject.met01_target}%</span>
              </div>
            </div>
          </div>

          {/* KPI 2: Thời gian thẩm duyệt trung bình (#B45309 Amber) */}
          <div className="relative rounded-[20px] border-[1.5px] border-[#B45309]/25 bg-gradient-to-b from-[#B45309]/[0.04] via-white/50 to-white p-5 shadow-2xs overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(180,83,9,0.15)] flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#B45309] to-amber-200" />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B45309] ring-4 ring-[#B45309]/20" />
                  <span className="font-bold text-xs tracking-wider text-slate-700 uppercase">
                    Thời gian thẩm duyệt
                  </span>
                </div>
                <span className="px-[10px] py-[3px] rounded-full bg-amber-50 text-[#B45309] text-[11px] font-bold border border-amber-200">
                  {currentProject.met04_change}
                </span>
              </div>
              <div className="pt-1">
                <div className="flex items-baseline gap-1">
                  <span className="font-sansation text-3xl font-bold tracking-tight text-slate-900">
                    {currentProject.met04_mtta}
                  </span>
                  <span className="text-sm font-semibold text-slate-600">ngày</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  Mục tiêu trung bình: ≤ 4.0 ngày / đợt
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 mt-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex justify-between items-center text-xs">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Giám sát duyệt</span>
                  <span className="font-mono font-bold text-slate-800">{currentProject.met04_sup_days} ngày</span>
                </div>
                <span className="text-slate-300 font-light">|</span>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">PM XỬ LÝ NHANH</span>
                  <span className="font-mono font-bold text-[#8C6D1F]">{currentProject.met04_pm_days} ngày</span>
                </div>
              </div>
            </div>
          </div>

          {/* KPI 3: Độ bền kết cấu & Kiểm soát lún nứt (#047857 Emerald / #B91C1C Red) */}
          <div
            className={`relative rounded-[20px] border-[1.5px] p-5 shadow-2xs overflow-hidden transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between ${
              currentProject.met08_recurrence >= 5.0
                ? 'border-[#B91C1C]/25 bg-gradient-to-b from-[#B91C1C]/[0.04] via-white/50 to-white hover:shadow-[0_12px_28px_rgba(185,28,28,0.15)]'
                : 'border-[#047857]/25 bg-gradient-to-b from-[#047857]/[0.04] via-white/50 to-white hover:shadow-[0_12px_28px_rgba(4,120,87,0.15)]'
            }`}
          >
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                currentProject.met08_recurrence >= 5.0
                  ? 'from-[#B91C1C] to-rose-200'
                  : 'from-[#047857] to-emerald-200'
              }`}
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ring-4 ${
                      currentProject.met08_recurrence >= 5.0
                        ? 'bg-[#B91C1C] ring-[#B91C1C]/20'
                        : 'bg-[#047857] ring-[#047857]/20'
                    }`}
                  />
                  <span className="font-bold text-xs tracking-wider text-slate-700 uppercase">
                    Kiểm soát lún nứt
                  </span>
                </div>
                <span
                  className={`px-[10px] py-[3px] rounded-full text-[11px] font-bold border ${
                    currentProject.met08_recurrence >= 5.0
                      ? 'bg-rose-50 text-[#B91C1C] border-rose-200'
                      : 'bg-emerald-50 text-[#047857] border-emerald-200'
                  }`}
                >
                  {currentProject.met08_recurrence >= 5.0 ? 'CẢNH BÁO' : 'ĐẠT CHUẨN'}
                </span>
              </div>
              <div className="pt-1">
                <div className="flex items-baseline gap-1">
                  <span
                    className={`font-sansation text-3xl font-bold tracking-tight ${
                      currentProject.met08_recurrence >= 5.0 ? 'text-[#B91C1C]' : 'text-slate-900'
                    }`}
                  >
                    {currentProject.met08_recurrence}%
                  </span>
                  <span className="text-xs text-slate-500 font-medium">tái phát</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  {currentProject.met08_note}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 mt-3">
              <div
                className={`inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-xl text-xs font-semibold border ${
                  currentProject.met08_recurrence >= 5.0
                    ? 'bg-rose-50 border-rose-200 text-[#B91C1C]'
                    : 'bg-emerald-50 border-emerald-200 text-[#047857]'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {currentProject.met08_recurrence >= 5.0 ? 'report' : 'check_circle'}
                </span>
                <span>
                  {currentProject.met08_recurrence >= 5.0
                    ? 'Vượt ngưỡng kỹ thuật (≥ 5.0%)'
                    : 'Đạt chuẩn kỹ thuật (< 5.0%)'}
                </span>
              </div>
            </div>
          </div>

          {/* KPI 4: Toàn vẹn hồ sơ số (#047857 Emerald) */}
          <div className="relative rounded-[20px] border-[1.5px] border-[#047857]/25 bg-gradient-to-b from-[#047857]/[0.04] via-white/50 to-white p-5 shadow-2xs overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(4,120,87,0.15)] flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#047857] to-emerald-200" />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#047857] ring-4 ring-[#047857]/20" />
                  <span className="font-bold text-xs tracking-wider text-slate-700 uppercase">
                    Toàn vẹn hồ sơ số
                  </span>
                </div>
                <span className="px-[10px] py-[3px] rounded-full bg-emerald-50 text-[#047857] text-[11px] font-bold border border-emerald-200 font-mono">
                  SHA-256
                </span>
              </div>
              <div className="pt-1">
                <span className="font-sansation text-3xl font-bold tracking-tight text-slate-900">
                  {currentProject.met11_integrity}%
                </span>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  {currentProject.met11_items_text}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 mt-3">
              <div className="inline-flex items-center justify-center gap-1.5 w-full bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-xl text-xs font-semibold text-slate-700">
                <span className="material-symbols-outlined text-[15px] text-[#047857]">shield_with_heart</span>
                <span className="truncate">TCVN 8819:2011 • Đạt chuẩn</span>
              </div>
            </div>
          </div>
        </div>

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
                      <p className="text-sm font-semibold text-slate-700">Không tìm thấy hồ sơ phù hợp với bộ lọc hiện tại</p>
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

