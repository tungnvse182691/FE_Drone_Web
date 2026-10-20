import React, { useEffect, useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { DefectItem, WorkMode } from './types'
import { fastTrackService } from '../../../api/services/fastTrackService'

export interface DispatchActionBarProps {
  selectedDefectIds: string[]
  surveyDistanceM: number
  selectedItems: DefectItem[]
  setSelectedDefectIds: React.Dispatch<React.SetStateAction<string[]>>
  showToast: (msg: string) => void
  workMode: WorkMode
  handleDispatchBatch: () => void
  handleRepairDirect: () => void
  handleEmergencyDispatch: () => void
  hasViolationItem: boolean
  isSupervisor?: boolean
  eligibilityMap?: Record<string, { eligible: boolean; missingReasons: string[]; loading: boolean }>
}

export const DispatchActionBar: React.FC<DispatchActionBarProps> = ({
  selectedDefectIds,
  surveyDistanceM,
  selectedItems,
  setSelectedDefectIds,
  showToast,
  workMode,
  handleDispatchBatch,
  handleRepairDirect,
  handleEmergencyDispatch,
  hasViolationItem,
  isSupervisor = false,
  eligibilityMap
}) => {
  const [internalChecking, setInternalChecking] = useState(false)
  const [singleItemResult, setSingleItemResult] = useState<{
    eligible: boolean
    missingReasons: string[]
  } | null>(null)

  useEffect(() => {
    if (eligibilityMap || selectedItems.length !== 1) {
      setSingleItemResult(null)
      setInternalChecking(false)
      return
    }

    let isMounted = true
    setInternalChecking(true)
    fastTrackService
      .checkEligibility(selectedItems[0].id)
      .then((res) => {
        if (!isMounted) return
        setSingleItemResult(res)
      })
      .catch(() => {
        if (!isMounted) return
        setSingleItemResult({
          eligible: false,
          missingReasons: ['Lỗi kiểm tra điều kiện API-146.']
        })
      })
      .finally(() => {
        if (isMounted) setInternalChecking(false)
      })

    return () => {
      isMounted = false
    }
  }, [selectedItems, eligibilityMap])

  const firstItem = selectedItems[0]
  const firstItemFromMap = firstItem && eligibilityMap ? eligibilityMap[firstItem.id] : null
  const isChecking = firstItemFromMap ? firstItemFromMap.loading : internalChecking
  const firstItemEligible = firstItemFromMap
    ? firstItemFromMap.eligible
    : singleItemResult
    ? singleItemResult.eligible
    : (firstItem?.isFastTrackEligible ?? false)
  const firstItemMissingReasons = firstItemFromMap?.missingReasons?.length
    ? firstItemFromMap.missingReasons
    : singleItemResult?.missingReasons?.length
    ? singleItemResult.missingReasons
    : firstItem?.violationReason
    ? [firstItem.violationReason]
    : []
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 bg-white rounded-[20px] border border-[#E2E5E9] shadow-2xs">
      {/* Selection Summary */}
      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-900 text-sm">
            {isSupervisor
              ? `Hồ sơ khảo sát: ${selectedDefectIds.length} khiếm khuyết trên tuyến`
              : `Đã chọn: ${selectedDefectIds.length} khiếm khuyết`}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600">
            Tổng chiều dài khảo sát:{' '}
            <strong className="text-slate-900 font-mono font-bold">{surveyDistanceM} m</strong>
          </span>
          {hasViolationItem && (
            <span className="inline-flex items-center gap-1 px-[14px] py-[5px] rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#B91C1C] border border-[#E6A8A8]">
              <Icon name="report" size={13} className="text-[#B91C1C]" />
              {isSupervisor ? 'Có lỗi vi phạm ngưỡng xử lý nhanh' : 'Chặn giao việc: Có lỗi vượt ngưỡng'}
            </span>
          )}
        </div>
        <div className="text-slate-500 flex items-center gap-1.5 flex-wrap text-[11px]">
          <Icon name="groups" size={14} className="text-[#C9A227]" />
          <span>
            {isSupervisor ? (
              <>Đội thi công phụ trách: <strong className="text-slate-900 font-semibold">{selectedItems[0]?.assignedCrew || 'Đang chờ PM phân công'}</strong></>
            ) : (
              <>Phân bổ sơ bộ: <strong className="text-slate-900 font-semibold">{selectedItems[0]?.assignedCrew || 'Chưa chỉ định'}</strong> (Bấm nút bên phải để phát lệnh chính thức)</>
            )}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 flex-wrap justify-end">
        {isSupervisor ? (
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
            <Icon name="visibility" size={16} className="text-brand-gold shrink-0" />
            <span className="font-medium">Chế độ giám sát hiện trường (Chỉ xem) • Thẩm quyền giao việc thuộc Chỉ huy trưởng (PM)</span>
          </div>
        ) : (
          <>
            <button
              onClick={() => setSelectedDefectIds([])}
              type="button"
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            >
              Hủy chọn
            </button>
            <button
              onClick={() => showToast('Đã lưu nháp cấu hình phân bổ nhiệm vụ vào hồ sơ dự án.')}
              type="button"
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            >
              Lưu nháp phân công
            </button>

            {/* Dynamic Buttons based on workMode */}
            {workMode === 'MEASURE_ONLY' && (
              <div className="relative group">
                <button
                  onClick={handleDispatchBatch}
                  disabled={selectedDefectIds.length === 0 || hasViolationItem}
                  type="button"
                  className={`px-5 py-2 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 ${
                    selectedDefectIds.length === 0 || hasViolationItem
                      ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                      : 'bg-brand-gold hover:bg-[#B38E1F] text-white cursor-pointer'
                  }`}
                >
                  <Icon name="send" size={14} />
                  <span>Giao việc gom lô đo đạc ({selectedDefectIds.length} khiếm khuyết)</span>
                </button>
                {hasViolationItem && (
                  <div className="absolute bottom-full mb-2 right-0 hidden group-hover:flex items-center px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-medium whitespace-nowrap shadow-lg z-30 pointer-events-none">
                    <Icon name="report" size={14} className="text-rose-400 mr-1 shrink-0" />
                    Khóa: Không thể giao việc xử lý nhanh khi có khiếm khuyết vi phạm ngưỡng!
                  </div>
                )}
              </div>
            )}

            {workMode === 'INSPECT_AND_REPAIR' && (
              <div className="relative group">
                <button
                  onClick={handleRepairDirect}
                  disabled={hasViolationItem || !firstItemEligible || isChecking || selectedDefectIds.length !== 1}
                  type="button"
                  className={`px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all ${
                    hasViolationItem || !firstItemEligible || isChecking || selectedDefectIds.length !== 1
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                  }`}
                >
                  {isChecking ? (
                    <>
                      <Icon name="progress_activity" size={14} className="animate-spin text-slate-500" />
                      <span>Đang kiểm tra API-146...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="build" size={14} />
                      <span>Phát lệnh Đo &amp; Sửa ngay (1 khiếm khuyết)</span>
                    </>
                  )}
                </button>
                {(hasViolationItem || !firstItemEligible || selectedDefectIds.length !== 1) && !isChecking && (
                  <div className="absolute bottom-full mb-2 right-0 hidden group-hover:flex items-center px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-medium whitespace-nowrap shadow-lg z-30 pointer-events-none">
                    <Icon name="report" size={14} className="text-rose-400 mr-1 shrink-0" />
                    {hasViolationItem || !firstItemEligible
                      ? `Khóa: ${firstItemMissingReasons[0] || 'Khiếm khuyết không đủ điều kiện xử lý nhanh (API-146)'}`
                      : 'Quy tắc BR-08: Chế độ Đo & Sửa ngay chỉ áp dụng cho đúng 1 lỗi đạt chuẩn'}
                  </div>
                )}
              </div>
            )}

            {workMode === 'EMERGENCY' && (
              <div className="flex items-center gap-2.5">
                {firstItemEligible && (
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs font-semibold animate-pulse">
                    <Icon name="warning" size={16} className="text-amber-600 shrink-0" />
                    <span>Lưu ý: Hư hỏng #{selectedItems[0]?.code} đủ chuẩn xử lý nhanh thông thường!</span>
                  </div>
                )}
                {!firstItemEligible && selectedItems[0] && (
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 text-xs font-semibold">
                    <Icon name="local_fire_department" size={16} className="text-rose-600 shrink-0" />
                    <span>
                      Hư hỏng #{selectedItems[0]?.code} không đủ điều kiện ({firstItemMissingReasons[0] || 'Vượt ngưỡng'}) — Khắc phục tạm thông xe (Hậu kiểm sau)
                    </span>
                  </div>
                )}
                <div className="relative group">
                  <button
                    onClick={handleEmergencyDispatch}
                    disabled={selectedDefectIds.length !== 1 || isChecking}
                    type="button"
                    className={`px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all ${
                      selectedDefectIds.length !== 1 || isChecking
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        : 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                    }`}
                  >
                    {isChecking ? (
                      <>
                        <Icon name="progress_activity" size={14} className="animate-spin text-slate-500" />
                        <span>Đang kiểm tra API-146...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="local_fire_department" size={14} />
                        <span>Phát lệnh Xử lý khẩn cấp (Ưu tiên 24/7)</span>
                      </>
                    )}
                  </button>
                  {selectedDefectIds.length !== 1 && !isChecking && (
                    <div className="absolute bottom-full mb-2 right-0 hidden group-hover:flex items-center px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-medium whitespace-nowrap shadow-lg z-30 pointer-events-none">
                      <Icon name="report" size={14} className="text-rose-400 mr-1 shrink-0" />
                      Chỉ chọn đúng 1 vị trí nguy hiểm để điều động xe khẩn cấp
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
