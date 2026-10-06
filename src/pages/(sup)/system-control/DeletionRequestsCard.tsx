import React from 'react'
import {
  Trash2,
  Lock,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { DataDeletionRequest } from '../../../types/domain'

export interface DeletionRequestsCardProps {
  deletionRequests: DataDeletionRequest[]
  isSupervisor: boolean
  handleRejectDeletion: (requestId: string) => void
  handleApprovePurge: (requestId: string) => void
}

export const DeletionRequestsCard: React.FC<DeletionRequestsCardProps> = ({
  deletionRequests,
  isSupervisor,
  handleRejectDeletion,
  handleApprovePurge,
}) => {
  return (
    <div className="lg:col-span-7 bg-white border border-brand-border rounded-xl shadow-sm p-5 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-brand-border">
        <div>
          <h2 className="text-sm font-bold text-[#151C27] flex items-center gap-1.5">
            <Trash2 className="w-4 h-4 text-[#BA1A1A]" />
            {isSupervisor
              ? 'Thẩm duyệt yêu cầu xóa dữ liệu lưu trữ (FR-35, UAT-10)'
              : 'Theo dõi yêu cầu xóa dữ liệu bảo hành (FR-35, BR-45)'}
          </h2>
          <p className="text-xs text-[#555F6F]">
            {isSupervisor
              ? 'Xử lý các đề xuất giải phóng dữ liệu hết hạn bảo hành từ PM theo quy tắc BR-45'
              : 'Các yêu cầu giải phóng dữ liệu Drone và đo đạc đã trình lên Giám sát (Supervisor)'}
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-[#FBF6E9] border border-[#F3E6C4] text-[#8C6D15] text-xs font-semibold self-start sm:self-auto">
          {deletionRequests.filter((r) => r.status === 'PENDING_APPROVAL').length} yêu cầu chờ duyệt
        </span>
      </div>

      {/* Danh sách các yêu cầu xóa dữ liệu */}
      <div className="space-y-3">
        {deletionRequests.map((req) => {
          const isBlockedByHold = req.blocked_by_legal_hold
          const isRetentionNotExpired = !req.is_eligible_5years
          const isPending = req.status === 'PENDING_APPROVAL'
          const isPurged = req.status === 'APPROVED_PURGED'
          const isRejected = req.status === 'REJECTED'

          return (
            <div
              key={req.id}
              className={`p-4 rounded-xl border space-y-2.5 transition-all ${
                isPurged
                  ? 'bg-brand-surfaceAlt/60 border-brand-border opacity-75'
                  : isBlockedByHold
                  ? 'bg-[#FFDAD6]/30 border-[#FFCDD2]'
                  : isRetentionNotExpired
                  ? 'bg-[#FBF6E9]/30 border-[#F3E6C4]'
                  : 'bg-white border-brand-border shadow-sm'
              }`}
            >
              {/* Header yêu cầu */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-[#151C27]">
                    {req.request_code}
                  </span>
                  {isBlockedByHold ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FFDAD6] text-[#BA1A1A] border border-[#FFCDD2] flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      BỊ KHÓA BỞI ĐÓNG BĂNG PHÁP LÝ
                    </span>
                  ) : isRetentionNotExpired ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FFDAD6] text-[#BA1A1A] border border-[#FFCDD2] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      CHƯA ĐỦ THỜI HẠN (DƯỚI 5 NĂM)
                    </span>
                  ) : isPurged ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F0F2F5] text-[#555F6F]">
                      ĐÃ DUYỆT XÓA DỮ LIỆU
                    </span>
                  ) : isRejected ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FFDAD6] text-[#BA1A1A]">
                      ĐÃ TỪ CHỐI YÊU CẦU
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      ĐỦ ĐIỀU KIỆN XÓA (TRÊN 5 NĂM)
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-[#555F6F]">
                  Người đề xuất: <strong>{req.requested_by_name}</strong> • {req.requested_at}
                </span>
              </div>

              {/* Nội dung dữ liệu đề xuất xóa */}
              <div className="text-xs text-[#151C27] leading-relaxed bg-brand-surfaceAlt p-2.5 rounded-lg border border-brand-border">
                <div>
                  <strong>Dự án:</strong> {req.project_name} (Hạn BH: {req.warranty_end_date})
                </div>
                <div>
                  <strong>Nội dung tệp:</strong> {req.data_description}
                </div>
                <div className="flex items-center gap-4 text-[#555F6F] mt-1">
                  <span>
                    Dung lượng: <strong className="text-[#151C27]">{req.data_size_gb} GB</strong>
                  </span>
                  <span>
                    Thời gian sau bảo hành:{' '}
                    <strong className="text-[#151C27]">
                      {req.years_since_warranty > 0 ? `${req.years_since_warranty.toFixed(1)} năm` : 'Đang bảo hành'}
                    </strong>
                  </span>
                </div>
                <div className="text-[#555F6F] italic mt-1">
                  "Căn cứ: {req.justification_notes}"
                </div>
              </div>

              {/* Cảnh báo lý do từ chối nếu có */}
              {req.rejection_reason && (
                <div className="p-2 rounded-lg bg-[#FFDAD6] text-[#BA1A1A] text-[11px] flex items-center gap-1.5 font-medium border border-[#FFCDD2]">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#BA1A1A]" />
                  <span>Lý do từ chối: {req.rejection_reason}</span>
                </div>
              )}

              {/* Nút hành động */}
              {isPending && (
                <div className="flex items-center justify-between pt-1 border-t border-brand-border text-xs">
                  <div className="text-[11px] text-[#555F6F]">
                    {isBlockedByHold ? (
                      <span className="text-[#BA1A1A] font-semibold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Nút xóa bị khóa: Thanh tra đang niêm phong
                      </span>
                    ) : isRetentionNotExpired ? (
                      <span className="text-[#BA1A1A] font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Nút xóa bị khóa: Chưa hết bảo hành + 5 năm
                      </span>
                    ) : isSupervisor ? (
                      <span className="text-[#059669] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Đủ điều kiện phê duyệt an toàn
                      </span>
                    ) : (
                      <span className="text-[#8C6D15] font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Đang chờ Supervisor thẩm duyệt
                      </span>
                    )}
                  </div>

                  {isSupervisor && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRejectDeletion(req.id)}
                        className="px-3 py-1.5 rounded-lg border border-brand-border hover:bg-brand-surfaceAlt text-[#374151] text-xs font-semibold transition-colors"
                      >
                        Bác bỏ
                      </button>

                      <button
                        type="button"
                        disabled={isBlockedByHold || isRetentionNotExpired}
                        onClick={() => handleApprovePurge(req.id)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                          isBlockedByHold || isRetentionNotExpired
                            ? 'bg-brand-border text-[#7A7768] cursor-not-allowed border border-[#CAC7B5]'
                            : 'bg-[#BA1A1A] hover:bg-[#93000A] text-white cursor-pointer'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Phê duyệt xóa (Purge)</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
