import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { ShieldCheck } from 'lucide-react'
import { ForcePasswordForm } from './force-change-password/ForcePasswordForm'

export const ForceChangePassword: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // State cho Form Đổi mật khẩu bắt buộc
  const [tempPassword, setTempPassword] = useState('TempPass#2026')
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

  const handleForcePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!allRulesPassed || !isConfirmMatched) return

    setIsForceSuccess(true)
    setTimeout(() => {
      if (user) user.must_change_password = false
      if (user?.role === RoleCode.SUPERVISOR) {
        navigate('/sup/dashboard')
      } else {
        navigate('/pm/dashboard')
      }
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
      {/* Top Bar */}
      <header className="w-full px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-200 text-stone-700 font-mono">
            AUTH-GUARD • TCVN 11944:2018
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            An ninh truy cập hạ tầng giao thông đường bộ
          </span>
        </div>
      </header>

      {/* Decorative background map lines */}
      <div className="fixed inset-0 pointer-events-none opacity-25 overflow-hidden z-0">
        <svg className="absolute w-full h-full text-slate-300" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M-100,200 C300,100 400,600 800,400 C1200,200 1400,800 2000,500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="8 8"
          />
          <path
            d="M-50,450 C350,350 650,850 1100,650 C1550,450 1650,900 2100,750"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            opacity="0.6"
          />
          <circle cx="800" cy="400" r="6" fill="#C9A227" opacity="0.4" />
          <circle cx="1100" cy="650" r="5" fill="#C9A227" opacity="0.4" />
        </svg>
      </div>

      {/* Central Card */}
      <main className="w-full flex-1 flex items-center justify-center p-4 z-10 my-4">
        <div
          className="w-full max-w-[480px] bg-white p-8 sm:p-10 border border-slate-200/80 rounded-xl shadow-xl transition-all duration-200"
          style={{ border: '1px solid #E2E5E9', borderRadius: '12px' }}
        >
          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-[#C9A227]/10 border border-[#C9A227]/20 flex items-center justify-center text-[#C9A227] shadow-xs">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-headline">
                  Hoàng Hải
                </span>
                <span className="text-xs px-2 py-0.5 font-mono font-semibold bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30 rounded-full">
                  ROADGUARD
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 tracking-wide uppercase">
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
      <footer className="w-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 z-10 gap-2 border-t border-slate-200/50 bg-white/40 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>
            Hệ thống máy chủ giám sát vận hành:{' '}
            <strong className="text-slate-700 font-semibold font-mono">ONLINE (Hà Nội - ĐN Node)</strong>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>Chính sách bảo mật dữ liệu</span>
          <span>•</span>
          <span>Quy chuẩn TCVN 8819:2011</span>
          <span>•</span>
          <span className="font-mono text-slate-400">v2.4.1-prod</span>
        </div>
      </footer>
    </div>
  )
}
export default ForceChangePassword
