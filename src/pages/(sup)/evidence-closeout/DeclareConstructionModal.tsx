import React, { useState } from 'react'
import { CaseItem } from './types'
import { AcceptancePackage } from '../../../api/services/acceptanceService'
import { NO_DATA, fmtTime, missingReasonText, repairStateLabel } from './acceptanceLabels'

/**
 * Hộp thoại xác nhận thao tác nghiệm thu theo vai trò (dữ liệu từ bản nộp hiện hành):
 *  - normal: PM review ACCEPT (chấp nhận hồ sơ và trình Giám sát)
 *  - fast-track: PM review ACCEPT (nếu chưa có) rồi final-confirmation
 *  - supervisor-final: Giám sát final-confirmation (Normal)
 * Không có bằng chứng/lời khai/cam kết điền sẵn. Contract review chỉ nhận fieldSubmissionId + decision + reason.
 */
export type ReviewModalVariant = 'normal' | 'fast-track' | 'supervisor-final'

export interface DeclareConstructionModalProps {
  isOpen: boolean
  onClose: () => void
  currentPackage: AcceptancePackage | null
  currentItem: CaseItem
  variant?: ReviewModalVariant
  busy?: boolean
  error?: string
  onConfirmDeclaration: (notes: string) => void
}

const TITLE: Record<ReviewModalVariant, string> = {
  normal: 'Chấp nhận hồ sơ và trình Giám sát',
  'fast-track': 'Chấp nhận hồ sơ và đóng Fast Track',
  'supervisor-final': 'Giám sát xác nhận nghiệm thu',
}
const SUBTITLE: Record<ReviewModalVariant, string> = {
  normal: 'PM đánh giá: review ACCEPT cho bản nộp hiện hành; sau đó Giám sát xác nhận cuối',
  'fast-track': 'PM chấp nhận (review ACCEPT) rồi xác nhận cuối Fast Track — hai bước tuần tự, đọc lại trạng thái giữa hai bước',
  'supervisor-final': 'Xác nhận cuối (final-confirmation) cho hồ sơ PM đã chấp nhận',
}
const CHECK_TEXT: Record<ReviewModalVariant, string> = {
  normal: 'Tôi đã đối chiếu bản nộp hiện hành (ảnh, số đo, mốc thời gian) và quyết định chấp nhận hồ sơ này.',
  'fast-track': 'Tôi đã đối chiếu bản nộp hiện hành và quyết định chấp nhận và đóng hạng mục Fast Track này.',
  'supervisor-final': 'Tôi đã đối chiếu hồ sơ PM đã chấp nhận và quyết định xác nhận nghiệm thu cuối.',
}

export const DeclareConstructionModal: React.FC<DeclareConstructionModalProps> = ({
  isOpen,
  onClose,
  currentPackage,
  currentItem,
  variant = 'normal',
  busy = false,
  error = '',
  onConfirmDeclaration
}) => {
  const [notes, setNotes] = useState('')
  const [checked, setChecked] = useState(false)

  if (!isOpen) return null

  const refs = [currentItem.before_ref, currentItem.after_ref, ...(currentItem.other_refs || [])].filter(Boolean) as NonNullable<CaseItem['before_ref']>[]
  const alreadyAccepted = variant === 'fast-track' && currentItem.be_state === 'Reviewed'
  // BE bắt buộc lý do cho final-confirmation; review ACCEPT thì ghi chú là tùy chọn.
  const noteRequired = variant !== 'normal'
  const canConfirm = checked && !busy && (!noteRequired || notes.trim().length > 0)

  return (
    <div role="dialog" aria-modal="true" aria-label={TITLE[variant]} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border-[1.5px] border-[#E2E5E9] space-y-4 animate-in fade-in zoom-in-95 relative overflow-hidden max-h-[92vh] overflow-y-auto">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A227] via-amber-500 to-amber-200" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#C9A227]">
              <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A1D20]">{TITLE[variant]}</h3>
              <p className="text-[11px] text-slate-500">{SUBTITLE[variant]}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Đóng"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Thông tin gói, hạng mục, bản nộp hiện hành */}
        <div className="bg-[#F8F9FA] p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-1 text-slate-600 font-medium">
            <span>Gói: <strong className="text-slate-900">{currentPackage?.code || NO_DATA}</strong></span>
            <span>Hạng mục: <strong className="text-slate-900 font-mono">{currentItem.item_code}</strong></span>
          </div>
          <div className="pt-1 border-t border-slate-200/80 text-[11px] text-slate-600 space-y-0.5">
            <div>Trạng thái hiện tại (BE): <strong className="text-slate-900">{repairStateLabel(currentItem.be_state)}</strong></div>
            <div>
              Bản nộp hiện hành: <strong className="text-slate-900">#{currentItem.submission_revision ?? '—'}</strong>{' '}
              <span className="font-mono text-[10px] text-slate-500">({currentItem.submission_id ? currentItem.submission_id.slice(0, 8).toUpperCase() : NO_DATA})</span>
            </div>
            <div>Crew nộp lúc: <strong className="text-slate-900">{fmtTime(currentItem.submitted_at)}</strong> • Kết thúc thi công: <strong className="text-slate-900">{fmtTime(currentItem.construction_end)}</strong></div>
            {currentItem.missing_reasons && currentItem.missing_reasons.length > 0 && (
              <div className="text-amber-800">BE ghi nhận: {currentItem.missing_reasons.map(missingReasonText).join('; ')}</div>
            )}
          </div>
        </div>

        {alreadyAccepted && (
          <p role="status" className="text-[11px] text-sky-800 bg-sky-50 border border-sky-200 rounded-lg px-3 py-2">
            Hồ sơ đã có PM ACCEPT hợp lệ (trạng thái Reviewed). Hệ thống sẽ KHÔNG gửi review trùng, chỉ thực hiện xác nhận cuối.
          </p>
        )}

        {/* Bằng chứng thật của bản nộp hiện hành (chỉ đọc) */}
        <div className="space-y-1.5 text-xs">
          <label className="font-semibold text-slate-700 uppercase tracking-wider text-[11px] block">Bằng chứng của bản nộp hiện hành ({refs.length})</label>
          {refs.length === 0 ? (
            <p className="text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">{NO_DATA}: bản nộp chưa có ảnh/bằng chứng.</p>
          ) : (
            <ul className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {refs.map((r) => (
                <li key={`${r.source}:${r.fileId}`} className="p-2 rounded-lg border border-slate-200 bg-white text-[11px] flex flex-wrap items-center justify-between gap-1">
                  <span className="font-semibold text-slate-800">{r.source === 'DEFECT_SOURCE' ? 'Ảnh nguồn khiếm khuyết' : r.purpose || 'Ảnh'}</span>
                  <span className="font-mono text-slate-500 text-[10px]">{r.fileId.slice(0, 8).toUpperCase()}{r.checksum ? ` · ${r.checksum.slice(0, 10)}…` : ''}</span>
                  <span className="text-slate-500 basis-full">Chụp: {fmtTime(r.capturedAt)}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-[10px] text-slate-500">Contract review chỉ nhận bản nộp hiện hành (fieldSubmissionId), quyết định và lý do; không gửi từng mã bằng chứng riêng.</p>
        </div>

        {/* Ghi chú của người thao tác */}
        <div className="space-y-1 text-xs">
          <label className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]" htmlFor="review-notes">
            {variant === 'supervisor-final' ? 'Lý do xác nhận cuối' : 'Ghi chú của PM'}{noteRequired ? ' (bắt buộc)' : ' (không bắt buộc)'}:
          </label>
          <textarea
            id="review-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={2000}
            disabled={busy}
            className="w-full px-3 py-2 bg-white border border-[#E2E5E9] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C9A227] text-xs text-slate-800"
            placeholder="Nhập nội dung do bạn tự đánh giá…"
          />
        </div>

        {/* Xác nhận của người thao tác (không tích sẵn) */}
        <label className="flex items-start gap-2 text-[11px] text-slate-700 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={checked}
            disabled={busy}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 rounded text-[#C9A227] focus:ring-[#C9A227]"
          />
          <span className="leading-tight">{CHECK_TEXT[variant]}</span>
        </label>

        {error && (
          <div role="alert" className="text-[11px] text-rose-800 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 break-words">{error}</div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => onConfirmDeclaration(notes)}
            className="px-4 py-2 bg-[#C9A227] hover:bg-[#8C6D1F] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">send</span>
            <span>{busy ? 'Đang gửi…' : variant === 'normal' ? 'Chấp nhận và trình Giám sát' : variant === 'fast-track' ? 'Chấp nhận và đóng Fast Track' : 'Xác nhận nghiệm thu'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
