import React, { useState } from 'react'
import { type SurveyMissionItem as SurveyMission } from '../../../api/services'

interface SurveyCardProps {
  survey: SurveyMission
  basePath: string
  onNavigate: (path: string) => void
  onOpenSimulator: (mission: SurveyMission) => void
}

export const SurveyCard: React.FC<SurveyCardProps> = ({
  survey,
  basePath,
  onNavigate,
  onOpenSimulator
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const isCompleted = survey.status === 'BASELINE_LOCKED'
  const isNeedReview = survey.status === 'PENDING_AI_REVIEW'
  const isScheduled = survey.status === 'SCHEDULED'

  // Bảng màu viền / thanh gradient / chấm / nền tint theo spec đã duyệt
  const styleConfig = (() => {
    if (isCompleted) {
      return {
        border: '#A7C4B8',
        gradient: 'linear-gradient(90deg, #047857 0%, #065F46 100%)',
        dot: '#047857',
        halo: 'rgba(4, 120, 87, 0.15)',
        bgTint: 'linear-gradient(180deg, #F0FDF7 0%, #ffffff 45%)',
        hoverShadow: '0 12px 28px rgba(4, 120, 87, 0.15)',
        badgeBg: '#DCE8E2',
        badgeText: '#065F46',
        badgeLabel: 'Đã khóa Baseline'
      }
    }
    if (isScheduled) {
      return {
        border: '#B8C5D9',
        gradient: 'linear-gradient(90deg, #1E40AF 0%, #3B5BA9 100%)',
        dot: '#1E40AF',
        halo: 'rgba(30, 64, 175, 0.15)',
        bgTint: 'linear-gradient(180deg, #F0F9FF 0%, #ffffff 45%)',
        hoverShadow: '0 12px 28px rgba(30, 64, 175, 0.15)',
        badgeBg: '#DDE3EE',
        badgeText: '#1E3A5F',
        badgeLabel: 'Kế hoạch lên lịch'
      }
    }
    // isNeedReview (Chờ thẩm định AI)
    return {
      border: '#E3D3AC',
      gradient: 'linear-gradient(90deg, #B45309 0%, #92400E 100%)',
      dot: '#B45309',
      halo: 'rgba(180, 83, 9, 0.15)',
      bgTint: 'linear-gradient(180deg, #FFFBEB 0%, #ffffff 45%)',
      hoverShadow: '0 12px 28px rgba(180, 83, 9, 0.15)',
      badgeBg: '#F0E8D5',
      badgeText: '#78350F',
      badgeLabel: 'Chờ Thẩm Định AI'
    }
  })()

  const pilotClean = survey.pilot_name
    .replace(' (Drone Pilot)', '')
    .replace(' (Phi công thiết bị bay)', '')

  return (
    <div
      onClick={() => {
        if (isScheduled) {
          onOpenSimulator(survey)
        } else {
          onNavigate(`${basePath}/surveys/${survey.id}/review`)
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="rounded-[20px] overflow-hidden flex flex-col justify-between cursor-pointer select-none"
      style={{
        border: `1.5px solid ${isHovered ? styleConfig.dot : styleConfig.border}`,
        background: styleConfig.bgTint,
        boxShadow: isHovered ? styleConfig.hoverShadow : '0 2px 8px rgba(0, 0, 0, 0.05)',
        transform: isHovered ? 'translateY(-4px)' : 'none',
        transition: 'all 0.3s ease'
      }}
    >
      {/* 1. Thanh gradient 4px trên cùng */}
      <div className="h-1 w-full shrink-0" style={{ background: styleConfig.gradient }} />

      {/* 2. Thân thẻ */}
      <div className="p-[20px_22px] flex flex-col justify-between flex-1 gap-3.5">
        {/* Hàng 1: Chấm màu tròn 10px + Halo 4px + Tiêu đề + Badge trạng thái */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="w-[10px] h-[10px] rounded-full shrink-0"
              style={{
                backgroundColor: styleConfig.dot,
                boxShadow: `0 0 0 4px ${styleConfig.halo}`
              }}
            />
            <h3 className="text-sm font-bold text-slate-900 truncate tracking-tight font-sansation">
              {survey.title}
            </h3>
          </div>
          <span
            className="rounded-full text-[11px] font-bold px-[14px] py-[5px] whitespace-nowrap shrink-0"
            style={{
              backgroundColor: styleConfig.badgeBg,
              color: styleConfig.badgeText
            }}
          >
            {styleConfig.badgeLabel}
          </span>
        </div>

        {/* Hàng 2: Meta (Tuyến • Phi công phụ trách • Ngày bay) — Không icon thừa */}
        <div className="text-xs text-slate-500 font-medium flex items-center flex-wrap gap-x-2 gap-y-1">
          <span className="text-slate-800 font-semibold">{survey.project_name}</span>
          <span>•</span>
          <span className="font-mono text-slate-700">{survey.start_km} → {survey.end_km}</span>
          <span>•</span>
          <span>Phi công thiết bị bay: {pilotClean}</span>
          <span>•</span>
          <span>{survey.flight_date}</span>
        </div>

        {/* Hàng 3: Mô tả ngắn (độ phủ ảnh %, số khiếm khuyết, số ảnh) */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          Độ phủ ảnh {survey.coverage_percent}% toàn tuyến • Ghi nhận {survey.ai_defects_count} khiếm khuyết AI • Khối lượng {survey.total_photos.toLocaleString()} ảnh chụp độ phân giải GSD {survey.gsd_resolution.replace(' cm/pixel', 'cm')}.
        </p>

        {/* Khối chỉ số kỹ thuật nhanh */}
        <div className="flex items-center gap-2 flex-wrap pt-0.5">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
            {survey.total_photos > 0 ? `${survey.total_photos.toLocaleString()} ảnh` : 'Chờ nạp ảnh'}
          </span>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono">
            GSD: {survey.gsd_resolution.replace(' cm/pixel', 'cm')}
          </span>
          {survey.ai_defects_count > 0 && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
              {survey.ai_defects_count} khiếm khuyết AI
            </span>
          )}
        </div>

        {/* 3. Đường kẻ phân cách */}
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-3 mt-auto">
          {/* Mã đợt bay monospace */}
          <span className="font-mono font-bold text-xs text-slate-800 tracking-wider">
            {survey.code}
          </span>

          {/* Nút hành động */}
          {isScheduled ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onOpenSimulator(survey)
              }}
              className="px-4 py-2 rounded-xl bg-[#1A1D20] hover:bg-[#2D3748] text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              Theo dõi trực tiếp
            </button>
          ) : isNeedReview ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onNavigate(`${basePath}/surveys/${survey.id}/review`)
              }}
              className="px-4 py-2 rounded-xl bg-[#C9A227] hover:bg-[#8C6D1F] text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              Xem chi tiết
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onNavigate(`${basePath}/surveys/${survey.id}/review`)
              }}
              className="px-4 py-2 rounded-xl bg-white border border-[#E2E5E9] hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-all cursor-pointer"
            >
              Xem chi tiết
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
