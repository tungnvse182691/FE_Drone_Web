import React from 'react'
import { ShieldCheck, X, CheckCircle2, Lock, AlertTriangle } from 'lucide-react'
import { PolicyThresholdConfig } from './types'

export interface PolicyModalProps {
  isOpen: boolean
  onClose: () => void
  currentPolicy: PolicyThresholdConfig
  formVersionName: string
  setFormVersionName: (v: string) => void
  formMaxArea: string
  setFormMaxArea: (v: string) => void
  formMaxDepth: string
  setFormMaxDepth: (v: string) => void
  formSlaHours: string
  setFormSlaHours: (v: string) => void
  formMaxPerimeter: string
  setFormMaxPerimeter: (v: string) => void
  formPolicyNote: string
  setFormPolicyNote: (v: string) => void
  handleApplyPolicy: (action: 'DRAFT' | 'ACTIVATE') => void
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  currentPolicy,
  formVersionName,
  setFormVersionName,
  formMaxArea,
  setFormMaxArea,
  formMaxDepth,
  setFormMaxDepth,
  formSlaHours,
  setFormSlaHours,
  formMaxPerimeter,
  setFormMaxPerimeter,
  formPolicyNote,
  setFormPolicyNote,
  handleApplyPolicy
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-brand-gold">
              <ShieldCheck className="w-4 h-4 text-brand-gold" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">Táº¡o PhiÃªn Báº£n ChÃ­nh SÃ¡ch Fast Track Má»›i</h3>
              <span className="text-[10px] text-slate-500">Káº¿ thá»«a vÃ  Ä‘iá»u chá»‰nh tá»« {currentPolicy.version}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">TÃªn phiÃªn báº£n chÃ­nh sÃ¡ch</label>
            <input
              type="text"
              value={formVersionName}
              onChange={(e) => setFormVersionName(e.target.value)}
              placeholder="VÃ­ dá»¥: Policy v2.2"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold focus:bg-white focus:border-brand-gold focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">NgÆ°á»¡ng diá»‡n tÃ­ch tá»‘i Ä‘a (mÂ²)</label>
              <input
                type="number"
                step="0.05"
                value={formMaxArea}
                onChange={(e) => setFormMaxArea(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold focus:border-brand-gold focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Hiá»‡n hÃ nh: â‰¤ {currentPolicy.maxAreaM2} mÂ²</span>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">NgÆ°á»¡ng Ä‘á»™ sÃ¢u tá»‘i Ä‘a (cm)</label>
              <input
                type="number"
                step="0.5"
                value={formMaxDepth}
                onChange={(e) => setFormMaxDepth(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold focus:border-brand-gold focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Hiá»‡n hÃ nh: â‰¤ {currentPolicy.maxDepthCm} cm</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Thá»i háº¡n SLA hoÃ n thÃ nh (giá»)</label>
              <input
                type="number"
                value={formSlaHours}
                onChange={(e) => setFormSlaHours(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold focus:border-brand-gold focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Hiá»‡n hÃ nh: â‰¤ {currentPolicy.slaHours} giá»</span>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Chu vi tá»‘i Ä‘a (m)</label>
              <input
                type="number"
                step="0.1"
                value={formMaxPerimeter}
                onChange={(e) => setFormMaxPerimeter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold focus:border-brand-gold focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Hiá»‡n hÃ nh: â‰¤ {currentPolicy.maxPerimeterM} m</span>
            </div>
          </div>

          {/* Cáº¥u hÃ¬nh Má»©c Ä‘á»™ nghiÃªm trá»ng Ã¡p dá»¥ng */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Má»©c Ä‘á»™ nghiÃªm trá»ng cho phÃ©p Ã¡p dá»¥ng Fast Track
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>LOW (Nháº¹)</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>MEDIUM (Vá»«a)</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-400 cursor-not-allowed opacity-80" title="Quy chuáº©n an toÃ n cáº¥m tá»± duyá»‡t Fast Track vá»›i lá»—i náº·ng">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>HIGH (KhÃ³a)</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-400 cursor-not-allowed opacity-80" title="Quy chuáº©n an toÃ n cáº¥m tá»± duyá»‡t Fast Track vá»›i lá»—i kháº©n cáº¥p/nguy hiá»ƒm">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>CRITICAL (KhÃ³a)</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              ðŸ”’ <strong>RÃ ng buá»™c báº¥t biáº¿n:</strong> Theo quy Ä‘á»‹nh BR-04 &amp; BR-08, Fast Track chá»‰ Ã¡p dá»¥ng cho hÆ° há»ng nhá»/vá»«a (LOW &amp; MEDIUM). HÆ° há»ng káº¿t cáº¥u náº·ng (HIGH/CRITICAL) báº¯t buá»™c pháº£i qua tháº©m duyá»‡t Supervisor hoáº·c Äá»™i cá»©u há»™ kháº©n cáº¥p.
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Ghi chÃº cÄƒn cá»© & lÃ½ do ban hÃ nh</label>
            <textarea
              rows={2}
              value={formPolicyNote}
              onChange={(e) => setFormPolicyNote(e.target.value)}
              placeholder="Ghi rÃµ cÆ¡ sá»Ÿ Ä‘iá»u chá»‰nh..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-brand-gold focus:outline-none"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Quy táº¯c há»‡ thá»‘ng:</strong> Khi chá»n <em>KÃ­ch hoáº¡t chÃ­nh sÃ¡ch ngay</em>, há»‡ thá»‘ng sáº½ tá»± Ä‘á»™ng cáº­p nháº­t báº£ng khiáº¿m khuyáº¿t theo ngÆ°á»¡ng má»›i vÃ  lÆ°u báº£n hiá»‡n táº¡i ({currentPolicy.version}) vÃ o kho lÆ°u trá»¯ (ARCHIVED).
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
          <button
            onClick={onClose}
            type="button"
            className="px-3.5 py-2 bg-white text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            Há»§y bá»
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleApplyPolicy('DRAFT')}
              type="button"
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-[#8F7212] text-xs font-bold rounded-xl border border-amber-200 shadow-2xs cursor-pointer transition-colors"
            >
              LÆ°u dá»± tháº£o (DRAFT)
            </button>
            <button
              onClick={() => handleApplyPolicy('ACTIVATE')}
              type="button"
              className="px-4 py-2 bg-brand-gold hover:bg-[#B38E1F] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>KÃ­ch hoáº¡t chÃ­nh sÃ¡ch ngay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
