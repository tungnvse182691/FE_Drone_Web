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
  const toast = useToastStore()
  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#1A1D20]">
          Đăng nhập hệ thống
        </h1>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
          Nền tảng giám sát bảo hành &amp; điều phối khắc phục hạ tầng đường bộ
        </p>
      </div>

      {/* Thông báo lỗi đăng nhập */}
      {loginError && (
        <div className="p-3 rounded-lg bg-[#FDECEC] border border-[#E5484D]/30 text-[#E5484D] text-xs leading-relaxed flex items-start gap-2.5">
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
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-[18px]">mail</span>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pmhoang@gmail.com hoặc suphoang@gmail.com"
              required
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8F9FA] border border-[#E2E5E9] rounded-lg text-sm text-[#1A1D20] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/20 focus:border-[#C9A227] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Trường Mật khẩu */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Mật khẩu
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-[18px]">lock</span>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu truy cập"
              required
              className="w-full pl-10 pr-10 py-2.5 bg-[#F8F9FA] border border-[#E2E5E9] rounded-lg text-sm text-[#1A1D20] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/20 focus:border-[#C9A227] focus:bg-white transition-all font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
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
            className="w-full py-2.5 px-4 bg-[#C9A227] hover:bg-[#8C6D1F] text-white text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  progress_activity
                </span>
                <span>Đang xác thực thông tin...</span>
              </>
            ) : (
              <>
                <span>Đăng nhập vào hệ thống</span>
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Lối tắt chọn tài khoản mẫu nhanh (Tối giản - Tiện lợi khi kiểm thử) */}
      <div className="pt-3 border-t border-[#E2E5E9]">
        <span className="text-[11px] font-medium text-slate-400 block mb-2">
          Tài khoản kiểm thử nhanh (Mật khẩu mặc định: 123456):
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setEmail('pmhoang@gmail.com')
              setPassword('123456')
            }}
            className="px-2.5 py-1.5 rounded-md border border-[#E2E5E9] hover:border-[#C9A227] bg-[#F8F9FA] hover:bg-white text-left transition-colors cursor-pointer group"
          >
            <div className="text-[11px] font-semibold text-slate-800 group-hover:text-[#8C6D1F]">
              Chỉ huy trưởng (PM)
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              pmhoang@gmail.com
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setEmail('suphoang@gmail.com')
              setPassword('123456')
            }}
            className="px-2.5 py-1.5 rounded-md border border-[#E2E5E9] hover:border-[#C9A227] bg-[#F8F9FA] hover:bg-white text-left transition-colors cursor-pointer group"
          >
            <div className="text-[11px] font-semibold text-slate-800 group-hover:text-[#8C6D1F]">
              Giám sát (Supervisor)
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              suphoang@gmail.com
            </div>
          </button>
        </div>
      </div>
    </section>
  )
}

export default LoginForm
