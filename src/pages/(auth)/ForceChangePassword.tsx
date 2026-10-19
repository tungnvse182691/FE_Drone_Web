import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { authService } from '../../api/services/authService'
import { ForcePasswordForm } from './force-change-password/ForcePasswordForm'
import { useToastStore } from '../../store/toastStore'
import './auth-light-aurora.css'

export const ForceChangePassword: React.FC = () => {
  const toast = useToastStore()
  const navigate = useNavigate()
  const { setUserAndToken } = useAuthStore()

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

  const handleForcePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allRulesPassed || !isConfirmMatched) return

    try {
      const res = await authService.changePassword({ tempPassword, newPassword })
      setIsForceSuccess(true)
      setTimeout(() => {
        const updatedUser = res.user
        setUserAndToken(updatedUser)
        if (updatedUser.role === RoleCode.SUPERVISOR) {
          navigate('/sup/dashboard')
        } else {
          navigate('/pm/dashboard')
        }
      }, 700)
    } catch {
      toast.error('Đổi mật khẩu thất bại, vui lòng kiểm tra lại mật khẩu hiện tại.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1D20] flex flex-col justify-between relative overflow-x-hidden">
      {/* Light Aurora Background: 3 blobs + grid + 3 đường cong contour bezier */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[120px] -left-[120px] aurora-blob-1 rounded-full" />
        <div className="absolute -bottom-[100px] -right-[100px] aurora-blob-2 rounded-full" />
        <div className="absolute top-[40%] left-[30%] -translate-x-1/2 -translate-y-1/2 aurora-blob-3 rounded-full" />
        <div className="absolute inset-0 aurora-grid-overlay" />
        
        {/* Đường cong mờ contour lines */}
        <svg className="curves absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <path d="M-100,700 C300,620 600,780 900,700 S1300,600 1540,680" fill="none" stroke="rgba(201,162,39,0.20)" strokeWidth="1.5"/>
          <path d="M-100,745 C300,665 600,825 900,745 S1300,645 1540,725" fill="none" stroke="rgba(201,162,39,0.12)" strokeWidth="1.5"/>
          <path d="M-100,150 C400,80 700,200 1100,120 S1400,180 1540,140" fill="none" stroke="rgba(59,130,246,0.14)" strokeWidth="1.5"/>
        </svg>
      </div>

      {/* Topbar: logo 44px + HOÀNG HẢI ROADGUARD / Hạ tầng giao thông đường bộ */}
      <header className="w-full px-6 sm:px-10 py-3.5 flex items-center justify-between z-10 border-b border-[#E2E5E9] bg-white/85 backdrop-blur-[14px]">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Logo Hoàng Hải RoadGuard"
            className="w-[44px] h-[44px] rounded-full object-cover border-2 border-[rgba(201,162,39,0.5)] shadow-[0_4px_12px_rgba(201,162,39,0.25)] shrink-0"
          />
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-bold text-[#1A1D20] tracking-wider uppercase">
              Hoàng Hải RoadGuard
            </span>
            <span className="text-[11px] text-[#5B6470]">
              Hạ tầng giao thông đường bộ
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-800 font-medium">
          <span className="w-2 h-2 rounded-full bg-[#2F9E44] animate-pulse"></span>
          <span>Bảo mật hệ thống thông tin hạ tầng</span>
        </div>
      </header>

      {/* Vùng trung tâm: Container centered, max-width ~560px */}
      <main className="w-full flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 z-10 my-2">
        <div className="w-full max-w-[560px] flex flex-col items-center">
          {/* Logo tròn 104px */}
          <img
            src="/logo.png"
            alt="Logo Hoàng Hải RoadGuard"
            className="float-logo-104 mb-5 bg-white"
          />

          {/* Eyebrow */}
          <div className="text-[12px] font-bold tracking-[0.4em] uppercase text-[#C9A227] mb-2.5">
            HOÀNG HẢI ROADGUARD
          </div>

          {/* H1 */}
          <h1 className="text-[30px] sm:text-[40px] font-extrabold tracking-[-0.01em] text-[#1A1D20] leading-tight mb-6 text-center">
            Thiết lập{' '}
            <span className="bg-gradient-to-r from-[#E8C547] via-[#C9A227] to-[#9A7A1E] bg-clip-text text-transparent">
              mật khẩu mới
            </span>
          </h1>

          {/* Card viền gradient xoay - nền trắng */}
          <div className="w-full card-border-animated">
            <div className="glass-card-inner">
              <ForcePasswordForm
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
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 sm:px-10 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#5B6470] z-10 gap-2 border-t border-[#E2E5E9] bg-white/85 backdrop-blur-[14px]">
        <div className="flex items-center gap-2 text-[#5B6470]">
          <span className="w-2 h-2 rounded-full bg-[#2F9E44]"></span>
          <span>Bảo mật hệ thống thông tin hạ tầng</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <span>TCVN 10380:2014</span>
          <span>•</span>
          <span>TCVN 8819:2011</span>
          <span>•</span>
          <span>© 2026 Hoàng Hải RoadGuard</span>
        </div>
      </footer>
    </div>
  )
}

export default ForceChangePassword
