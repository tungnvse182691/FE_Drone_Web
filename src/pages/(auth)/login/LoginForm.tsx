import React from 'react'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  X
} from 'lucide-react'

export interface LoginFormProps {
  email: string
  setEmail: (val: string) => void
  password: string
  setPassword: (val: string) => void
  showPassword: boolean
  setShowPassword: (val: boolean) => void
  rememberMe: boolean
  setRememberMe: (val: boolean) => void
  loginError: boolean
  setLoginError: (val: boolean) => void
  isLoading: boolean
  onSubmit: (e: React.FormEvent) => void
}

export const LoginForm: React.FC<LoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  loginError,
  setLoginError,
  isLoading,
  onSubmit
}) => {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-headline">
          ÄÄƒng nháº­p há»‡ thá»‘ng
        </h1>
        <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
          Ná»n táº£ng giÃ¡m sÃ¡t báº£o hÃ nh &amp; Ä‘iá»u phá»‘i kháº¯c phá»¥c Ä‘Æ°á»ng bá»™
        </p>
      </div>

      {/* Error Banner */}
      {loginError && (
        <div className="p-3.5 rounded-2xl bg-[#FDEAEB] border border-red-200/70 text-[#D9383A] text-xs leading-relaxed flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#D9383A]" />
          <div className="flex-1">
            <span className="font-semibold">ÄÄƒng nháº­p khÃ´ng thÃ nh cÃ´ng:</span> Email hoáº·c máº­t kháº©u khÃ´ng Ä‘Ãºng.
            TÃ i khoáº£n máº«u: <strong>pmhoang@gmail.com</strong> hoáº·c <strong>suphoang@gmail.com</strong> (máº­t kháº©u: <strong>123456</strong>).
          </div>
          <button
            type="button"
            onClick={() => setLoginError(false)}
            className="text-red-400 hover:text-red-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Email cÃ´ng vá»¥</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pmhoang@gmail.com hoáº·c suphoang@gmail.com"
              required
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Máº­t kháº©u</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nháº­p máº­t kháº©u cÃ´ng vá»¥"
              required
              className="w-full pl-10 pr-11 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              title="áº¨n / Hiá»‡n máº­t kháº©u"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember & Forgot Password */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-brand-gold focus:ring-brand-gold accent-brand-gold"
            />
            <span className="text-xs text-slate-600 font-medium">Ghi nhá»› phiÃªn lÃ m viá»‡c trÃªn mÃ¡y nÃ y</span>
          </label>
          <button
            type="button"
            onClick={() => alert('Vui lÃ²ng liÃªn há»‡ Quáº£n trá»‹ viÃªn (Ban GiÃ¡m sÃ¡t) hoáº·c gá»­i yÃªu cáº§u Ä‘áº·t láº¡i máº­t kháº©u ná»™i bá»™ theo quy Ä‘á»‹nh TCVN 11944.')}
            className="text-xs font-semibold text-brand-goldMuted hover:text-brand-goldDark transition-colors cursor-pointer"
          >
            QuÃªn máº­t kháº©u?
          </button>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-brand-gold hover:bg-brand-goldMuted text-white text-sm font-semibold rounded-xl shadow-xs transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer disabled:opacity-75"
          >
            {isLoading ? (
              <span>Äang xÃ¡c thá»±c...</span>
            ) : (
              <>
                <span>ÄÄƒng nháº­p vÃ o há»‡ thá»‘ng</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Security Guard Notice */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
          <span>KhÃ´ng há»— trá»£ SSO cÃ´ng cá»™ng (FE-GAP-03)</span>
        </div>
        <span className="font-mono text-slate-400">TLS 1.3 â€¢ AES-256</span>
      </div>
    </section>
  )
}
export default LoginForm
