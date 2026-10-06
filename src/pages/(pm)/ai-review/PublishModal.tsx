import React from 'react'
import { Send, X } from 'lucide-react'
import type { TriageCase } from './types'

export interface PublishModalProps {
  isOpen: boolean
  onClose: () => void
  targetTriageCase: TriageCase | null
  publishPublicNote: string
  setPublishPublicNote: (note: string) => void
  onConfirmPublishResult: () => void
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  targetTriageCase,
  publishPublicNote,
  setPublishPublicNote,
  onConfirmPublishResult,
}) => {
  if (!isOpen || !targetTriageCase) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">CÃ´ng Bá»‘ Tiáº¿n Äá»™ Xá»­ LÃ½ Cho NgÆ°á»i DÃ¢n (PA07)</h3>
              <p className="text-xs text-slate-500">Äá»“ng bá»™ thÃ´ng bÃ¡o cÃ´ng khai xuá»‘ng á»©ng dá»¥ng di Ä‘á»™ng Citizen</p>
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
            <span className="font-bold text-slate-700 block">Há»“ sÆ¡ pháº£n Ã¡nh:</span>
            <span className="font-mono font-bold text-brand-dark">{targetTriageCase.code}</span>
            <p className="text-slate-600">
              {targetTriageCase.stationing} - {targetTriageCase.defect_title}
            </p>
            <span className="text-[10px] text-slate-400 block">
              NgÆ°á»i gá»­i: {targetTriageCase.reporter_name || 'NgÆ°á»i dÃ¢n'} ({targetTriageCase.reporter_phone || 'N/A'})
            </span>
          </div>

          <div className="flex flex-col">
            <label className="font-bold text-slate-700 mb-1">Ná»™i dung thÃ´ng bÃ¡o cÃ´ng khai gá»­i ngÆ°á»i dÃ¢n:</label>
            <textarea
              rows={3}
              value={publishPublicNote}
              onChange={(e) => setPublishPublicNote(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            ÄÃ³ng
          </button>
          <button
            type="button"
            onClick={onConfirmPublishResult}
            className="px-4 py-2 text-xs font-bold bg-brand-gold hover:bg-[#B38E1F] text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>CÃ´ng Bá»‘ Xuá»‘ng App Citizen</span>
          </button>
        </div>
      </div>
    </div>
  )
}
