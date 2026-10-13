import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { authService } from '../../api/services/authService'
import { LoginViewMode } from './login/types'
import { LoginForm } from './login/LoginForm'
import { ForcePasswordSection } from './login/ForcePasswordSection'
import { LoginHeader, LoginBrandCardHeader, LoginFooter } from './login/LoginHeader'

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const { setUserAndToken } = useAuthStore()

  // Chế độ xem: 'login' (Form Đăng nhập chính) hoặc 'force' (Chặn đổi mật khẩu lần đầu)
  const [viewMode, setViewMode] = useState<LoginViewMode>('login')

  // State cho Form Đăng nhập (Không điền sẵn - Người dùng nhập hoặc bấm thẻ mẫu)
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
      // Gọi qua Mock API Service bất đồng bộ (In-memory, KHÔNG dùng localStorage)
      const res = await authService.login({ email, password })
      setUserAndToken(res.user, res.token)

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
        setUserAndToken(currentUser, `mock-jwt-token-${currentUser.id}`)
        const dest = currentUser.role === RoleCode.SUPERVISOR ? '/sup/dashboard' : '/pm/dashboard'
        navigate(dest)
      }, 700)
    } catch {
      alert('Đổi mật khẩu thất bại, vui lòng kiểm tra lại mật khẩu hiện tại.')
    }
  }

  return (
    <div className="min-h-screen text-slate-800 flex flex-col justify-between bg-[#F8F9FA]">
      <LoginHeader viewMode={viewMode} setViewMode={setViewMode} />

      {/* Thẻ đăng nhập trung tâm */}
      <main className="w-full flex-1 flex items-center justify-center p-4 z-10 my-4">
        <div className="w-full max-w-[460px] bg-white p-7 sm:p-9 border border-[#E2E5E9] rounded-xl shadow-xs transition-all">
          <LoginBrandCardHeader />

          {viewMode === 'login' ? (
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
            />
          ) : (
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
          )}
        </div>
      </main>

      <LoginFooter />
    </div>
  )
}

export default Login
