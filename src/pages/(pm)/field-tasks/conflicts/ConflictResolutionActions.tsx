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
  const isRescueConflict = selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
  const isAggregateConflict = selectedConflict.conflict_type === 'AGGREGATE_VERSION_CONFLICT'
  const isPolicyConflict = selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH'
  const isReassignConflict = selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
  const isDuplicateConflict = selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT'

  return (
    <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
      <div className="text-xs text-slate-500">
        {selectedConflict.status === 'CONFLICT_INTAKE' ? (
          selectedConflict.status_label === 'ĐÃ TRÌNH GIÁM SÁT (CHỜ KÝ SỐ)' ? (
            <span className="flex items-center gap-1.5 text-purple-700 font-medium">
              <Icon name="schedule" size={15} /> Đã trình Giám sát (Chờ ký số)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-700 font-medium">
              <Icon name="schedule" size={15} /> Chờ phân giải
            </span>
          )
        ) : selectedConflict.status === 'RESOLVED_KEEP_SERVER' || selectedConflict.status === 'RESCUE_REJECTED' ? (
          <span className="flex items-center gap-1.5 text-rose-700 font-medium">
            <Icon name="cancel" size={15} /> {selectedConflict.status_label}
          </span>
        ) : selectedConflict.status === 'RESCUE_AUTHORIZED' ? (
          <span className="flex items-center gap-1.5 text-purple-700 font-medium">
            <Icon name="verified_user" size={15} /> {selectedConflict.status_label}
          </span>
        ) : selectedConflict.status === 'RESOLVED_FORK_ATTEMPT' ? (
          <span className="flex items-center gap-1.5 text-amber-800 font-medium">
            <Icon name="call_split" size={15} /> {selectedConflict.status_label}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <Icon name="check_circle" size={15} /> {selectedConflict.status_label}
          </span>
        )}
      </div>

      {/* 1. TRƯỜNG HỢP CỨU HỘ THIẾT BỊ GẶP SỰ CỐ (Q17 / QUYẾT ĐỊNH 42A) */}
      {isRescueConflict && selectedConflict.status === 'CONFLICT_INTAKE' && (
        <>
          {isPM && (
            selectedConflict.status_label === 'ĐÃ TRÌNH GIÁM SÁT (CHỜ KÝ SỐ)' ? (
              <div className="text-xs text-slate-500 italic flex items-center gap-1.5">
                <Icon name="hourglass_top" size={14} className="text-purple-600" />
                <span>Đã gửi tờ trình cứu hộ lên Giám sát. Chờ ký số phê duyệt (Q17).</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenResolve('SUBMIT_RESCUE_TO_SUP')}
                  className="px-3.5 py-2 rounded-lg text-white text-xs font-semibold bg-brand-dark hover:bg-slate-800 transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  title="Quy chuẩn Q17: PM lập tờ trình chuyển Supervisor ký số phê duyệt gói SQLite"
                >
                  <Icon name="send" size={15} className="text-brand-gold" />
                  <span>Trình Giám sát duyệt cứu hộ (Q17)</span>
                </button>
              </div>
            )
          )}

          {isSupervisor && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleOpenResolve('AUTHORIZE_RESCUE')}
                className="px-3.5 py-2 rounded-lg text-white text-xs font-semibold bg-purple-700 hover:bg-purple-800 transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Icon name="verified_user" size={15} />
                <span>Ký số phê duyệt cứu hộ</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenResolve('SUPERVISOR_REJECT_RESCUE')}
                className="px-3.5 py-2 rounded-lg text-rose-700 text-xs font-semibold bg-rose-50 hover:bg-rose-100 transition border border-rose-300 shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Icon name="cancel" size={15} />
                <span>Từ chối gói cứu hộ</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* 2. TRƯỜNG HỢP HỒ SƠ ĐỢT ĐÃ ĐÓNG BĂNG ĐÃ DUYỆT (BR-26 / ĐIỀU BẤT BIẾN #3) */}
      {isAggregateConflict && selectedConflict.status === 'CONFLICT_INTAKE' && (
        <div className="flex items-center gap-2 flex-wrap">
          {isPM && (
            <>
              <button
                type="button"
                onClick={() => handleOpenResolve('FORK_NEW_ATTEMPT')}
                className="px-3.5 py-2 rounded-lg text-white text-xs font-semibold bg-brand-gold hover:bg-brand-goldMuted transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title="Tạo đợt phụ lục mới theo quy tắc BR-26 do đợt cũ đã đóng băng"
              >
                <Icon name="add_circle" size={15} />
                <span>Tạo phụ lục đợt mới (BR-26)</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenResolve('KEEP_SERVER_STATE')}
                className="px-3.5 py-2 rounded-lg text-rose-700 text-xs font-semibold bg-white hover:bg-rose-50 transition border border-rose-300 shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Icon name="cancel" size={15} className="text-rose-600" />
                <span>Từ chối số liệu nộp muộn</span>
              </button>
            </>
          )}
          {isSupervisor && (
            <div className="text-xs text-slate-500 italic">
              Đợt đã đóng băng (APPROVED). PM xử lý tạo phụ lục đợt mới hoặc từ chối.
            </div>
          )}
        </div>
      )}

      {/* 3. TRƯỜNG HỢP LỆCH CHÍNH SÁCH FAST TRACK (D06 / BR-16) - CHỈ CÓ 2 QUYẾT ĐỊNH: ĐẶC CÁCH DUYỆT HOẶC TỪ CHỐI */}
      {isPolicyConflict && selectedConflict.status === 'CONFLICT_INTAKE' && (
        <div className="flex items-center gap-2 flex-wrap">
          {isPM && (
            <>
              <button
                type="button"
                onClick={() => handleOpenResolve('ACCEPT_INCOMING')}
                className="px-3.5 py-2 rounded-lg text-white text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title="Đặc cách cho phép tự sửa Fast Track theo chính sách v1.8"
              >
                <Icon name="check_circle" size={15} />
                <span>Đặc cách duyệt Fast Track</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenResolve('KEEP_SERVER_STATE')}
                className="px-3.5 py-2 rounded-lg text-rose-700 text-xs font-semibold bg-white hover:bg-rose-50 transition border border-rose-300 shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title="Bác bỏ đề xuất Fast Track, chuyển sang diện lập hồ sơ đợt sửa theo chính sách v2.2"
              >
                <Icon name="cancel" size={15} className="text-rose-600" />
                <span>Từ chối Fast Track (Chuyển duyệt đợt)</span>
              </button>
            </>
          )}
          {isSupervisor && (
            <div className="text-xs text-slate-500 italic">
              Chỉ huy trưởng (PM) có thẩm quyền phân giải chính sách Fast Track.
            </div>
          )}
        </div>
      )}

      {/* 4. TRƯỜNG HỢP ĐỔI ĐỘI THI CÔNG KHI NGOẠI TUYẾN (D05 / Q04) - CÔNG NHẬN KẾT QUẢ ĐỘI CŨ HOẶC TỪ CHỐI GIỮ ĐỘI MỚI */}
      {isReassignConflict && selectedConflict.status === 'CONFLICT_INTAKE' && (
        <div className="flex items-center gap-2 flex-wrap">
          {isPM && (
            <>
              <button
                type="button"
                onClick={() => handleOpenResolve('ACCEPT_INCOMING')}
                className="px-3.5 py-2 rounded-lg text-white text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title="Công nhận kết quả đo 62mm của Tổ 02 nộp lên, thu hồi điều động đối với Đội 01"
              >
                <Icon name="check_circle" size={15} />
                <span>Công nhận kết quả Tổ 02 (Thu hồi Đội 01)</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenResolve('KEEP_SERVER_STATE')}
                className="px-3.5 py-2 rounded-lg text-rose-700 text-xs font-semibold bg-white hover:bg-rose-50 transition border border-rose-300 shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title="Bác bỏ kết quả nộp của Tổ 02, giữ nguyên phân công cho Đội 01 thi công"
              >
                <Icon name="cancel" size={15} className="text-rose-600" />
                <span>Từ chối kết quả Tổ 02 (Giữ Đội 01)</span>
              </button>
            </>
          )}
          {isSupervisor && (
            <div className="text-xs text-slate-500 italic">
              Chỉ huy trưởng (PM) có thẩm quyền phân giải điều phối đội thi công.
            </div>
          )}
        </div>
      )}

      {/* 5. TRƯỜNG HỢP TRÙNG LẶP 2 THIẾT BỊ CÙNG ĐO (DEDUP) - CHỌN MÁY CHÍNH, MÁY PHỤ HOẶC HỢP NHẤT THỦ CÔNG */}
      {isDuplicateConflict && selectedConflict.status === 'CONFLICT_INTAKE' && (
        <div className="flex items-center gap-2 flex-wrap">
          {isPM && (
            <>
              <button
                type="button"
                onClick={() => handleOpenResolve('ACCEPT_INCOMING')}
                className="px-3.5 py-2 rounded-lg text-white text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title="Công nhận bản đo 38mm của Máy chính (chuẩn TCVN 8864)"
              >
                <Icon name="check_circle" size={15} />
                <span>Chọn bản Máy chính (38mm)</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenResolve('KEEP_SERVER_STATE')}
                className="px-3.5 py-2 rounded-lg text-slate-700 text-xs font-semibold bg-white hover:bg-slate-100 transition border border-slate-300 shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title="Công nhận bản đo 45mm của Máy phụ"
              >
                <Icon name="devices" size={15} className="text-slate-500" />
                <span>Chọn bản Máy phụ (45mm)</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenResolve('FORK_NEW_ATTEMPT')}
                className="px-3.5 py-2 rounded-lg text-white text-xs font-semibold bg-brand-gold hover:bg-brand-goldMuted transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title="Đối soát và chọn từng trường dữ liệu giữa 2 bản nộp"
              >
                <Icon name="call_split" size={15} />
                <span>Hợp nhất thủ công</span>
              </button>
            </>
          )}
          {isSupervisor && (
            <div className="text-xs text-slate-500 italic">
              Chỉ huy trưởng (PM) có thẩm quyền phân giải trùng lặp dữ liệu.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
