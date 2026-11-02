import React, { useEffect, useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { DefectItem, PolicyThresholdConfig } from './types'
import { fastTrackService } from '../../../api/services/fastTrackService'

export interface DispatchTableProps {
  selectedDefectIds: string[]
  filteredDefects: DefectItem[]
  handleSelectAll: (checked: boolean) => void
  handleToggleSelect: (id: string) => void
  handleAssignCrew: (defectId: string, crew: string) => void
  setDetailDefect: (defect: DefectItem | null) => void
  hasViolationItem: boolean
  selectedItems: DefectItem[]
  currentPolicy: PolicyThresholdConfig | null
  onRemoveViolationItems?: () => void
  onNavigateProposals?: () => void
  isSupervisor?: boolean
  eligibilityMap?: Record<string, { eligible: boolean; missingReasons: string[]; loading: boolean }>
}

function formatDefectTypeVi(code?: string): string {
  if (!code) return 'Chưa phân loại'
  const c = code.toUpperCase()
  if (c.includes('POTHOLE')) return 'Ổ gà'
  if (c.includes('CRACK')) return 'Nứt mặt đường'
  if (c.includes('RUT')) return 'Vệt lún bánh xe'
  if (c.includes('RAVEL')) return 'Bong bật cốt liệu'
  return code
}

function formatSeverityVi(sev?: string): string {
  switch (sev?.toUpperCase()) {
    case 'LOW':
      return 'Thấp (Nhẹ)'
    case 'MEDIUM':
      return 'Trung bình (Vừa)'
    case 'HIGH':
      return 'Cao (Nặng)'
    case 'CRITICAL':
      return 'Khẩn cấp (Rất nặng)'
    default:
      return sev || 'Chưa xác định'
  }
}

function formatStatusVi(st?: string): string {
  switch (st?.toUpperCase()) {
    case 'OPEN':
      return 'Chờ xử lý'
    case 'IN_PROGRESS':
      return 'Đang thi công'
    case 'RESOLVED':
    case 'COMPLETED':
      return 'Đã hoàn thành'
    case 'CLOSED':
      return 'Đã đóng'
    default:
      return st || 'Đang theo dõi'
  }
}

interface DefectCardProps {
  defect: DefectItem
  index: number
  isChecked: boolean
  isSupervisor: boolean
  isEligible: boolean
  isLoadingEligibility: boolean
  missingReasons: string[]
  onToggleSelect: () => void
  onAssignCrew: (crew: string) => void
  onSetDetail: () => void
  onNavigateProposals?: () => void
}

const DefectCard: React.FC<DefectCardProps> = ({
  defect,
  index,
  isChecked,
  isSupervisor,
  isEligible,
  isLoadingEligibility,
  missingReasons,
  onToggleSelect,
  onSetDetail,
  onNavigateProposals
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const cfg = (() => {
    if (!isEligible) {
      return {
        border: '#E6A8A8',
        gradient: 'linear-gradient(90deg, #B91C1C 0%, #7F1D1D 100%)',
        dot: '#B91C1C',
        halo: 'rgba(185, 28, 28, 0.15)',
        bgTint: 'linear-gradient(180deg, #FEF2F2 0%, #ffffff 45%)',
        hoverShadow: '0 12px 28px rgba(185, 28, 28, 0.15)'
      }
    }
    return {
      border: '#A7C4B8',
      gradient: 'linear-gradient(90deg, #047857 0%, #065F46 100%)',
      dot: '#047857',
      halo: 'rgba(4, 120, 87, 0.15)',
      bgTint: 'linear-gradient(180deg, #F0FDF7 0%, #ffffff 45%)',
      hoverShadow: '0 12px 28px rgba(4, 120, 87, 0.15)'
    }
  })()

  return (
    <div
      onClick={onToggleSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        border: `1.5px solid ${isChecked && !isSupervisor ? '#C9A227' : cfg.border}`,
        background: cfg.bgTint,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered
          ? cfg.hoverShadow
          : isChecked && !isSupervisor
          ? '0 0 0 2px rgba(201, 162, 39, 0.35), 0 4px 12px rgba(0,0,0,0.05)'
          : '0 1px 3px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      className="relative rounded-2xl p-4 flex flex-col justify-between cursor-pointer group"
    >
      <div className="space-y-3">
        {/* Header thẻ: Mã khiếm khuyết & Mức độ */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: cfg.dot, boxShadow: `0 0 0 4px ${cfg.halo}` }}
            />
            <div>
              <span className={`font-mono font-bold text-sm ${isEligible ? 'text-slate-900' : 'text-[#B91C1C]'}`}>
                {defect.code}
              </span>
              <span className="ml-2 text-xs font-bold text-slate-800">
                {formatDefectTypeVi(defect.defectTypeCode)}
              </span>
            </div>
          </div>

          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            {isSupervisor ? (
              <span className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 text-[11px] font-bold flex items-center justify-center">
                #{index + 1}
              </span>
            ) : (
              <input
                type="checkbox"
                checked={isChecked}
                onChange={onToggleSelect}
                className="w-4 h-4 rounded text-brand-gold focus:ring-brand-gold/30 border-slate-300 cursor-pointer"
              />
            )}
          </div>
        </div>

        {/* Thông tin kỹ thuật từ CSDL */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
            <span className="text-[10px] text-slate-400 block font-medium">Mức độ nghiêm trọng</span>
            <span className={`font-bold ${
              defect.severity === 'HIGH' || defect.severity === 'CRITICAL' ? 'text-rose-700' : 'text-slate-800'
            }`}>
              {formatSeverityVi(defect.severity)}
            </span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
            <span className="text-[10px] text-slate-400 block font-medium">Trạng thái CSDL</span>
            <span className="font-bold text-slate-800">{formatStatusVi(defect.status)}</span>
          </div>
        </div>

        {/* Trạng thái thỏa mãn tiêu chuẩn xử lý nhanh */}
        <div className="pt-1">
          {isLoadingEligibility ? (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-300 animate-ping"></span>
              <span>Đang kiểm tra tiêu chuẩn kỹ thuật...</span>
            </div>
          ) : isEligible ? (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <Icon name="check_circle" size={13} className="text-emerald-600 shrink-0" />
              <span>Đủ điều kiện xử lý nhanh</span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                <Icon name="error" size={13} className="text-rose-600 shrink-0" />
                <span>Không đủ điều kiện xử lý nhanh</span>
              </div>
              {missingReasons.length > 0 && (
                <p className="text-[10px] text-rose-600 leading-tight">
                  {missingReasons.join('; ')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer thẻ */}
      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
        <div className="text-[11px] text-slate-500 truncate">
          Phụ trách: <strong className="text-slate-700">{defect.assignedCrew || 'Chưa chỉ định'}</strong>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onSetDetail()
          }}
          className="text-[#C9A227] hover:text-[#b08d20] font-bold text-xs inline-flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <span>Chi tiết</span>
          <Icon name="chevron_right" size={14} />
        </button>
      </div>
    </div>
  )
}

export const DispatchTable: React.FC<DispatchTableProps> = ({
  selectedDefectIds,
  filteredDefects,
  handleSelectAll,
  handleToggleSelect,
  handleAssignCrew,
  setDetailDefect,
  hasViolationItem,
  selectedItems,
  currentPolicy,
  onRemoveViolationItems,
  onNavigateProposals,
  isSupervisor = false,
  eligibilityMap
}) => {
  const isAllSelected =
    filteredDefects.length > 0 && selectedDefectIds.length === filteredDefects.length

  return (
    <div className="space-y-4">
      {/* Thanh chọn tất cả */}
      {!isSupervisor && filteredDefects.length > 0 && (
        <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="w-4 h-4 rounded text-brand-gold focus:ring-brand-gold/30 border-slate-300 cursor-pointer"
            />
            <span>Chọn tất cả ({filteredDefects.length} vị trí)</span>
          </label>
          <span className="text-slate-500 font-medium">
            Đã chọn: <strong className="text-slate-900">{selectedDefectIds.length}</strong> mục
          </span>
        </div>
      )}

      {/* Grid danh sách thẻ */}
      {filteredDefects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 space-y-2">
          <Icon name="inbox" size={36} className="text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-700 text-sm">Không có dữ liệu khiếm khuyết trên dự án này</h4>
          <p className="text-xs text-slate-400">
            CSDL hiện tại chưa ghi nhận khiếm khuyết nào khớp với bộ lọc được chọn.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDefects.map((defect, index) => {
            const el = eligibilityMap?.[defect.id]
            const isChecked = selectedDefectIds.includes(defect.id)
            const isLoadingEligibility = el ? el.loading : false
            const isEligible = el ? el.eligible : defect.isFastTrackEligible
            const missingReasons = el?.missingReasons?.length
              ? el.missingReasons
              : defect.violationReason
              ? [defect.violationReason]
              : []

            return (
              <DefectCard
                key={defect.id}
                defect={defect}
                index={index}
                isChecked={isChecked}
                isSupervisor={isSupervisor}
                isEligible={isEligible}
                isLoadingEligibility={isLoadingEligibility}
                missingReasons={missingReasons}
                onToggleSelect={() => handleToggleSelect(defect.id)}
                onAssignCrew={(crew) => handleAssignCrew(defect.id, crew)}
                onSetDetail={() => setDetailDefect(defect)}
                onNavigateProposals={onNavigateProposals}
              />
            )
          })}
        </div>
      )}

      {/* CẢNH BÁO KHI CÓ HẠNG MỤC VƯỢT NGƯỠNG */}
      {hasViolationItem && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-rose-800 font-medium">
            <Icon name="warning" size={18} className="text-rose-600 shrink-0" />
            <span>Có hạng mục vi phạm tiêu chuẩn xử lý nhanh (Mức độ nghiêm trọng cao hoặc vượt ngưỡng quy chuẩn).</span>
          </div>
          {onRemoveViolationItems && !isSupervisor && (
            <button
              onClick={onRemoveViolationItems}
              type="button"
              className="px-3 py-1 bg-white hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-300 shadow-2xs shrink-0 cursor-pointer"
            >
              Bỏ chọn lỗi vi phạm
            </button>
          )}
        </div>
      )}
    </div>
  )
}
