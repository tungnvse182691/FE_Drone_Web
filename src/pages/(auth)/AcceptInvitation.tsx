import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { Route, ShieldCheck } from 'lucide-react'
import { InvitationDemoState } from './accept-invitation/types'
import { InvitationCard } from './accept-invitation/InvitationCard'
import { AcceptForm } from './accept-invitation/AcceptForm'
import { ExpiredInvitationView } from './accept-invitation/ExpiredInvitationView'

export const AcceptInvitation: React.FC = () => {
  const navigate = useNavigate()
  const { token } = useParams<{ token?: string }>()
  const { login } = useAuthStore()

  // Cháº¿ Ä‘á»™ xem Demo: 'valid' (Token há»£p lá»‡) hoáº·c 'expired' (Token háº¿t háº¡n)
  const [demoState, setDemoState] = useState<InvitationDemoState>('valid')

  // Form state
  const [fullName, setFullName] = useState('Äá»— Quá»‘c HoÃ ng')
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

  // Password strength score (0 to 4 váº¡ch)
  const getStrength = () => {
    if (!password) {
      return { score: 0, label: 'ChÆ°a nháº­p máº­t kháº©u', color: 'text-slate-400', barColor: 'bg-slate-200' }
    }
    let passed = 0
    if (rules.length) passed++
    if (rules.case) passed++
    if (rules.special) passed++
    if (password.length >= 12) passed++

    if (password.length < 8) {
      return { score: 1, label: 'Yáº¿u (Weak)', color: 'text-rose-500', barColor: 'bg-rose-500' }
    }
    if (passed <= 2) {
      return { score: 2, label: 'Trung bÃ¬nh (Fair)', color: 'text-amber-500', barColor: 'bg-amber-500' }
    }
    if (passed === 3) {
      return { score: 3, label: 'KhÃ¡ máº¡nh (Good)', color: 'text-brand-goldMuted', barColor: 'bg-brand-gold' }
    }
    return { score: 4, label: 'Ráº¥t máº¡nh (Strong) â€” Chuáº©n Enterprise', color: 'text-emerald-600', barColor: 'bg-emerald-600' }
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
      login(RoleCode.PROJECT_MANAGER)
      navigate('/pm/dashboard')
    }, 900)
  }

  return (
    <div
      className="min-h-screen text-slate-800 flex flex-col justify-between relative selection:bg-brand-gold selection:text-white"
      style={{ backgroundColor: '#F8F9FA' }}
    >
      {/* Background Dot & Vector Map Grid */}
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
          <div className="w-10 h-10 rounded-xl bg-brand-gold flex items-center justify-center text-white shadow-xs">
            <Route className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base text-slate-900 tracking-tight font-headline">HoÃ ng Háº£i RoadGuard</span>
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
              <span>Cháº¿ Ä‘á»™ Demo:</span>
            </div>
            <button
              onClick={() => setDemoState('valid')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                demoState === 'valid'
                  ? 'bg-brand-gold text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              Token há»£p lá»‡
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
              Token háº¿t háº¡n
            </button>
          </div>

          {/* Decorative Highway Stationing Watermark Badge */}
          <div className="hidden lg:flex items-center gap-2 mb-4 px-3.5 py-1 bg-slate-200/70 rounded-full border border-slate-300/40 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse"></span>
            <span className="text-[12px] font-mono text-slate-600 font-medium">Há»† THá»NG KIá»‚M SOÃT THI CÃ”NG &amp; Háº  Táº¦NG GIAO THÃ”NG Sá»</span>
            <span className="text-slate-400">â€¢</span>
            <span className="text-[12px] font-mono text-brand-goldMuted font-bold">SECURE ONBOARDING GATEWAY</span>
          </div>

          {/* STATE A: VALID INVITATION CARD */}
          {demoState === 'valid' ? (
            <div
              className="w-full max-w-[580px] bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 relative border border-slate-200"
              style={{ borderRadius: '16px', boxShadow: 'rgba(0, 0, 0, 0.05) 0px 4px 20px -2px' }}
            >
              <div
                className="h-2 w-full"
                style={{ background: 'linear-gradient(90deg, #C9A227 0%, #B38E1F 50%, #E8D385 100%)' }}
              />
              <div className="p-6 sm:p-8 md:p-9 flex flex-col">
                <InvitationCard token={token} />
                <AcceptForm
                  fullName={fullName}
                  setFullName={setFullName}
                  password={password}
                  setPassword={setPassword}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  confirmPassword={confirmPassword}
                  setConfirmPassword={setConfirmPassword}
                  showConfirmPassword={showConfirmPassword}
                  setShowConfirmPassword={setShowConfirmPassword}
                  agreementChecked={agreementChecked}
                  setAgreementChecked={setAgreementChecked}
                  isSubmitting={isSubmitting}
                  isFormValid={isFormValid}
                  isMatched={isMatched}
                  rules={rules}
                  strength={strength}
                  onFillStrongPassword={handleFillStrongPassword}
                  onSubmit={handleSubmit}
                  onReject={() => {
                    if (window.confirm('Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n tá»« chá»‘i lá»i má»i tham gia dá»± Ã¡n nÃ y?')) {
                      navigate('/login')
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            <ExpiredInvitationView
              onBackToLogin={() => navigate('/login')}
              onSwitchToValidDemo={() => setDemoState('valid')}
            />
          )}

          {/* Sub-footer Legal */}
          <div className="w-full max-w-2xl text-center mt-6 space-y-1 px-4 pb-2 text-[11px] text-slate-400">
            <p>Há»‡ thá»‘ng báº£o máº­t háº¡ táº§ng sá»‘ RoadGuard â€¢ NhÃ  tháº§u HoÃ ng Háº£i â€¢ TuÃ¢n thá»§ TCVN 8819:2011 â€¢ MÃ£ hÃ³a End-to-End TLS 1.3 â€¢ ToÃ n váº¹n SHA-256</p>
            <p>Â© 2026 HoÃ ng Háº£i Infrastructure Management Group. All rights reserved.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
export default AcceptInvitation
