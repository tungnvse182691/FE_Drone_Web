import React from 'react'
import { Icon } from '../../../../components/ui/Icon'
import { SyncConflictItem } from '../../../../types/domain'

export interface ConflictResolutionActionsProps {
  selectedConflict: SyncConflictItem
  isPM: boolean
  isSupervisor: boolean
  handleOpenResolve: (
    decision:
      | 'ACCEPT_INCOMING'
      | 'KEEP_SERVER_STATE'
      | 'FORK_NEW_ATTEMPT'
      | 'SUBMIT_RESCUE_TO_SUP'
      | 'AUTHORIZE_RESCUE'
      | 'SUPERVISOR_REJECT_RESCUE'
  ) => void
}

export const ConflictResolutionActions: React.FC<ConflictResolutionActionsProps> = ({
  selectedConflict,
  isPM,
  isSupervisor,
  handleOpenResolve
}) => {
  return (
    <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
      <div className="text-[11px] text-slate-500">
        {selectedConflict.status === 'CONFLICT_INTAKE' ? (
          <span className="flex items-center gap-1 text-amber-700 font-semibold">
            <Icon name="schedule" size={14} /> Hồ sơ đang chờ quyết định xử lý
          </span>
        ) : (
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <Icon name="check_circle" size={14} /> Hồ sơ đã được chốt và lưu vết kiểm toán
          </span>
        )}
      </div>

      {/* NÚT THAO TÁC CHO PROJECT MANAGER (PM CHỈ HUY TRƯỞNG) */}
      {isPM && selectedConflict.status === 'CONFLICT_INTAKE' && (
        <div className="flex items-center gap-2 flex-wrap">
          {/* TRƯỜNG HỢP CA 3: DEVICE_RESCUE_PENDING (Tuân thủ Q17/Decision 42A - PM là Maker, không tự duyệt) */}
          {selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING' ? (
            <>
              <button
                type="button"
                onClick={() => handleOpenResolve('SUBMIT_RESCUE_TO_SUP')}
                className="px-3.5 py-2 rounded-xl text-white text-xs font-bold bg-purple-700 hover:bg-purple-800 transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                title="Theo Q17/42A: PM lập tờ trình gửi Supervisor ký số phê duyệt"
              >
                <Icon name="verified_user" size={16} className="text-amber-300" />
                <span>Trình Giám sát ký duyệt cứu hộ (Q17/42A)</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenResolve('KEEP_SERVER_STATE')}
                className="px-3 py-2 rounded-xl text-slate-700 text-xs font-semibold bg-slate-100 hover:bg-slate-200 transition border border-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Icon name="refresh" size={14} className="text-slate-500" />
                <span>Yêu cầu Đội thi công bổ sung biên bản</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenResolve('FORK_NEW_ATTEMPT')}
                className="px-3 py-2 rounded-xl text-white text-xs font-semibold bg-rose-700 hover:bg-rose-800 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Icon name="cancel" size={14} />
                <span>Bác bỏ dữ liệu hỏng & Giao Đội đo lại</span>
              </button>
            </>
          ) : selectedConflict.conflict_type === 'AGGREGATE_VERSION_CONFLICT' ? (
            /* TRƯỜNG HỢP CA 5: AGGREGATE_VERSION_CONFLICT (Tuân thủ BR-26 & Invariant #3 - Khóa cứng đợt cũ) */
            <>
              <button
                type="button"
                onClick={() => handleOpenResolve('FORK_NEW_ATTEMPT')}
                className="px-3.5 py-2 rounded-xl text-white text-xs font-bold bg-brand-gold hover:bg-brand-goldMuted transition shadow-sm flex items-center gap-1.5 cursor-pointer ring-2 ring-brand-gold/40"
                title="Tuân thủ BR-26: Tạo phụ lục đợt mới để giải ngân khối lượng nộp muộn"
              >
                <Icon name="call_split" size={16} />
                <span>Tạo Phụ Lục Đợt Bổ Sung (Tuân thủ BR-26)</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenResolve('KEEP_SERVER_STATE')}
                className="px-3 py-2 rounded-xl text-slate-700 text-xs font-semibold bg-slate-100 hover:bg-slate-200 transition border border-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Icon name="cancel" size={14} className="text-slate-500" />
                <span>Bảo lưu hồ sơ đã đóng (Từ chối số liệu)</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenResolve('ACCEPT_INCOMING')}
                className="px-3 py-2 rounded-xl text-slate-800 text-xs font-semibold bg-slate-100 hover:bg-slate-200 transition border border-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Icon name="archive" size={14} className="text-slate-600" />
                <span>Chuyển vào Hàng đợi đợt sửa tiếp theo</span>
              </button>
            </>
          ) : (
            /* CÁC TRƯỜNG HỢP CA 1, 2, 4 */
            <>
              {/* Nút 1: Chấp nhận ngoại tuyến / Bản đo chuẩn / Chuyển đợt */}
              <button
                type="button"
                onClick={() => handleOpenResolve('ACCEPT_INCOMING')}
                className="px-3 py-2 rounded-xl text-white text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Icon name="check_circle" size={16} />
                <span>
                  {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' &&
                    'Chấp nhận Thiết Bị 2 (Máy chính chuẩn)'}
                  {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED' &&
                    'Chấp nhận Đội 02 (Thu hồi lệnh Đội 01)'}
                  {selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH' &&
                    'Chuyển sang Lập đợt sửa trình Giám sát (Policy v2.2)'}
                </span>
              </button>

              {/* Nút 2: Bảo lưu máy chủ */}
              <button
                type="button"
                onClick={() => handleOpenResolve('KEEP_SERVER_STATE')}
                className="px-3 py-2 rounded-xl text-slate-700 text-xs font-semibold bg-slate-100 hover:bg-slate-200 transition border border-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Icon name="cancel" size={14} className="text-slate-500" />
                <span>
                  {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' &&
                    'Bảo lưu Thiết Bị 1 (Máy phụ)'}
                  {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED' &&
                    'Bảo lưu lệnh Đội 01 (Hủy kết quả Đội 02)'}
                  {selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH' &&
                    'Bảo lưu chính sách v2.2 (Từ chối Fast Track)'}
                </span>
              </button>

              {/* Nút 3: Tách lần sửa mới (Fork Attempt) */}
              <button
                type="button"
                onClick={() => handleOpenResolve('FORK_NEW_ATTEMPT')}
                className="px-3 py-2 rounded-xl text-white text-xs font-semibold bg-brand-gold hover:bg-brand-goldMuted transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Icon name="call_split" size={16} />
                <span>
                  {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' &&
                    'Tách 2 đợt đo đối chứng (Fork)'}
                  {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED' &&
                    'Tách 2 lần sửa độc lập (Fork)'}
                  {selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH' &&
                    'Tách thành Đợt sửa chữa nền móng chuyên đề'}
                </span>
              </button>
            </>
          )}
        </div>
      )}

      {/* NÚT THAO TÁC CHO SUPERVISOR (GIÁM SÁT / CHỦ ĐẦU TƯ) */}
      {isSupervisor && selectedConflict.status === 'CONFLICT_INTAKE' && (
        <div className="flex items-center gap-2 flex-wrap">
          {selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING' ? (
            <>
              <button
                type="button"
                onClick={() => handleOpenResolve('AUTHORIZE_RESCUE')}
                className="px-4 py-2 rounded-xl text-white text-xs font-bold bg-purple-700 hover:bg-purple-800 transition shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Icon name="verified_user" size={16} className="text-emerald-300" />
                <span>Ký số Phê duyệt Cứu Dữ Liệu Thiết Bị (Decision 42A)</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenResolve('SUPERVISOR_REJECT_RESCUE')}
                className="px-3.5 py-2 rounded-xl text-rose-700 text-xs font-bold bg-rose-50 hover:bg-rose-100 transition border border-rose-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Icon name="cancel" size={14} className="text-rose-600" />
                <span>Từ chối gói cứu hộ (Bắt buộc đo lại)</span>
              </button>
            </>
          ) : (
            <div className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
              Chế độ Giám sát: Quyền phân giải nghiệp vụ thuộc Chỉ huy trưởng PM (Maker-Checker).
            </div>
          )}
        </div>
      )}
    </div>
  )
}
