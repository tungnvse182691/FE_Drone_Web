import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  X,
  AlertCircle,
  Camera,
  Send,
  ShieldCheck,
  Eye,
} from 'lucide-react'
import type { TriageCase } from './types'

export interface DrawerDecisionFormProps {
  selectedCase: TriageCase
  currentSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  setCurrentSeverity: (s: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => void
  currentUrgency: 'NORMAL' | 'URGENT' | 'EMERGENCY'
  setCurrentUrgency: (u: 'NORMAL' | 'URGENT' | 'EMERGENCY') => void
  currentArea: number
  setCurrentArea: (a: number) => void
  currentDepth: number
  setCurrentDepth: (d: number) => void
  currentNotes: string
  setCurrentNotes: (n: string) => void
  onVerifyDefect: (c?: TriageCase) => void
  onOpenNoDefectModal: (c?: TriageCase) => void
  onConclusionOutOfScope: (c?: TriageCase) => void
  onOpenRequestSurveyModal: (c?: TriageCase) => void
  onOpenPublishModal: (c?: TriageCase) => void
  onNavigateFastTrack: (c: TriageCase) => void
}

export const DrawerDecisionForm: React.FC<DrawerDecisionFormProps> = ({
  selectedCase,
  currentSeverity,
  setCurrentSeverity,
  currentUrgency,
  setCurrentUrgency,
  currentArea,
  setCurrentArea,
  currentDepth,
  setCurrentDepth,
  currentNotes,
  setCurrentNotes,
  onVerifyDefect,
  onOpenNoDefectModal,
  onConclusionOutOfScope,
  onOpenRequestSurveyModal,
  onOpenPublishModal,
  onNavigateFastTrack,
}) => {
  const navigate = useNavigate()

  return (
    <div className="space-y-3.5">
      {/* Severity & Urgency */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label className="text-[11px] font-semibold text-slate-700 mb-1">
            Má»©c Ä‘á»™ nghiÃªm trá»ng <span className="text-red-500">*</span>
          </label>
          <select
            value={currentSeverity}
            onChange={(e) => setCurrentSeverity(e.target.value as any)}
            className={`w-full text-xs font-bold px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer ${
              currentSeverity === 'CRITICAL'
                ? 'bg-red-50 text-red-700 border-red-200'
                : currentSeverity === 'HIGH'
                ? 'bg-amber-50 text-[#8F7212] border-amber-200'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <option value="LOW">LOW (Nháº¹ - Cáº¥p 1)</option>
            <option value="MEDIUM">MEDIUM (Vá»«a - Cáº¥p 2)</option>
            <option value="HIGH">HIGH (NghiÃªm trá»ng - Cáº¥p 3)</option>
            <option value="CRITICAL">CRITICAL (Nguy hiá»ƒm - Cáº¥p 4)</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-[11px] font-semibold text-slate-700 mb-1">
            TÃ­nh kháº©n cáº¥p <span className="text-red-500">*</span>
          </label>
          <select
            value={currentUrgency}
            onChange={(e) => setCurrentUrgency(e.target.value as any)}
            className="w-full bg-amber-50 text-amber-900 border border-amber-200 font-bold text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer"
          >
            <option value="NORMAL">NORMAL (Theo lá»‹ch 7 ngÃ y)</option>
            <option value="URGENT">URGENT (Trong 24-48 giá»)</option>
            <option value="EMERGENCY">EMERGENCY (Xá»­ lÃ½ ngay 4h)</option>
          </select>
        </div>
      </div>

      {/* Area & Depth Dimensions */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label className="text-[11px] font-medium text-slate-600 mb-1">Diá»‡n tÃ­ch hÆ° háº¡i</label>
          <div className="flex items-center bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg focus-within:ring-1 focus-within:ring-brand-gold focus-within:border-brand-gold">
            <input
              type="number"
              step="0.01"
              value={currentArea}
              onChange={(e) => setCurrentArea(parseFloat(e.target.value) || 0)}
              className="w-full bg-transparent font-mono text-xs font-bold text-slate-800 focus:outline-none"
            />
            <span className="text-xs text-slate-500 font-semibold ml-1">mÂ²</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">
            AI Æ°á»›c tÃ­nh: {selectedCase.ai_area_sqm} mÂ²
          </span>
        </div>

        <div className="flex flex-col">
          <label className="text-[11px] font-medium text-slate-600 mb-1">Äá»™ sÃ¢u lá»›n nháº¥t</label>
          <div className="flex items-center bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg focus-within:ring-1 focus-within:ring-brand-gold focus-within:border-brand-gold">
            <input
              type="number"
              step="0.1"
              value={currentDepth}
              onChange={(e) => setCurrentDepth(parseFloat(e.target.value) || 0)}
              className="w-full bg-transparent font-mono text-xs font-bold text-slate-800 focus:outline-none"
            />
            <span className="text-xs text-slate-500 font-semibold ml-1">cm</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">
            AI Æ°á»›c tÃ­nh: {selectedCase.ai_depth_cm} cm
          </span>
        </div>
      </div>

      {/* PM Notes */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-semibold text-slate-700">Ghi chÃº tháº©m Ä‘á»‹nh PM</label>
          <span className="text-[10px] text-slate-400 font-normal">LÆ°u nháº­t kÃ½ cÃ´ng trÃ¬nh</span>
        </div>
        <textarea
          rows={2}
          value={currentNotes}
          onChange={(e) => setCurrentNotes(e.target.value)}
          placeholder="Nháº­p ghi chÃº ká»¹ thuáº­t, chá»‰ Ä‘áº¡o vÃ¡ nÃ³ng cáº¥p bÃ¡ch hoáº·c Ä‘á» xuáº¥t cáº¯m biá»ƒn cáº£nh bÃ¡o táº¡m..."
          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
        />
      </div>

      {/* Decision Action Buttons (PA05: DEFECT_FOUND / NO_DEFECT / OUT_OF_SCOPE) */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={() => onVerifyDefect(selectedCase)}
          className={`w-full py-2.5 px-4 rounded-lg text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
            selectedCase.conclusion === 'DEFECT_FOUND'
              ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-400'
              : 'bg-brand-gold hover:bg-[#B38E1F]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {selectedCase.conclusion === 'DEFECT_FOUND'
              ? 'âœ“ ÄÃ£ XÃ¡c Minh DEFECT_FOUND (Báº¥m Ä‘á»ƒ cáº­p nháº­t láº¡i)'
              : 'XÃ¡c minh cÃ³ khiáº¿m khuyáº¿t (DEFECT_FOUND - PA05)'}
          </span>
        </button>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onOpenNoDefectModal(selectedCase)}
            className={`border px-2.5 py-2 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer ${
              selectedCase.conclusion === 'NO_DEFECT'
                ? 'bg-red-600 text-white border-red-700'
                : 'bg-white border-slate-200 hover:bg-red-50 text-red-600'
            }`}
            title="KhÃ´ng cÃ³ khiáº¿m khuyáº¿t (Báº¯t buá»™c lÃ½ do giáº£i trÃ¬nh theo BR-39)"
          >
            <X className="w-3.5 h-3.5" />
            <span>{selectedCase.conclusion === 'NO_DEFECT' ? 'ÄÃ£ bÃ¡o sai' : 'KhÃ´ng cÃ³ lá»—i (BR-39)'}</span>
          </button>
          <button
            type="button"
            onClick={() => onConclusionOutOfScope(selectedCase)}
            className={`border px-2.5 py-2 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer ${
              selectedCase.conclusion === 'OUT_OF_SCOPE'
                ? 'bg-amber-600 text-white border-amber-700'
                : 'bg-white border-slate-200 hover:bg-amber-50 text-amber-700'
            }`}
            title="NgoÃ i pháº¡m vi báº£o hÃ nh HoÃ ng Háº£i"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{selectedCase.conclusion === 'OUT_OF_SCOPE' ? 'ÄÃ£ loáº¡i trá»«' : 'NgoÃ i pháº¡m vi'}</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenRequestSurveyModal(selectedCase)}
            className={`border px-2.5 py-2 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer ${
              selectedCase.status === 'NEED_SURVEY'
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
            title="YÃªu cáº§u kháº£o sÃ¡t láº¡i hiá»‡n trÆ°á»ng hoáº·c bay drone bÃ¹ (WF-11)"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{selectedCase.status === 'NEED_SURVEY' ? 'ÄÃ£ giao Ä‘o láº¡i' : 'YÃªu cáº§u Ä‘o láº¡i'}</span>
          </button>
        </div>

        {/* Public Notice Action (PA07) */}
        <button
          type="button"
          onClick={() => onOpenPublishModal(selectedCase)}
          className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border ${
            selectedCase.is_published
              ? 'bg-sky-50 text-sky-800 border-sky-300 font-bold'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
          }`}
        >
          <Send className="w-3.5 h-3.5 text-blue-600" />
          <span>
            {selectedCase.is_published
              ? `ðŸ“¢ ÄÃ£ cÃ´ng bá»‘ tiáº¿n Ä‘á»™ cho ngÆ°á»i dÃ¢n (${selectedCase.published_at || 'HÃ´m nay'})`
              : 'CÃ´ng bá»‘ tiáº¿n Ä‘á»™ cho ngÆ°á»i dÃ¢n (PA07)'}
          </span>
        </button>
      </div>

      {/* Compliance Note & Direct Action Links */}
      <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-600 text-[11px]">
          <ShieldCheck className="w-4 h-4 text-brand-gold shrink-0" />
          <span>ÄÃ£ Ä‘á»§ Ä‘iá»u kiá»‡n kÃ­ch hoáº¡t lá»‡nh thi cÃ´ng sá»­a chá»¯a cáº¥p bÃ¡ch (WF-05).</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => navigate(`/pm/defects/${selectedCase.id}/verify`)}
            className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-brand-gold" />
            <span>So sÃ¡nh Ä‘a ká»³ & BBox</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateFastTrack(selectedCase)}
            className="py-2 px-3 bg-amber-50 hover:bg-amber-100 text-[#8F7212] text-xs font-bold rounded-lg border border-amber-200 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-brand-gold" />
            <span>Äiá»u phá»‘i Fast Track</span>
          </button>
        </div>
      </div>
    </div>
  )
}
