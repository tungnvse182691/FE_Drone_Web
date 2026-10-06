import React from 'react'
import { Plus, X, Send, SlidersHorizontal, Wrench, Sparkles } from 'lucide-react'
import type { RouteSegmentOption, UnassignedDefectItem } from './types'
import { ProposalBOQCard } from './ProposalBOQCard'

export interface CreateProposalModalProps {
  isCreateModalOpen: boolean
  setIsCreateModalOpen: (open: boolean) => void
  formPackageName: string
  setFormPackageName: (name: string) => void
  formRouteId: string
  handleRouteChange: (routeId: string) => void
  availableRoutes: { id: string; name: string; code: string }[]
  formSegmentId: string
  handleSegmentChange: (segId: string) => void
  currentRouteSegments: RouteSegmentOption[]
  currentSegment: RouteSegmentOption | undefined
  currentRoute: { id: string; name: string; code: string } | undefined
  formContractor: string
  setFormContractor: (c: string) => void
  formDurationDays: number
  setFormDurationDays: (d: number) => void
  formTechnicalMethod: string
  setFormTechnicalMethod: (method: string) => void
  unassignedDefects: UnassignedDefectItem[]
  handleToggleDefect: (id: string) => void
  modalCalculations: { count: number; description: string }
  handleSaveDraft: (andSubmit: boolean) => void
}

export const CreateProposalModal: React.FC<CreateProposalModalProps> = ({
  isCreateModalOpen,
  setIsCreateModalOpen,
  formPackageName,
  setFormPackageName,
  formRouteId,
  handleRouteChange,
  availableRoutes,
  formSegmentId,
  handleSegmentChange,
  currentRouteSegments,
  currentSegment,
  currentRoute,
  formContractor,
  setFormContractor,
  formDurationDays,
  setFormDurationDays,
  formTechnicalMethod,
  setFormTechnicalMethod,
  unassignedDefects,
  handleToggleDefect,
  modalCalculations,
  handleSaveDraft,
}) => {
  if (!isCreateModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-3xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-brand-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-brand-gold shrink-0">
              <Plus className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">Khá»Ÿi táº¡o gÃ³i Ä‘á» xuáº¥t sá»­a chá»¯a ká»¹ thuáº­t má»›i</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gom cÃ¡c khiáº¿m khuyáº¿t Ä‘á»™c láº­p thÃ nh gÃ³i thi cÃ´ng táº­p trung Ä‘á»ƒ tá»‘i Æ°u hÃ³a mÃ¡y mÃ³c vÃ  nhÃ¢n lá»±c.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* TÃªn gÃ³i */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 uppercase text-[11px]">
              TÃªn gÃ³i Ä‘á» xuáº¥t cÃ´ng viá»‡c <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formPackageName}
              onChange={(e) => setFormPackageName(e.target.value)}
              placeholder="VÃ­ dá»¥: Xá»­ lÃ½ á»• gÃ  vÃ  trÃ¡m ná»©t máº·t Ä‘Æ°á»ng Ä‘oáº¡n Km 1028 - Km 1033..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>

          {/* Chá»n Tuyáº¿n Ä‘Æ°á»ng & PhÃ¢n Ä‘oáº¡n */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 uppercase text-[11px]">
                Tuyáº¿n Ä‘Æ°á»ng phá»¥ trÃ¡ch <span className="text-rose-500">*</span>
              </label>
              <select
                value={formRouteId}
                onChange={(e) => handleRouteChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
              >
                {availableRoutes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 uppercase text-[11px]">
                PhÃ¢n Ä‘oáº¡n lÃ½ trÃ¬nh <span className="text-rose-500">*</span>
              </label>
              <select
                value={formSegmentId}
                onChange={(e) => handleSegmentChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
              >
                {currentRouteSegments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tá»• Ä‘á»™i thi cÃ´ng & Thá»i gian dá»± kiáº¿n */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 uppercase text-[11px]">
                ÄÆ¡n vá»‹ thi cÃ´ng dá»± kiáº¿n <span className="text-rose-500">*</span>
              </label>
              <select
                value={formContractor}
                onChange={(e) => setFormContractor(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
              >
                <option value="Tá»• vÃ¡ dáº·m cÆ¡ giá»›i 01">Tá»• vÃ¡ dáº·m cÆ¡ giá»›i 01 (HoÃ ng Háº£i)</option>
                <option value="XÃ­ nghiá»‡p Cáº§u ÄÆ°á»ng 4">XÃ­ nghiá»‡p Cáº§u ÄÆ°á»ng 4</option>
                <option value="Tá»• duy tu báº£o dÆ°á»¡ng Ä‘Æ°á»ng bá»™ 03">Tá»• duy tu báº£o dÆ°á»¡ng Ä‘Æ°á»ng bá»™ 03</option>
                <option value="Äá»™i cÆ¡ Ä‘á»™ng">Äá»™i cÆ¡ Ä‘á»™ng kháº¯c phá»¥c sá»± cá»‘ kháº©n cáº¥p</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 uppercase text-[11px]">
                Thá»i gian thi cÃ´ng dá»± kiáº¿n (ngÃ y) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={formDurationDays}
                onChange={(e) => setFormDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
          </div>

          {/* Danh sÃ¡ch khiáº¿m khuyáº¿t & Khá»‘i lÆ°á»£ng BOQ */}
          <ProposalBOQCard
            unassignedDefects={unassignedDefects}
            handleToggleDefect={handleToggleDefect}
            modalCalculations={modalCalculations}
          />

          {/* PhÆ°Æ¡ng Ã¡n ká»¹ thuáº­t sá»­a chá»¯a tá»•ng quÃ¡t */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="font-bold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-brand-gold" />
                <span>PhÆ°Æ¡ng Ã¡n ká»¹ thuáº­t sá»­a chá»¯a tá»•ng quÃ¡t <span className="text-rose-500">*</span></span>
              </label>
              <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                Chá»‰ huy trÆ°á»Ÿng (PM) soáº¡n tháº£o â€¢ TrÃ¬nh GiÃ¡m sÃ¡t duyá»‡t (WF-07)
              </span>
            </div>

            {/* CÃ¡c nÃºt gá»£i Ã½ phÆ°Æ¡ng Ã¡n nhanh */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-500 font-medium mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand-gold" /> Gá»£i Ã½ nhanh:
              </span>
              <button
                type="button"
                onClick={() =>
                  setFormTechnicalMethod(
                    'CÃ o bÃ³c sÃ¢u 5cm theo hÃ¬nh chá»¯ nháº­t vÃ¡t cáº¡nh, lÃ m sáº¡ch bá» máº·t, tÆ°á»›i nhá»±a dÃ­nh bÃ¡m vÃ  tháº£m hoÃ n tráº£ báº±ng bÃª tÃ´ng nhá»±a nÃ³ng C12.5 lu lÃ¨n tiÃªu chuáº©n.'
                  )
                }
                className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100/70 hover:text-amber-900 text-slate-700 rounded-lg text-[11px] font-medium transition-colors border border-slate-200 cursor-pointer"
              >
                âš¡ CÃ o bÃ³c &amp; tháº£m BTN
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormTechnicalMethod(
                    'Xáº» rÃ£nh chá»¯ U kÃ­ch thÆ°á»›c 1.5x1.5cm dá»c theo tim ná»©t, lÃ m khÃ´ sáº¡ch bá»¥i báº©n vÃ  bÆ¡m chÃ¨n kÃ­n báº±ng keo mastic polymer Ä‘Ã n há»“i chá»‹u nhiá»‡t.'
                  )
                }
                className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100/70 hover:text-amber-900 text-slate-700 rounded-lg text-[11px] font-medium transition-colors border border-slate-200 cursor-pointer"
              >
                âš¡ Xáº» rÃ£nh rÃ³t Mastic
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormTechnicalMethod(
                    'Äá»¥c táº©y vuÃ´ng thÃ nh sáº¯c cáº¡nh, dá»n sáº¡ch Ä‘Ã¡y á»• gÃ , ráº£i Ä‘á»u váº­t liá»‡u ráº£i nguá»™i Carboncor Asphalt lá»›p dÃ y 3-4cm Ä‘áº§m nÃ©n cháº·t K95.'
                  )
                }
                className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100/70 hover:text-amber-900 text-slate-700 rounded-lg text-[11px] font-medium transition-colors border border-slate-200 cursor-pointer"
              >
                âš¡ VÃ¡ dáº·m Carboncor
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormTechnicalMethod(
                    'CÃ o bÃ³c san pháº³ng vá»‡t háº±n lÃºn bÃ¡nh xe, bÃ¹ lÃºn báº±ng lá»›p bÃª tÃ´ng nhá»±a cháº·t káº¿t há»£p tháº£m phá»§ máº·t Ä‘áº§m lÃ¨n Ä‘áº¡t Ä‘á»™ cháº·t K98.'
                  )
                }
                className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100/70 hover:text-amber-900 text-slate-700 rounded-lg text-[11px] font-medium transition-colors border border-slate-200 cursor-pointer"
              >
                âš¡ BÃ¹ lÃºn vá»‡t bÃ¡nh xe
              </button>
              {formTechnicalMethod && (
                <button
                  type="button"
                  onClick={() => setFormTechnicalMethod('')}
                  className="px-2 py-1 text-slate-400 hover:text-rose-600 text-[11px] font-medium transition-colors ml-auto cursor-pointer"
                >
                  XÃ³a ná»™i dung
                </button>
              )}
            </div>

            <textarea
              rows={3}
              value={formTechnicalMethod}
              onChange={(e) => setFormTechnicalMethod(e.target.value)}
              placeholder="Nháº­p phÆ°Æ¡ng Ã¡n sá»­a chá»¯a ká»¹ thuáº­t tá»•ng quÃ¡t cho cÃ¡c khiáº¿m khuyáº¿t Ä‘Æ°á»£c chá»n..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold leading-relaxed"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            onClick={() => setIsCreateModalOpen(false)}
            type="button"
            className="px-4 py-2 rounded-xl bg-white text-slate-700 text-xs font-semibold border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Há»§y bá»
          </button>
          <button
            onClick={() => handleSaveDraft(false)}
            type="button"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>LÆ°u báº£n nhÃ¡p</span>
          </button>
          <button
            onClick={() => handleSaveDraft(true)}
            type="button"
            className="px-5 py-2 rounded-xl bg-brand-gold hover:bg-[#B38E1F] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>KhÃ³a &amp; TrÃ¬nh duyá»‡t ngay</span>
          </button>
        </div>
      </div>
    </div>
  )
}
