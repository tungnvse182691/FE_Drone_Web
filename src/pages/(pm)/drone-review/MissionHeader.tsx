import React from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../../components/ui/Icon'
import { MissionQualitySection } from './MissionQualitySection'

export interface MissionHeaderProps {
  droneModel?: string
  totalPhotos?: number
  aiDetectionsCount?: number
  basePath: string
  missionCode?: string
  missionTitle?: string
  missionStatus?: 'PENDING_AI_REVIEW' | 'BASELINE_LOCKED' | 'SCHEDULED' | 'PROCESSING_AI'
  setCurrentFrame: (f: number) => void
  showToast: (msg: string) => void
  coveragePercentage?: number
  hasBlindspot?: boolean
  isBaselineLocked: boolean
  lockedBaselineRange?: string | null
  pendingCount: number
  detailHref?: string
  reviewedCount?: number
  totalCount?: number
  approvedCount?: number
  rejectedCount?: number
  reviewProgressPercent?: number
}

export const MissionHeader: React.FC<MissionHeaderProps> = ({
  basePath,
  missionCode = '#MS-2026-0000',
  missionTitle = 'Nhiệm vụ bay khảo sát trắc địa',
  missionStatus = 'PENDING_AI_REVIEW',
  setCurrentFrame,
  showToast,
  coveragePercentage,
  hasBlindspot,
  isBaselineLocked,
  lockedBaselineRange,
  pendingCount,
  detailHref,
  reviewedCount = 0,
  totalCount = 0,
  approvedCount = 0,
  rejectedCount = 0,
  reviewProgressPercent = 0
}) => {
  const isLocked = isBaselineLocked || missionStatus === 'BASELINE_LOCKED'

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
              {/* Badge trạng thái đồng bộ 100% với bên ngoài */}
              {isLocked ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#EDF7ED] text-[#1B5E20] border border-emerald-200">
                  <Icon name="verified" size={14} className="text-[#2F9E44]" />
                  <span>Đã khóa Baseline</span>
                </span>
              ) : missionStatus === 'PENDING_AI_REVIEW' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>Chờ thẩm định AI</span>
                </span>
              ) : missionStatus === 'PROCESSING_AI' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                  <span>Đang nhận diện AI</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <span>Kế hoạch lên lịch</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Thẩm định không ảnh trắc địa & phát hiện tự động từ đợt bay Drone theo CSDL Backend.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {basePath === '/sup' ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <Icon name="visibility" size={14} className="text-slate-500" />
                <span>Chế độ Giám sát (Chỉ xem)</span>
              </span>
            ) : (
              <>
                {/* BE: bay bổ sung = POST /survey-tasks/{id}/supplements; khóa Baseline = POST /projects/{p}/baseline-selections theo bản nộp đã đánh giá — cả hai làm ở chi tiết nhiệm vụ khảo sát */}
                {detailHref && (
                  <Link to={detailHref} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs">
                    <Icon name="open_in_new" size={14} className="text-slate-500" />
                    <span>Chi tiết nhiệm vụ: bản nộp, đánh giá, Baseline, bay bổ sung</span>
                  </Link>
                )}
                {isLocked && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold border shadow-2xs bg-emerald-100 text-emerald-800 border-emerald-300">
                    <Icon name="verified" size={14} className="text-emerald-700" />
                    <span>{lockedBaselineRange ? `Đã khóa Baseline (${lockedBaselineRange})` : 'Đã khóa Baseline số'}</span>
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* 3-DIMENSIONAL DATA QUALITY INGEST ASSESSMENT & ASYNC AI JOB PROGRESS BAR */}
      <MissionQualitySection
        coveragePercentage={coveragePercentage}
        hasBlindspot={hasBlindspot}
        setCurrentFrame={setCurrentFrame}
        showToast={showToast}
        aiDetectionsCount={totalCount}
        reviewedCount={reviewedCount}
        totalCount={totalCount}
        approvedCount={approvedCount}
        rejectedCount={rejectedCount}
        pendingCount={pendingCount}
        reviewProgressPercent={reviewProgressPercent}
        isBaselineLocked={isLocked}
      />
    </>
  )
}
