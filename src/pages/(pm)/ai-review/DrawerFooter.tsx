import React from 'react'
import { ShieldCheck } from 'lucide-react'

export interface DrawerFooterProps {
  handleClose?: () => void
}

export const DrawerFooter: React.FC<DrawerFooterProps> = ({ handleClose }) => {
  return (
    <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
      <div className="text-xs text-slate-500 flex items-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-brand-gold" />
        <span>Há»“ sÆ¡ tháº©m Ä‘á»‹nh theo chuáº©n PA05 / BR-39 tiÃªu chuáº©n HoÃ ng Háº£i.</span>
      </div>
      <button
        type="button"
        onClick={handleClose}
        className="px-5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer shadow-2xs"
      >
        ÄÃ³ng láº¡i
      </button>
    </div>
  )
}
