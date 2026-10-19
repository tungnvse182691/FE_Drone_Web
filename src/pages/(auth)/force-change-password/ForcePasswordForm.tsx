import React from 'react'
import { PasswordRules } from './types'

export interface ForcePasswordFormProps {
  tempPassword: string
  setTempPassword: (val: string) => void
  showTempPassword: boolean
  setShowTempPassword: (val: boolean) => void
  newPassword: string
  setNewPassword: (val: string) => void
  showNewPassword: boolean
  setShowNewPassword: (val: boolean) => void
  confirmPassword: string
  setConfirmPassword: (val: string) => void
  showConfirmPassword: boolean
  setShowConfirmPassword: (val: boolean) => void
  rules: PasswordRules
  rulesPassedCount: number
  allRulesPassed: boolean
  isConfirmMatched: boolean
  isConfirmMismatched: boolean
  isForceSuccess: boolean
  onSubmit: (e: React.FormEvent) => void
}

export const ForcePasswordForm: React.FC<ForcePasswordFormProps> = ({
  tempPassword,
  setTempPassword,
  showTempPassword,
  setShowTempPassword,
  newPassword,
  setNewPassword,
  showNewPassword,
  setShowNewPassword,
  confirmPassword,
  setConfirmPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  rules,
  rulesPassedCount,
  allRulesPassed,
  isConfirmMatched,
  isConfirmMismatched,
  isForceSuccess,
  onSubmit
}) => {
  return (
    <section className="space-y-5">
      <div>
        <h3 className="text-2xl font-bold tracking-tight text-[#1A1D20]">
          Thiết lập mật khẩu mới
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
          Bảo vệ tài khoản quản trị trước khi truy cập cơ sở dữ liệu đường bộ
        </p>
      </div>

      {/* Thông báo bắt buộc đổi mật khẩu */}
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
        <span className="material-symbols-outlined text-[18px] text-[#8C6D1F] shrink-0 mt-0.5">
          shield
        </span>
        <div>
          <span className="font-semibold text-amber-950">Yêu cầu bảo mật:</span> Đây là lần đầu bạn đăng nhập bằng mật khẩu tạm. Vui lòng thiết lập mật khẩu mới trước khi tiếp tục.
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Mật khẩu tạm thời */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Mật khẩu hiện tại (Mật khẩu tạm)
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-[14px] top-1/2 -translate-y-1/2 text-[20px] text-[#C9A227] pointer-events-none">
              key
            </span>
            <input
              type={showTempPassword ? 'text' : 'password'}
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              placeholder="Nhập mật khẩu tạm đã được cấp"
              required
              className="aurora-input-light pr-10 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowTempPassword(!showTempPassword)}
              className="absolute right-[14px] top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label={showTempPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showTempPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        {/* Mật khẩu mới */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Mật khẩu mới
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-[14px] top-1/2 -translate-y-1/2 text-[20px] text-[#C9A227] pointer-events-none">
              lock
            </span>
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Tối thiểu 8 ký tự, có chữ hoa, số & ký tự đặc biệt"
              required
              className="aurora-input-light pr-10 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-[14px] top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showNewPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        {/* Xác nhận mật khẩu mới */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Xác nhận mật khẩu mới
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-[14px] top-1/2 -translate-y-1/2 text-[20px] text-[#C9A227] pointer-events-none">
              lock_reset
            </span>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới vừa đặt"
              required
              className="aurora-input-light pr-10 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-[14px] top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showConfirmPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          {isConfirmMismatched && (
            <p className="text-xs font-medium text-[#E5484D] flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">error</span>
              <span>Mật khẩu xác nhận không trùng khớp</span>
            </p>
          )}
        </div>

        {/* Bảng quy tắc an toàn mật khẩu */}
        <div className="bg-[#F8F9FA] border border-[#E2E5E9] rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Tiêu chuẩn độ an toàn
            </span>
            <span
              className={`text-[11px] font-mono font-medium ${
                allRulesPassed ? 'text-emerald-700 font-semibold' : 'text-slate-500'
              }`}
            >
              {rulesPassedCount}/4 điều kiện
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div
              className={`flex items-center gap-1.5 ${
                rules.length ? 'text-emerald-700 font-medium' : 'text-slate-400'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {rules.length ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span>Ít nhất 8 ký tự</span>
            </div>

            <div
              className={`flex items-center gap-1.5 ${
                rules.case ? 'text-emerald-700 font-medium' : 'text-slate-400'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {rules.case ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span>Chữ hoa &amp; chữ thường</span>
            </div>

            <div
              className={`flex items-center gap-1.5 ${
                rules.number ? 'text-emerald-700 font-medium' : 'text-slate-400'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {rules.number ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span>Ít nhất 1 chữ số</span>
            </div>

            <div
              className={`flex items-center gap-1.5 ${
                rules.special ? 'text-emerald-700 font-medium' : 'text-slate-400'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {rules.special ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span>Ký tự đặc biệt (!@#$)</span>
            </div>
          </div>
        </div>

        {/* Nút gửi */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!allRulesPassed || !isConfirmMatched}
            className="aurora-btn-gold flex items-center justify-center gap-2 cursor-pointer"
          >
            {isForceSuccess ? (
              <>
                <span className="material-symbols-outlined text-[20px] text-[#0B0E14]">check_circle</span>
                <span>Đã đổi thành công! Đang chuyển hướng...</span>
              </>
            ) : (
              <>
                <span>Cập nhật &amp; Vào hệ thống</span>
                <span className="material-symbols-outlined text-[20px] text-[#0B0E14]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  )
}

export default ForcePasswordForm
