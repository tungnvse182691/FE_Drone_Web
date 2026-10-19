import React from 'react'
import { useToastStore } from '../../../store/toastStore'

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
  onSwitchToForce?: () => void
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
  onSubmit,
  onSwitchToForce
}) => {
  const toast = useToastStore()

  return (
    <section className="space-y-5">
      <div>
        <h3 className="text-2xl font-bold tracking-tight text-[#1A1D20]">
          Đăng nhập
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
          Nền tảng giám sát bảo hành &amp; điều phối khắc phục hạ tầng đường bộ
        </p>
      </div>

      {/* Thông báo lỗi đăng nhập */}
      {loginError && (
        <div className="p-3.5 rounded-xl bg-[#FDECEC] border border-[#E5484D]/30 text-[#E5484D] text-xs leading-relaxed flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
            error
          </span>
          <div className="flex-1">
            <span className="font-semibold">Đăng nhập không thành công:</span> Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.
          </div>
          <button
            type="button"
            onClick={() => setLoginError(false)}
            className="text-red-400 hover:text-red-700 cursor-pointer p-0.5"
            aria-label="Đóng thông báo lỗi"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Form đăng nhập */}
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Trường Email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Email công vụ
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-[14px] top-1/2 -translate-y-1/2 text-[20px] text-[#C9A227] pointer-events-none">
              mail
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pmhoang@gmail.com hoặc suphoang@gmail.com"
              required
              className="aurora-input-light font-mono"
            />
          </div>
        </div>

        {/* Trường Mật khẩu */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Mật khẩu
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-[14px] top-1/2 -translate-y-1/2 text-[20px] text-[#C9A227] pointer-events-none">
              lock
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu truy cập"
              required
              className="aurora-input-light pr-10 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-[14px] top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        {/* Ghi nhớ & Quên mật khẩu */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-[#C9A227] border-slate-300 focus:ring-[#C9A227] accent-[#C9A227] cursor-pointer"
            />
            <span className="text-xs text-slate-600">Ghi nhớ phiên làm việc</span>
          </label>

          <button
            type="button"
            onClick={() => toast.info('Vui lòng liên hệ Quản trị viên để đặt lại mật khẩu công vụ.')}
            className="text-xs font-medium text-[#8C6D1F] hover:text-[#6B5219] transition-colors cursor-pointer"
          >
            Quên mật khẩu?
          </button>
        </div>

        {/* Nút Đăng nhập */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="aurora-btn-gold flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined text-[20px] animate-spin text-[#0B0E14]">
                  progress_activity
                </span>
                <span>Đang xác thực thông tin...</span>
              </>
            ) : (
              <>
                <span>Vào hệ thống</span>
                <span className="material-symbols-outlined text-[20px] text-[#0B0E14]">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Khu vực Đổi mật khẩu lần đầu (kích hoạt tài khoản mới) */}
      {onSwitchToForce && (
        <div className="p-3.5 rounded-xl bg-[#FEF9E7] border border-[rgba(201,162,39,0.30)] flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white border border-[rgba(201,162,39,0.28)] text-[#C9A227] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">key</span>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#1A1D20]">
                Được cấp mật khẩu tạm?
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                Đổi mật khẩu lần đầu để kích hoạt tài khoản
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onSwitchToForce}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-white hover:bg-[#FAF4DF] border border-[rgba(201,162,39,0.40)] text-[#8C6D1F] hover:text-[#6B5219] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
          >
            <span>Đổi ngay</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>
      )}

      {/* 2 nút tài khoản dùng thử: PM | Giám sát */}
      <div className="pt-4 border-t border-[#E2E5E9]">
        <span className="text-[11px] font-medium text-slate-400 block mb-2.5">
          Tài khoản kiểm thử nhanh (Mật khẩu mặc định: 123456):
        </span>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              setEmail('pmhoang@gmail.com')
              setPassword('123456')
            }}
            className="p-3 rounded-xl border border-[#E2E5E9] hover:border-[#C9A227] bg-[#F8F9FA] hover:bg-white text-left transition-all cursor-pointer group shadow-2xs"
          >
            <div className="text-xs font-bold text-slate-800 group-hover:text-[#8C6D1F] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#C9A227]">badge</span>
              <span>PM Dùng thử</span>
            </div>
            <div className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">
              pmhoang@gmail.com
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setEmail('suphoang@gmail.com')
              setPassword('123456')
            }}
            className="p-3 rounded-xl border border-[#E2E5E9] hover:border-[#C9A227] bg-[#F8F9FA] hover:bg-white text-left transition-all cursor-pointer group shadow-2xs"
          >
            <div className="text-xs font-bold text-slate-800 group-hover:text-[#8C6D1F] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#C9A227]">supervisor_account</span>
              <span>Giám sát Dùng thử</span>
            </div>
            <div className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">
              suphoang@gmail.com
            </div>
          </button>
        </div>
      </div>
    </section>
  )
}

export default LoginForm
