import React from 'react'
import { CaseItem } from './types'
import { repairStateLabel } from './acceptanceLabels'

export interface ActionButtonsProps {
  currentItem: CaseItem
  isSupervisorView: boolean
  isPMView: boolean
  allItemsAccepted?: boolean
  isCaseClosed?: boolean
  /** Đang gửi lệnh hoặc đang tải lại: khóa mọi nút ghi. */
  busy?: boolean
  onOpenExportModal: () => void
  onOpenReworkModal: () => void
  onAcceptItem: () => void
  onPMCloseFastTrack: () => void
  onPMSubmitToSupervisor: () => void
  onOpenCloseCaseModal?: () => void
}

const primary = 'px-3.5 h-8 font-medium text-xs rounded-md shadow-xs transition flex items-center gap-1.5 bg-[#C9A227] hover:bg-[#8C6D1F] active:bg-[#6B5219] text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#C9A227]'
const danger = 'px-3 h-8 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-medium text-xs rounded-md shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white'
const doneChip = 'inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium bg-[#E9F7EC] text-[#2F9E44] border border-[#C3E6CB]'

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  currentItem,
  isSupervisorView,
  isPMView,
  isCaseClosed = false,
  busy = false,
  onOpenExportModal,
  onOpenReworkModal,
  onAcceptItem,
  onPMCloseFastTrack,
  onPMSubmitToSupervisor,
}) => {
  const be = currentItem.be_state
  const step = currentItem.pending_step
  const isFT = currentItem.track_type === 'FAST_TRACK'
  const hasHead = !!currentItem.submission_id && !!currentItem.task_id
  const accepted = currentItem.status === 'ACCEPTED'
  const cancelled = currentItem.status === 'CANCELLED'

  // Điều kiện bật từng thao tác theo trạng thái BE và bản nộp hiện hành (head). Lý do khóa luôn được nêu rõ.
  const pmReviewWhy: string | null =
    cancelled ? 'Hạng mục đã hủy.'
    : be !== 'Submitted' ? `Hạng mục đang ở "${repairStateLabel(be)}", không còn ở bước PM đánh giá.`
    : !hasHead ? 'Chưa có bản nộp hiện hành của Crew để đánh giá.'
    : step === 'SUPPLEMENT' ? 'Đã yêu cầu bổ sung; chờ Crew nộp bản bổ sung mới rồi mới đánh giá tiếp.'
    : null
  const ftCloseWhy: string | null = be === 'Reviewed' ? null : pmReviewWhy
  const supConfirmWhy: string | null =
    cancelled ? 'Hạng mục đã hủy.'
    : isFT ? 'Fast Track do PM xác nhận cuối, Giám sát không xác nhận ở nhánh này.'
    : be === 'Reviewed' ? null
    : be === 'Submitted' ? (step === 'SUPPLEMENT' ? 'PM đã yêu cầu bổ sung; chưa có bản nộp mới được PM chấp nhận.' : 'PM chưa chấp nhận hồ sơ (chưa có review ACCEPT) nên Giám sát chưa xác nhận được.')
    : `Hạng mục đang ở "${repairStateLabel(be)}", chưa ở bước Giám sát xác nhận.`

  const lock = isSupervisorView ? (accepted ? null : supConfirmWhy) : isPMView ? (accepted ? null : isFT ? ftCloseWhy : pmReviewWhy) : null

  return (
    <div className="flex flex-col items-end gap-1.5">
    <div className="flex items-center flex-wrap gap-2 justify-end">
      {/* Nút Xuất Hồ Sơ Bằng Chứng RPT-07 (Secondary CTA) */}
      <button
        onClick={onOpenExportModal}
        type="button"
        className="px-3 h-8 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium text-xs rounded-md shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
        title="Kết xuất hồ sơ bằng chứng số (PDF/A hoặc ZIP)"
      >
        <span className="material-symbols-outlined text-[16px] text-slate-600">download</span>
        <span>Xuất hồ sơ</span>
      </button>

      {cancelled && (
        <span className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">
          <span className="material-symbols-outlined text-[16px]">cancel</span>
          <span>Đã hủy</span>
        </span>
      )}

      {/* SUPERVISOR ACTIONS */}
      {isSupervisorView && !cancelled && (
        <>
          {/* Yêu cầu sửa lại sau quyết định là hiệu chỉnh (corrections) ở màn Đề xuất sửa chữa; review SUPPLEMENT chỉ dành cho PM. */}
          {!isCaseClosed && (
            <button
              type="button"
              disabled
              className="px-3 h-8 font-medium text-xs rounded-md shadow-2xs flex items-center gap-1.5 border bg-white text-rose-700 border-rose-300 opacity-50 cursor-not-allowed"
              title="Giám sát không gửi được review SUPPLEMENT (chỉ PM). Hiệu chỉnh/sửa lại sau quyết định thực hiện ở 'Xử lý ngoại lệ và hiệu chỉnh' của Đề xuất sửa chữa."
            >
              <span className="material-symbols-outlined text-[16px] text-rose-600">replay</span>
              <span>Yêu cầu sửa lại</span>
            </button>
          )}

          {!accepted ? (
            <button
              onClick={onAcceptItem}
              type="button"
              disabled={busy || !!supConfirmWhy}
              title={supConfirmWhy || 'Giám sát xác nhận cuối (final-confirmation) cho hồ sơ PM đã chấp nhận'}
              className={primary}
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Chấp thuận nghiệm thu</span>
            </button>
          ) : (
            <span className={doneChip}>
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Đã nghiệm thu đạt</span>
            </span>
          )}
        </>
      )}

      {/* PROJECT MANAGER ACTIONS */}
      {isPMView && !cancelled && (
        <>
          {!isCaseClosed && !accepted && (
            <button
              onClick={onOpenReworkModal}
              type="button"
              disabled={busy || !!pmReviewWhy}
              title={pmReviewWhy || 'PM review SUPPLEMENT: yêu cầu Crew bổ sung hồ sơ (không phải yêu cầu sửa chữa lại)'}
              className={danger}
            >
              <span className="material-symbols-outlined text-[16px] text-rose-600">upload_file</span>
              <span>Yêu cầu bổ sung hồ sơ</span>
            </button>
          )}

          {isFT ? (
            !accepted ? (
              <button
                onClick={onPMCloseFastTrack}
                type="button"
                disabled={busy || !!ftCloseWhy}
                title={ftCloseWhy || 'Chấp nhận hồ sơ (review ACCEPT nếu chưa có) rồi xác nhận cuối Fast Track'}
                className={primary}
              >
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                <span>Chấp thuận &amp; Đóng Fast Track</span>
              </button>
            ) : (
              <span className={doneChip}>
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Fast Track đã đóng (BR-25)</span>
              </span>
            )
          ) : !accepted ? (
            be === 'Reviewed' ? (
              <span className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium bg-[#FEF3E2] text-[#B45309] border border-[#FDE68A]">
                <span className="material-symbols-outlined text-[16px]">hourglass_top</span>
                <span>PM đã chấp nhận — chờ Giám sát xác nhận</span>
              </span>
            ) : (
              <button
                onClick={onPMSubmitToSupervisor}
                type="button"
                disabled={busy || !!pmReviewWhy}
                title={pmReviewWhy || 'PM review ACCEPT bản nộp hiện hành rồi chuyển Giám sát xác nhận cuối'}
                className={primary}
              >
                <span className="material-symbols-outlined text-[16px]">assignment_turned_in</span>
                <span>Chấp nhận hồ sơ và trình Giám sát</span>
              </button>
            )
          ) : (
            <span className={doneChip}>
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Giám sát đã xác nhận</span>
            </span>
          )}
        </>
      )}
    </div>
    {lock && !cancelled && (
      <p role="status" data-testid="action-lock-reason" className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1 max-w-md text-right">
        Chưa thao tác được: {lock}
      </p>
    )}
    </div>
  )
}
export default ActionButtons
