import React from 'react'
import { X, AlertTriangle, Check } from 'lucide-react'
import type { TriageCase } from './types'

export interface NoDefectModalProps {
  isOpen: boolean
  onClose: () => void
  targetTriageCase: TriageCase | null
  noDefectReason: string
  setNoDefectReason: (r: string) => void
  onConfirmNoDefect: () => void
}

export const NoDefectModal: React.FC<NoDefectModalProps> = ({
  isOpen,
  onClose,
  targetTriageCase,
  noDefectReason,
  setNoDefectReason,
  onConfirmNoDefect,
}) => {
  if (!isOpen || !targetTriageCase) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
              <X className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">Káº¿t Luáº­n: KhÃ´ng CÃ³ Khiáº¿m Khuyáº¿t (NO_DEFECT)</h3>
              <p className="text-xs text-red-600 font-semibold">
                Quy chuáº©n báº¥t biáº¿n BR-39: Báº¯t buá»™c giáº£i trÃ¬nh ká»¹ thuáº­t
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-700 block">Há»“ sÆ¡ xem xÃ©t tá»« chá»‘i:</span>
            <span className="font-mono font-bold text-brand-dark">
              {targetTriageCase.code} ({targetTriageCase.stationing})
            </span>
            <p className="text-slate-500">{targetTriageCase.defect_title}</p>
          </div>

          <div className="flex flex-col">
            <label className="font-bold text-slate-700 mb-1">
              LÃ½ do giáº£i trÃ¬nh ká»¹ thuáº­t tá»« chá»‘i: <span className="text-red-500">* (Báº¯t buá»™c theo BR-39)</span>
            </label>
            <textarea
              rows={3}
              value={noDefectReason}
              onChange={(e) => setNoDefectReason(e.target.value)}
              placeholder="Ghi rÃµ lÃ½ do: vÃ­ dá»¥ váº¿t nÆ°á»›c Ä‘á»ng bá» máº·t, bÃ¹n Ä‘áº¥t rÃ¡c rÃ£nh mÃ©p Ä‘Æ°á»ng, khÃ´ng cáº¥u thÃ nh ná»©t vá»¡ káº¿t cáº¥u máº·t Ä‘Æ°á»ng bÃª tÃ´ng xi mÄƒng..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
              required
            />
          </div>

          <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-[11px] text-red-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>
              LÃ½ do nÃ y sáº½ Ä‘Æ°á»£c ghi vÃ o nháº­t kÃ½ kiá»ƒm toÃ¡n khÃ´ng thá»ƒ xÃ³a (Audit Trail) vÃ  pháº£n há»“i lÃ½ do chÃ­nh thá»©c
              cho ngÆ°á»i dÃ¢n trÃªn á»©ng dá»¥ng di Ä‘á»™ng.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Há»§y bá»
          </button>
          <button
            type="button"
            onClick={onConfirmNoDefect}
            className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>XÃ¡c Nháº­n Káº¿t Luáº­n NO_DEFECT</span>
          </button>
        </div>
      </div>
    </div>
  )
}
