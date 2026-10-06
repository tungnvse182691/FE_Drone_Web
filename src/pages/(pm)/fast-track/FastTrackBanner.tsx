import React from 'react'
import { Zap } from 'lucide-react'

export interface FastTrackBannerProps {
  sourceCase: {
    code: string
    title: string
    stationing: string
    isEligible: boolean
  } | null
  onClose: () => void
}

export const FastTrackBanner: React.FC<FastTrackBannerProps> = ({
  sourceCase,
  onClose
}) => {
  if (!sourceCase) return null

  return (
    <div className="p-4 bg-amber-50/90 border-2 border-brand-gold rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-800 shadow-md animate-in fade-in">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-brand-gold text-white shrink-0 mt-0.5">
          <Zap className="w-5 h-5 fill-white" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-xs text-brand-dark">ÄÃƒ Tá»° Äá»˜NG CHá»ŒN Há»’ SÆ  Tá»ª Há»˜P THÆ¯ TIáº¾P NHáº¬N:</span>
            <span className="font-mono font-bold text-xs bg-white px-2.5 py-0.5 rounded-lg border border-amber-300 text-amber-900 shadow-2xs">
              {sourceCase.code}
            </span>
            {sourceCase.isEligible ? (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                âœ“ Äá»§ tiÃªu chuáº©n Fast Track Direct
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300">
                âš  VÆ°á»£t ngÆ°á»¡ng Fast Track (Chuyá»ƒn sang Cháº¿ Ä‘á»™ Äo Ä‘áº¡c)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600">
            <strong className="text-slate-800">{sourceCase.title}</strong> â€¢ LÃ½ trÃ¬nh: <span className="font-semibold text-slate-700">{sourceCase.stationing}</span>. Há»‡ thá»‘ng Ä‘Ã£ tá»± Ä‘á»™ng tick chá»n khiáº¿m khuyáº¿t nÃ y vÃ  thiáº¿t láº­p cháº¿ Ä‘á»™ phÃ¹ há»£p.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="self-start sm:self-center px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 bg-white border border-amber-200 rounded-lg cursor-pointer transition-colors shadow-2xs shrink-0"
      >
        ÄÃ³ng
      </button>
    </div>
  )
}
