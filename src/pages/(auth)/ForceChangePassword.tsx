import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import {
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Key,
  CheckCircle2,
  Check,
  LogOut,
  AlertTriangle
} from 'lucide-react'

export const ForceChangePassword: React.FC = () => {
  const navigate = useNavigate()
  const { user, login } = useAuthStore()

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

      {/* Central Authentication Card */}
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
                Quản lý Bảo hành & Sửa chữa Hạ tầng
              </p>
            </div>
          </div>

          <section className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold mb-2 font-mono">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>FLAG: mustChangePassword = true</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-headline">
                Thiết lập mật khẩu mới
              </h1>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                Bảo vệ tài khoản quản trị trước khi truy cập cơ sở dữ liệu đường bộ.
              </p>
            </div>

            {/* Warning Policy Banner */}
            <div className="p-3.5 rounded-xl bg-[#FEF3C7] border border-amber-300/80 text-[#D97706] text-xs leading-relaxed flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#D97706]" />
              <div>
                <span className="font-bold">Yêu cầu bảo mật bắt buộc:</span> Đây là lần đầu bạn đăng nhập bằng mật khẩu tạm. Vui lòng thiết lập mật khẩu mới trước khi tiếp tục.
              </div>
            </div>

            {/* Force Password Change Form */}
            <form onSubmit={handleForcePasswordSubmit} className="space-y-4">
              {/* Temporary Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Mật khẩu hiện tại (Mật khẩu tạm)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type={showTempPassword ? 'text' : 'password'}
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    placeholder="Nhập mật khẩu tạm đã được cấp"
                    required
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/20 focus:border-[#C9A227] transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTempPassword(!showTempPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showTempPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Mật khẩu mới</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 8 ký tự, có chữ hoa, số & ký tự đặc biệt"
                    required
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/20 focus:border-[#C9A227] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới vừa đặt"
                    required
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/20 focus:border-[#C9A227] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {isConfirmMismatched && (
                  <p className="text-xs font-semibold text-[#D9383A] flex items-center gap-1.5 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Mật khẩu xác nhận không trùng khớp</span>
                  </p>
                )}
              </div>

              {/* Password Strength Checklist TCVN 11944 */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Tiêu chuẩn độ an toàn (TCVN 11944)</span>
                  <span
                    className={`text-[11px] font-mono font-medium ${
                      allRulesPassed ? 'text-emerald-600 font-semibold' : 'text-slate-500'
                    }`}
                  >
                    {rulesPassedCount}/4 điều kiện
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div
                    className={`flex items-center gap-2 transition-colors ${
                      rules.length ? 'text-emerald-600 font-medium' : 'text-slate-500'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                        rules.length
                          ? 'bg-emerald-500 border-emerald-600 text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {rules.length && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span>Ít nhất 8 ký tự</span>
                  </div>

                  <div
                    className={`flex items-center gap-2 transition-colors ${
                      rules.case ? 'text-emerald-600 font-medium' : 'text-slate-500'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                        rules.case
                          ? 'bg-emerald-500 border-emerald-600 text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {rules.case && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span>1 hoa &amp; 1 thường</span>
                  </div>

                  <div
                    className={`flex items-center gap-2 transition-colors ${
                      rules.number ? 'text-emerald-600 font-medium' : 'text-slate-500'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                        rules.number
                          ? 'bg-emerald-500 border-emerald-600 text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {rules.number && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span>Ít nhất 1 chữ số</span>
                  </div>

                  <div
                    className={`flex items-center gap-2 transition-colors ${
                      rules.special ? 'text-emerald-600 font-medium' : 'text-slate-500'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                        rules.special
                          ? 'bg-emerald-500 border-emerald-600 text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {rules.special && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span>1 ký tự đặc biệt (!@#$)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <button
                  type="submit"
                  disabled={!allRulesPassed || !isConfirmMatched}
                  className={`w-full py-3 px-4 text-white text-sm font-semibold rounded-xl shadow-xs transition-all duration-150 flex items-center justify-center gap-2 ${
                    allRulesPassed && isConfirmMatched
                      ? 'bg-[#C9A227] hover:bg-[#8C6D1F] cursor-pointer active:scale-[0.99]'
                      : 'bg-[#C9A227] opacity-50 cursor-not-allowed'
                  }`}
                >
                  {isForceSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Đã đổi thành công! Đang chuyển hướng...</span>
                    </>
                  ) : (
                    <>
                      <span>Cập nhật mật khẩu &amp; Vào Dashboard</span>
                      <ShieldCheck className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-slate-400" />
                  <span>Quay lại Đăng nhập</span>
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>

      {/* Footer with Legal & System Status */}
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
