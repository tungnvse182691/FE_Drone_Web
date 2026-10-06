import React from 'react'
import { Link2Off, LogIn } from 'lucide-react'

export interface ExpiredInvitationViewProps {
  onBackToLogin: () => void
  onSwitchToValidDemo: () => void
}

export const ExpiredInvitationView: React.FC<ExpiredInvitationViewProps> = ({
  onBackToLogin,
  onSwitchToValidDemo
}) => {
  return (
    <div
      className="w-full max-w-[560px] bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 relative border border-slate-200"
      style={{ borderRadius: '16px', boxShadow: 'rgba(0, 0, 0, 0.05) 0px 4px 20px -2px' }}
    >
      <div className="h-2 w-full bg-rose-600" />
      <div className="p-8 sm:p-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-5 shadow-xs">
          <Link2Off className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
          <span>Token đã vô hiệu hóa</span>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2 font-headline">
          Liên kết lời mời không còn hiệu lực
        </h2>
        <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
          Mã lời mời token <code className="font-mono bg-slate-100 px-2 py-0.5 rounded text-rose-600 font-semibold">inv_tok_98f21e892c</code> này đã hết hạn sau 48 giờ hoặc đã được kích hoạt trước đó.
        </p>

        {/* Detailed Info Card */}
        <div className="w-full bg-slate-50 rounded-xl p-4 text-left mb-6 space-y-2 border border-slate-200 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Dự án liên kết:</span>
            <span className="font-semibold text-slate-900">QL1A - Giai đoạn 2 (PRJ-QL1A-02)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Người gửi lời mời:</span>
            <span className="font-semibold text-slate-900">Nguyễn Văn An (Ban QLDA)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Thời gian gửi thư:</span>
            <span className="font-mono text-slate-500">28/09/2026 - 08:30:14</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-6">
          Vui lòng liên hệ <strong className="text-slate-800">Giám sát trưởng</strong> hoặc Quản trị viên hệ thống Hoàng Hải RoadGuard để được tái cấp liên kết truy cập mới.
        </p>

        {/* Actions */}
        <div className="w-full space-y-3">
          <button
            onClick={onBackToLogin}
            className="w-full py-3.5 px-6 rounded-xl bg-[#C9A227] hover:bg-[#8C6D1F] text-white text-sm font-semibold flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Quay về màn hình đăng nhập</span>
          </button>
          <button
            onClick={onSwitchToValidDemo}
            className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            Xem lại màn hình thư mời hợp lệ (Demo)
          </button>
        </div>
      </div>
    </div>
  )
}
export default ExpiredInvitationView
