import React from 'react'
import { ShieldCheck } from 'lucide-react'
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
            <div className="p-5 border-b border-brand-border bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-bold text-base text-slate-900 font-sansation">
                  Xác Nhận Quyết Định Phân Giải Xung Đột
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsResolveModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteResolution} className="p-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-[#FBF6E9]/50 border border-[#F1E5C6] space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Hồ sơ xung đột:</span>
                  <span className="font-mono font-bold text-brand-dark">{selectedConflict?.conflict_code}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Lý trình công trình:</span>
                  <span className="font-mono text-slate-800">{selectedConflict?.chainage}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Quyết định lựa chọn:</span>
                  <span className="font-bold text-[#8C6D1F]">
                    {pendingDecision === 'SUBMIT_RESCUE_TO_SUP' &&
                      'Trình Giám sát phê duyệt gói cứu hộ (Q17/Decision 42A)'}
                    {pendingDecision === 'AUTHORIZE_RESCUE' &&
                      'Ký số phê duyệt đưa gói dữ liệu cứu hộ vào kho chứng cứ số (Decision 42A)'}
                    {pendingDecision === 'SUPERVISOR_REJECT_RESCUE' &&
                      'Từ chối gói dữ liệu cứu hộ (Bắt buộc đo đạc lại ngoài hiện trường)'}
                    {pendingDecision === 'ACCEPT_INCOMING' &&
                      (selectedConflict?.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                        ? 'Chấp nhận bản đo chuẩn Thiết Bị 2 (Máy chính)'
                        : selectedConflict?.conflict_type === 'ASSIGNMENT_REASSIGNED'
                        ? 'Chấp nhận kết quả Đội 02 (Thu hồi lệnh Đội 01)'
                        : selectedConflict?.conflict_type === 'POLICY_VERSION_MISMATCH'
                        ? 'Chuyển sang Lập đợt sửa trình Giám sát duyệt (Policy v2.2)'
                        : selectedConflict?.conflict_type === 'AGGREGATE_VERSION_CONFLICT'
                        ? 'Chuyển số liệu nộp muộn vào Hàng đợi đợt sửa tiếp theo'
                        : 'Chấp nhận chứng cứ ngoại tuyến (Accept Incoming)')}
                    {pendingDecision === 'KEEP_SERVER_STATE' &&
                      (selectedConflict?.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                        ? 'Bảo lưu bản nộp sơ bộ Thiết Bị 1 (Máy phụ)'
                        : selectedConflict?.conflict_type === 'ASSIGNMENT_REASSIGNED'
                        ? 'Bảo lưu lệnh điều chuyển Đội 01 (Hủy kết quả Đội 02)'
                        : selectedConflict?.conflict_type === 'POLICY_VERSION_MISMATCH'
                        ? 'Bảo lưu chính sách v2.2 (Từ chối tự sửa Fast Track)'
                        : selectedConflict?.conflict_type === 'AGGREGATE_VERSION_CONFLICT'
                        ? 'Bảo lưu hồ sơ đã đóng (Từ chối số liệu nộp muộn)'
                        : selectedConflict?.conflict_type === 'DEVICE_RESCUE_PENDING'
                        ? 'Yêu cầu Đội thi công nộp bổ sung biên bản xác nhận sự cố thiết bị tại hiện trường'
                        : 'Bảo lưu trạng thái máy chủ (Keep Server State)')}
                    {pendingDecision === 'FORK_NEW_ATTEMPT' &&
                      (selectedConflict?.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                        ? 'Tách thành 2 bản đo đối chứng độc lập'
                        : selectedConflict?.conflict_type === 'ASSIGNMENT_REASSIGNED'
                        ? 'Tách thành 2 lần sửa chữa độc lập'
                        : selectedConflict?.conflict_type === 'POLICY_VERSION_MISMATCH'
                        ? 'Tách thành Đợt sửa chữa nền móng chuyên đề'
                        : selectedConflict?.conflict_type === 'AGGREGATE_VERSION_CONFLICT'
                        ? 'Tạo Phụ Lục Đợt Bổ Sung mới (Tuân thủ BR-26 / Invariant #3)'
                        : selectedConflict?.conflict_type === 'DEVICE_RESCUE_PENDING'
                        ? 'Bác bỏ dữ liệu hỏng & Giao Đội thi công ra đo đạc lại ngoài hiện trường'
                        : 'Tách thành lần sửa mới (Fork New Attempt)')}
                  </span>
                </div>
              </div>


              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Lý do phân giải kỹ thuật & Căn cứ kiểm toán (Bắt buộc)
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolutionReason}
                  onChange={(e) => setResolutionReason(e.target.value)}
                  placeholder="Nhập căn cứ nghiệp vụ (Ví dụ: Đã đối soát kích thước dưỡng đo 3m khớp với ảnh hiện trạng, xác nhận ảnh có mã hash SHA-256 nguyên bản...)"
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227] leading-relaxed"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-50 text-[11px] text-slate-500 border border-slate-200 space-y-1">
                <div>• Quyết định này sẽ được ký số và lưu vĩnh viễn vào nhật ký kiểm toán hệ thống.</div>
                <div>• Dữ liệu chứng cứ không được phép ghi đè mất lịch sử (Tuân thủ nguyên tắc D05 & 42A).</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResolveModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Hủy thao tác
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white text-xs font-bold bg-[#C9A227] hover:bg-[#8C6D1F] transition shadow-md font-sansation cursor-pointer"
                >
                  Xác nhận & Lưu vết Audit
                </button>
              </div>
            </form>
          </div>
        </div>
  )
}
