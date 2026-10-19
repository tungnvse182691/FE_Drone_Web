import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { authService } from '../../api/services/authService'
import { LoginViewMode } from './login/types'
import { LoginForm } from './login/LoginForm'
import { ForcePasswordSection } from './login/ForcePasswordSection'
import { LoginHeader, LoginFooter } from './login/LoginHeader'
import { useToastStore } from '../../store/toastStore'
import './auth-light-aurora.css'

export const Login: React.FC = () => {
  const toast = useToastStore()
  const navigate = useNavigate()
  const { setUserAndToken } = useAuthStore()

  // Chế độ xem: 'login' (Form Đăng nhập chính) hoặc 'force' (Chặn đổi mật khẩu lần đầu)
  const [viewMode, setViewMode] = useState<LoginViewMode>('login')

  // State cho Form Đăng nhập
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loginError, setLoginError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // State cho Form Đổi mật khẩu bắt buộc
  const [tempPassword, setTempPassword] = useState('123456')
  const [showTempPassword, setShowTempPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isForceSuccess, setIsForceSuccess] = useState(false)

  // Validation quy tắc mật khẩu
  const rules = {
    length: newPassword.length >= 8,
    case: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword),
  }
  const rulesPassedCount = Object.values(rules).filter(Boolean).length
  const allRulesPassed = rulesPassedCount === 4
  const isConfirmMatched = confirmPassword.length > 0 && newPassword === confirmPassword
  const isConfirmMismatched = confirmPassword.length > 0 && newPassword !== confirmPassword

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError(false)

    try {
      // Gọi qua Mock API Service bất đồng bộ
      const res = await authService.login({ email, password })
      setUserAndToken(res.user)

      if (res.user.must_change_password) {
        setViewMode('force')
      } else {
        const dest = res.user.role === RoleCode.SUPERVISOR ? '/sup/dashboard' : '/pm/dashboard'
        navigate(dest)
      }
    } catch {
      setLoginError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForcePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allRulesPassed || !isConfirmMatched) return

    try {
      const res = await authService.changePassword({ tempPassword, newPassword })
      setIsForceSuccess(true)
      setTimeout(() => {
        const currentUser = res.user
        setUserAndToken(currentUser)
        const dest = currentUser.role === RoleCode.SUPERVISOR ? '/sup/dashboard' : '/pm/dashboard'
        navigate(dest)
      }, 700)
    } catch {
      toast.error('Đổi mật khẩu thất bại, vui lòng kiểm tra lại mật khẩu hiện tại.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1D20] flex flex-col justify-between relative overflow-x-hidden">
      {/* Light Aurora background: blobs + grid + contour lines */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[120px] -left-[120px] aurora-blob-light-1 rounded-full" />
        <div className="absolute -bottom-[100px] -right-[100px] aurora-blob-light-2 rounded-full" />
        <div className="absolute top-[40%] left-[30%] -translate-x-1/2 -translate-y-1/2 aurora-blob-light-3 rounded-full" />
        <div className="absolute inset-0 aurora-grid-light" />
        <svg
          className="auth-curves"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <path
            d="M-100,700 C300,620 600,780 900,700 S1300,600 1540,680"
            fill="none"
            stroke="rgba(201,162,39,0.20)"
            strokeWidth="1.5"
          />
          <path
            d="M-100,745 C300,665 600,825 900,745 S1300,645 1540,725"
            fill="none"
            stroke="rgba(201,162,39,0.12)"
            strokeWidth="1.5"
          />
          <path
            d="M-100,150 C400,80 700,200 1100,120 S1400,180 1540,140"
            fill="none"
            stroke="rgba(59,130,246,0.14)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <LoginHeader />

      {viewMode === 'login' ? (
        <main className="w-full flex-1 relative z-10">
          <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-10 py-10 lg:py-12 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-[56px] items-center">
            {/* Cột trái: Panel branding */}
            <div className="flex flex-col justify-center">
              {/* Logo to hơn và canh giữa cùng chữ HOÀNG HẢI ROADGUARD */}
              <div className="w-full max-w-[560px] flex flex-col items-center mb-7">
                <div className="w-[170px] h-[170px] sm:w-[185px] sm:h-[185px] rounded-full border-[4px] border-[rgba(201,162,39,0.58)] shadow-[0_20px_52px_rgba(201,162,39,0.32)] float-logo overflow-hidden bg-white mb-4">
                  <img
                    src="/logo.png"
                    alt="Logo Hoàng Hải RoadGuard"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                <div className="text-[14px] sm:text-[15px] font-extrabold tracking-[0.38em] uppercase text-[#C9A227] text-center pl-[0.38em]">
                  HOÀNG HẢI ROADGUARD
                </div>
              </div>

              <h1 className="text-[34px] sm:text-[44px] font-extrabold tracking-[-0.02em] text-[#1A1D20] leading-[1.12] mb-4">
                Nền tảng số quản lý{' '}
                <span className="gold-gradient-text">bảo hành hạ tầng đường bộ</span>
              </h1>

              <p className="text-[15px] text-[#5B6470] leading-[1.7] mb-8 max-w-[560px]">
                Từ khảo sát trên không, trí tuệ nhân tạo thẩm định hư hỏng đến điều phối thi công và nghiệm thu hiện trường — mọi nghiệp vụ bảo hành đường bê tông trong một hệ thống duy nhất.
              </p>

              {/* 3 tính năng */}
              <div className="space-y-5 pt-6 border-t border-[#E2E5E9]">
                <div className="flex items-start gap-4">
                  <div className="w-[46px] h-[46px] rounded-[14px] bg-[#FEF9E7] border border-[rgba(201,162,39,0.28)] text-[#C9A227] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">flight</span>
                  </div>
                  <div className="pt-0.5">
                    <div className="text-[14px] font-bold text-[#1A1D20] leading-snug">
                      Khảo sát trên không
                    </div>
                    <div className="text-[13px] text-[#5B6470] leading-[1.6] mt-1">
                      Lập kế hoạch bay, thu thập ảnh toàn tuyến, trí tuệ nhân tạo tự động phát hiện ổ gà, nứt rạn.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-[46px] h-[46px] rounded-[14px] bg-[#FEF9E7] border border-[rgba(201,162,39,0.28)] text-[#C9A227] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">smart_toy</span>
                  </div>
                  <div className="pt-0.5">
                    <div className="text-[14px] font-bold text-[#1A1D20] leading-snug">
                      Thẩm định thông minh &amp; xử lý nhanh
                    </div>
                    <div className="text-[13px] text-[#5B6470] leading-[1.6] mt-1">
                      Bóc tách khối lượng tự động, luồng ưu tiên cho hư hỏng khẩn cấp.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-[46px] h-[46px] rounded-[14px] bg-[#FEF9E7] border border-[rgba(201,162,39,0.28)] text-[#C9A227] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">verified</span>
                  </div>
                  <div className="pt-0.5">
                    <div className="text-[14px] font-bold text-[#1A1D20] leading-snug">
                      Nghiệm thu số
                    </div>
                    <div className="text-[13px] text-[#5B6470] leading-[1.6] mt-1">
                      Đối chiếu Before/After tại hiện trường, đóng đợt bảo hành minh bạch.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải: Card đăng nhập */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-[460px] card-border-animated">
                <div className="glass-card-white">
                  <LoginForm
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    rememberMe={rememberMe}
                    setRememberMe={setRememberMe}
                    loginError={loginError}
                    setLoginError={setLoginError}
                    isLoading={isLoading}
                    onSubmit={handleLoginSubmit}
                    onSwitchToForce={() => setViewMode('force')}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <main className="w-full flex-1 flex items-center justify-center relative z-10 px-5 py-10 sm:py-12">
          <div className="w-full max-w-[560px]">
            <div className="flex flex-col items-center text-center mb-7">
              <div className="w-[104px] h-[104px] rounded-full border-[3px] border-[rgba(201,162,39,0.5)] shadow-[0_14px_40px_rgba(201,162,39,0.28)] float-logo mb-5 overflow-hidden bg-white">
                <img
                  src="/logo.png"
                  alt="Logo Hoàng Hải RoadGuard"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              <div className="text-[12px] font-bold tracking-[0.4em] uppercase text-[#C9A227] mb-3">
                HOÀNG HẢI ROADGUARD
              </div>

              <h1 className="text-[32px] sm:text-[40px] font-extrabold tracking-[-0.02em] text-[#1A1D20] leading-[1.15]">
                Thiết lập <span className="gold-gradient-text">mật khẩu mới</span>
              </h1>
            </div>

            <div className="card-border-animated">
              <div className="glass-card-white">
                <ForcePasswordSection
                  tempPassword={tempPassword}
                  setTempPassword={setTempPassword}
                  showTempPassword={showTempPassword}
                  setShowTempPassword={setShowTempPassword}
                  newPassword={newPassword}
                  setNewPassword={setNewPassword}
                  showNewPassword={showNewPassword}
                  setShowNewPassword={setShowNewPassword}
                  confirmPassword={confirmPassword}
                  setConfirmPassword={setConfirmPassword}
                  showConfirmPassword={showConfirmPassword}
                  setShowConfirmPassword={setShowConfirmPassword}
                  rules={rules}
                  rulesPassedCount={rulesPassedCount}
                  allRulesPassed={allRulesPassed}
                  isConfirmMatched={isConfirmMatched}
                  isConfirmMismatched={isConfirmMismatched}
                  isForceSuccess={isForceSuccess}
                  onSubmit={handleForcePasswordSubmit}
                  onBackToLogin={() => setViewMode('login')}
                />
              </div>
            </div>
          </div>
        </main>
      )}

      <LoginFooter />
    </div>
  )
}

export default Login
