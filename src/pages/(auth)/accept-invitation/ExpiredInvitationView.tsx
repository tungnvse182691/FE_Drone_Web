import React from 'react'
import { Link2Off, LogIn } from 'lucide-react'

export interface ExpiredInvitationViewProps {
  onBackToLogin: () => void
  onSwitchToValidDemo: () => void
}

export const ExpiredInvitationView: React.FC<ExpiredInvitationViewProps> = ({
  onBackToLogin,
  onSwitchToValidDemo
}) => {
  return (
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
          <span>Token Ä‘Ã£ vÃ´ hiá»‡u hÃ³a</span>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2 font-headline">
          LiÃªn káº¿t lá»i má»i khÃ´ng cÃ²n hiá»‡u lá»±c
        </h2>
        <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
          MÃ£ lá»i má»i token <code className="font-mono bg-slate-100 px-2 py-0.5 rounded text-rose-600 font-semibold">inv_tok_98f21e892c</code> nÃ y Ä‘Ã£ háº¿t háº¡n sau 48 giá» hoáº·c Ä‘Ã£ Ä‘Æ°á»£c kÃ­ch hoáº¡t trÆ°á»›c Ä‘Ã³.
        </p>

        {/* Detailed Info Card */}
        <div className="w-full bg-slate-50 rounded-xl p-4 text-left mb-6 space-y-2 border border-slate-200 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Dá»± Ã¡n liÃªn káº¿t:</span>
            <span className="font-semibold text-slate-900">QL1A - Giai Ä‘oáº¡n 2 (PRJ-QL1A-02)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">NgÆ°á»i gá»­i lá»i má»i:</span>
            <span className="font-semibold text-slate-900">Nguyá»…n VÄƒn An (Ban QLDA)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Thá»i gian gá»­i thÆ°:</span>
            <span className="font-mono text-slate-500">28/09/2026 - 08:30:14</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-6">
          Vui lÃ²ng liÃªn há»‡ <strong className="text-slate-800">GiÃ¡m sÃ¡t trÆ°á»Ÿng</strong> hoáº·c Quáº£n trá»‹ viÃªn há»‡ thá»‘ng HoÃ ng Háº£i RoadGuard Ä‘á»ƒ Ä‘Æ°á»£c tÃ¡i cáº¥p liÃªn káº¿t truy cáº­p má»›i.
        </p>

        {/* Actions */}
        <div className="w-full space-y-3">
          <button
            onClick={onBackToLogin}
            className="w-full py-3.5 px-6 rounded-xl bg-brand-gold hover:bg-brand-goldMuted text-white text-sm font-semibold flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Quay vá» mÃ n hÃ¬nh Ä‘Äƒng nháº­p</span>
          </button>
          <button
            onClick={onSwitchToValidDemo}
            className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            Xem láº¡i mÃ n hÃ¬nh thÆ° má»i há»£p lá»‡ (Demo)
          </button>
        </div>
      </div>
    </div>
  )
}
export default ExpiredInvitationView
