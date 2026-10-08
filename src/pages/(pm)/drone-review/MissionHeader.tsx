import React from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../../components/ui/Icon'
import { MissionQualitySection } from './MissionQualitySection'

export interface MissionHeaderProps {
  basePath: string
  missionCode?: string
  missionTitle?: string
  setCurrentFrame: (f: number) => void
  showToast: (msg: string) => void
  coveragePercentage: number
  hasBlindspot: boolean
  isBaselineLocked: boolean
  lockedBaselineRange?: string | null
  pendingCount: number
  onOpenReFlightModal: () => void
  onLockBaseline: () => void
}

export const MissionHeader: React.FC<MissionHeaderProps> = ({
  basePath,
  missionCode = '#MS-2026-0924',
  missionTitle = 'Khảo sát Drone: Đợt bay quét QL1A (Đoạn Km 1024 - 1030)',
  setCurrentFrame,
  showToast,
  coveragePercentage,
  hasBlindspot,
  isBaselineLocked,
  lockedBaselineRange,
  pendingCount,
  onOpenReFlightModal,
  onLockBaseline
}) => {
  return (
    <>
      {/* BREADCRUMB & HEADER TOPBAR */}
      <section className="bg-white rounded-xl px-5 py-4 shadow-2xs border border-[#E2E5E9] flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Link to={`${basePath}/dashboard`} className="hover:text-[#C9A227] transition-colors flex items-center gap-1">
              <Icon name="home" size={14} />
              <span>Trang chủ</span>
            </Link>
            <Icon name="chevron_right" size={14} className="text-slate-400" />
            <Link to={`${basePath}/surveys`} className="hover:text-[#C9A227] transition-colors">
              Khảo sát
            </Link>
            <Icon name="chevron_right" size={14} className="text-slate-400" />
            <span className="text-slate-800 font-semibold truncate">{missionCode}</span>
          </nav>

          {/* Thiết bị khảo sát RTK Fix Widget nhỏ gọn */}
          <div className="hidden sm:flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-xs">
            <div className="flex items-center gap-1.5">
              <Icon name="radio" size={14} className="text-[#C9A227]" />
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
              <h1 className="text-xl font-bold text-[#1A1D20] tracking-tight">
                {missionTitle}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold border border-slate-200">
                {missionCode}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                Đang rà soát AI
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Thẩm định không ảnh trắc địa & phát hiện tự động từ đợt bay Drone.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Re-flight Button */}
            <button
              onClick={onOpenReFlightModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              type="button"
            >
              <Icon name="flight_takeoff" size={14} className="text-slate-500" />
              <span>Yêu cầu bay bổ sung</span>
            </button>

            {/* Baseline Lock Button with Tooltip */}
            <div className="flex items-center gap-2">
              {isBaselineLocked ? (
                <>
                  <span className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold border shadow-2xs ${
                    lockedBaselineRange?.includes('Toàn tuyến')
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-50 text-amber-900 border-amber-300'
                  }`}>
                    <Icon name="verified" size={14} className={lockedBaselineRange?.includes('Toàn tuyến') ? 'text-emerald-700' : 'text-amber-600'} />
                    <span>{lockedBaselineRange ? `Đã khóa Baseline (${lockedBaselineRange})` : 'Đã khóa Baseline số'}</span>
                  </span>

                  {/* Nếu mới chỉ khóa phân đoạn và nay đã bay bù đủ độ phủ (coverage >= 95%), cho phép khóa nốt toàn tuyến */}
                  {lockedBaselineRange?.includes('Phân đoạn đạt chuẩn') && coveragePercentage >= 95 && (
                    <button
                      onClick={onLockBaseline}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-[#C9A227] hover:bg-[#8C6D1F] text-white cursor-pointer shadow-xs active:scale-98 transition-all"
                      type="button"
                    >
                      <Icon name="lock" size={14} />
                      <span>Khóa Baseline toàn tuyến (Km 1024 - 1030)</span>
                    </button>
                  )}
                </>
              ) : (
                <div className="relative group">
                  <button
                    onClick={onLockBaseline}
                    disabled={pendingCount > 0}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shadow-xs ${
                      pendingCount === 0
                        ? 'bg-[#C9A227] hover:bg-[#8C6D1F] text-white cursor-pointer active:scale-98'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    }`}
                    type="button"
                  >
                    <Icon name="lock" size={14} />
                    <span>Khóa Baseline đoạn đường</span>
                  </button>

                  {pendingCount > 0 && (
                    <div className="absolute right-0 top-full mt-2 w-64 p-2.5 bg-slate-900 text-white rounded-lg text-xs shadow-xl hidden group-hover:block z-50 pointer-events-none">
                      <div className="flex items-start gap-1.5">
                        <Icon name="warning" size={14} className="text-amber-400 shrink-0 mt-0.5" />
                        <span>
                          Cần hoàn tất thẩm định {pendingCount} mục còn lại trong danh sách trước khi khóa Baseline.
                        </span>
                      </div>
                    </div>
                  )}
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
