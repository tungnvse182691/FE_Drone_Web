import React from 'react'
import {
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Sparkles,
  Scale,
  Check,
  AlertTriangle,
  Lock,
  Clock,
  History as HistoryIcon,
  FileText,
} from 'lucide-react'
import type { PolicyThresholdConfig, PolicyHistoryItem } from './types'

export interface PolicySectionProps {
  currentPolicy: PolicyThresholdConfig
  policyHistory: (PolicyHistoryItem | any)[]
  onActivateDraft: (item: any) => void
  onOpenAuditModal: () => void
}

export const PolicySection: React.FC<PolicySectionProps> = ({
  currentPolicy,
  policyHistory,
  onActivateDraft,
  onOpenAuditModal,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xs border border-brand-border space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-brand-gold">
            <ShieldCheck className="w-5 h-5 text-brand-gold" />
          </div>
          <h2 className="text-lg font-bold text-brand-dark">PhiÃªn báº£n chÃ­nh sÃ¡ch Fast Track hiá»‡n hÃ nh</h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            {currentPolicy.version} (ACTIVE) â€” Báº¥t biáº¿n sau kÃ­ch hoáº¡t
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Quy chuáº©n kÃ­ch hoáº¡t: <strong className="text-brand-dark font-semibold">3/3 TiÃªu chÃ­</strong> báº¯t buá»™c pháº£i
            thá»a mÃ£n Ä‘á»ƒ tá»± Ä‘á»™ng má»Ÿ luá»“ng Fast Track
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Cá»™t trÃ¡i: 3 Tháº» ngÆ°á»¡ng ká»¹ thuáº­t & SLA Card (8 cols) */}
        <div className="xl:col-span-8 flex flex-col space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Threshold 1: Diá»‡n tÃ­ch */}
            <div className="bg-slate-50/70 rounded-xl p-4 flex flex-col justify-between space-y-3 border border-slate-200 shadow-2xs">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  NgÆ°á»¡ng diá»‡n tÃ­ch tá»‘i Ä‘a
                </span>
                <Sliders className="w-4 h-4 text-brand-gold" />
              </div>
              <div>
                <div className="text-2xl font-black text-brand-dark tracking-tight">
                  â‰¤ {currentPolicy.maxAreaM2} mÂ²
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Chu vi biÃªn dáº¡ng khÃ©p kÃ­n &lt; {currentPolicy.maxPerimeterM} m
                </p>
              </div>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                  <Sparkles className="w-3 h-3" />
                  AI &amp; Tuáº§n tra xÃ¡c thá»±c
                </span>
              </div>
            </div>

            {/* Threshold 2: Äá»™ sÃ¢u */}
            <div className="bg-slate-50/70 rounded-xl p-4 flex flex-col justify-between space-y-3 border border-slate-200 shadow-2xs">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  NgÆ°á»¡ng Ä‘á»™ sÃ¢u tá»‘i Ä‘a
                </span>
                <Scale className="w-4 h-4 text-brand-gold" />
              </div>
              <div>
                <div className="text-2xl font-black text-brand-dark tracking-tight">
                  â‰¤ {currentPolicy.maxDepthCm} cm
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Äá»™ lá»‡ch máº·t Ä‘Æ°á»ng cÆ¡ sá»Ÿ Ä‘o laser</p>
              </div>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                  <Check className="w-3 h-3" />
                  Kiá»ƒm tra Ä‘o Ä‘áº¡c thÆ°á»›c
                </span>
              </div>
            </div>

            {/* Threshold 3: Má»©c nghiÃªm trá»ng */}
            <div className="bg-slate-50/70 rounded-xl p-4 flex flex-col justify-between space-y-3 border border-slate-200 shadow-2xs">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Má»©c nghiÃªm trá»ng</span>
                <AlertTriangle className="w-4 h-4 text-brand-gold" />
              </div>
              <div>
                <div className="text-2xl font-black text-brand-dark tracking-tight">LOW / MEDIUM</div>
                <p className="text-[11px] text-slate-500 mt-1">KhÃ´ng gÃ¢y máº¥t an toÃ n giao thÃ´ng tá»©c thÃ¬</p>
              </div>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  <Lock className="w-3 h-3" />
                  Cáº¥m tá»± duyá»‡t HIGH / CRITICAL
                </span>
              </div>
            </div>
          </div>

          {/* SLA Card */}
          <div className="bg-white p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-brand-gold border border-amber-200 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-brand-dark block">
                  Thá»i gian cam káº¿t chu trÃ¬nh Fast Track
                </span>
                <span className="text-xs text-slate-500">
                  Thá»i háº¡n tá»‘i Ä‘a tá»« lÃºc xÃ¡c thá»±c Ä‘áº¿n hoÃ n táº¥t thi cÃ´ng sá»­a nguá»™i:{' '}
                  <strong className="text-brand-dark font-semibold">â‰¤ {currentPolicy.slaHours} giá»</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 font-mono text-xs bg-slate-50 px-3 py-1.5 rounded-full text-slate-700 border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>SLA SLA-FT-24H</span>
            </div>
          </div>
        </div>

        {/* Cá»™t pháº£i: Lá»‹ch sá»­ phiÃªn báº£n & Audit Log (4 cols) */}
        <div className="xl:col-span-4 bg-slate-50/60 rounded-xl p-4 flex flex-col justify-between border border-slate-200 shadow-2xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                <HistoryIcon className="w-4 h-4 text-brand-gold" />
                <span>Lá»‹ch sá»­ phiÃªn báº£n chÃ­nh sÃ¡ch</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                {policyHistory.length} báº£n ghi
              </span>
            </div>

            <div className="space-y-2">
              {policyHistory.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className={`p-2.5 rounded-lg border text-xs space-y-1.5 transition-all ${
                    item.status === 'ACTIVE'
                      ? 'bg-white border-brand-border shadow-xs'
                      : item.status === 'DRAFT'
                      ? 'bg-amber-50/70 border-amber-200 shadow-2xs'
                      : 'bg-slate-100/70 border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-brand-dark">{item.version}</span>
                      {item.status === 'ACTIVE' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Hiá»‡n hÃ nh
                        </span>
                      )}
                      {item.status === 'DRAFT' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Dá»± tháº£o
                        </span>
                      )}
                      {item.status === 'ARCHIVED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                          ÄÃ£ Ä‘Ã³ng
                        </span>
                      )}
                    </div>
                    {item.status === 'DRAFT' && (
                      <button
                        type="button"
                        onClick={() => onActivateDraft(item)}
                        className="px-2.5 py-0.5 text-[11px] font-bold text-white bg-brand-gold hover:bg-[#B38E1F] rounded-md transition-colors cursor-pointer shadow-xs"
                      >
                        KÃ­ch hoáº¡t ngay
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {item.status === 'DRAFT' ? 'Soáº¡n bá»Ÿi' : 'KÃ­ch hoáº¡t bá»Ÿi'} {item.activatedBy} â€¢ {item.activatedAt}
                  </p>
                  <div className="text-[11px] text-[#8F7212] font-semibold">{item.route}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    NgÆ°á»¡ng: Diá»‡n tÃ­ch â‰¤ {item.maxArea}mÂ² â€¢ SÃ¢u â‰¤ {item.maxDepth}cm â€¢ SLA {item.slaHours}h
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onOpenAuditModal}
            type="button"
            className="mt-3 w-full py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-brand-gold" />
            <span>Xem nháº­t kÃ½ chi tiáº¿t thay Ä‘á»•i (Audit Log)</span>
          </button>
        </div>
      </div>
    </div>
  )
}
