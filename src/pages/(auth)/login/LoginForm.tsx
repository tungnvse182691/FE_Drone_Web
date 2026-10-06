import React from 'react'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  X
} from 'lucide-react'

export interface LoginFormProps {
  email: string
  setEmail: (val: string) => void
  password: string
  setPassword: (val: string) => void
  showPassword: boolean
  setShowPassword: (val: boolean) => void
  rememberMe: boolean
  setRememberMe: (val: boolean) => void
  loginError: boolean
  setLoginError: (val: boolean) => void
  isLoading: boolean
  onSubmit: (e: React.FormEvent) => void
}

export const LoginForm: React.FC<LoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  loginError,
  setLoginError,
  isLoading,
  onSubmit
}) => {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-headline">
          Đăng nhập hệ thống
        </h1>
        <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
          Nền tảng giám sát bảo hành &amp; điều phối khắc phục đường bộ
        </p>
      </div>

      {/* Error Banner */}
      {loginError && (
        <div className="p-3.5 rounded-2xl bg-[#FDEAEB] border border-red-200/70 text-[#D9383A] text-xs leading-relaxed flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#D9383A]" />
          <div className="flex-1">
            <span className="font-semibold">Đăng nhập không thành công:</span> Email hoặc mật khẩu không đúng.
            Tài khoản mẫu: <strong>pmhoang@gmail.com</strong> hoặc <strong>suphoang@gmail.com</strong> (mật khẩu: <strong>123456</strong>).
          </div>
          <button
            type="button"
            onClick={() => setLoginError(false)}
            className="text-red-400 hover:text-red-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Email công vụ</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pmhoang@gmail.com hoặc suphoang@gmail.com"
              required
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/20 focus:border-[#C9A227] transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Mật khẩu</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu công vụ"
              required
              className="w-full pl-10 pr-11 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/20 focus:border-[#C9A227] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              title="Ẩn / Hiện mật khẩu"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember & Forgot Password */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[#C9A227] focus:ring-[#C9A227] accent-[#C9A227]"
            />
            <span className="text-xs text-slate-600 font-medium">Ghi nhớ phiên làm việc trên máy này</span>
          </label>
          <button
            type="button"
            onClick={() => alert('Vui lòng liên hệ Quản trị viên (Ban Giám sát) hoặc gửi yêu cầu đặt lại mật khẩu nội bộ theo quy định TCVN 11944.')}
            className="text-xs font-semibold text-[#8C6D1F] hover:text-[#6B5219] transition-colors cursor-pointer"
          >
            Quên mật khẩu?
          </button>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#C9A227] hover:bg-[#8C6D1F] text-white text-sm font-semibold rounded-xl shadow-xs transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer disabled:opacity-75"
          >
            {isLoading ? (
              <span>Đang xác thực...</span>
            ) : (
              <>
                <span>Đăng nhập vào hệ thống</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Security Guard Notice */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
          <span>Không hỗ trợ SSO công cộng (FE-GAP-03)</span>
        </div>
        <span className="font-mono text-slate-400">TLS 1.3 • AES-256</span>
      </div>
    </section>
  )
}
export default LoginForm
