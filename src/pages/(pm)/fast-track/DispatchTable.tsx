import React, { useEffect, useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { DefectItem, WorkMode, PolicyThresholdConfig } from './types'
import { fastTrackService } from '../../../api/services/fastTrackService'

export interface DispatchTableProps {
  workMode: WorkMode
  selectedDefectIds: string[]
  filteredDefects: DefectItem[]
  handleSelectAll: (checked: boolean) => void
  handleToggleSelect: (id: string) => void
  handleAssignCrew: (defectId: string, crew: string) => void
  setDetailDefect: (defect: DefectItem | null) => void
  hasViolationItem: boolean
  selectedItems: DefectItem[]
  currentPolicy: PolicyThresholdConfig
  onRemoveViolationItems?: () => void
  onNavigateProposals?: () => void
  isSupervisor?: boolean
  eligibilityMap?: Record<string, { eligible: boolean; missingReasons: string[]; loading: boolean }>
}

interface DefectCardProps {
  defect: DefectItem
  index: number
  workMode: WorkMode
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
  workMode,
  isChecked,
  isSupervisor,
  isEligible,
  isLoadingEligibility,
  missingReasons,
  onToggleSelect,
  onAssignCrew,
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
    if (isEligible) {
      return {
        border: '#A7C4B8',
        gradient: 'linear-gradient(90deg, #047857 0%, #065F46 100%)',
        dot: '#047857',
        halo: 'rgba(4, 120, 87, 0.15)',
        bgTint: 'linear-gradient(180deg, #F0FDF7 0%, #ffffff 45%)',
        hoverShadow: '0 12px 28px rgba(4, 120, 87, 0.15)'
      }
    }
    return {
      border: '#E5D8B4',
      gradient: 'linear-gradient(90deg, #C9A227 0%, #8C6D1F 100%)',
      dot: '#C9A227',
      halo: 'rgba(201, 162, 39, 0.15)',
      bgTint: 'linear-gradient(180deg, #FFFDF5 0%, #ffffff 45%)',
      hoverShadow: '0 12px 28px rgba(201, 162, 39, 0.15)'
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
      className="rounded-[20px] overflow-hidden relative flex flex-col justify-between cursor-pointer"
    >
      {/* 4px top gradient line */}
      <div className="h-1 w-full" style={{ background: cfg.gradient }} />

      <div className="p-4 sm:p-5 flex flex-col gap-3.5 flex-1 justify-between">
        {/* Phần trên: Header thẻ + Chấm tròn halo + Checkbox */}
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Dot 10px + Halo 4px */}
              <div className="relative flex items-center justify-center w-4 h-4 shrink-0 mt-0.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: cfg.dot }}
                />
                <span
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: cfg.halo }}
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`font-mono font-bold text-sm ${isEligible ? 'text-slate-900' : 'text-[#B91C1C]'}`}>
                    {defect.code}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {defect.type}
                  </span>
                </div>
              </div>
            </div>

            {/* Checkbox / Radio hoặc Index (Giám sát) */}
            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
              {isSupervisor ? (
                <span className="font-mono text-slate-400 font-bold text-xs bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  #{index + 1}
                </span>
              ) : (
                <div className="relative group">
                  <input
                    type={workMode === 'MEASURE_ONLY' ? 'checkbox' : 'radio'}
                    name="defect-selection"
                    disabled={isLoadingEligibility || (workMode === 'INSPECT_AND_REPAIR' && !isEligible)}
                    checked={isChecked}
                    onChange={onToggleSelect}
                    className={`w-4 h-4 cursor-pointer accent-[#C9A227] ${
                      workMode === 'MEASURE_ONLY' ? 'rounded' : 'rounded-full'
                    } disabled:opacity-30 disabled:cursor-not-allowed`}
                  />
                  {!isEligible && workMode === 'INSPECT_AND_REPAIR' && (
                    <div className="absolute right-full mr-2 top-0 hidden group-hover:flex items-center px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-medium whitespace-nowrap z-20 shadow-lg pointer-events-none">
                      <Icon name="lock" size={12} className="text-rose-400 mr-1" />
                      <span>{missingReasons[0] || 'Khóa: Đo & Sửa ngay chỉ áp dụng cho lỗi đạt chuẩn (API-146)'}</span>
                    </div>
                  )}
                  {!isEligible && workMode === 'EMERGENCY' && (
                    <div className="absolute right-full mr-2 top-0 hidden group-hover:flex items-center px-2.5 py-1 bg-rose-950 text-white rounded-lg text-[10px] font-medium whitespace-nowrap z-20 shadow-lg pointer-events-none">
                      <Icon name="warning" size={12} className="text-amber-400 mr-1" />
                      Khẩn cấp 24/7: Khắc phục tạm thông xe (Hậu kiểm sau)
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tuyến + Km & Kích thước */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {defect.stationing}
            </span>
            <span className="text-slate-500 font-mono text-[11px]">{defect.lane}</span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-slate-700">
              {defect.areaM2} m² / {defect.depthCm} cm
            </span>
          </div>

          {/* Badge đánh giá xử lý nhanh */}
          <div className="pt-1">
            {isLoadingEligibility ? (
              <span className="inline-flex items-center gap-1.5 px-[14px] py-[5px] rounded-full text-[11px] font-bold bg-[#F0F9FF] text-[#1E40AF] border border-[#B8C5D9]">
                <Icon name="progress_activity" size={13} className="animate-spin text-[#1E40AF]" />
                <span>Đang kiểm tra...</span>
              </span>
            ) : isEligible ? (
              <span className="inline-flex items-center gap-1.5 px-[14px] py-[5px] rounded-full text-[11px] font-bold bg-[#F0FDF7] text-[#047857] border border-[#A7C4B8]">
                <Icon name="check_circle" size={13} className="text-[#047857]" />
                <span>Đạt chuẩn xử lý nhanh</span>
              </span>
            ) : (
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-[14px] py-[5px] rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#B91C1C] border border-[#E6A8A8]">
                  <Icon name="report" size={13} className="text-[#B91C1C]" />
                  <span>Không đủ điều kiện (API-146)</span>
                </span>
                {missingReasons.length > 0 && (
                  <p className="text-[11px] text-[#B91C1C] font-medium line-clamp-1" title={missingReasons.join('; ')}>
                    {missingReasons[0]}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Phần dưới: Đội phân bổ + Thao tác */}
        <div
          className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Đội phân bổ */}
          <div className="flex-1 min-w-0">
            {isSupervisor ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 truncate">
                <Icon name="groups" size={14} className="text-slate-400 shrink-0" />
                <span className="truncate">{defect.assignedCrew || 'Chờ phân công'}</span>
              </span>
            ) : isEligible ? (
              <select
                value={defect.assignedCrew}
                onChange={(e) => onAssignCrew(e.target.value)}
                className="w-full px-2.5 py-1 bg-white border border-[#E2E5E9] rounded-xl text-xs font-semibold text-slate-700 hover:border-[#C9A227] focus:outline-none focus:ring-1 focus:ring-[#C9A227] cursor-pointer transition-colors"
              >
                <option value="Tổ tuần tra số 01">Tổ tuần tra số 01</option>
                <option value="Tổ đo đạc số 02">Tổ đo đạc số 02</option>
                <option value="Tổ cơ động">Tổ cơ động 03</option>
                <option value="Chưa chỉ định">Chưa chỉ định</option>
              </select>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                <Icon name="lock" size={13} className="text-slate-400" />
                <span>Chờ gom đợt</span>
              </span>
            )}
          </div>

          {/* Thao tác */}
          <div className="flex items-center gap-1.5 shrink-0">
            {!isSupervisor && !isEligible && onNavigateProposals && (
              <button
                onClick={onNavigateProposals}
                type="button"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#8C6D1F] border border-amber-200 text-[11px] font-bold cursor-pointer transition-colors shadow-2xs whitespace-nowrap"
                title="Đưa vào Gói đề xuất sửa chữa lớn để trình Giám sát thẩm duyệt"
              >
                <Icon name="arrow_forward" size={13} />
                <span>Gom đợt duyệt</span>
              </button>
            )}
            <button
              onClick={onSetDetail}
              type="button"
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 cursor-pointer transition-colors"
              title="Xem chi tiết trắc địa"
            >
              <Icon name="visibility" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const DispatchTable: React.FC<DispatchTableProps> = ({
  workMode,
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
  const [internalMap, setInternalMap] = useState<
    Record<string, { eligible: boolean; missingReasons: string[]; loading: boolean }>
  >({})

  const activeMap = eligibilityMap || internalMap

  useEffect(() => {
    if (eligibilityMap) return
    let isMounted = true
    const ids = filteredDefects.map((d) => d.id)
    if (ids.length === 0) return

    setInternalMap((prev) => {
      const next = { ...prev }
      for (const d of filteredDefects) {
        if (!next[d.id]) {
          next[d.id] = {
            eligible: d.isFastTrackEligible ?? true,
            missingReasons: d.violationReason ? [d.violationReason] : [],
            loading: true
          }
        }
      }
      return next
    })

    Promise.all(
      filteredDefects.map(async (d) => {
        const res = await fastTrackService.checkEligibility(d.id)
        return { id: d.id, res }
      })
    ).then((results) => {
      if (!isMounted) return
      setInternalMap((prev) => {
        const next = { ...prev }
        for (const { id, res } of results) {
          next[id] = {
            eligible: res.eligible,
            missingReasons: res.missingReasons || [],
            loading: false
          }
        }
        return next
      })
    })

    return () => {
      isMounted = false
    }
  }, [filteredDefects, eligibilityMap])

  // Chỉ đếm các item đạt chuẩn Fast Track theo API-146 để tính trạng thái Select All
  const eligibleDefects = filteredDefects.filter((d) => {
    const el = activeMap[d.id]
    return el ? el.eligible : d.isFastTrackEligible
  })
  const isAllEligibleSelected =
    workMode === 'MEASURE_ONLY' &&
    eligibleDefects.length > 0 &&
    eligibleDefects.every((d) => selectedDefectIds.includes(d.id))

  return (
    <div className="space-y-4">
      {/* Thanh công cụ Chọn tất cả (cho PM khi ở chế độ Gom lô đo đạc) */}
      {!isSupervisor && filteredDefects.length > 0 && (
        <div className="flex items-center justify-between pb-1 px-1">
          <label
            className={`inline-flex items-center gap-2 text-xs font-semibold text-slate-700 select-none ${
              workMode === 'MEASURE_ONLY' && eligibleDefects.length > 0
                ? 'cursor-pointer'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <input
              type="checkbox"
              disabled={workMode !== 'MEASURE_ONLY' || eligibleDefects.length === 0}
              title={
                workMode !== 'MEASURE_ONLY'
                  ? 'Chế độ Sửa nhanh/Khẩn cấp chỉ áp dụng cho 1 lỗi đơn lẻ (BR-08)'
                  : 'Chọn tất cả khiếm khuyết đạt chuẩn xử lý nhanh'
              }
              checked={isAllEligibleSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer accent-[#C9A227] disabled:opacity-30 disabled:cursor-not-allowed"
            />
            <span>
              Chọn tất cả ({eligibleDefects.length} khiếm khuyết đạt chuẩn xử lý nhanh)
            </span>
          </label>
          {selectedDefectIds.length > 0 && (
            <span className="text-xs text-amber-800 font-semibold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Đã chọn {selectedDefectIds.length} khiếm khuyết
            </span>
          )}
        </div>
      )}

      {/* LƯỚI THẺ KHIẾM KHUYẾT (Thay cho bảng dày đặc) */}
      {filteredDefects.length === 0 ? (
        <div className="bg-white border border-[#E2E5E9] rounded-[20px] p-12 text-center flex flex-col items-center justify-center space-y-2">
          <Icon name="search_off" size={36} className="text-slate-300" />
          <h4 className="text-sm font-bold text-slate-700">Không tìm thấy khiếm khuyết nào</h4>
          <p className="text-xs text-slate-400">
            Thử thay đổi bộ lọc tuyến đường hoặc trạng thái xử lý nhanh
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredDefects.map((defect, index) => {
            const isChecked = selectedDefectIds.includes(defect.id)
            const itemEligibility = activeMap[defect.id]
            const isLoadingEligibility = itemEligibility?.loading ?? false
            const isEligible = itemEligibility ? itemEligibility.eligible : defect.isFastTrackEligible
            const missingReasons = itemEligibility?.missingReasons?.length
              ? itemEligibility.missingReasons
              : defect.violationReason
              ? [defect.violationReason]
              : []

            return (
              <DefectCard
                key={defect.id}
                defect={defect}
                index={index}
                workMode={workMode}
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

      {/* WARNING BANNER CHẶN KHI CÓ HẠNG MỤC VƯỢT NGƯỠNG */}
      {hasViolationItem && (
        <div
          className="p-5 rounded-[20px] border shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
          style={{
            borderColor: '#E6A8A8',
            background: 'linear-gradient(180deg, #FEF2F2 0%, #ffffff 45%)'
          }}
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0 text-[#B91C1C] mt-0.5 shadow-2xs">
              <Icon name="report" size={22} />
            </div>
            <div className="space-y-1.5 text-xs">
              <h3 className="font-bold text-[#B91C1C] text-sm flex items-center gap-2">
                <span>
                  {isSupervisor
                    ? 'Cảnh báo Giám sát: Phát hiện khiếm khuyết không đủ điều kiện xử lý nhanh (API-146)'
                    : 'Chặn xuất quân: Phát hiện khiếm khuyết không đủ điều kiện xử lý nhanh (API-146)!'}
                </span>
              </h3>
              <div className="text-slate-700 leading-relaxed space-y-1">
                <p>
                  Hệ thống kiểm tra qua <strong>API-146</strong> xác định các khiếm khuyết sau không đủ điều kiện xử lý nhanh:
                </p>
                <div className="space-y-1 pl-1">
                  {selectedItems
                    .filter((d) => {
                      const el = activeMap[d.id]
                      return el ? !el.eligible : !d.isFastTrackEligible
                    })
                    .map((d) => {
                      const el = activeMap[d.id]
                      const reasons = el?.missingReasons?.length
                        ? el.missingReasons
                        : d.violationReason
                        ? [d.violationReason]
                        : ['Không đạt ngưỡng chính sách xử lý nhanh']
                      return (
                        <div key={d.id} className="text-[11px] text-rose-800 flex items-start gap-1 font-mono">
                          <span className="font-bold shrink-0">{d.code}:</span>
                          <span className="font-sans font-medium text-rose-700">{reasons.join('; ')}</span>
                        </div>
                      )
                    })}
                </div>
                <p className="text-[11px] text-slate-500 pt-0.5">
                  Theo quy định <strong className="text-rose-700">BR-04</strong>, các hư hỏng không đủ điều kiện này bắt buộc phải lập hồ sơ trình Giám sát duyệt.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {!isSupervisor && onRemoveViolationItems && (
              <button
                onClick={onRemoveViolationItems}
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-rose-50 text-rose-700 font-bold rounded-xl border border-rose-300 shadow-2xs text-xs cursor-pointer transition-colors"
              >
                <Icon name="delete" size={14} />
                <span>Loại bỏ lỗi vượt ngưỡng</span>
              </button>
            )}
            {onNavigateProposals && (
              <button
                onClick={onNavigateProposals}
                type="button"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1A1D20] hover:bg-black text-[#F1E5C6] font-bold rounded-xl shadow-xs text-xs cursor-pointer transition-colors"
              >
                <span>{isSupervisor ? 'Xem Gói đề xuất' : 'Chuyển sang Gói đề xuất'}</span>
                <Icon name="arrow_forward" size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
