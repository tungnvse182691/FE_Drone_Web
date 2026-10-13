import React, { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { SystemUserAccount } from '../../../types/domain'

export interface ResetPasswordModalProps {
  isOpen: boolean
  user: SystemUserAccount | null
  onClose: () => void
  onConfirm: (userId: string, tempPassword: string) => Promise<void>
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  user,
  onClose,
  onConfirm
}) => {
  const [tempPassword, setTempPassword] = useState('RoadGuard@2026')
  const [copied, setCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen || !user) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(tempPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGenerateRandom = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%'
    let res = 'RG@'
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setTempPassword(res)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tempPassword.trim()) return

    try {
      setIsSubmitting(true)
      await onConfirm(user.id, tempPassword.trim())
      setIsSuccess(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (isSubmitting) return
    setIsSuccess(false)
    setCopied(false)
    setTempPassword('RoadGuard@2026')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#151C27]/60 backdrop-blur-xs flex items-center justify-center p-4 font-body animate-in fade-in duration-150">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-[#C9A227] flex items-center justify-center shrink-0">
              <Icon name="lock_reset" size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-headline">
                Đặt lại mật khẩu nhân sự (CN10)
              </h3>
              <p className="text-[11px] text-slate-500">
                POST /users/{'{userId}'}/password-reset • Cấp mật khẩu tạm
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100 cursor-pointer disabled:opacity-50"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* MODAL BODY */}
        {isSuccess ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Icon name="check_circle" size={28} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Đặt lại mật khẩu thành công!
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Đã cấp mật khẩu tạm và kích hoạt cờ buộc đổi mật khẩu{' '}
                <code className="text-amber-800 font-mono bg-amber-50 px-1 rounded font-bold">
                  must_change_password: true
                </code>{' '}
                cho nhân sự <strong>{user.full_name}</strong>.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-left space-y-2">
              <span className="text-[11px] font-semibold text-slate-600 block">
                Mật khẩu tạm thời cấp cho nhân sự:
              </span>
              <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded border border-slate-300 font-mono text-sm font-bold text-slate-900">
                <span>{tempPassword}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-xs text-brand-gold hover:text-brand-goldDark font-sans font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Icon name={copied ? 'done' : 'content_copy'} size={15} />
                  <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                Hãy gửi mật khẩu này qua kênh nội bộ an toàn. Người dùng bắt buộc phải đổi mật khẩu ngay ở lần đăng nhập tiếp theo.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Đã hoàn tất
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* THÔNG TIN NHÂN SỰ */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{user.full_name}</span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                  {user.role_label}
                </span>
              </div>
              <div className="text-slate-500 text-[11px] flex items-center gap-1 font-mono">
                <Icon name="mail" size={14} className="text-slate-400" />
                <span>{user.email}</span>
              </div>
            </div>

            {/* QUY TRÌNH AN TOÀN (CN10 / QT09) */}
            <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-200 text-[11px] text-amber-950 flex items-start gap-2.5">
              <Icon name="security" size={18} className="text-[#D97706] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Quy tắc bảo mật (CN10 &amp; QT09):</strong> Hệ thống không tiết lộ mật khẩu cũ.
                Sau khi đặt lại, nhân sự sẽ bị thu hồi toàn bộ token và bắt buộc phải đổi mật khẩu mới ở lần đăng nhập kế tiếp. Hành động này được ghi vào Audit Trail.
              </div>
            </div>

            {/* NHẬP / TẠO MẬT KHẨU TẠM THỜI */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Mật khẩu tạm thời an toàn: <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateRandom}
                  className="text-[11px] text-brand-gold hover:text-brand-goldDark font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Icon name="autorenew" size={13} />
                  <span>Tạo ngẫu nhiên</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  className="w-full h-9 px-3 pr-20 rounded-lg border border-slate-300 font-mono text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Icon name={copied ? 'done' : 'content_copy'} size={12} />
                  <span>{copied ? 'Đã chép' : 'Chép'}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và ký tự đặc biệt.
              </p>
            </div>

            {/* FOOTER */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !tempPassword.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Icon name="sync" size={16} className="animate-spin text-white" />
                    <span>Đang cấp mật khẩu...</span>
                  </>
                ) : (
                  <>
                    <Icon name="lock_reset" size={16} />
                    <span>Xác nhận đặt lại (CN10)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
