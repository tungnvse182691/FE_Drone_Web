import React from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronRight,
  Home,
  Radio,
  PlaneTakeoff,
  AlertTriangle,
  Lock,
  RefreshCw
} from 'lucide-react'
import { MissionQualitySection } from './MissionQualitySection'

export interface MissionHeaderProps {
  basePath: string
  setCurrentFrame: (f: number) => void
  showToast: (msg: string) => void
  coveragePercentage: number
  hasBlindspot: boolean
  isBaselineLocked: boolean
  pendingCount: number
  onOpenReFlightModal: () => void
  onLockBaseline: () => void
}

export const MissionHeader: React.FC<MissionHeaderProps> = ({
  basePath,
  setCurrentFrame,
  showToast,
  coveragePercentage,
  hasBlindspot,
  isBaselineLocked,
  pendingCount,
  onOpenReFlightModal,
  onLockBaseline
}) => {
  return (
    <>
      {/* BREADCRUMB & HEADER TOPBAR */}
      <section className="bg-white rounded-xl px-5 py-4 shadow-2xs border border-brand-border flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Link to={`${basePath}/dashboard`} className="hover:text-brand-gold transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link to={`${basePath}/surveys`} className="hover:text-brand-gold transition-colors">
              Khảo sát
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 font-semibold truncate">Nhiệm vụ bay QL1A-MS-04</span>
          </nav>

          {/* Thiết bị khảo sát RTK Fix Widget nhỏ gọn */}
          <div className="hidden sm:flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-xs">
            <div className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#C9A227]" />
              <span className="text-slate-500 text-[11px]">DJI Matrice 300 RTK</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              RTK Fix: 100%
            </span>
          </div>
        </div>

        {/* Title and Top Actions */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pt-1 border-t border-slate-100">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold text-brand-dark tracking-tight">
                Khảo sát Drone: Đợt bay quét QL1A (Đoạn Km 1024 - 1030)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold border border-slate-200">
                #MS-2026-0924
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                Đang rà soát AI
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Thu thập ảnh Nadir độ phân giải trắc địa phục vụ số hóa bề mặt và kiểm định độ võng nứt gãy cơ học.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* AI Status Button */}
            <button
              onClick={() => showToast('Mô hình Road-YOLOv9 đang xử lý batch 16 frames trên GPU Cloud')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              type="button"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Đang xử lý phân tích AI (Mã phản hồi: 202)</span>
            </button>

            {/* Re-flight Button */}
            <button
              onClick={onOpenReFlightModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              type="button"
            >
              <PlaneTakeoff className="w-3.5 h-3.5 text-slate-500" />
              <span>Yêu cầu bay bổ sung</span>
            </button>

            {/* Baseline Lock Button with Tooltip */}
            <div className="relative group">
              <button
                onClick={onLockBaseline}
                disabled={!isBaselineLocked}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shadow-xs ${
                  isBaselineLocked
                    ? 'bg-[#C9A227] hover:bg-[#B38E1F] text-white cursor-pointer active:scale-98'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
                type="button"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Xác nhận Baseline đoạn đường</span>
              </button>

              {!isBaselineLocked && (
                <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-slate-900 text-white rounded-xl text-xs shadow-xl hidden group-hover:block z-50 pointer-events-none">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      Chưa thể khóa Baseline: Độ phủ mới đạt {coveragePercentage}% (&lt; 95%) và còn {pendingCount} phát hiện AI chưa được rà soát.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3-DIMENSIONAL DATA QUALITY INGEST ASSESSMENT & ASYNC AI JOB PROGRESS BAR */}
      <MissionQualitySection
        coveragePercentage={coveragePercentage}
        hasBlindspot={hasBlindspot}
        setCurrentFrame={setCurrentFrame}
        showToast={showToast}
      />
    </>
  )
}
