import React from 'react'
import { DataDeletionRequest } from '../../../types/domain'

export interface DeletionRequestDetailModalProps {
  request: DataDeletionRequest | null
  isOpen: boolean
  isSupervisor: boolean
  onClose: () => void
  onApprove?: (requestId: string) => void
  onReject?: (requestId: string) => void
}

export const DeletionRequestDetailModal: React.FC<DeletionRequestDetailModalProps> = ({
  request,
  isOpen,
  isSupervisor,
  onClose,
  onApprove,
  onReject
}) => {
  if (!isOpen || !request) return null

  const isBlockedByHold = request.blocked_by_legal_hold
  const isRetentionNotExpired = !request.is_eligible_5years
  const isPending = request.status === 'PENDING_APPROVAL'
  const isPurged = request.status === 'APPROVED_PURGED'
  const isRejected = request.status === 'REJECTED'

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-brand-gold">
              folder_open
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Chi Tiết Yêu Cầu Hủy Hồ Sơ
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {request.request_code}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            title="Đóng cửa sổ"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Trạng thái duyệt */}
        <div className="px-5 pt-4 pb-1">
          {isBlockedByHold ? (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5 text-xs">
              <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0">
                lock
              </span>
              <div>
                <span className="font-bold block">
                  BỊ KHÓA BỞI PHONG TỎA PHÁP LÝ (LEGAL HOLD)
                </span>
                <span className="text-[11px] text-rose-700">
                  Dự án đang trong diện thanh tra. Mọi thao tác giải phóng hoặc hủy dữ liệu bị chặn tuyệt đối.
                </span>
              </div>
            </div>
          ) : isRetentionNotExpired ? (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-2.5 text-xs">
              <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0">
                schedule
              </span>
              <div>
                <span className="font-bold block">
                  CHƯA ĐỦ THỜI HẠN LƯU TRỮ (DƯỚI 5 NĂM)
                </span>
                <span className="text-[11px] text-amber-700">
                  Hồ sơ chưa đạt mốc 5 năm sau thời điểm kết thúc bảo hành công trình.
                </span>
              </div>
            </div>
          ) : isPurged ? (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 text-xs">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">
                verified
              </span>
              <span className="font-bold">
                ĐÃ PHÊ DUYỆT GIẢI PHÓNG DỮ LIỆU THÀNH CÔNG
              </span>
            </div>
          ) : isRejected ? (
            <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-start gap-2.5 text-xs">
              <span className="material-symbols-outlined text-[18px] text-slate-500 shrink-0">
                cancel
              </span>
              <div>
                <span className="font-bold block">
                  ĐỀ XUẤT ĐÃ BỊ TỪ CHỐI
                </span>
                {request.rejection_reason && (
                  <span className="text-[11px] text-slate-600">
                    Lý do: {request.rejection_reason}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-2 text-xs">
              <span className="material-symbols-outlined text-[18px] text-blue-600">
                hourglass_top
              </span>
              <span className="font-bold">
                ĐANG CHỜ GIÁM SÁT THẨM DUYỆT (KIỂM SOÁT 4 MẮT)
              </span>
            </div>
          )}
        </div>

        {/* Chi tiết nội dung hồ sơ đề xuất */}
        <div className="p-5 space-y-3 text-xs overflow-y-auto max-h-[50vh]">
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 text-[11px] block">Dự án công trình:</span>
              <span className="font-semibold text-slate-800">{request.project_name}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Thời hạn bảo hành:</span>
              <span className="font-semibold text-slate-800">
                {request.warranty_end_date} ({request.years_since_warranty.toFixed(1)} năm)
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Loại tệp đề xuất xóa:</span>
              <span className="font-semibold text-slate-800">{request.data_type}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Dung lượng giải phóng:</span>
              <span className="font-semibold text-brand-goldDark">{request.data_size_gb} GB</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 text-[11px] block">Người lập đề xuất:</span>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
              <span className="font-semibold text-slate-800">{request.requested_by_name}</span>
              <span className="text-slate-400 text-[11px]">• {request.requested_at}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 text-[11px] block">Mô tả tệp dữ liệu:</span>
            <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 leading-relaxed text-[11px]">
              {request.data_description}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 text-[11px] block">Căn cứ &amp; Giải trình pháp lý:</span>
            <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 leading-relaxed text-[11px]">
              "{request.justification_notes}"
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            Đóng
          </button>

          {isSupervisor && isPending && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onReject?.(request.id)
                  onClose()
                }}
                className="px-3.5 py-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
              >
                Từ chối
              </button>
              <button
                type="button"
                disabled={isBlockedByHold || isRetentionNotExpired}
                onClick={() => {
                  onApprove?.(request.id)
                  onClose()
                }}
                className={`px-4 py-2 rounded-lg text-white text-xs font-bold transition shadow-xs ${
                  isBlockedByHold || isRetentionNotExpired
                    ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                    : 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                }`}
              >
                Phê duyệt xóa
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
