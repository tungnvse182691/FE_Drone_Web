import React from 'react'
import {
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Circle,
  ArrowRight
} from 'lucide-react'
import { PasswordRules, PasswordStrength } from './types'

export interface AcceptFormProps {
  fullName?: string
  setFullName?: (val: string) => void
  password: string
  setPassword: (val: string) => void
  showPassword: boolean
  setShowPassword: (val: boolean) => void
  confirmPassword: string
  setConfirmPassword: (val: string) => void
  showConfirmPassword: boolean
  setShowConfirmPassword: (val: boolean) => void
  agreementChecked: boolean
  setAgreementChecked: (val: boolean) => void
  isSubmitting: boolean
  isFormValid: boolean
  isMatched: boolean
  rules: PasswordRules
  strength: PasswordStrength
  onFillStrongPassword: () => void
  onSubmit: (e: React.FormEvent) => void
  onReject: () => void
}

export const AcceptForm: React.FC<AcceptFormProps> = ({
  fullName,
  setFullName,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  confirmPassword,
  setConfirmPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  agreementChecked,
  setAgreementChecked,
  isSubmitting,
  isFormValid,
  isMatched,
  rules,
  strength,
  onFillStrongPassword,
  onSubmit,
  onReject
}) => {
  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Field 0: Họ và tên của nhân sự */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Họ và tên hiển thị trong hệ thống <span className="text-rose-600">*</span>
          </label>
          <div className="relative rounded-lg shadow-2xs">
            <input
              type="text"
              required
              value={fullName || ''}
              onChange={(e) => setFullName?.(e.target.value)}
              placeholder="Nhập họ và tên đầy đủ của bạn..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-gold transition"
            />
          </div>
        </div>

        {/* Field 1: Mật khẩu mới */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700">
              Thiết lập mật khẩu đăng nhập mới <span className="text-rose-600">*</span>
            </label>
            <button
              type="button"
              onClick={onFillStrongPassword}
              className="inline-flex items-center gap-1 text-[11px] text-brand-goldMuted hover:text-brand-gold font-semibold transition cursor-pointer"
              title="Tự động điền mật khẩu mẫu đạt chuẩn Enterprise"
            >
              <Sparkles className="w-3 h-3 text-brand-gold" />
              <span>Gợi ý mật khẩu mẫu</span>
            </button>
          </div>
          <div className="relative rounded-lg shadow-2xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Nhập ít nhất 8 ký tự..."
              className="w-full pl-10 pr-11 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-gold transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Strength Meter */}
          {password && (
            <div className="pt-1.5 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 flex items-center gap-1 font-medium">
                  Mức độ: <strong className={strength.color}>{strength.label}</strong>
                </span>
                <span className="text-slate-400 font-mono text-[10px]">
                  Yêu cầu: Khá mạnh
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full rounded-full transition-all duration-300 ${
                      step <= strength.score ? strength.barColor : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Rules Check list */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            <div className={`flex items-center gap-1.5 ${rules.length ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}>
              {rules.length ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Circle className="w-3.5 h-3.5 text-slate-300" />}
              <span>Tối thiểu 8 ký tự</span>
            </div>
            <div className={`flex items-center gap-1.5 ${rules.case ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}>
              {rules.case ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Circle className="w-3.5 h-3.5 text-slate-300" />}
              <span>Chữ hoa &amp; thường</span>
            </div>
            <div className={`flex items-center gap-1.5 ${rules.special ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}>
              {rules.special ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Circle className="w-3.5 h-3.5 text-slate-300" />}
              <span>Số &amp; ký tự đặc biệt</span>
            </div>
          </div>
        </div>

        {/* Field 2: Xác nhận mật khẩu */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Xác nhận mật khẩu mới <span className="text-rose-600">*</span>
          </label>
          <div className="relative rounded-lg shadow-2xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Nhập lại chính xác mật khẩu..."
              className={`w-full pl-10 pr-11 py-2.5 bg-white border rounded-lg text-sm text-slate-800 font-mono tracking-wider focus:outline-none focus:ring-2 transition ${
                confirmPassword.length > 0 && !isMatched
                  ? 'border-rose-400 focus:ring-rose-400'
                  : 'border-slate-200 focus:ring-brand-gold'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword.length > 0 && !isMatched && (
            <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Mật khẩu xác nhận không khớp</span>
            </p>
          )}
        </div>

        {/* Agreement Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreementChecked}
              onChange={(e) => setAgreementChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-brand-gold focus:ring-brand-gold border-slate-300 cursor-pointer"
            />
            <span className="leading-relaxed">
              Tôi cam kết tuân thủ quy chế bảo mật số liệu công trình, Nghị định 130/2018/NĐ-CP và tính toàn vẹn của chuỗi bằng chứng pháp lý (Nhật ký kiểm toán).
            </span>
          </label>
        </div>

        {/* Action Buttons Row */}
        <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full sm:flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
              isFormValid && !isSubmitting
                ? 'bg-[#C9A227] hover:bg-[#B38E1F] text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Đang kích hoạt tài khoản...</span>
              </>
            ) : (
              <>
                <span>Kích hoạt tài khoản &amp; Đăng nhập</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onReject}
            disabled={isSubmitting}
            className="w-full sm:w-auto py-3 px-5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            Từ chối lời mời
          </button>
        </div>
      </form>
    </>
  )
}

export default AcceptForm
