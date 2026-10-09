import React from 'react'
import { ProjectConfig, AsyncExportJob, ExportRecord } from './types'
import { AsyncExportWorkerCard } from './AsyncExportWorkerCard'

interface RiskMetricsGridProps {
  currentProject: ProjectConfig
  activeJob: AsyncExportJob | null
  handleCancelActiveJob: () => void
  handleDownloadFile: (fileName: string) => void
  processedRecords: ExportRecord[]
  exportRecords: ExportRecord[]
  setSelectedRecordForDetail: (r: ExportRecord) => void
  setIsPreviewModalOpen: (open: boolean) => void
}

export const RiskMetricsGrid: React.FC<RiskMetricsGridProps> = ({
  currentProject,
  activeJob,
  handleCancelActiveJob,
  handleDownloadFile,
  processedRecords,
  exportRecords,
  setSelectedRecordForDetail,
  setIsPreviewModalOpen
}) => {
  return (
    <div className="space-y-4">
      {/* 4-COLUMN CORE KPI METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: HIỆU QUẢ XỬ LÝ HƯ HỎNG */}
        <div className="rounded-xl p-5 flex flex-col justify-between bg-white text-slate-800 border border-slate-200 shadow-xs">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs tracking-wider text-slate-700 flex items-center gap-1.5 uppercase">
                <span className="material-symbols-outlined text-[18px] text-blue-600">speed</span>
                <span>Hiệu quả xử lý hư hỏng</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200">
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

          <div className="pt-4 space-y-1.5">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-700"
                style={{ width: `${currentProject.met01_ratio}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>Tiến độ cam kết SLA</span>
              <span className="font-semibold text-slate-800">Mục tiêu: ≥ {currentProject.met01_target}%</span>
            </div>
          </div>
        </div>

        {/* KPI 2: THỜI GIAN THẨM DUYỆT TRUNG BÌNH */}
        <div className="rounded-xl p-5 flex flex-col justify-between bg-white text-slate-800 border border-slate-200 shadow-xs">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs tracking-wider text-slate-700 flex items-center gap-1.5 uppercase">
                <span className="material-symbols-outlined text-[18px] text-[#8C6D1F]">schedule</span>
                <span>Thời gian thẩm duyệt</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[11px] font-semibold border border-amber-200">
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

          <div className="pt-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex justify-between items-center text-xs">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-medium uppercase">Giám sát duyệt</span>
                <span className="font-mono font-bold text-slate-800">{currentProject.met04_sup_days} ngày</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-slate-500 font-medium uppercase">PM Fast Track</span>
                <span className="font-mono font-bold text-[#8C6D1F]">{currentProject.met04_pm_days} ngày</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI 3: ĐỘ BỀN KẾT CẤU & TỶ LỆ TÁI PHÁT */}
        <div
          className={`rounded-xl p-5 flex flex-col justify-between border shadow-xs transition-all duration-200 ${
            currentProject.met08_recurrence >= 5.0
              ? 'bg-rose-50/40 text-slate-800 border-rose-200'
              : 'bg-white text-slate-800 border-slate-200'
          }`}
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs tracking-wider text-slate-700 flex items-center gap-1.5 uppercase">
                <span
                  className={`material-symbols-outlined text-[18px] ${
                    currentProject.met08_recurrence >= 5.0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {currentProject.met08_recurrence >= 5.0 ? 'warning' : 'verified'}
                </span>
                <span>Kiểm soát lún nứt</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                  currentProject.met08_recurrence >= 5.0
                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {currentProject.met08_recurrence >= 5.0 ? 'CẢNH BÁO' : 'ĐẠT CHUẨN'}
              </span>
            </div>
            <div className="pt-1">
              <div className="flex items-baseline gap-1">
                <span
                  className={`font-sansation text-3xl font-bold tracking-tight ${
                    currentProject.met08_recurrence >= 5.0 ? 'text-rose-700' : 'text-slate-900'
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

          <div className="pt-4">
            <div
              className={`inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-lg text-xs font-medium border ${
                currentProject.met08_recurrence >= 5.0
                  ? 'bg-rose-100/70 border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
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

        {/* KPI 4: TÍNH TOÀN VẸN HỒ SƠ SỐ (SHA-256) */}
        <div className="rounded-xl p-5 flex flex-col justify-between bg-white text-slate-800 border border-slate-200 shadow-xs">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs tracking-wider text-slate-700 flex items-center gap-1.5 uppercase">
                <span className="material-symbols-outlined text-[18px] text-emerald-600">verified_user</span>
                <span>Toàn vẹn hồ sơ số</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200 font-mono">
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

          <div className="pt-4">
            <div className="inline-flex items-center justify-center gap-1.5 w-full bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-lg text-xs font-medium text-slate-700">
              <span className="material-symbols-outlined text-[15px] text-emerald-600">shield_with_heart</span>
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
  )
}
