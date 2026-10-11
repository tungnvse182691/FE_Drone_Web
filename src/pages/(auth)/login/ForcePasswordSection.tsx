import React from 'react'
import { PasswordRules } from './types'

export interface ForcePasswordSectionProps {
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
  onBackToLogin: () => void
}

export const ForcePasswordSection: React.FC<ForcePasswordSectionProps> = ({
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
  onSubmit,
  onBackToLogin
}) => {
  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#1A1D20]">
          Thiết lập mật khẩu mới
        </h1>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
          Bảo vệ tài khoản quản trị trước khi truy cập hệ thống hạ tầng đường bộ
        </p>
      </div>

      {/* Thông báo bắt buộc đổi mật khẩu lần đầu */}
      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
        <span className="material-symbols-outlined text-[18px] text-[#8C6D1F] shrink-0 mt-0.5">
          info
        </span>
        <div>
          <span className="font-semibold">Yêu cầu bảo mật:</span> Đây là lần đầu bạn đăng nhập bằng mật khẩu tạm. Vui lòng thiết lập mật khẩu mới trước khi tiếp tục.
        </div>
      </div>

      {/* Form đổi mật khẩu */}
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Mật khẩu tạm thời */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Mật khẩu hiện tại (Mật khẩu tạm)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-[18px]">key</span>
            </div>
            <input
              type={showTempPassword ? 'text' : 'password'}
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              placeholder="Nhập mật khẩu tạm đã được cấp"
              required
              className="w-full pl-10 pr-10 py-2.5 bg-[#F8F9FA] border border-[#E2E5E9] rounded-lg text-sm text-[#1A1D20] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/20 focus:border-[#C9A227] focus:bg-white transition-all font-mono"
            />
            <button
              type="button"
              onClick={() => setShowTempPassword(!showTempPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
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
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-[18px]">lock</span>
            </div>
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Tối thiểu 8 ký tự, chữ hoa, số & ký tự đặc biệt"
              required
              className="w-full pl-10 pr-10 py-2.5 bg-[#F8F9FA] border border-[#E2E5E9] rounded-lg text-sm text-[#1A1D20] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/20 focus:border-[#C9A227] focus:bg-white transition-all font-mono"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
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
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              required
              className="w-full pl-10 pr-10 py-2.5 bg-[#F8F9FA] border border-[#E2E5E9] rounded-lg text-sm text-[#1A1D20] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/20 focus:border-[#C9A227] focus:bg-white transition-all font-mono"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
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

        {/* Danh sách tiêu chí an toàn mật khẩu */}
        <div className="bg-[#F8F9FA] border border-[#E2E5E9] rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Tiêu chuẩn độ an toàn
            </span>
            <span
              className={`text-[11px] font-mono font-medium ${
                allRulesPassed ? 'text-emerald-600 font-semibold' : 'text-slate-500'
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

        {/* Nút hành động */}
        <div className="pt-2 space-y-2">
          <button
            type="submit"
            disabled={!allRulesPassed || !isConfirmMatched}
            className={`w-full py-2.5 px-4 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 ${
              allRulesPassed && isConfirmMatched
                ? 'bg-[#C9A227] hover:bg-[#8C6D1F] cursor-pointer'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isForceSuccess ? (
              <>
                <span className="material-symbols-outlined text-[18px]">check</span>
                <span>Đã đổi thành công! Đang chuyển hướng...</span>
              </>
            ) : (
              <>
                <span>Cập nhật mật khẩu &amp; Vào hệ thống</span>
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full py-2 px-4 bg-white hover:bg-slate-50 border border-[#E2E5E9] text-slate-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-400">
              arrow_back
            </span>
            <span>Quay lại Đăng nhập</span>
          </button>
        </div>
      </form>
    </section>
  )
}

export default ForcePasswordSection
