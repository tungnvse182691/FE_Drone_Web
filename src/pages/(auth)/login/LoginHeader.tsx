import React from 'react'
import {
  LogIn,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react'
import { LoginViewMode } from './types'

export interface LoginHeaderProps {
  viewMode: LoginViewMode
  setViewMode: (mode: LoginViewMode) => void
}

export const LoginHeader: React.FC<LoginHeaderProps> = ({ viewMode, setViewMode }) => {
  return (
    <>
      {/* Top Bar Switcher */}
      <header className="w-full px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-200 text-stone-700 font-mono">
            AUTH-GUARD â€¢ TCVN 11944:2018
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            An ninh truy cáº­p háº¡ táº§ng giao thÃ´ng Ä‘Æ°á»ng bá»™
          </span>
        </div>

        {/* Toggle Demo Mode Buttons */}
        <div className="flex items-center bg-white border border-slate-200 p-1 rounded-full shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode('login')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'login'
                ? 'bg-brand-gold text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Form ÄÄƒng nháº­p chÃ­nh (WF-01)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('force')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'force'
                ? 'bg-brand-gold text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Cháº·n Ä‘á»•i máº­t kháº©u láº§n Ä‘áº§u</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          </button>
        </div>
      </header>

      {/* Decorative subtle background map lines */}
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
          <path
            d="M100,-100 C200,300 50,600 250,1000"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <circle cx="800" cy="400" r="6" fill="#C9A227" opacity="0.4" />
          <circle cx="1100" cy="650" r="5" fill="#C9A227" opacity="0.4" />
        </svg>
      </div>
    </>
  )
}

export const LoginBrandCardHeader: React.FC = () => {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-11 h-11 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold shadow-xs">
        <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-slate-900 font-headline">
            HoÃ ng Háº£i
          </span>
          <span className="text-xs px-2 py-0.5 font-mono font-semibold bg-brand-gold/10 text-brand-gold border border-brand-gold/30 rounded-full">
            ROADGUARD
          </span>
        </div>
        <p className="text-xs font-medium text-slate-500 tracking-wide uppercase">
          Quáº£n lÃ½ Báº£o hÃ nh &amp; Sá»­a chá»¯a Háº¡ táº§ng
        </p>
      </div>
    </div>
  )
}

export const LoginFooter: React.FC = () => {
  return (
    <footer className="w-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 z-10 gap-2 border-t border-slate-200/50 bg-white/40 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span>
          Há»‡ thá»‘ng mÃ¡y chá»§ giÃ¡m sÃ¡t váº­n hÃ nh:{' '}
          <strong className="text-slate-700 font-semibold font-mono">ONLINE (HÃ  Ná»™i - ÄN Node)</strong>
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span>ChÃ­nh sÃ¡ch báº£o máº­t dá»¯ liá»‡u</span>
        <span>â€¢</span>
        <span>Quy chuáº©n TCVN 8819:2011</span>
        <span>â€¢</span>
        <span className="font-mono text-slate-400">v2.4.1-prod</span>
      </div>
    </footer>
  )
}
