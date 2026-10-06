import React from 'react'
import {
  Key,
  Lock,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  AlertCircle
} from 'lucide-react'
import { PasswordRules } from './types'

export interface ForcePasswordFormProps {
  tempPassword: string
  setTempPassword: (val: string) => void
  showTempPassword: boolean
  setShowTempPassword: (val: boolean) => void
  newPassword: string
  setNewPassword: (val: string) => void
  showNewPassword: boolean
  setShowNewPassword: (val: boolean) => void
  confirmPassword: string
  setConfirmPassword: (val: string) => void
  showConfirmPassword: boolean
  setShowConfirmPassword: (val: boolean) => void
  rules: PasswordRules
  rulesPassedCount: number
  allRulesPassed: boolean
  isConfirmMatched: boolean
  isConfirmMismatched: boolean
  isForceSuccess: boolean
  onSubmit: (e: React.FormEvent) => void
}

export const ForcePasswordForm: React.FC<ForcePasswordFormProps> = ({
  tempPassword,
  setTempPassword,
  showTempPassword,
  setShowTempPassword,
  newPassword,
  setNewPassword,
  showNewPassword,
  setShowNewPassword,
  confirmPassword,
  setConfirmPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  rules,
  rulesPassedCount,
  allRulesPassed,
  isConfirmMatched,
  isConfirmMismatched,
  isForceSuccess,
  onSubmit
}) => {
  return (
    <section className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold mb-2 font-mono">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>FLAG: mustChangePassword = true</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-headline">
          Thiáº¿t láº­p máº­t kháº©u má»›i
        </h1>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
          Báº£o vá»‡ tÃ i khoáº£n quáº£n trá»‹ trÆ°á»›c khi truy cáº­p cÆ¡ sá»Ÿ dá»¯ liá»‡u Ä‘Æ°á»ng bá»™.
        </p>
      </div>

      {/* Warning Policy Banner */}
      <div className="p-3.5 rounded-xl bg-[#FEF3C7] border border-amber-300/80 text-[#D97706] text-xs leading-relaxed flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#D97706]" />
        <div>
          <span className="font-bold">YÃªu cáº§u báº£o máº­t báº¯t buá»™c:</span> ÄÃ¢y lÃ  láº§n Ä‘áº§u báº¡n Ä‘Äƒng nháº­p báº±ng máº­t kháº©u táº¡m. Vui lÃ²ng thiáº¿t láº­p máº­t kháº©u má»›i trÆ°á»›c khi tiáº¿p tá»¥c.
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Temporary Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Máº­t kháº©u hiá»‡n táº¡i (Máº­t kháº©u táº¡m)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Key className="w-4 h-4" />
            </div>
            <input
              type={showTempPassword ? 'text' : 'password'}
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              placeholder="Nháº­p máº­t kháº©u táº¡m Ä‘Ã£ Ä‘Æ°á»£c cáº¥p"
              required
              className="w-full pl-10 pr-11 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all font-mono"
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
          <label className="block text-xs font-semibold text-slate-700">Máº­t kháº©u má»›i</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Tá»‘i thiá»ƒu 8 kÃ½ tá»±, cÃ³ chá»¯ hoa, sá»‘ & kÃ½ tá»± Ä‘áº·c biá»‡t"
              required
              className="w-full pl-10 pr-11 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
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
          <label className="block text-xs font-semibold text-slate-700">XÃ¡c nháº­n máº­t kháº©u má»›i</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nháº­p láº¡i máº­t kháº©u má»›i vá»«a Ä‘áº·t"
              required
              className="w-full pl-10 pr-11 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
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
              <span>Máº­t kháº©u xÃ¡c nháº­n khÃ´ng trÃ¹ng khá»›p</span>
            </p>
          )}
        </div>

        {/* Password Strength Checklist TCVN 11944 */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">TiÃªu chuáº©n Ä‘á»™ an toÃ n (TCVN 11944)</span>
            <span
              className={`text-[11px] font-mono font-medium ${
                allRulesPassed ? 'text-emerald-600 font-semibold' : 'text-slate-500'
              }`}
            >
              {rulesPassedCount}/4 Ä‘iá»u kiá»‡n
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className={`flex items-center gap-2 transition-colors ${rules.length ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${rules.length ? 'bg-emerald-500 border-emerald-600 text-white' : 'border-slate-300'}`}>
                {rules.length && <Check className="w-2.5 h-2.5" />}
              </div>
              <span>Ãt nháº¥t 8 kÃ½ tá»±</span>
            </div>
            <div className={`flex items-center gap-2 transition-colors ${rules.case ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${rules.case ? 'bg-emerald-500 border-emerald-600 text-white' : 'border-slate-300'}`}>
                {rules.case && <Check className="w-2.5 h-2.5" />}
              </div>
              <span>1 hoa &amp; 1 thÆ°á»ng</span>
            </div>
            <div className={`flex items-center gap-2 transition-colors ${rules.number ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${rules.number ? 'bg-emerald-500 border-emerald-600 text-white' : 'border-slate-300'}`}>
                {rules.number && <Check className="w-2.5 h-2.5" />}
              </div>
              <span>Ãt nháº¥t 1 chá»¯ sá»‘</span>
            </div>
            <div className={`flex items-center gap-2 transition-colors ${rules.special ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${rules.special ? 'bg-emerald-500 border-emerald-600 text-white' : 'border-slate-300'}`}>
                {rules.special && <Check className="w-2.5 h-2.5" />}
              </div>
              <span>1 kÃ½ tá»± Ä‘áº·c biá»‡t (!@#$)</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!allRulesPassed || !isConfirmMatched}
            className={`w-full py-3 px-4 text-white text-sm font-semibold rounded-xl shadow-xs transition-all duration-150 flex items-center justify-center gap-2 ${
              allRulesPassed && isConfirmMatched
                ? 'bg-brand-gold hover:bg-brand-goldMuted cursor-pointer active:scale-[0.99]'
                : 'bg-brand-gold opacity-50 cursor-not-allowed'
            }`}
          >
            {isForceSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>ÄÃ£ Ä‘á»•i thÃ nh cÃ´ng! Äang chuyá»ƒn hÆ°á»›ng...</span>
              </>
            ) : (
              <>
                <span>Cáº­p nháº­t máº­t kháº©u &amp; VÃ o Dashboard</span>
                <ShieldCheck className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  )
}
export default ForcePasswordForm
