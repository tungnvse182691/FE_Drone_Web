import React from 'react'
import {
  Zap,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock
} from 'lucide-react'
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
    <>
      {/* 4-COLUMN CORE METRICS GRID (MET-01, MET-04, MET-08, MET-11) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* MET-01: FAST TRACK RATIO */}
        <div className="rounded-2xl p-5 shadow-2xs flex flex-col justify-between bg-[#EAF4FB] text-slate-800 border border-blue-200/80">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-sansation font-bold tracking-wider text-[#2B78C5] uppercase flex items-center gap-1.5 text-xs">
                <Zap className="w-4 h-4" />
                <span>MET-01 • HIỆU QUẢ VẬN HÀNH</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-[#2B78C5] font-sansation text-[11px] font-bold border border-blue-200">
                {currentProject.met01_change}
              </span>
            </div>
            <div className="pt-1">
              <span className="font-sansation text-3xl font-bold tracking-tight text-[#2B78C5]">
                {currentProject.met01_ratio}%
              </span>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                {currentProject.met01_completed_text}
              </p>
            </div>
          </div>

          <div className="pt-4 space-y-1.5">
            <div className="w-full bg-[#D3E8F8] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#2B78C5] h-full rounded-full transition-all duration-700"
                style={{ width: `${currentProject.met01_ratio}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-600 font-medium">
              <span>Tiến độ cam kết SLA</span>
              <span className="font-bold text-slate-900">Mục tiêu: ≥ {currentProject.met01_target}%</span>
            </div>
          </div>
        </div>

        {/* MET-04: MEAN TIME TO ACCEPT (MTTA) */}
        <div className="rounded-2xl p-5 shadow-2xs flex flex-col justify-between bg-[#F5EFE6] text-slate-800 border border-amber-200/80">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-sansation font-bold tracking-wider text-[#8C6D46] uppercase flex items-center gap-1.5 text-xs">
                <Clock className="w-4 h-4" />
                <span>MET-04 • TỐC ĐỘ THẨM DUYỆT</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-[#8C6D46] font-sansation text-[11px] font-bold border border-amber-200">
                {currentProject.met04_change}
              </span>
            </div>
            <div className="pt-1">
              <div className="flex items-baseline gap-1">
                <span className="font-sansation text-3xl font-bold tracking-tight text-[#8C6D46]">
                  {currentProject.met04_mtta}
                </span>
                <span className="font-sansation text-lg font-bold text-[#8C6D46]">ngày</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Giảm so với tháng trước (Mục tiêu: ≤ 4.0 ngày)
              </p>
            </div>
          </div>

          <div className="pt-4">
            <div className="bg-white/90 border border-amber-200/80 rounded-xl p-2 flex justify-between items-center text-xs">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Supervisor duyệt</span>
                <span className="font-mono font-bold text-slate-800">{currentProject.met04_sup_days} ngày</span>
              </div>
              <span className="text-slate-300 font-light">|</span>
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">PM Fast Track</span>
                <span className="font-mono font-bold text-[#8C6D46]">{currentProject.met04_pm_days} ngày</span>
              </div>
            </div>
          </div>
        </div>

        {/* MET-08: RECURRENCE RATE */}
        <div
          className={`rounded-2xl p-5 shadow-2xs flex flex-col justify-between border transition-all duration-300 ${
            currentProject.met08_recurrence >= 5.0
              ? 'bg-[#FDEAEB] text-slate-800 border-rose-200/80 ring-1 ring-rose-200/50'
              : 'bg-[#EDF7ED] text-slate-800 border-emerald-200/80'
          }`}
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span
                className={`font-sansation font-bold tracking-wider uppercase flex items-center gap-1.5 text-xs ${
                  currentProject.met08_recurrence >= 5.0 ? 'text-[#D9383A]' : 'text-[#1B5E20]'
                }`}
              >
                {currentProject.met08_recurrence >= 5.0 ? (
                  <AlertTriangle className="w-4 h-4 text-[#D9383A]" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-[#1B5E20]" />
                )}
                <span>MET-08 • ĐỘ BỀN KẾT CẤU</span>
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-white font-sansation text-[10px] font-bold tracking-wide shadow-2xs ${
                  currentProject.met08_recurrence >= 5.0 ? 'bg-[#D9383A]' : 'bg-emerald-600'
                }`}
              >
                {currentProject.met08_recurrence >= 5.0 ? 'CẢNH BÁO' : 'ĐẠT CHUẨN'}
              </span>
            </div>
            <div className="pt-1">
              <span
                className={`font-sansation text-3xl font-bold tracking-tight ${
                  currentProject.met08_recurrence >= 5.0 ? 'text-[#D9383A]' : 'text-[#1B5E20]'
                }`}
              >
                {currentProject.met08_recurrence}%
              </span>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                {currentProject.met08_note}
              </p>
            </div>
          </div>

          <div className="pt-4">
            {currentProject.met08_recurrence >= 5.0 ? (
              <div className="inline-flex items-center justify-center gap-1.5 w-full bg-rose-100/90 border border-rose-300 py-1.5 px-3 rounded-full text-xs font-sansation font-bold text-[#D9383A]">
                <AlertTriangle className="w-4 h-4 text-[#D9383A]" />
                <span>VƯỢT NGƯỠNG AN TOÀN KỸ THUẬT (≥ 5.0%)</span>
              </div>
            ) : (
              <div className="inline-flex items-center justify-center gap-1.5 w-full bg-white/90 border border-emerald-300 py-1.5 px-3 rounded-full text-xs font-sansation font-bold text-[#1B5E20]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>ĐẠT CHUẨN AN TOÀN KỸ THUẬT (&lt; 5.0%)</span>
              </div>
            )}
          </div>
        </div>

        {/* MET-11: INTEGRITY PASS RATE */}
        <div className="rounded-2xl p-5 shadow-2xs flex flex-col justify-between bg-[#EDF7ED] text-slate-800 border border-emerald-200/80">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-sansation font-bold tracking-wider text-[#1B5E20] uppercase flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>MET-11 • PHÁP LÝ & BẢO MẬT SỐ</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-[#1B5E20] font-sansation text-[10px] font-bold border border-emerald-200 font-mono">
                SHA-256
              </span>
            </div>
            <div className="pt-1">
              <span className="font-sansation text-3xl font-bold tracking-tight text-[#1B5E20]">
                {currentProject.met11_integrity}%
              </span>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                {currentProject.met11_items_text}
              </p>
            </div>
          </div>

          <div className="pt-4">
            <div className="inline-flex items-center justify-center gap-1.5 w-full bg-[#1B5E20]/10 border border-[#1B5E20]/20 py-1.5 px-3 rounded-full text-xs font-sansation font-bold text-[#1B5E20]">
              <Lock className="w-3.5 h-3.5 text-[#1B5E20]" />
              <span className="truncate">MÃ BĂM BLOCKCHAIN / TCVN SẴN SÀNG</span>
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
    </>
  )
}
