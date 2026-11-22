import React, { useState } from 'react'
import { type SurveyMissionItem as SurveyMission } from '../../../api/services'

interface SurveyCardProps {
  survey: SurveyMission
  isHighlighted?: boolean
  basePath: string
  onNavigate: (path: string) => void
  onOpenSimulator: (mission: SurveyMission) => void
  /** Mở bản ghi liên quan (kế hoạch ↔ nhiệm vụ, nhiệm vụ gốc ↔ bổ sung) theo ID. */
  onOpenRelated?: (id: string) => void
}

export const SurveyCard: React.FC<SurveyCardProps> = ({
  survey,
  isHighlighted = false,
  basePath,
  onNavigate,
  onOpenSimulator,
  onOpenRelated
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const isCompleted = survey.serverRecordKind ? survey.serverStatus === 'COMPLETED' : survey.status === 'BASELINE_LOCKED'
  const isNeedReview = survey.status === 'PENDING_AI_REVIEW'
  const isScheduled = survey.serverRecordKind ? survey.serverRecordKind === 'PLAN' : survey.status === 'SCHEDULED'

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
        border: isHighlighted ? '2px solid #C9A227' : `1.5px solid ${isHovered ? styleConfig.dot : styleConfig.border}`,
        background: styleConfig.bgTint,
        boxShadow: isHighlighted ? '0 0 0 3px rgba(201, 162, 39, 0.35), 0 8px 20px rgba(0, 0, 0, 0.08)' : isHovered ? styleConfig.hoverShadow : '0 2px 8px rgba(0, 0, 0, 0.05)',
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
            {survey.serverRecordKind && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 border ${survey.serverRecordKind === 'PLAN' ? 'bg-sky-50 text-sky-800 border-sky-200' : 'bg-teal-50 text-teal-800 border-teal-200'}`}>{survey.serverRecordKind === 'PLAN' ? 'KẾ HOẠCH' : 'NHIỆM VỤ'}</span>
            )}
            {survey.parent_task_id && <span className="text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 border bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200">Bổ sung</span>}
            {survey.survey_type && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 border ${
                  survey.survey_type === 'BASELINE'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : survey.survey_type === 'AD_HOC'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {survey.survey_type === 'BASELINE'
                  ? 'Cơ sở'
                  : survey.survey_type === 'AD_HOC'
                  ? 'Đột xuất'
                  : 'Định kỳ'}
              </span>
            )}
          </div>
          <span
            className="rounded-full text-[11px] font-bold px-[14px] py-[5px] whitespace-nowrap shrink-0"
            style={{
              backgroundColor: styleConfig.badgeBg,
              color: styleConfig.badgeText
            }}
          >
            {survey.serverRecordKind ? survey.status_label : styleConfig.badgeLabel}
          </span>
        </div>

        {/* Hàng 2: Meta (Tuyến • Phi công phụ trách • Ngày bay) — Không icon thừa */}
        <div className="text-xs text-slate-500 font-medium flex items-center flex-wrap gap-x-2 gap-y-1">
          <span className="text-slate-800 font-semibold">{survey.project_name}</span>
          {survey.serverRecordKind ? <>
            {survey.pilot_name && <span>Operator: {pilotClean}</span>}
            {survey.serverRecordKind === 'PLAN' && !survey.pilot_name && <span>Operator: chưa có nhiệm vụ giao</span>}
            {survey.flight_date && <span>Lịch bay dự kiến: {survey.flight_date}</span>}
            {survey.serverRecordKind === 'TASK' && <span>Hạn hoàn thành: {survey.due_label || 'không đặt'}</span>}
          </> : <><span>•</span>
          <span className="font-mono text-slate-700">{survey.start_km} → {survey.end_km}</span>
          <span>•</span>
          <span>Phi công thiết bị bay: {pilotClean}</span>
          <span>•</span>
          <span>{survey.flight_date}</span></>}
        </div>

        {/* Hàng 3: Mô tả ngắn (độ phủ ảnh %, số khiếm khuyết, số ảnh) */}
        <p role={survey.read_error ? 'alert' : undefined} className="text-xs text-slate-600 leading-relaxed break-words">
          {survey.serverRecordKind ? survey.read_error || survey.scope_summary : <>Nhiệm vụ bay khảo sát trắc địa mặt đường • {Number.isFinite(survey.ai_defects_count) ? `Ghi nhận ${survey.ai_defects_count} khiếm khuyết AI` : 'Chưa đọc được số khiếm khuyết AI'} • Thiết bị: {survey.drone_model}.</>}
        </p>

        {survey.serverRecordKind && (
          <div className="text-[11px] text-slate-500 flex items-center flex-wrap gap-x-3 gap-y-1">
            <span>Loại khảo sát: {survey.survey_type_label}{survey.parent_task_id ? ' · Bổ sung (theo nhiệm vụ gốc)' : ''}</span>
            {survey.plan_id && onOpenRelated && <button type="button" onClick={e => { e.stopPropagation(); onOpenRelated(survey.plan_id!) }} className="underline text-brand-navy cursor-pointer">Kế hoạch KH-{survey.plan_id.replace(/-/g, '').slice(0, 8).toUpperCase()}</button>}
            {survey.parent_task_id && onOpenRelated && <button type="button" onClick={e => { e.stopPropagation(); onOpenRelated(survey.parent_task_id!) }} className="underline text-brand-navy cursor-pointer">Nhiệm vụ gốc NV-{survey.parent_task_id.replace(/-/g, '').slice(0, 8).toUpperCase()}</button>}
            {survey.supplement_task_id && onOpenRelated && <button type="button" onClick={e => { e.stopPropagation(); onOpenRelated(survey.supplement_task_id!) }} className="underline text-brand-navy cursor-pointer">Nhiệm vụ bổ sung NV-{survey.supplement_task_id.replace(/-/g, '').slice(0, 8).toUpperCase()}</button>}
          </div>
        )}

        {/* Khối chỉ số nghiệp vụ thực tế */}
        {!survey.serverRecordKind && <div className="flex items-center gap-2 flex-wrap pt-0.5">
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
              survey.status === 'BASELINE_LOCKED'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : (survey.reviewed_count || 0) >= survey.ai_defects_count && survey.ai_defects_count > 0
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : survey.status === 'PENDING_AI_REVIEW'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {survey.status === 'BASELINE_LOCKED'
              ? 'Đã khóa Baseline'
              : (survey.reviewed_count || 0) >= survey.ai_defects_count && survey.ai_defects_count > 0
              ? 'Đã thẩm định 100%'
              : survey.status === 'PENDING_AI_REVIEW'
              ? 'Chờ thẩm định AI'
              : 'Chưa cập nhật trạng thái bay'}
          </span>

          {(survey.approved_count || 0) > 0 ? (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-100/70 text-emerald-800 border border-emerald-300">
              {survey.approved_count} khiếm khuyết hợp lệ
            </span>
          ) : survey.ai_defects_count > 0 ? (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
              {survey.ai_defects_count} khiếm khuyết AI
            </span>
          ) : (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
              {Number.isFinite(survey.ai_defects_count) ? `${survey.ai_defects_count} phát hiện AI` : 'Chưa cập nhật phát hiện AI'}
            </span>
          )}
        </div>}

        {/* 3. Đường kẻ phân cách */}
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-3 mt-auto">
          {/* Mã đợt bay monospace */}
          <span className="font-mono font-bold text-xs text-slate-800 tracking-wider">
            {survey.serverRecordKind ? `${survey.serverRecordKind === 'PLAN' ? 'Kế hoạch' : 'Nhiệm vụ'} · ${survey.short_code || survey.id.slice(0, 8)}` : survey.code}
          </span>

          {/* Nút hành động */}
          {survey.serverRecordKind ? <button type="button" onClick={e=>{e.stopPropagation();onOpenSimulator(survey)}} className="px-4 py-2 rounded-xl bg-[#C9A227] hover:bg-[#8C6D1F] text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95">Xem chi tiết</button> : isScheduled ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onOpenSimulator(survey)
              }}
              className="px-4 py-2 rounded-xl bg-[#C9A227] hover:bg-[#8C6D1F] text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
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
              className="px-4 py-2 rounded-xl bg-[#C9A227] hover:bg-[#8C6D1F] text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              Xem chi tiết
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
