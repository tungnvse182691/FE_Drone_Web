import React from 'react'
import { X, Wrench, Check, Send } from 'lucide-react'
import type { ProposalWorkPackage } from './types'

export interface ProposalDetailModalProps {
  selectedPackageForDetail: ProposalWorkPackage | null
  setSelectedPackageForDetail: React.Dispatch<React.SetStateAction<ProposalWorkPackage | null>>
  isSupervisor: boolean
  isPM: boolean
  handleQuickApprove: (id: string, code: string) => void
  handleSubmitDraftPackage: (id: string, code: string) => void
}

export const ProposalDetailModal: React.FC<ProposalDetailModalProps> = ({
  selectedPackageForDetail,
  setSelectedPackageForDetail,
  isSupervisor,
  isPM,
  handleQuickApprove,
  handleSubmitDraftPackage,
}) => {
  if (!selectedPackageForDetail) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-brand-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header chi tiáº¿t */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono font-bold text-sm shadow-xs shrink-0 ${
                selectedPackageForDetail.status === 'SUBMITTED'
                  ? 'bg-brand-gold text-white'
                  : selectedPackageForDetail.status === 'DECIDED'
                  ? 'bg-emerald-600 text-white'
                  : selectedPackageForDetail.status === 'DISPATCHED'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-white'
              }`}
            >
              {selectedPackageForDetail.code.split('-').pop()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-800">
                  {selectedPackageForDetail.code}
                </span>
                <span
                  className={`font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    selectedPackageForDetail.status === 'SUBMITTED'
                      ? 'bg-amber-100 text-amber-800'
                      : selectedPackageForDetail.status === 'DECIDED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedPackageForDetail.status === 'DISPATCHED'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {selectedPackageForDetail.status}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Snapshot: v1.0 (Immutable)
                </span>
              </div>
              <h3 className="text-base font-bold text-brand-dark mt-1">
                {selectedPackageForDetail.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                <span>Tuyáº¿n: <strong className="text-slate-700">{selectedPackageForDetail.route_name}</strong></span>
                <span>â€¢</span>
                <span>Pháº¡m vi: <strong className="text-slate-700 font-mono">{selectedPackageForDetail.chainage_display}</strong></span>
                <span>â€¢</span>
                <span>NhÃ  tháº§u: <strong className="text-slate-700">{selectedPackageForDetail.contractor_name}</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedPackageForDetail(null)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: Danh sÃ¡ch cÃ¡c RepairItems */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium block">Sá»‘ lÆ°á»£ng khiáº¿m khuyáº¿t</span>
              <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                {selectedPackageForDetail.defect_count} háº¡ng má»¥c
              </span>
              <span className="text-[11px] text-slate-500">{selectedPackageForDetail.defect_summary}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium block">Khá»‘i lÆ°á»£ng ká»¹ thuáº­t dá»± toÃ¡n</span>
              <span className="text-lg font-mono font-bold text-slate-900 mt-0.5 block">
                {selectedPackageForDetail.technical_scope}
              </span>
              <span className="text-[11px] text-slate-500">{selectedPackageForDetail.material_scope}</span>
            </div>
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
              <span className="text-[11px] text-amber-900 font-medium block">Thá»i háº¡n &amp; Tiáº¿n Ä‘á»™ káº¿ hoáº¡ch</span>
              <span className="text-lg font-mono font-black text-[#8F7212] mt-0.5 block">
                {selectedPackageForDetail.duration_days} ngÃ y thi cÃ´ng
              </span>
              <span className="text-[11px] text-amber-800">
                Káº¿ hoáº¡ch: {selectedPackageForDetail.date_range}
              </span>
            </div>
          </div>

          {/* PhÆ°Æ¡ng Ã¡n ká»¹ thuáº­t sá»­a chá»¯a tá»•ng quÃ¡t cá»§a gÃ³i (Do PM nháº­p) */}
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-brand-gold" />
                <span>PhÆ°Æ¡ng Ã¡n ká»¹ thuáº­t sá»­a chá»¯a tá»•ng quÃ¡t (PM Ä‘á» xuáº¥t):</span>
              </span>
              <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded font-mono border border-slate-200">
                methodDescription
              </span>
            </div>
            <p className="text-slate-800 text-xs leading-relaxed font-medium">
              {selectedPackageForDetail.technical_method ||
                'CÃ o bÃ³c xá»­ lÃ½ hÆ° há»ng theo quy trÃ¬nh báº£o trÃ¬ máº·t Ä‘Æ°á»ng'}
            </p>
            <div className="text-[11px] text-slate-600 pt-1.5 border-t border-amber-200/60 flex items-center gap-3 flex-wrap">
              <span>Quy mÃ´: <strong className="text-slate-800">{selectedPackageForDetail.technical_scope}</strong></span>
            </div>
          </div>

          {/* Danh sÃ¡ch RepairItems chi tiáº¿t */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-sm text-brand-dark">
                Danh sÃ¡ch háº¡ng má»¥c sá»­a chá»¯a chi tiáº¿t (RepairItems - {selectedPackageForDetail.defect_count})
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">
                Tiáº¿n Ä‘á»™ tháº©m Ä‘á»‹nh: {selectedPackageForDetail.approved_items}/{selectedPackageForDetail.total_items} má»¥c Ä‘áº¡t
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
              <div className="p-3 bg-slate-50/70 flex items-center justify-between gap-3 text-slate-600 font-semibold text-[11px]">
                <span className="w-24">MÃ£ hÆ° há»ng</span>
                <span className="w-32">LÃ½ trÃ¬nh / Vá»‹ trÃ­</span>
                <span className="flex-1">PhÆ°Æ¡ng Ã¡n ká»¹ thuáº­t &amp; Váº­t tÆ°</span>
                <span className="w-32 text-right">Khá»‘i lÆ°á»£ng &amp; Quy cÃ¡ch</span>
                <span className="w-24 text-right">Tráº¡ng thÃ¡i</span>
              </div>

              <div className="p-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3">
                <span className="w-24 font-mono font-bold text-slate-900">DEF-102</span>
                <span className="w-32 font-mono text-slate-600">Km 1029+200 (LÃ n pháº£i)</span>
                <span className="flex-1 text-slate-700">CÃ o bÃ³c 5cm, trÃ¡m tháº£m BTN C19 lu lÃ¨n tiÃªu chuáº©n</span>
                <span className="w-32 text-right font-mono font-semibold text-slate-900">0.45 mÂ² (SÃ¢u 5.2cm)</span>
                <span className="w-24 text-right">
                  <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    APPROVED
                  </span>
                </span>
              </div>

              <div className="p-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3">
                <span className="w-24 font-mono font-bold text-slate-900">DEF-105</span>
                <span className="w-32 font-mono text-slate-600">Km 1029+800 (Tim Ä‘Æ°á»ng)</span>
                <span className="flex-1 text-slate-700">Xáº» rÃ£nh lÃ m sáº¡ch, thá»•i bá»¥i vÃ  rÃ³t nhá»±a mastic polymer</span>
                <span className="w-32 text-right font-mono font-semibold text-slate-900">0.85 mÂ² (SÃ¢u 3.1cm)</span>
                <span className="w-24 text-right">
                  <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    APPROVED
                  </span>
                </span>
              </div>

              <div className="p-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3">
                <span className="w-24 font-mono font-bold text-slate-900">DEF-108</span>
                <span className="w-32 font-mono text-slate-600">Km 1030+150 (Vá»‡t bÃ¡nh)</span>
                <span className="flex-1 text-slate-700">CÃ o bÃ³c sÃ¢u 4.5cm, bÃ¹ vÃªnh Ä‘Ã¡ dÄƒm lu lÃ¨n lá»›p máº·t C19</span>
                <span className="w-32 text-right font-mono font-semibold text-slate-900">1.25 mÂ² (SÃ¢u 4.5cm)</span>
                <span className="w-24 text-right">
                  <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-amber-100 text-amber-800">
                    PENDING
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer hÃ nh Ä‘á»™ng theo vai trÃ² */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            NgÆ°á»i láº­p: <strong className="text-slate-800">{selectedPackageForDetail.created_by_name}</strong> â€¢{' '}
            {selectedPackageForDetail.created_at}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedPackageForDetail(null)}
              type="button"
              className="px-4 py-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              ÄÃ³ng
            </button>

            {/* Náº¿u Supervisor vÃ  gÃ³i Ä‘ang SUBMITTED */}
            {isSupervisor && selectedPackageForDetail.status === 'SUBMITTED' && (
              <button
                onClick={() => {
                  handleQuickApprove(selectedPackageForDetail.id, selectedPackageForDetail.code)
                  setSelectedPackageForDetail((prev) =>
                    prev
                      ? { ...prev, status: 'DECIDED', status_label: 'ÄÃ£ phÃª duyá»‡t', approved_items: prev.total_items }
                      : null
                  )
                }}
                type="button"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>PhÃª duyá»‡t chÃ­nh thá»©c gÃ³i</span>
              </button>
            )}

            {/* Náº¿u PM vÃ  gÃ³i Ä‘ang DRAFT */}
            {isPM && selectedPackageForDetail.status === 'DRAFT' && (
              <button
                onClick={() => {
                  handleSubmitDraftPackage(selectedPackageForDetail.id, selectedPackageForDetail.code)
                  setSelectedPackageForDetail((prev) =>
                    prev ? { ...prev, status: 'SUBMITTED', status_label: 'Chá» duyá»‡t' } : null
                  )
                }}
                type="button"
                className="px-4 py-2 bg-brand-gold hover:bg-[#B38E1F] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>KhÃ³a &amp; TrÃ¬nh duyá»‡t gÃ³i</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
