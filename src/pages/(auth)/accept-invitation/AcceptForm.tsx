import React from 'react'
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Circle,
  ArrowRight,
  HelpCircle
} from 'lucide-react'
import { PasswordRules, PasswordStrength } from './types'

export interface AcceptFormProps {
  fullName: string
  setFullName: (val: string) => void
  password: string
  setPassword: (val: string) => void
  showPassword: boolean
  setShowPassword: (val: boolean) => void
  confirmPassword: string
  setConfirmPassword: (val: string) => void
  showConfirmPassword: boolean
  setShowConfirmPassword: (val: boolean) => void
  agreementChecked: boolean
  setAgreementChecked: (val: boolean) => void
  isSubmitting: boolean
  isFormValid: boolean
  isMatched: boolean
  rules: PasswordRules
  strength: PasswordStrength
  onFillStrongPassword: () => void
  onSubmit: (e: React.FormEvent) => void
  onReject: () => void
}

export const AcceptForm: React.FC<AcceptFormProps> = ({
  fullName,
  setFullName,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  confirmPassword,
  setConfirmPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  agreementChecked,
  setAgreementChecked,
  isSubmitting,
  isFormValid,
  isMatched,
  rules,
  strength,
  onFillStrongPassword,
  onSubmit,
  onReject
}) => {
  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Field 1: Full Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Há» vÃ  tÃªn hiá»ƒn thá»‹ trong há»‡ thá»‘ng <span className="text-rose-600">*</span>
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
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold transition"
            />
          </div>
        </div>

        {/* Field 2: Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700">
              Thiáº¿t láº­p máº­t kháº©u Ä‘Äƒng nháº­p má»›i <span className="text-rose-600">*</span>
            </label>
            <button
              type="button"
              onClick={onFillStrongPassword}
              className="inline-flex items-center gap-1 text-[11px] text-brand-goldMuted hover:text-brand-gold font-semibold transition cursor-pointer"
              title="Tá»± Ä‘á»™ng Ä‘iá»n máº­t kháº©u máº«u Ä‘áº¡t chuáº©n Enterprise"
            >
              <Sparkles className="w-3 h-3 text-brand-gold" />
              <span>Gá»£i Ã½ máº­t kháº©u máº«u</span>
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
              placeholder="Nháº­p Ã­t nháº¥t 8 kÃ½ tá»±..."
              className="w-full pl-10 pr-11 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-gold transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          <div className="pt-1.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className={`flex items-center gap-1.5 font-semibold transition-colors ${strength.color}`}>
                {strength.score >= 3 ? <CheckCircle2 className="w-3.5 h-3.5" /> : strength.score > 0 ? <AlertCircle className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5 text-slate-300" />}
                <span>Má»©c Ä‘á»™: {strength.label}</span>
              </div>
              <span className="text-[11px] text-slate-500">
                {strength.score === 4 ? 'Äáº¡t chuáº©n an ninh Ban QLDA' : 'YÃªu cáº§u tá»‘i thiá»ƒu: KhÃ¡ máº¡nh'}
              </span>
            </div>

            {/* 4-Segment Progress Bar */}
            <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-full rounded-full transition-all duration-300 ${strength.score >= level ? strength.barColor : 'bg-slate-200'}`}
                />
              ))}
            </div>

            {/* 3 Checklist Items */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 pt-1 text-[11px]">
              <div className={`flex items-center gap-1 transition-colors ${rules.length ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                {rules.length ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                <span>Tá»‘i thiá»ƒu 8 kÃ½ tá»±</span>
              </div>
              <div className={`flex items-center gap-1 transition-colors ${rules.case ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                {rules.case ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                <span>Chá»¯ hoa &amp; thÆ°á»ng</span>
              </div>
              <div className={`flex items-center gap-1 transition-colors ${rules.special ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                {rules.special ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                <span>Sá»‘ &amp; kÃ½ tá»± Ä‘áº·c biá»‡t</span>
              </div>
            </div>
          </div>
        </div>

        {/* Field 3: Confirm Password */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-xs font-semibold text-slate-700">
            XÃ¡c nháº­n máº­t kháº©u má»›i <span className="text-rose-600">*</span>
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
              placeholder="Nháº­p láº¡i chÃ­nh xÃ¡c máº­t kháº©u..."
              className="w-full pl-10 pr-11 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-gold transition"
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
                  <CheckCircle2 className="w-3.5 h-3.5" /> Máº­t kháº©u trÃ¹ng khá»›p
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-rose-500 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> Máº­t kháº©u xÃ¡c nháº­n chÆ°a trÃ¹ng khá»›p
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
              className="mt-0.5 w-4 h-4 rounded text-brand-gold focus:ring-brand-gold accent-brand-gold cursor-pointer"
            />
            <span className="text-xs text-slate-600 leading-snug">
              TÃ´i cam káº¿t tuÃ¢n thá»§ quy cháº¿ báº£o máº­t sá»‘ liá»‡u cÃ´ng trÃ¬nh,{' '}
              <strong className="text-slate-900">Nghá»‹ Ä‘á»‹nh 130/2018/NÄ-CP</strong> vÃ  tÃ­nh toÃ n váº¹n cá»§a chuá»—i báº±ng chá»©ng phÃ¡p lÃ½ (
              <span className="font-mono font-semibold">Audit Trail SHA-256</span>).
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 space-y-3">
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className="w-full py-3.5 px-6 rounded-xl bg-brand-gold hover:bg-brand-goldMuted text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.99] transition shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span>Äang kÃ­ch hoáº¡t tÃ i khoáº£n...</span>
            ) : (
              <>
                <span>Cháº¥p thuáº­n lá»i má»i &amp; VÃ o khÃ´ng gian dá»± Ã¡n</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 text-xs">
            <button
              type="button"
              onClick={onReject}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-300 transition cursor-pointer"
            >
              Tá»« chá»‘i lá»i má»i
            </button>
            <button
              type="button"
              onClick={() => alert('Vui lÃ²ng liÃªn há»‡ GiÃ¡m sÃ¡t trÆ°á»Ÿng Nguyá»…n VÄƒn An hoáº·c Ban Chá»‰ huy dá»± Ã¡n HoÃ ng Háº£i: 1900-6868')}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-brand-goldMuted transition underline underline-offset-4 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Cáº§n há»— trá»£ tá»« GiÃ¡m sÃ¡t viÃªn (Supervisor)?</span>
            </button>
          </div>
        </div>
      </form>

      {/* Micro Tech Footer inside card */}
      <div className="mt-6 -mx-6 sm:-mx-8 md:-mx-9 -mb-6 sm:-mb-8 md:-mb-9 px-6 sm:px-9 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-slate-500 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          <span>MÃ£ hÃ³a End-to-End TLS 1.3</span>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <span>TCVN 8819:2011</span>
          <span>â€¢</span>
          <span>SHA-256 Verified</span>
        </div>
      </div>
    </>
  )
}
export default AcceptForm
