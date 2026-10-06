import React from 'react'
import { ChevronRight, Plus, Send } from 'lucide-react'

export interface FastTrackHeaderProps {
  basePath: string
  onNavigateDashboard: () => void
  onOpenPolicyModal: () => void
  onScrollToDispatch: () => void
}

export const FastTrackHeader: React.FC<FastTrackHeaderProps> = ({
  onNavigateDashboard,
  onOpenPolicyModal,
  onScrollToDispatch
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div className="space-y-1">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <button
            onClick={onNavigateDashboard}
            className="hover:text-brand-gold cursor-pointer transition-colors"
          >
            Trang chá»§
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="hover:text-brand-gold cursor-pointer transition-colors">Quáº£n lÃ½ tuyáº¿n</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-brand-gold font-semibold">ChÃ­nh sÃ¡ch & Giao viá»‡c Ä‘o Ä‘áº¡c (WF-05)</span>
        </nav>

        <div className="flex items-center gap-2.5 pt-0.5">
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
            Cáº¥u hÃ¬nh chÃ­nh sÃ¡ch Fast Track & Äiá»u phá»‘i hiá»‡n trÆ°á»ng
          </h1>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold"></span>
            QL1A â€¢ PK-04
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Thiáº¿t láº­p ngÆ°á»¡ng tá»± Ä‘á»™ng xá»­ lÃ½ nhanh vÃ  phÃ¢n cÃ´ng 3 cháº¿ Ä‘á»™ kháº£o sÃ¡t, sá»­a chá»¯a hiá»‡n trÆ°á»ng.
        </p>
      </div>

      {/* Action Buttons Top Bar */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <button
          onClick={onOpenPolicyModal}
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-slate-700 text-xs font-semibold rounded-xl shadow-xs hover:bg-slate-50 border border-slate-200 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4 text-brand-gold" />
          <span>Táº¡o phiÃªn báº£n chÃ­nh sÃ¡ch má»›i</span>
        </button>
        <button
          onClick={onScrollToDispatch}
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-gold hover:bg-[#B38E1F] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
        >
          <Send className="w-4 h-4" />
          <span>Táº¡o lá»‡nh giao viá»‡c</span>
        </button>
      </div>
    </div>
  )
}
