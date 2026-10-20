import React, { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { TriageCase } from './types'

export interface TriageCardProps {
  item: TriageCase
  selectedCaseId: string
  isChecked: boolean
  isMaster: boolean
  isExpanded: boolean
  isSupervisor?: boolean
  childReports: TriageCase[]
  onSelectCase: (c: TriageCase) => void
  onToggleSelectReport: (id: string, e: React.MouseEvent) => void
  onToggleExpandMaster: (id: string, e: React.MouseEvent) => void
  onOpenTriageProject: (c: TriageCase, e?: React.MouseEvent) => void
  onOpenMergeModal: (c: TriageCase) => void
  onUnlinkReport: (childId: string, e: React.MouseEvent) => void
}

export const TriageCard: React.FC<TriageCardProps> = ({
  item,
  selectedCaseId,
  isChecked,
  isMaster,
  isExpanded,
  isSupervisor = false,
  childReports,
  onSelectCase,
  onToggleSelectReport,
  onToggleExpandMaster,
  onOpenTriageProject,
  onOpenMergeModal,
  onUnlinkReport
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const isSelected = item.id === selectedCaseId
  const isUnassigned = !item.project_id || item.project_id === ''

  const isCritical = item.severity === 'CRITICAL' || item.urgency === 'EMERGENCY'
  const isVerified = item.status === 'VERIFIED'
  const isNeedSurvey = item.status === 'NEED_SURVEY'
  const isPending = item.status === 'PENDING' || item.severity === 'HIGH'

  // Bảng màu viền / thanh gradient / chấm / nền tint (tông trầm, ĐÃ DUYỆT)
  const styleConfig = (() => {
    if (isCritical) {
      return {
        border: '#E3B8B8',
        gradient: 'linear-gradient(90deg, #B91C1C 0%, #7F1D1D 100%)',
        dot: '#B91C1C',
        halo: 'rgba(185, 28, 28, 0.15)',
        bgTint: 'linear-gradient(180deg, #FFF7F7 0%, #ffffff 45%)',
        hoverShadow: '0 12px 28px rgba(185, 28, 28, 0.15)'
      }
    }
    if (isVerified) {
      return {
        border: '#A7C4B8',
        gradient: 'linear-gradient(90deg, #047857 0%, #065F46 100%)',
        dot: '#047857',
        halo: 'rgba(4, 120, 87, 0.15)',
        bgTint: 'linear-gradient(180deg, #F0FDF7 0%, #ffffff 45%)',
        hoverShadow: '0 12px 28px rgba(4, 120, 87, 0.15)'
      }
    }
    if (isNeedSurvey) {
      return {
        border: '#B8C5D9',
        gradient: 'linear-gradient(90deg, #1E40AF 0%, #3B5BA9 100%)',
        dot: '#1E40AF',
        halo: 'rgba(30, 64, 175, 0.15)',
        bgTint: 'linear-gradient(180deg, #F0F9FF 0%, #ffffff 45%)',
        hoverShadow: '0 12px 28px rgba(30, 64, 175, 0.15)'
      }
    }
    if (isPending) {
      return {
        border: '#E3D3AC',
        gradient: 'linear-gradient(90deg, #B45309 0%, #92400E 100%)',
        dot: '#B45309',
        halo: 'rgba(180, 83, 9, 0.15)',
        bgTint: 'linear-gradient(180deg, #FFFBEB 0%, #ffffff 45%)',
        hoverShadow: '0 12px 28px rgba(180, 83, 9, 0.15)'
      }
    }
    // Thấp / Mặc định
    return {
      border: '#E3D28A',
      gradient: 'linear-gradient(90deg, #C9A227 0%, #8C6D1F 100%)',
      dot: '#C9A227',
      halo: 'rgba(201, 162, 39, 0.15)',
      bgTint: 'linear-gradient(180deg, #FDFBF3 0%, #ffffff 45%)',
      hoverShadow: '0 12px 28px rgba(201, 162, 39, 0.15)'
    }
  })()

  // Badge mức độ ưu tiên (Bo tròn 999px, font 11px font-weight 700, padding 5px 14px)
  const priorityBadge = (() => {
    if (item.severity === 'CRITICAL') {
      return { bg: '#F3E0E0', text: '#7F1D1D', label: 'Khẩn cấp' }
    }
    if (item.severity === 'HIGH') {
      return { bg: '#F0E8D5', text: '#78350F', label: 'Ưu tiên Cao' }
    }
    if (item.severity === 'MEDIUM') {
      return { bg: '#F5EED3', text: '#8C6D1F', label: 'Ưu tiên Vừa' }
    }
    return { bg: '#F5EED3', text: '#8C6D1F', label: 'Ưu tiên Thấp' }
  })()

  // Badge trạng thái xác minh (Bo tròn 999px, font 11px font-weight 700, padding 5px 14px)
  const statusBadge = (() => {
    if (item.status === 'VERIFIED') {
      return { bg: '#DCE8E2', text: '#065F46', label: 'Đã xác minh' }
    }
    if (item.status === 'NEED_SURVEY') {
      return { bg: '#DDE3EE', text: '#1E3A5F', label: 'Cần đo đạc' }
    }
    if (item.status === 'PENDING') {
      return { bg: '#F0E8D5', text: '#78350F', label: 'Chờ xác minh' }
    }
    if (item.status === 'MERGED') {
      return { bg: '#F3E8FF', text: '#6B21A8', label: 'Đã gộp trùng' }
    }
    if (item.status === 'REJECTED') {
      const isOutOfScope = item.conclusion === 'OUT_OF_SCOPE'
      const isNoDefect = item.conclusion === 'NO_DEFECT'
      if (isNoDefect) {
        return { bg: '#F1F5F9', text: '#475569', label: 'Báo sai' }
      }
      if (isOutOfScope) {
        return { bg: '#F5EED3', text: '#8C6D1F', label: 'Ngoài phạm vi' }
      }
      return { bg: '#F1F5F9', text: '#475569', label: 'Từ chối' }
    }
    return { bg: '#F5EED3', text: '#8C6D1F', label: item.status_label || item.status }
  })()

  // Nguồn tiếp nhận chuẩn hóa tiếng Việt (Xóa icon trang trí thừa)
  const sourceLabel = (() => {
    if (item.source === 'DRONE_AI') return 'Thiết bị bay quét'
    if (item.source === 'CITIZEN') return item.reporter_name || 'Người dân báo'
    return 'Đội tuần tra'
  })()

  return (
    <div
      onClick={() => onSelectCase(item)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`rounded-[20px] overflow-hidden flex flex-col justify-between cursor-pointer select-none relative ${
        isSelected ? 'ring-2 ring-brand-gold' : ''
      }`}
      style={{
        border: `1.5px solid ${isHovered ? styleConfig.dot : isSelected ? '#C9A227' : styleConfig.border}`,
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
        {/* Hàng 1: Chấm màu tròn 10px + Halo 4px + Tên lỗi + Badges (Ưu tiên & Trạng thái) */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="w-[10px] h-[10px] rounded-full shrink-0"
              style={{
                backgroundColor: styleConfig.dot,
                boxShadow: `0 0 0 4px ${styleConfig.halo}`
              }}
            />
            <h3
              className="text-sm font-bold text-slate-900 truncate tracking-tight font-sansation"
              title={item.defect_title}
            >
              {item.defect_title}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            <span
              className="rounded-full text-[11px] font-bold px-[14px] py-[5px] whitespace-nowrap"
              style={{
                backgroundColor: priorityBadge.bg,
                color: priorityBadge.text
              }}
            >
              {priorityBadge.label}
            </span>
            <span
              className="rounded-full text-[11px] font-bold px-[14px] py-[5px] whitespace-nowrap"
              style={{
                backgroundColor: statusBadge.bg,
                color: statusBadge.text
              }}
            >
              {statusBadge.label}
            </span>
          </div>
        </div>

        {/* Hàng 2: Meta (Nguồn tiếp nhận • Tuyến + Km • Thời gian) — Không icon trang trí */}
        <div className="text-xs text-slate-500 font-medium flex items-center flex-wrap gap-x-2 gap-y-1">
          <span className="text-slate-800 font-semibold">{sourceLabel}</span>
          <span>•</span>
          <span className="text-slate-700">{item.project_name || 'Chưa gán dự án'}</span>
          <span>•</span>
          <span className="font-mono text-slate-700">
            {item.stationing || 'Lý trình cập nhật'}
          </span>
          {item.lane && (
            <>
              <span>•</span>
              <span>{item.lane}</span>
            </>
          )}
          <span>•</span>
          <span>{item.time_ago}</span>
        </div>

        {/* Hàng 3: Mô tả ngắn 1-2 dòng + Thumbnail GPS nhỏ gọn */}
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed flex-1">
            {item.description || item.pm_notes || 'Ghi nhận hiện trường đang chờ kỹ sư đối chiếu và thẩm định phân cấp.'}
          </p>
          {item.image_url && (
            <div className="relative w-12 h-10 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
              <img
                src={item.image_url}
                alt={item.defect_title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[7px] font-mono text-white text-center py-0.2">
                GPS
              </div>
            </div>
          )}
        </div>

        {/* Khối Nhóm gộp (nếu là master case) */}
        {isMaster && (
          <div className="pt-1">
            <button
              type="button"
              onClick={(e) => onToggleExpandMaster(item.id, e)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer transition-colors border border-slate-200"
            >
              <Icon name="link" size={13} className="text-slate-500" />
              <span>
                {isExpanded ? 'Ẩn' : 'Xem'} {item.linked_report_ids?.length} báo cáo trùng đã gộp
              </span>
              <Icon name={isExpanded ? 'expand_less' : 'expand_more'} size={13} />
            </button>

            {/* Danh sách các case con khi mở rộng */}
            {isExpanded && childReports.length > 0 && (
              <div
                className="mt-2.5 space-y-2 p-2.5 rounded-xl bg-white/80 border border-slate-200 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-[11px] font-bold text-slate-700">
                  Hồ sơ con đã gộp ({childReports.length}):
                </div>
                {childReports.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-mono font-bold text-[11px] text-slate-800">
                        {child.code}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {child.source === 'CITIZEN' ? child.reporter_name || 'Người dân báo' : 'Tuần tra'} • {child.defect_title}
                      </div>
                    </div>
                    {!isSupervisor && (
                      <button
                        type="button"
                        onClick={(e) => onUnlinkReport(child.id, e)}
                        className="text-[10px] text-rose-600 hover:text-rose-800 hover:underline font-semibold cursor-pointer shrink-0"
                      >
                        Tách gộp
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hàng 4: Phân cách nhẹ */}
        <div className="border-t border-slate-200/60 my-0.5" />

        {/* Hàng 5: Mã code Monospace + Nút Hành Động */}
        <div
          className="flex items-center justify-between gap-3 pt-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            {!isSupervisor && (
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => onToggleSelectReport(item.id, e as any)}
                className="w-4 h-4 rounded text-brand-gold focus:ring-brand-gold accent-brand-gold cursor-pointer"
                title="Chọn hồ sơ để thao tác hàng loạt"
              />
            )}
            <span className="font-mono text-xs font-bold text-slate-800 tracking-wider">
              {item.code}
            </span>
            {isUnassigned && !isSupervisor && (
              <button
                type="button"
                onClick={(e) => onOpenTriageProject(item, e)}
                className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 rounded px-1.5 py-0.5 hover:bg-amber-200 transition-colors cursor-pointer"
                title="Điều phối gán dự án"
              >
                Gán dự án
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {!isSupervisor && item.cluster_duplicates &&
              item.cluster_duplicates.length > 0 &&
              !item.cluster_duplicates.every((d) => d.is_merged) && (
                <button
                  type="button"
                  onClick={() => onOpenMergeModal(item)}
                  className="p-1.5 rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                  title={`Có ${item.cluster_duplicates.length} báo cáo trùng lân cận. Bấm để gộp.`}
                >
                  <Icon name="call_merge" size={14} />
                </button>
              )}

            <button
              type="button"
              onClick={() => onSelectCase(item)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-brand-gold text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>{isSupervisor ? 'Xem hồ sơ' : 'Thẩm định'}</span>
              <Icon name="arrow_forward" size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
