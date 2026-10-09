import React from 'react'
import { DataDeletionRequest } from '../../../types/domain'

export interface DeletionRequestsCardProps {
  deletionRequests: DataDeletionRequest[]
  isSupervisor: boolean
  handleRejectDeletion: (requestId: string) => void
  handleApprovePurge: (requestId: string) => void
  onViewDetail?: (req: DataDeletionRequest) => void
}

export const DeletionRequestsCard: React.FC<DeletionRequestsCardProps> = ({
  deletionRequests,
  isSupervisor,
  handleRejectDeletion,
  handleApprovePurge,
  onViewDetail
}) => {
  return (
    <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-rose-600">
              delete
            </span>
            {isSupervisor
              ? 'Thẩm Duyệt Yêu Cầu Hủy Hồ Sơ Lưu Trữ'
              : 'Theo Dõi Đề Xuất Hủy Dữ Liệu Bảo Hành'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isSupervisor
              ? 'Thẩm định hồ sơ đề xuất giải phóng dữ liệu hết hạn bảo hành từ Chỉ huy trưởng'
              : 'Danh sách các đề xuất hủy dữ liệu Drone và hồ sơ đo đạc đã trình Giám sát'}
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold self-start sm:self-auto font-mono">
          {deletionRequests.filter((r) => r.status === 'PENDING_APPROVAL').length} yêu cầu chờ duyệt
        </span>
      </div>

      {/* Danh sách các yêu cầu xóa dữ liệu */}
      <div className="space-y-3">
        {deletionRequests.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs">
            Chưa có yêu cầu hủy dữ liệu nào trong hệ thống.
          </div>
        ) : (
          deletionRequests.map((req) => {
            const isBlockedByHold = req.blocked_by_legal_hold
            const isRetentionNotExpired = !req.is_eligible_5years
            const isPending = req.status === 'PENDING_APPROVAL'
            const isPurged = req.status === 'APPROVED_PURGED'
            const isRejected = req.status === 'REJECTED'

            return (
              <div
                key={req.id}
                className={`p-4 rounded-xl border space-y-3 transition-all ${
                  isPurged
                    ? 'bg-slate-50/70 border-slate-200 opacity-80'
                    : isBlockedByHold
                    ? 'bg-rose-50/40 border-rose-200'
                    : isRetentionNotExpired
                    ? 'bg-amber-50/40 border-amber-200'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                {/* Header yêu cầu */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {req.request_code}
                    </span>
                    {isBlockedByHold ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">lock</span>
                        BỊ KHÓA BỞI PHONG TỎA PHÁP LÝ
                      </span>
                    ) : isRetentionNotExpired ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">schedule</span>
                        CHƯA ĐỦ THỜI HẠN (DƯỚI 5 NĂM)
                      </span>
                    ) : isPurged ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">verified</span>
                        ĐÃ PHÊ DUYỆT XÓA DỮ LIỆU
                      </span>
                    ) : isRejected ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">cancel</span>
                        ĐÃ TỪ CHỐI ĐỀ XUẤT
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        ĐỦ ĐIỀU KIỆN XÓA (TRÊN 5 NĂM)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">
                      {req.requested_at}
                    </span>
                    <button
                      type="button"
                      onClick={() => onViewDetail?.(req)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                      title="Xem chi tiết đề xuất"
                    >
                      <span className="material-symbols-outlined text-[15px] text-slate-500">
                        visibility
                      </span>
                      <span>Chi tiết</span>
                    </button>
                  </div>
                </div>

                {/* Nội dung tóm tắt dữ liệu đề xuất xóa */}
                <div className="text-xs text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                  <div>
                    <span className="text-slate-500">Dự án:</span>{' '}
                    <strong className="text-slate-900">{req.project_name}</strong>{' '}
                    <span className="text-slate-500 font-mono text-[11px]">(Hạn BH: {req.warranty_end_date})</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Hạng mục tệp:</span>{' '}
                    <span className="font-semibold text-slate-800">{req.data_description}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-600 text-[11px] pt-1">
                    <span>
                      Dung lượng: <strong className="text-slate-900 font-mono">{req.data_size_gb} GB</strong>
                    </span>
                    <span>
                      Thời gian sau bảo hành:{' '}
                      <strong className="text-slate-900">
                        {req.years_since_warranty > 0 ? `${req.years_since_warranty.toFixed(1)} năm` : 'Đang trong hạn'}
                      </strong>
                    </span>
                    <span>
                      Người gửi: <strong>{req.requested_by_name}</strong>
                    </span>
                  </div>
                  <div className="text-slate-600 italic text-[11px] pt-0.5">
                    "{req.justification_notes}"
                  </div>
                </div>

                {/* Cảnh báo lý do từ chối nếu có */}
                {req.rejection_reason && (
                  <div className="p-2.5 rounded-lg bg-rose-50 text-rose-800 text-[11px] flex items-center gap-2 font-medium border border-rose-200">
                    <span className="material-symbols-outlined text-[16px] text-rose-600 shrink-0">
                      warning
                    </span>
                    <span>Lý do từ chối: {req.rejection_reason}</span>
                  </div>
                )}

                {/* Nút hành động */}
                {isPending && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="text-[11px]">
                      {isBlockedByHold ? (
                        <span className="text-rose-700 font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">lock</span>
                          Nút xóa bị khóa: Thanh tra đang niêm phong hồ sơ
                        </span>
                      ) : isRetentionNotExpired ? (
                        <span className="text-amber-700 font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          Nút xóa bị khóa: Chưa đủ điều kiện 5 năm sau bảo hành
                        </span>
                      ) : isSupervisor ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          Đủ điều kiện phê duyệt giải phóng an toàn
                        </span>
                      ) : (
                        <span className="text-slate-500 font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
                          Đang chờ Giám sát thẩm duyệt hồ sơ
                        </span>
                      )}
                    </div>

                    {isSupervisor && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRejectDeletion(req.id)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
                        >
                          Từ chối
                        </button>

                        <button
                          type="button"
                          disabled={isBlockedByHold || isRetentionNotExpired}
                          onClick={() => handleApprovePurge(req.id)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs ${
                            isBlockedByHold || isRetentionNotExpired
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                              : 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[15px]">delete_forever</span>
                          <span>Phê duyệt xóa</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
