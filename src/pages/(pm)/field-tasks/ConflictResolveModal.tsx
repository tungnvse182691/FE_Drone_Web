import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { SyncConflictItem } from '../../../types/domain'

export interface ConflictResolveModalProps {
  isResolveModalOpen: boolean
  setIsResolveModalOpen: (open: boolean) => void
  selectedConflict: SyncConflictItem
  pendingDecision:
    | 'ACCEPT_INCOMING'
    | 'KEEP_SERVER_STATE'
    | 'FORK_NEW_ATTEMPT'
    | 'SUBMIT_RESCUE_TO_SUP'
    | 'AUTHORIZE_RESCUE'
    | 'SUPERVISOR_REJECT_RESCUE'
    | null
  resolutionReason: string
  setResolutionReason: (reason: string) => void
  handleExecuteResolution: (e: React.FormEvent) => void
}

export const ConflictResolveModal: React.FC<ConflictResolveModalProps> = ({
  isResolveModalOpen,
  setIsResolveModalOpen,
  selectedConflict,
  pendingDecision,
  resolutionReason,
  setResolutionReason,
  handleExecuteResolution
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
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 flex items-center justify-center cursor-pointer"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <form onSubmit={handleExecuteResolution} className="p-5 space-y-4">
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
                    ? 'Công nhận kết quả Tổ 02 (Thu hồi Đội 01)'
                    : selectedConflict?.conflict_type === 'POLICY_VERSION_MISMATCH'
                    ? 'Đặc cách duyệt Fast Track (v1.8)'
                    : selectedConflict?.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                    ? 'Chọn bản Máy chính (38mm)'
                    : 'Chấp thuận bản Hiện trường')}
                {pendingDecision === 'KEEP_SERVER_STATE' &&
                  (selectedConflict?.conflict_type === 'ASSIGNMENT_REASSIGNED'
                    ? 'Từ chối kết quả Tổ 02 (Giữ Đội 01)'
                    : selectedConflict?.conflict_type === 'POLICY_VERSION_MISMATCH'
                    ? 'Từ chối Fast Track (Chuyển duyệt đợt v2.2)'
                    : selectedConflict?.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                    ? 'Chọn bản Máy phụ (45mm)'
                    : selectedConflict?.conflict_type === 'AGGREGATE_VERSION_CONFLICT'
                    ? 'Từ chối số liệu nộp muộn (BR-26)'
                    : 'Từ chối bản Hiện trường')}
                {pendingDecision === 'FORK_NEW_ATTEMPT' &&
                  (selectedConflict?.conflict_type === 'AGGREGATE_VERSION_CONFLICT'
                    ? 'Tạo phụ lục đợt mới (BR-26)'
                    : 'Hợp nhất thủ công (Manual Merge)')}
                {pendingDecision === 'SUBMIT_RESCUE_TO_SUP' && 'Trình Giám sát ký số cứu hộ (Q17 / Quyết định 42A)'}
                {pendingDecision === 'AUTHORIZE_RESCUE' && 'Ký số phê duyệt cứu hộ (Q17)'}
                {pendingDecision === 'SUPERVISOR_REJECT_RESCUE' && 'Từ chối gói cứu hộ'}
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
              Lý do phân giải kỹ thuật <span className="text-rose-500">*</span>:
            </label>
            <textarea
              required
              rows={3}
              value={resolutionReason}
              onChange={(e) => setResolutionReason(e.target.value)}
              placeholder="Nhập lý do phân giải..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-gold leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsResolveModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!resolutionReason.trim()}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition shadow-2xs ${
                !resolutionReason.trim()
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-brand-gold hover:bg-brand-goldMuted text-white cursor-pointer'
              }`}
            >
              Xác nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
