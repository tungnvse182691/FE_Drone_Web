import React from 'react'
import { AlertOctagon, X, Lock } from 'lucide-react'
import { SystemUserAccount } from '../../../types/domain'

export interface SuspendUserModalProps {
  showSuspendModal: boolean
  setShowSuspendModal: (show: boolean) => void
  userToSuspend: SystemUserAccount | null
  handoffAssignee: string
  setHandoffAssignee: (val: string) => void
  handleConfirmSuspend: () => void
}

export const SuspendUserModal: React.FC<SuspendUserModalProps> = ({
  showSuspendModal,
  setShowSuspendModal,
  userToSuspend,
  handoffAssignee,
  setHandoffAssignee,
  handleConfirmSuspend,
}) => {
  if (!showSuspendModal || !userToSuspend) return null

  return (
    <div className="fixed inset-0 z-50 bg-[#151C27]/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E2E5E9] max-w-lg w-full p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E9]">
          <div className="flex items-center gap-2 text-[#BA1A1A]">
            <AlertOctagon className="w-5 h-5" />
            <h3 className="text-base font-bold text-[#151C27]">
              Đình chỉ tài khoản &amp; Bàn giao công việc (UAT-09)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowSuspendModal(false)}
            className="p-1 rounded-lg text-[#555F6F] hover:text-[#151C27] hover:bg-[#F8F9FA]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-[#555F6F] space-y-3">
          <p>
            Bạn đang chuẩn bị đình chỉ quyền truy cập của{' '}
            <strong className="text-[#151C27]">{userToSuspend.full_name}</strong> ({userToSuspend.email}).
          </p>

          <div className="p-3 bg-[#FFDAD6] border border-[#FFCDD2] rounded-xl text-[#BA1A1A] space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              Quy trình thu hồi token tức thì (UAT-09):
            </div>
            <p className="text-[11px] leading-relaxed">
              Toàn bộ phiên làm việc (Web/Mobile) sẽ bị thu hồi ngay lập tức. Toàn bộ lịch sử thao tác của nhân sự này được bảo tồn nguyên vẹn trên Audit Trail (BR-45).
            </p>
          </div>

          {/* Bàn giao công việc dở dang */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#151C27] block">
              Chọn nhân sự tiếp nhận bàn giao công việc dở dang:
            </label>
            <select
              value={handoffAssignee}
              onChange={(e) => setHandoffAssignee(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#E2E5E9] bg-[#F8F9FA] text-xs font-semibold text-[#151C27] focus:outline-none focus:border-[#C9A227] cursor-pointer"
            >
              <option value="usr-01">Kỹ sư Nguyễn Văn An (Supervisor / Ban Giám Sát)</option>
              <option value="usr-04">PM Lê Tuấn (Chỉ huy trưởng QL1A-01)</option>
              <option value="usr-03">PM Đỗ Quốc Hoàng (Chỉ huy trưởng QL1A-02)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E5E9]">
          <button
            type="button"
            onClick={() => setShowSuspendModal(false)}
            className="px-4 py-2 rounded-lg bg-[#F8F9FA] hover:bg-[#E2E5E9] text-[#374151] text-xs font-semibold transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleConfirmSuspend}
            className="px-4 py-2 rounded-lg bg-[#BA1A1A] hover:bg-[#93000A] text-white text-xs font-bold shadow-sm transition-colors"
          >
            Xác nhận đình chỉ &amp; Bàn giao
          </button>
        </div>
      </div>
    </div>
  )
}
