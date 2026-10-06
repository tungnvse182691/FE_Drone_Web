import React from 'react'
import { Building2, X, CheckCircle2 } from 'lucide-react'
import type { TriageCase } from './types'

export interface TriageProjectModalProps {
  isOpen: boolean
  onClose: () => void
  targetTriageCase: TriageCase | null
  mockProjects: { id: string; code: string; name: string; start_km: number; end_km: number }[]
  selectedProjectId: string
  setSelectedProjectId: (id: string) => void
  onConfirmTriageProject: () => void
}

export const TriageProjectModal: React.FC<TriageProjectModalProps> = ({
  isOpen,
  onClose,
  targetTriageCase,
  mockProjects,
  selectedProjectId,
  setSelectedProjectId,
  onConfirmTriageProject,
}) => {
  if (!isOpen || !targetTriageCase) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-brand-gold border border-amber-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">Äiá»u Phá»‘i Pháº£n Ãnh VÃ o Dá»± Ãn (PA03)</h3>
              <p className="text-xs text-slate-500">Chá»‰ Ä‘á»‹nh tuyáº¿n Ä‘Æ°á»ng báº£o hÃ nh chá»‹u trÃ¡ch nhiá»‡m sá»­a chá»¯a</p>
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
            <span className="font-bold text-brand-dark block">Há»“ sÆ¡ pháº£n Ã¡nh tiáº¿p nháº­n:</span>
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-mono font-bold text-[#8F7212]">{targetTriageCase.code}</span>
              <span>
                {targetTriageCase.stationing} ({targetTriageCase.lane})
              </span>
            </div>
            <p className="text-slate-500 text-[11px] truncate">{targetTriageCase.defect_title}</p>
            <span className="text-[10px] text-slate-400 block">
              NgÆ°á»i bÃ¡o: {targetTriageCase.reporter_name || targetTriageCase.source_label} (
              {targetTriageCase.reporter_phone || 'KhÃ´ng cÃ³ SÄT'})
            </span>
          </div>

          <div className="flex flex-col">
            <label className="font-bold text-slate-700 mb-1">
              Chá»n tuyáº¿n Ä‘Æ°á»ng / Dá»± Ã¡n báº£o hÃ nh phá»¥ trÃ¡ch: <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-gold font-semibold cursor-pointer"
            >
              {mockProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name} (Km {p.start_km} &rarr; Km {p.end_km})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-[11px] text-blue-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Sau khi Ä‘iá»u phá»‘i, há»“ sÆ¡ sáº½ Ä‘Æ°á»£c gÃ¡n vÃ o pháº¡m vi quáº£n lÃ½ cá»§a dá»± Ã¡n, sáºµn sÃ ng Ä‘á»ƒ PM tháº©m Ä‘á»‹nh chi
              tiáº¿t vÃ  láº­p gÃ³i sá»­a chá»¯a hoáº·c giao nhiá»‡m vá»¥ kháº£o sÃ¡t Ä‘o Ä‘áº¡c hiá»‡n trÆ°á»ng.
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
            onClick={onConfirmTriageProject}
            className="px-4 py-2 text-xs font-bold bg-brand-gold hover:bg-[#B38E1F] text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>XÃ¡c Nháº­n Äiá»u Phá»‘i Dá»± Ãn</span>
          </button>
        </div>
      </div>
    </div>
  )
}
