import React from 'react'
import {
  Gavel,
  Trash2,
  Lock,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react'
import { LegalHoldProject, DataDeletionRequest } from '../../../types/domain'

interface RetentionLegalHoldTabProps {
  legalHoldProjects: LegalHoldProject[]
  deletionRequests: DataDeletionRequest[]
  isSupervisor: boolean
  handleToggleLegalHold: (projectId: string) => void
  handleRejectDeletion: (requestId: string) => void
  handleApprovePurge: (requestId: string) => void
}

export const RetentionLegalHoldTab: React.FC<RetentionLegalHoldTabProps> = ({
  legalHoldProjects,
  deletionRequests,
  isSupervisor,
  handleToggleLegalHold,
  handleRejectDeletion,
  handleApprovePurge
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full">
      {/* Cột trái (5 cols): Cơ chế Đóng băng pháp lý (Legal Hold) */}
      <div className="lg:col-span-5 bg-white border border-[#E2E5E9] rounded-xl shadow-sm p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E9]">
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-[#BA1A1A]" />
            <h2 className="text-sm font-bold text-[#151C27]">
              Cơ chế Đóng băng pháp lý (Legal Hold)
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#FFDAD6] text-[#BA1A1A] font-mono text-[11px] font-bold border border-[#FFCDD2]">
            Quy tắc BR-45
          </span>
        </div>

        <p className="text-xs text-[#555F6F] leading-relaxed">
          Thiết lập giữ hồ sơ tranh chấp thanh tra phục vụ các cơ quan quản lý nhà nước (Bộ GTVT, Cục ĐBVN). Khi kích hoạt, chức năng xóa đối với dự án này bị vô hiệu hóa hoàn toàn trên toàn bộ hệ thống.
        </p>

        {/* Danh sách các dự án và công tắc Legal Hold */}
        <div className="space-y-3">
          {legalHoldProjects.map((proj) => (
            <div
              key={proj.project_id}
              className={`p-3.5 rounded-xl border transition-all ${
                proj.is_legal_hold
                  ? 'bg-[#FFDAD6]/30 border-[#FFCDD2]'
                  : 'bg-[#F8F9FA] border-[#E2E5E9]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-[#151C27]">{proj.project_name}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 bg-white rounded border border-[#E2E5E9] text-[#555F6F]">
                      {proj.project_code}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#555F6F]">
                    Hạn bảo hành: <span className="font-semibold text-[#151C27]">{proj.warranty_end_date}</span>{' '}
                    {proj.is_warranty_expired ? (
                      <span className="text-[#059669] font-semibold">
                        (Hết hạn đã {proj.years_since_warranty_end.toFixed(1)} năm)
                      </span>
                    ) : (
                      <span className="text-[#3D4756] font-medium">(Đang trong bảo hành)</span>
                    )}
                  </div>
                </div>

                {/* Công tắc Bật/Tắt Legal Hold */}
                <div className="flex flex-col items-end gap-1">
                  <label className={`relative inline-flex items-center ${isSupervisor ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                    <input
                      type="checkbox"
                      disabled={!isSupervisor}
                      checked={proj.is_legal_hold}
                      onChange={() => handleToggleLegalHold(proj.project_id)}
                      className="sr-only peer"
                    />
                    <div
                      className={`w-10 h-5 bg-[#DCE2F3] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${
                        !isSupervisor ? 'opacity-50' : ''
                      } peer-checked:bg-[#C9A227]`}
                    ></div>
                  </label>
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      proj.is_legal_hold ? 'text-[#BA1A1A]' : 'text-[#7A7768]'
                    }`}
                  >
                    {proj.is_legal_hold ? 'HOLD BẬT' : 'HOLD TẮT'}
                  </span>
                  {!isSupervisor && (
                    <span className="text-[9px] text-[#7A7768] italic">
                      (Chỉ Giám sát mới có quyền)
                    </span>
                  )}
                </div>
              </div>

              {/* Chi tiết căn cứ thanh tra nếu Legal Hold đang bật */}
              {proj.is_legal_hold && (
                <div className="mt-2.5 pt-2 border-t border-[#FFCDD2] text-[11px] text-[#93000A] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#BA1A1A]">Cơ quan yêu cầu:</span>
                    <span className="font-semibold text-right">{proj.hold_authority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#BA1A1A]">Căn cứ văn bản:</span>
                    <span className="font-mono font-bold text-right">{proj.hold_reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#BA1A1A]">Lý do thanh tra:</span>
                    <span className="italic text-right max-w-[240px] truncate" title={proj.hold_reason}>
                      {proj.hold_reason}
                    </span>
                  </div>
                  <div className="flex justify-between pt-0.5 text-[10px] text-[#BA1A1A]/80">
                    <span>Thời điểm niêm phong:</span>
                    <span className="font-mono">{proj.hold_since}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Ghi chú quy chuẩn BR-45 */}
        <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E2E5E9] text-[11px] text-[#555F6F] space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#151C27]">
            <Info className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Quy chuẩn thời hạn lưu trữ BR-45:</span>
          </div>
          <p className="leading-relaxed">
            Hồ sơ dự án phải được lưu trữ tối thiểu đến hết thời hạn bảo hành cộng thêm <strong>5 năm</strong>. Lệnh xóa dữ liệu chỉ có hiệu lực khi do <strong>Supervisor phê duyệt</strong>; mọi hồ sơ có tranh chấp (Legal Hold) bị nghiêm cấm xóa vĩnh viễn.
          </p>
        </div>
      </div>

      {/* Cột phải (7 cols): Thẩm duyệt yêu cầu xóa dữ liệu (Deletion Requests) */}
      <div className="lg:col-span-7 bg-white border border-[#E2E5E9] rounded-xl shadow-sm p-5 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E5E9]">
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
                    ? 'bg-[#F8F9FA]/60 border-[#E2E5E9] opacity-75'
                    : isBlockedByHold
                    ? 'bg-[#FFDAD6]/30 border-[#FFCDD2]'
                    : isRetentionNotExpired
                    ? 'bg-[#FBF6E9]/30 border-[#F3E6C4]'
                    : 'bg-white border-[#E2E5E9] shadow-sm'
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
                <div className="text-xs text-[#151C27] leading-relaxed bg-[#F8F9FA] p-2.5 rounded-lg border border-[#E2E5E9]">
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
                  <div className="flex items-center justify-between pt-1 border-t border-[#E2E5E9] text-xs">
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
                          className="px-3 py-1.5 rounded-lg border border-[#E2E5E9] hover:bg-[#F8F9FA] text-[#374151] text-xs font-semibold transition-colors"
                        >
                          Bác bỏ
                        </button>

                        <button
                          type="button"
                          disabled={isBlockedByHold || isRetentionNotExpired}
                          onClick={() => handleApprovePurge(req.id)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                            isBlockedByHold || isRetentionNotExpired
                              ? 'bg-[#E2E5E9] text-[#7A7768] cursor-not-allowed border border-[#CAC7B5]'
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
    </div>
  )
}
