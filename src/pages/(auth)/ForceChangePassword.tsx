import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { authService } from '../../api/services/authService'
import { ForcePasswordForm } from './force-change-password/ForcePasswordForm'
import { useToastStore } from '../../store/toastStore'

export const ForceChangePassword: React.FC = () => {
  const toast = useToastStore()
  const navigate = useNavigate()
  const { user, setUserAndToken } = useAuthStore()

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
    <div className="min-h-screen text-slate-800 flex flex-col justify-between bg-[#F8F9FA]">
      {/* Thanh tiêu đề tối giản */}
      <header className="w-full px-6 py-4 flex items-center justify-between z-10 border-b border-[#E2E5E9] bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#C9A227]">
            <span className="material-symbols-outlined text-[20px]">shield</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-800 tracking-wide uppercase">
              Hoàng Hải RoadGuard
            </span>
            <span className="text-[11px] text-slate-400">
              Hạ tầng giao thông đường bộ
            </span>
          </div>
        </div>
      </header>

      {/* Thẻ đổi mật khẩu trung tâm */}
      <main className="w-full flex-1 flex items-center justify-center p-4 z-10 my-4">
        <div className="w-full max-w-[460px] bg-white p-7 sm:p-9 border border-[#E2E5E9] rounded-xl shadow-xs transition-all">
          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[#E2E5E9]">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#C9A227] shrink-0">
              <span className="material-symbols-outlined text-[28px]">lock_reset</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-[#1A1D20]">
                  Hoàng Hải
                </span>
                <span className="text-[11px] px-2 py-0.5 font-semibold bg-amber-50 text-[#8C6D1F] border border-amber-200/60 rounded">
                  ROADGUARD
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-normal truncate">
                Quản lý Bảo hành &amp; Sửa chữa Hạ tầng
              </p>
            </div>
          </div>

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
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 z-10 gap-2 border-t border-[#E2E5E9] bg-white">
        <div className="flex items-center gap-2 text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
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
