import React from 'react'
import { Check, Mail, FolderKanban, ShieldCheck, Lock, Timer } from 'lucide-react'

export interface InvitationCardProps {
  token?: string
  projectName?: string
  /** Kết quả POST /invitations/preview */
  preview?: { role?: string | null; projects?: Array<{ id: string; name: string }> | null; expiresAt?: string | null; inviterName?: string | null } | null
  previewLoading?: boolean
}
const ROLE_VI: Record<string, string> = { PM: 'Chỉ huy trưởng (PM)', PROJECT_MANAGER: 'Chỉ huy trưởng (PM)', OPERATOR: 'Phi công UAV', DRONE_OPERATOR: 'Phi công UAV', CREW: 'Đội thi công hiện trường', REPAIR_CREW: 'Đội thi công hiện trường' }

export const InvitationCard: React.FC<InvitationCardProps> = ({ projectName, preview, previewLoading }) => {
  const names = preview?.projects?.map((p) => p.name).filter(Boolean) || []
  const none = previewLoading ? 'Đang đọc từ máy chủ…' : 'Máy chủ không trả thông tin này'
  const details: Array<[string, string]> = [
    ['Người gửi lời mời', preview?.inviterName || none],
    ['Vai trò được phân công', preview?.role ? (ROLE_VI[preview.role.toUpperCase()] || preview.role) : none],
    ['Phạm vi công việc', names.length ? names.join(', ') : none],
    ['Thời gian hiệu lực', preview?.expiresAt ? `Đến ${new Date(preview.expiresAt).toLocaleString('vi-VN')}` : none],
  ]
  projectName = projectName || names.join(', ')
  return (
    <div>
      {/* Brand & Status Badge Row */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#C9A227]/15 p-1 flex items-center justify-center border border-[#C9A227]/30">
            <img
              src="/logo.png"
              alt="Hoàng Hải"
              className="w-10 h-10 rounded-xl object-contain"
              onError={(e) => {
                // Fallback nếu chưa tải được logo
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 font-headline">
              Công Ty Bê Tông Hoàng Hải
            </span>
            <span className="text-xs text-slate-500 font-medium">Hệ thống RoadGuard Warranty</span>
          </div>
        </div>

        {/* Invitation Badge Circle */}
        <div className="relative">
          <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <Mail className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Check className="w-3 h-3 stroke-[3]" />
          </span>
        </div>
      </div>

      {/* Main Headline */}
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug font-headline">
          Kích hoạt tài khoản &amp; Thiết lập mật khẩu
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
          Chào mừng bạn gia nhập hệ thống. Vui lòng thiết lập mật khẩu đăng nhập an toàn để bắt đầu làm việc.
        </p>
      </div>

      {/* Thẻ hiển thị Tên dự án bảo hành được phân công */}
      <div className="rounded-2xl p-4 sm:p-4.5 mb-6 border border-amber-200/90 bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-white flex items-center gap-3.5 shadow-2xs">
        <div className="w-11 h-11 rounded-xl bg-[#C9A227]/15 text-[#8C6D15] flex items-center justify-center shrink-0 border border-[#C9A227]/30">
          <FolderKanban className="w-5 h-5 text-[#C9A227]" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800/90 block mb-0.5">
            Dự án bảo hành được phân công:
          </span>
          <p className="text-sm sm:text-base font-bold text-slate-900 truncate">
            {projectName || (previewLoading ? 'Đang đọc từ máy chủ…' : 'Máy chủ không trả tên dự án')}
          </p>
        </div>
      </div>
      <section className="rounded-xl p-4 sm:p-5 mb-6 border border-slate-200 bg-[#FAF8F5] space-y-4">
        <h2 className="text-xs uppercase tracking-wider text-slate-600 font-bold flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-brand-gold" />Chi tiết phân công nhân sự</h2>
        <dl className="grid sm:grid-cols-2 gap-4 text-xs">{details.map(([label, value]) => <div key={label}><dt className="text-slate-500 mb-1">{label}</dt><dd className="text-slate-700 font-semibold">{value}</dd></div>)}</dl>
      </section>
      <div className="space-y-3 text-xs text-slate-500"><p className="flex items-start gap-2"><Lock className="w-4 h-4 shrink-0 text-brand-gold" />Chỉ kích hoạt tài khoản bằng lời mời hợp lệ. Quyền truy cập được xác nhận trên máy chủ.</p><p className="flex items-start gap-2"><Timer className="w-4 h-4 shrink-0 text-slate-400" />Thời hạn lời mời: Chưa cập nhật</p></div>
    </div>
  )
}

export default InvitationCard
