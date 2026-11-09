import { personnelBlocks } from '../../../api/services/personnelScreen'
import React from 'react'
import { AlertOctagon, X, Lock } from 'lucide-react'
import { SystemUserAccount } from '../../../types/domain'

export interface SuspendUserModalProps {
  action?: 'ACTIVE' | 'SUSPENDED'
  busy?: boolean
  pending?: boolean
  onCancel?: () => void
  conflict?: boolean
  compared?: boolean
  rejected?: boolean
  error?: string
  blockedReason?: string

  showSuspendModal: boolean
  setShowSuspendModal: (show: boolean) => void
  userToSuspend: SystemUserAccount | null
  suspendReason?: string
  setSuspendReason?: (val: string) => void
  handleConfirmSuspend: () => void
}

export const SuspendUserModal: React.FC<SuspendUserModalProps> = ({
  showSuspendModal,
  onCancel,
  action = 'SUSPENDED', busy = false, pending = false, conflict = false, compared = false, rejected = false, error = '',
  blockedReason = personnelBlocks.account,
  setShowSuspendModal,
  userToSuspend,
  suspendReason = '',
  setSuspendReason,
  handleConfirmSuspend,
}) => {
  if (!showSuspendModal || !userToSuspend) return null

  return (
    <div className="fixed inset-0 z-50 bg-[#151C27]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-brand-border max-w-lg w-full p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-brand-border">
          <div className="flex items-center gap-2 text-[#BA1A1A]">
            <AlertOctagon className="w-5 h-5" />
            <h3 className="text-base font-bold text-[#151C27]">
              {action === 'ACTIVE' ? 'Khôi phục tài khoản nhân sự' : 'Đình chỉ tài khoản nhân sự'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowSuspendModal(false)}
            className="p-1 rounded-lg text-[#555F6F] hover:text-[#151C27] hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-[#555F6F] space-y-3">
          <p role="status">{error || blockedReason}</p>
          <p>
            Bạn đang chuẩn bị {action === 'ACTIVE' ? 'khôi phục' : 'đình chỉ'} quyền truy cập của{' '}
            <strong className="text-[#151C27]">{userToSuspend.full_name}</strong> ({userToSuspend.email}).
          </p>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
            <span className="text-[#555F6F]">Vai trò tài khoản:</span>
            <span className="font-bold text-[#151C27] px-2 py-0.5 bg-slate-200/80 rounded">
              {userToSuspend.role}
            </span>
          </div>

          <div className="p-3 bg-[#FFDAD6] border border-[#FFCDD2] rounded-xl text-[#BA1A1A] space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              {action === 'ACTIVE' ? 'Khôi phục trạng thái tài khoản (API-239):' : 'Quy trình thu hồi token trên CSDL Backend (API-239):'}
            </div>
            <p className="text-[11px] leading-relaxed">
              {action === 'ACTIVE' ? 'Trạng thái sẽ chuyển thành ACTIVE. Tài khoản cần đăng nhập lại; lịch sử và phân công dự án được giữ nguyên.' : 'Trạng thái sẽ chuyển thành SUSPENDED trên Backend. Các phiên làm việc bị thu hồi; lịch sử thao tác và phân công được giữ nguyên.'}
            </p>
          </div>

          {/* Lý do đình chỉ */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#151C27] block">
              Lý do {action === 'ACTIVE' ? 'khôi phục' : 'đình chỉ'} tài khoản:
            </label>
            <textarea
              disabled={busy || pending}
              rows={2}
              value={suspendReason}
              onChange={(e) => setSuspendReason?.(e.target.value)}
              placeholder={action === 'ACTIVE' ? 'Nhập lý do khôi phục tài khoản...' : 'Nhập lý do đình chỉ tài khoản...'}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-[#151C27] focus:outline-none focus:border-[#C9A227] resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-brand-border">
          <button
            type="button"
            onClick={onCancel || (() => setShowSuspendModal(false))}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#374151] text-xs font-semibold transition cursor-pointer"
          >
            {compared ? 'Bỏ ý định cũ và đóng' : 'Hủy bỏ'}
          </button>
          <button
            type="button"
            disabled={!!blockedReason}
            title={blockedReason}
            onClick={handleConfirmSuspend}
            className="px-4 py-2 rounded-lg bg-[#BA1A1A] hover:bg-[#93000A] text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            {conflict ? compared ? 'Dùng snapshot mới' : 'Đọc snapshot để đối chiếu' : rejected ? 'Sửa yêu cầu đã từ chối' : pending ? 'Thử lại đúng yêu cầu' : action === 'ACTIVE' ? 'Xác nhận khôi phục tài khoản' : 'Xác nhận đình chỉ tài khoản'}
          </button>
        </div>
      </div>
    </div>
  )
}
