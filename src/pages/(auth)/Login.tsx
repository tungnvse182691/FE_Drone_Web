import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { LoginViewMode } from './login/types'
import { LoginForm } from './login/LoginForm'
import { ForcePasswordSection } from './login/ForcePasswordSection'
import { LoginHeader, LoginBrandCardHeader, LoginFooter } from './login/LoginHeader'

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  // Chế độ xem: 'login' (Form Đăng nhập chính WF-01) hoặc 'force' (Chặn đổi mật khẩu lần đầu)
  const [viewMode, setViewMode] = useState<LoginViewMode>('login')

  // State cho Form Đăng nhập
  const [email, setEmail] = useState('pmhoang@gmail.com')
  const [password, setPassword] = useState('123456')
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

  // Validation quy tắc mật khẩu TCVN 11944
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

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError(false)

    setTimeout(() => {
      setIsLoading(false)
      const trimmedEmail = email.trim().toLowerCase()
      let matchedRole: RoleCode | null = null

      if (trimmedEmail === 'pmhoang@gmail.com' && password === '123456') {
        matchedRole = RoleCode.PROJECT_MANAGER
      } else if (
        (trimmedEmail === 'suphoang@gmail.com' || trimmedEmail === 'suphoang@gamail.com') &&
        password === '123456'
      ) {
        matchedRole = RoleCode.SUPERVISOR
      }

      if (!matchedRole) {
        setLoginError(true)
        return
      }

      login(matchedRole)
      navigate(matchedRole === RoleCode.PROJECT_MANAGER ? '/pm/dashboard' : '/sup/dashboard')
    }, 600)
  }

  const handleForcePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!allRulesPassed || !isConfirmMatched) return

    setIsForceSuccess(true)
    setTimeout(() => {
      const currentUser = useAuthStore.getState().user
      if (currentUser) {
        currentUser.must_change_password = false
      }
      navigate(currentUser?.role === RoleCode.SUPERVISOR ? '/sup/dashboard' : '/pm/dashboard')
    }, 1000)
  }

  return (
    <div
      className="min-h-screen text-slate-800 flex flex-col justify-between relative selection:bg-stone-200"
      style={{
        backgroundColor: '#F8F9FA',
        backgroundImage: `
          radial-gradient(#d1d5db 1px, transparent 1px),
          linear-gradient(to right, rgba(229, 231, 235, 0.4) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(229, 231, 235, 0.4) 1px, transparent 1px)
        `,
        backgroundSize: '32px 32px, 96px 96px, 96px 96px',
      }}
    >
      <LoginHeader viewMode={viewMode} setViewMode={setViewMode} />

      {/* Central Authentication Card */}
      <main className="w-full flex-1 flex items-center justify-center p-4 z-10 my-4">
        <div
          className="w-full max-w-[480px] bg-white p-8 sm:p-10 border border-slate-200/80 rounded-xl shadow-xl transition-all duration-200"
          style={{ border: '1px solid #E2E5E9', borderRadius: '12px' }}
        >
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
