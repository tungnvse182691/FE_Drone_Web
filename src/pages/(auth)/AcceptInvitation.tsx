import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  HelpCircle,
  Timer,
  Mail,
  Route,
  BadgeAlert,
  Link2Off,
  LogIn,
  Check,
  ToggleLeft,
  ToggleRight,
  Circle,
  AlertCircle,
  Sparkles
} from 'lucide-react'

export const AcceptInvitation: React.FC = () => {
  const navigate = useNavigate()
  const { token } = useParams<{ token?: string }>()
  const { login } = useAuthStore()

  // Chế độ xem Demo: 'valid' (Token hợp lệ) hoặc 'expired' (Token hết hạn)
  const [demoState, setDemoState] = useState<'valid' | 'expired'>('valid')

  // Form state - Để rỗng để người dùng nhập và thấy thước đo độ mạnh hoạt động real-time
  const [fullName, setFullName] = useState('Đỗ Quốc Hoàng')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreementChecked, setAgreementChecked] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Password rules validation
  const rules = {
    length: password.length >= 8,
    case: /[a-z]/.test(password) && /[A-Z]/.test(password),
    special: /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password),
  }

  // Password strength score (0 to 4 vạch)
  const getStrength = () => {
    if (!password) {
      return { score: 0, label: 'Chưa nhập mật khẩu', color: 'text-slate-400', barColor: 'bg-slate-200' }
    }
    let passed = 0
    if (rules.length) passed++
    if (rules.case) passed++
    if (rules.special) passed++
    if (password.length >= 12) passed++

    if (password.length < 8) {
      return { score: 1, label: 'Yếu (Weak)', color: 'text-rose-500', barColor: 'bg-rose-500' }
    }
    if (passed <= 2) {
      return { score: 2, label: 'Trung bình (Fair)', color: 'text-amber-500', barColor: 'bg-amber-500' }
    }
    if (passed === 3) {
      return { score: 3, label: 'Khá mạnh (Good)', color: 'text-[#8C6D1F]', barColor: 'bg-[#C9A227]' }
    }
    return { score: 4, label: 'Rất mạnh (Strong) — Chuẩn Enterprise', color: 'text-emerald-600', barColor: 'bg-emerald-600' }
  }

  const strength = getStrength()
  const isMatched = confirmPassword.length > 0 && password === confirmPassword
  const isFormValid = rules.length && rules.case && rules.special && isMatched && agreementChecked

  const handleFillStrongPassword = () => {
    const strongPass = 'RoadGuard@2026Secure'
    setPassword(strongPass)
    setConfirmPassword(strongPass)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      // Kích hoạt tài khoản PM và đăng nhập vào Dashboard
      login(RoleCode.PROJECT_MANAGER)
      navigate('/pm/dashboard')
    }, 900)
  }

  return (
    <div
      className="min-h-screen text-slate-800 flex flex-col justify-between relative selection:bg-[#C9A227] selection:text-white"
      style={{
        backgroundColor: '#F8F9FA',
      }}
    >
      {/* Background Dot & Subtle Vector Map Grid */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-40 bg-[radial-gradient(#cac7b5_1px,transparent_1px)] [background-size:24px_24px]"></div>
      <div className="pointer-events-none fixed inset-0 z-0 opacity-20 overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 1200 800">
          <path d="M-100,200 C300,100 600,450 1300,300" strokeDasharray="8 8"></path>
          <path d="M-50,280 C320,180 620,530 1350,380"></path>
          <path d="M-100,500 C400,650 700,200 1300,550" strokeDasharray="4 4"></path>
          <circle cx="520" cy="380" fill="currentColor" r="4"></circle>
          <circle cx="780" cy="290" fill="currentColor" r="4"></circle>
        </svg>
      </div>

      {/* Top Header */}
      <header className="relative z-10 w-full px-6 md:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C9A227] flex items-center justify-center text-white shadow-xs">
            <Route className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base text-slate-900 tracking-tight font-headline">Hoàng Hải RoadGuard</span>
            <span className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">Civil Asset &amp; Highway Telemetry</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/70 border border-slate-300/40 text-slate-700 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>NODE: VN-HAN-01</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>TLS 1.3 SECURE</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="flex flex-col w-full items-center justify-center relative">
          {/* Interactive Floating Mode Switcher (Demo State Toggle) */}
          <div className="fixed top-4 right-4 z-50 flex items-center p-1 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-slate-200">
            <div className="flex items-center text-xs mr-2 pl-3 text-slate-500 font-medium">
              <span>Chế độ Demo:</span>
            </div>
            <button
              onClick={() => setDemoState('valid')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                demoState === 'valid'
                  ? 'bg-[#C9A227] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              Token hợp lệ
            </button>
            <button
              onClick={() => setDemoState('expired')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                demoState === 'expired'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              Token hết hạn
            </button>
          </div>

          {/* Decorative Highway Stationing Watermark Badge */}
          <div className="hidden lg:flex items-center gap-2 mb-4 px-3.5 py-1 bg-slate-200/70 rounded-full border border-slate-300/40 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse"></span>
            <span className="text-[12px] font-mono text-slate-600 font-medium">HỆ THỐNG KIỂM SOÁT THI CÔNG &amp; HẠ TẦNG GIAO THÔNG SỐ</span>
            <span className="text-slate-400">•</span>
            <span className="text-[12px] font-mono text-[#8C6D1F] font-bold">SECURE ONBOARDING GATEWAY</span>
          </div>

          {/* ========================================================= */}
          {/* STATE A: VALID INVITATION CARD (DEFAULT) */}
          {/* ========================================================= */}
          {demoState === 'valid' && (
            <div
              className="w-full max-w-[580px] bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 relative border border-slate-200"
              style={{ borderRadius: '16px', boxShadow: 'rgba(0, 0, 0, 0.05) 0px 4px 20px -2px' }}
            >
              {/* Top Decorative Geometric Stripe */}
              <div
                className="h-2 w-full"
                style={{ background: 'linear-gradient(90deg, #C9A227 0%, #B38E1F 50%, #E8D385 100%)' }}
              />

              <div className="p-6 sm:p-8 md:p-9 flex flex-col">
                {/* Brand & Status Badge Row */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-[#C9A227] p-0.5 flex items-center justify-center shadow-xs">
                      <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-[#C9A227]">
                        <Route className="w-6 h-6 stroke-[2.2]" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-bold tracking-tight text-slate-900 font-headline">Hoàng Hải</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#C9A227]/10 text-[#8C6D1F] font-mono text-[11px] font-bold">PRO</span>
                      </div>
                      <span className="text-xs text-slate-500">RoadGuard Civil Platform v2.2</span>
                    </div>
                  </div>

                  {/* Invitation Badge Circle */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-[#EDF7ED] flex items-center justify-center shadow-2xs">
                      <Mail className="w-6 h-6 text-[#1B5E20]" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#1B5E20] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  </div>
                </div>

                {/* Main Headline */}
                <div className="mb-6">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-snug font-headline">
                    Bạn nhận được lời mời tham gia dự án
                  </h1>
                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                    Supervisor <strong className="text-slate-900 font-semibold">Nguyễn Văn An</strong> (Ban QLDA) đã gửi lời mời tham gia quản trị &amp; vận hành dự án hạ tầng giao thông trọng điểm.
                  </p>
                </div>

                {/* Project Summary Box (#FAF8F5) */}
                <div
                  className="rounded-xl p-4 sm:p-5 mb-6 border border-slate-200 relative overflow-hidden"
                  style={{ backgroundColor: '#FAF8F5', borderRadius: '12px' }}
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/5">
                    <span className="text-xs uppercase tracking-wider text-slate-600 font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
                      Chi tiết phân công nhân sự
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 font-semibold">
                      MÃ: {token ? `#${token}` : '#IVT-2026-98F'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 relative z-10 text-xs">
                    {/* Item 1: Project Name */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-2xs text-[#C9A227]">
                        <Route className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[11px] text-slate-500">Dự án công trình</span>
                        <p className="text-sm font-bold text-slate-900 truncate">Quốc lộ 1A - Giai đoạn 2</p>
                        <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 bg-white rounded-full font-mono text-[10px] text-[#8C6D1F] font-semibold border border-slate-200">
                          <span>Km 1024 - Km 1045</span>
                          <span className="text-slate-300">•</span>
                          <span>PRJ-QL1A-02</span>
                        </div>
                      </div>
                    </div>

                    {/* Item 2: Assigned Role */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-2xs text-[#C9A227]">
                        <BadgeAlert className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[11px] text-slate-500">Vai trò bổ nhiệm</span>
                        <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A227] text-white shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                          <span className="text-xs font-semibold tracking-wide">Project Manager (PM)</span>
                        </div>
                      </div>
                    </div>

                    {/* Item 3: Email Receiver */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-2xs text-[#C9A227]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-500">Email xác thực</span>
                          <span className="inline-flex items-center text-[10px] text-slate-500 font-medium bg-black/5 px-1.5 py-0.2 rounded-full">
                            <Lock className="w-2.5 h-2.5 mr-0.5" /> Read-only
                          </span>
                        </div>
                        <p className="font-mono text-slate-900 text-xs truncate mt-0.5 font-semibold">
                          pmhoang@gmail.com
                        </p>
                      </div>
                    </div>

                    {/* Item 4: Expiration Window */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-2xs text-amber-600">
                        <Timer className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[11px] text-slate-500">Thời hạn liên kết</span>
                        <div className="mt-0.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706]">
                          <span className="text-xs font-bold">Còn 48 giờ</span>
                          <span className="text-[10px] text-[#D97706]/80">(23:59 02/10/2026)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Setup */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Field 1: Full Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Họ và tên hiển thị trong hệ thống <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative rounded-lg shadow-2xs">
                      <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227] transition"
                      />
                    </div>
                  </div>

                  {/* Field 2: Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700">
                        Thiết lập mật khẩu đăng nhập mới <span className="text-rose-600">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleFillStrongPassword}
                        className="inline-flex items-center gap-1 text-[11px] text-[#8C6D1F] hover:text-[#C9A227] font-semibold transition cursor-pointer"
                        title="Tự động điền mật khẩu mẫu đạt chuẩn Enterprise"
                      >
                        <Sparkles className="w-3 h-3 text-[#C9A227]" />
                        <span>Gợi ý mật khẩu mẫu</span>
                      </button>
                    </div>
                    <div className="relative rounded-lg shadow-2xs">
                      <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Nhập ít nhất 8 ký tự..."
                        className="w-full pl-10 pr-11 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#C9A227] transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator (Dynamic) */}
                    <div className="pt-1.5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className={`flex items-center gap-1.5 font-semibold transition-colors ${strength.color}`}>
                          {strength.score >= 3 ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : strength.score > 0 ? (
                            <AlertCircle className="w-3.5 h-3.5" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-slate-300" />
                          )}
                          <span>Mức độ: {strength.label}</span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {strength.score === 4 ? 'Đạt chuẩn an ninh Ban QLDA' : 'Yêu cầu tối thiểu: Khá mạnh'}
                        </span>
                      </div>

                      {/* 4-Segment Progress Bar */}
                      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-full rounded-full transition-all duration-300 ${
                              strength.score >= level ? strength.barColor : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>

                      {/* 3 Checklist Items */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 pt-1 text-[11px]">
                        <div
                          className={`flex items-center gap-1 transition-colors ${
                            rules.length ? 'text-emerald-700 font-semibold' : 'text-slate-400'
                          }`}
                        >
                          {rules.length ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                          )}
                          <span>Tối thiểu 8 ký tự</span>
                        </div>
                        <div
                          className={`flex items-center gap-1 transition-colors ${
                            rules.case ? 'text-emerald-700 font-semibold' : 'text-slate-400'
                          }`}
                        >
                          {rules.case ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                          )}
                          <span>Chữ hoa &amp; thường</span>
                        </div>
                        <div
                          className={`flex items-center gap-1 transition-colors ${
                            rules.special ? 'text-emerald-700 font-semibold' : 'text-slate-400'
                          }`}
                        >
                          {rules.special ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                          )}
                          <span>Số &amp; ký tự đặc biệt</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Field 3: Confirm Password */}
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Xác nhận mật khẩu mới <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative rounded-lg shadow-2xs">
                      <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Nhập lại chính xác mật khẩu..."
                        className="w-full pl-10 pr-11 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#C9A227] transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && (
                      <div className="pt-0.5">
                        {isMatched ? (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mật khẩu trùng khớp
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] text-rose-500 font-medium">
                            <AlertCircle className="w-3.5 h-3.5" /> Mật khẩu xác nhận chưa trùng khớp
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Legal Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer select-none p-3 rounded-xl bg-slate-100/70 hover:bg-slate-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={agreementChecked}
                        onChange={(e) => setAgreementChecked(e.target.checked)}
                        required
                        className="mt-0.5 w-4 h-4 rounded text-[#C9A227] focus:ring-[#C9A227] accent-[#C9A227] cursor-pointer"
                      />
                      <span className="text-xs text-slate-600 leading-snug">
                        Tôi cam kết tuân thủ quy chế bảo mật số liệu công trình,{' '}
                        <strong className="text-slate-900">Nghị định 130/2018/NĐ-CP</strong> và tính toàn vẹn của chuỗi bằng chứng pháp lý (
                        <span className="font-mono font-semibold">Audit Trail SHA-256</span>).
                      </span>
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 space-y-3">
                    <button
                      type="submit"
                      disabled={isSubmitting || !isFormValid}
                      className="w-full py-3.5 px-6 rounded-xl bg-[#C9A227] hover:bg-[#8C6D1F] text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.99] transition shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <span>Đang kích hoạt tài khoản...</span>
                      ) : (
                        <>
                          <span>Chấp thuận lời mời &amp; Vào không gian dự án</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Bạn có chắc chắn muốn từ chối lời mời tham gia dự án này?')) {
                            navigate('/login')
                          }
                        }}
                        className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-300 transition cursor-pointer"
                      >
                        Từ chối lời mời
                      </button>
                      <button
                        type="button"
                        onClick={() => alert('Vui lòng liên hệ Giám sát trưởng Nguyễn Văn An hoặc Ban Chỉ huy dự án Hoàng Hải: 1900-6868')}
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-[#8C6D1F] transition underline underline-offset-4 cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Cần hỗ trợ từ Giám sát viên (Supervisor)?</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Micro Tech Footer inside card */}
              <div className="px-6 sm:px-9 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-slate-500 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span>Mã hóa End-to-End TLS 1.3</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span>TCVN 8819:2011</span>
                  <span>•</span>
                  <span>SHA-256 Verified</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STATE B: EXPIRED / INVALID INVITATION CARD */}
          {/* ========================================================= */}
          {demoState === 'expired' && (
            <div
              className="w-full max-w-[560px] bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 relative border border-slate-200"
              style={{ borderRadius: '16px', boxShadow: 'rgba(0, 0, 0, 0.05) 0px 4px 20px -2px' }}
            >
              <div className="h-2 w-full bg-rose-600" />
              <div className="p-8 sm:p-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-5 shadow-xs">
                  <Link2Off className="w-8 h-8" />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                  <span>Token đã vô hiệu hóa</span>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2 font-headline">
                  Liên kết lời mời không còn hiệu lực
                </h2>
                <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
                  Mã lời mời token <code className="font-mono bg-slate-100 px-2 py-0.5 rounded text-rose-600 font-semibold">inv_tok_98f21e892c</code> này đã hết hạn sau 48 giờ hoặc đã được kích hoạt trước đó.
                </p>

                {/* Detailed Info Card */}
                <div className="w-full bg-slate-50 rounded-xl p-4 text-left mb-6 space-y-2 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Dự án liên kết:</span>
                    <span className="font-semibold text-slate-900">QL1A - Giai đoạn 2 (PRJ-QL1A-02)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Người gửi lời mời:</span>
                    <span className="font-semibold text-slate-900">Nguyễn Văn An (Ban QLDA)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Thời gian gửi thư:</span>
                    <span className="font-mono text-slate-500">28/09/2026 - 08:30:14</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mb-6">
                  Vui lòng liên hệ <strong className="text-slate-800">Giám sát trưởng</strong> hoặc Quản trị viên hệ thống Hoàng Hải RoadGuard để được tái cấp liên kết truy cập mới.
                </p>

                {/* Actions */}
                <div className="w-full space-y-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#C9A227] hover:bg-[#8C6D1F] text-white text-sm font-semibold flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Quay về màn hình đăng nhập</span>
                  </button>
                  <button
                    onClick={() => setDemoState('valid')}
                    className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
                  >
                    Xem lại màn hình thư mời hợp lệ (Demo)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sub-footer Legal */}
          <div className="w-full max-w-2xl text-center mt-6 space-y-1 px-4 pb-2 text-[11px] text-slate-400">
            <p>Hệ thống bảo mật hạ tầng số RoadGuard • Nhà thầu Hoàng Hải • Tuân thủ TCVN 8819:2011 • Mã hóa End-to-End TLS 1.3 • Toàn vẹn SHA-256</p>
            <p>© 2026 Hoàng Hải Infrastructure Management Group. All rights reserved.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
