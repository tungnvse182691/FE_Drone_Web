import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { SyncConflictItem } from '../../../types/domain'

export interface ConflictResolveModalProps {
  isResolveModalOpen: boolean
  setIsResolveModalOpen: (open: boolean) => void
  selectedConflict: SyncConflictItem | null
  pendingDecision:
    | 'ACCEPT_INCOMING'
    | 'KEEP_SERVER_STATE'
    | 'FORK_NEW_ATTEMPT'
    | 'SUBMIT_RESCUE_TO_SUP'
    | 'AUTHORIZE_RESCUE'
    | 'SUPERVISOR_REJECT_RESCUE'
    | 'REQUEST_ADDITIONAL_EVIDENCE'
    | null
  resolutionReason: string
  setResolutionReason: (reason: string) => void
  handleExecuteResolution: (e: React.FormEvent) => void
  isSubmitting?: boolean
  errorMessage?: string | null
  onClearError?: () => void
}

export const ConflictResolveModal: React.FC<ConflictResolveModalProps> = ({
  isResolveModalOpen,
  setIsResolveModalOpen,
  selectedConflict,
  pendingDecision,
  resolutionReason,
  setResolutionReason,
  handleExecuteResolution,
  isSubmitting = false,
  errorMessage = null,
  onClearError
}) => {
  if (!isResolveModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-brand-border overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-brand-border bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="verified_user" size={18} className="text-brand-gold" />
            <h3 className="font-bold text-sm text-slate-900">
              Xác Nhận Quyết Định Phân Giải
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsResolveModalOpen(false)}
            disabled={isSubmitting}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <form onSubmit={handleExecuteResolution} className="p-5 space-y-4">
          {/* Thông báo lỗi đơn giản, không chèn icon */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
              <span>{errorMessage}</span>
              {onClearError && (
                <button
                  type="button"
                  onClick={onClearError}
                  className="text-rose-500 hover:text-rose-700 cursor-pointer ml-2 text-xs font-bold"
                  aria-label="Đóng"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Mã xung đột:</span>
              <span className="font-mono font-bold text-slate-900">{selectedConflict?.conflict_code}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Lý trình:</span>
              <span className="font-mono text-slate-800">{selectedConflict?.chainage}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200/80 pt-1.5 mt-1.5">
              <span className="text-slate-500">Quyết định:</span>
              <span className="font-bold text-brand-goldMuted">
                {pendingDecision === 'ACCEPT_INCOMING' &&
                  (selectedConflict?.conflict_type === 'ASSIGNMENT_REASSIGNED'
                    ? `Công nhận ${selectedConflict.offline_actor.name} (Bác bỏ ${selectedConflict.server_state.current_assignee})`
                    : selectedConflict?.conflict_type === 'POLICY_VERSION_MISMATCH'
                    ? 'Công nhận số đo hiện trường'
                    : selectedConflict?.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                    ? 'Chọn bản Máy chính'
                    : 'Chấp thuận bản Hiện trường')}
                {pendingDecision === 'KEEP_SERVER_STATE' &&
                  (selectedConflict?.conflict_type === 'ASSIGNMENT_REASSIGNED'
                    ? `Công nhận ${selectedConflict.server_state.current_assignee} (Bác bỏ ${selectedConflict.offline_actor.name})`
                    : selectedConflict?.conflict_type === 'POLICY_VERSION_MISMATCH'
                    ? 'Giữ nguyên chính sách máy chủ'
                    : selectedConflict?.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                    ? 'Chọn bản Máy phụ'
                    : selectedConflict?.conflict_type === 'AGGREGATE_VERSION_CONFLICT'
                    ? 'Từ chối số liệu nộp muộn'
                    : 'Từ chối bản Hiện trường')}
                {pendingDecision === 'FORK_NEW_ATTEMPT' &&
                  (selectedConflict?.conflict_type === 'AGGREGATE_VERSION_CONFLICT'
                    ? 'Tạo phụ lục đợt mới'
                    : 'Hợp nhất thủ công')}
                {pendingDecision === 'SUBMIT_RESCUE_TO_SUP' && 'Trình Giám sát xác nhận cứu hộ'}
                {pendingDecision === 'AUTHORIZE_RESCUE' && 'Xác nhận dữ liệu cứu hộ'}
                {pendingDecision === 'SUPERVISOR_REJECT_RESCUE' && 'Từ chối gói cứu hộ'}
                {pendingDecision === 'REQUEST_ADDITIONAL_EVIDENCE' && 'Yêu cầu đo lại & Bổ sung ảnh bằng chứng'}
              </span>
            </div>
          </div>

          {/* BẢNG CHỌN TỪNG TRƯỜNG DỮ LIỆU KHI HỢP NHẤT THỦ CÔNG (BR-16 / Q04) */}
          {pendingDecision === 'FORK_NEW_ATTEMPT' && (
            <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Icon name="call_split" size={14} className="text-brand-gold" />
                  Chọn trường dữ liệu giữ lại từ 2 nguồn:
                </span>
                <span className="text-[10px] text-amber-800 font-medium">Đối soát thủ công</span>
              </div>

              <div className="space-y-1.5 divide-y divide-amber-200/40">
                {/* 1. Đội thi công */}
                <div className="pt-1.5 flex items-center justify-between gap-2">
                  <span className="text-slate-600 font-medium w-36 shrink-0">1. Đội thi công:</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                      <input
                        type="radio"
                        name="merge_assignee"
                        value="CLIENT"
                        defaultChecked
                        className="text-brand-gold focus:ring-brand-gold"
                      />
                      <span>Hiện trường ({selectedConflict?.offline_actor?.team?.substring(0, 10)}...)</span>
                    </label>
                    <label className="flex items-center gap-1 text-[11px] cursor-pointer text-slate-500">
                      <input
                        type="radio"
                        name="merge_assignee"
                        value="SERVER"
                        className="text-brand-gold focus:ring-brand-gold"
                      />
                      <span>Server ({selectedConflict?.server_state?.current_assignee?.substring(0, 10)}...)</span>
                    </label>
                  </div>
                </div>

                {/* 2. Số đo & Bằng chứng */}
                <div className="pt-1.5 flex items-center justify-between gap-2">
                  <span className="text-slate-600 font-medium w-36 shrink-0">2. Số đo & Ảnh:</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                      <input
                        type="radio"
                        name="merge_measurement"
                        value="CLIENT"
                        defaultChecked
                        className="text-brand-gold focus:ring-brand-gold"
                      />
                      <span>Hiện trường ({selectedConflict?.incoming_data?.measured_value})</span>
                    </label>
                    <label className="flex items-center gap-1 text-[11px] cursor-pointer text-slate-500">
                      <input
                        type="radio"
                        name="merge_measurement"
                        value="SERVER"
                        className="text-brand-gold focus:ring-brand-gold"
                      />
                      <span>Server (Khảo sát gốc)</span>
                    </label>
                  </div>
                </div>

                {/* 3. Thời điểm hoàn thành */}
                <div className="pt-1.5 flex items-center justify-between gap-2">
                  <span className="text-slate-600 font-medium w-36 shrink-0">3. Thời điểm:</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                      <input
                        type="radio"
                        name="merge_time"
                        value="CLIENT"
                        defaultChecked
                        className="text-brand-gold focus:ring-brand-gold"
                      />
                      <span>Hiện trường ({selectedConflict?.offline_actor?.captured_at})</span>
                    </label>
                    <label className="flex items-center gap-1 text-[11px] cursor-pointer text-slate-500">
                      <input
                        type="radio"
                        name="merge_time"
                        value="SERVER"
                        className="text-brand-gold focus:ring-brand-gold"
                      />
                      <span>Server ({selectedConflict?.server_state?.last_updated})</span>
                    </label>
                  </div>
                </div>

                {/* 4. Tiêu chuẩn kỹ thuật */}
                <div className="pt-1.5 flex items-center justify-between gap-2">
                  <span className="text-slate-600 font-medium w-36 shrink-0">4. Tiêu chuẩn:</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                      <input
                        type="radio"
                        name="merge_policy"
                        value="SERVER"
                        defaultChecked
                        className="text-brand-gold focus:ring-brand-gold"
                      />
                      <span>Server ({selectedConflict?.server_state?.policy_version})</span>
                    </label>
                    <label className="flex items-center gap-1 text-[11px] cursor-pointer text-slate-500">
                      <input
                        type="radio"
                        name="merge_policy"
                        value="CLIENT"
                        className="text-brand-gold focus:ring-brand-gold"
                      />
                      <span>Cache ngoại tuyến</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {pendingDecision === 'SUBMIT_RESCUE_TO_SUP'
                ? 'Nội dung tờ trình gửi Giám sát'
                : pendingDecision === 'REQUEST_ADDITIONAL_EVIDENCE'
                ? 'Lý do & chỉ đạo kỹ thuật cho hiện trường'
                : 'Lý do phân giải kỹ thuật'}{' '}
              <span className="text-rose-500">*</span>:
            </label>
            <textarea
              required
              rows={3}
              value={resolutionReason}
              onChange={(e) => setResolutionReason(e.target.value)}
              placeholder={
                pendingDecision === 'SUBMIT_RESCUE_TO_SUP'
                  ? 'Ví dụ: Đã đối soát chip nhớ máy hỏng, số liệu vết nứt nguyên bản khớp TCVN, kính trình Giám sát phê duyệt hợp thức hóa...'
                  : pendingDecision === 'REQUEST_ADDITIONAL_EVIDENCE'
                  ? 'Ví dụ: Ảnh trích xuất bị lóa sáng không rõ vạch thước, yêu cầu tổ đo dùng máy dự phòng đo lại tại Km...'
                  : 'Nhập lý do phân giải...'
              }
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-gold leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsResolveModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!resolutionReason.trim() || isSubmitting}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition shadow-2xs flex items-center gap-1.5 ${
                !resolutionReason.trim() || isSubmitting
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-brand-gold hover:bg-brand-goldMuted text-white cursor-pointer'
              }`}
            >
              {isSubmitting && (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span>
                {isSubmitting
                  ? 'Đang ghi nhận CSDL...'
                  : pendingDecision === 'SUBMIT_RESCUE_TO_SUP'
                  ? 'Gửi tờ trình'
                  : pendingDecision === 'REQUEST_ADDITIONAL_EVIDENCE'
                  ? 'Phát lệnh đo lại'
                  : 'Xác nhận'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
