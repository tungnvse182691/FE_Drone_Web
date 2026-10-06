import React from 'react'
import { Route as RouteIcon, Check, Map, PlaneTakeoff, Play, Lock } from 'lucide-react'

interface ProjectTimelineStepperProps {
  projectId: string
  basePath: string
  onNavigate: (path: string) => void
}

export const ProjectTimelineStepper: React.FC<ProjectTimelineStepperProps> = ({
  projectId,
  basePath,
  onNavigate
}) => {
  return (
    <div className="bg-white border border-brand-border rounded-xl p-6 shadow-sm flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-brand-dark flex items-center gap-2">
            <RouteIcon className="w-5 h-5 text-brand-gold" />
            <span>Tiáº¿n trÃ¬nh bÃ n giao &amp; VÃ²ng Ä‘á»i báº£o hÃ nh</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dÃµi luÃ¢n chuyá»ƒn trÃ¡ch nhiá»‡m giá»¯a Supervisor, Project Manager vÃ  Äá»™i hiá»‡n trÆ°á»ng.
          </p>
        </div>
        <span className="font-mono text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
          Giai Ä‘oáº¡n: 04/05
        </span>
      </div>

      {/* Vertical Stepper */}
      <div className="relative pl-6 sm:pl-8 flex flex-col gap-5 pt-2">
        <div className="absolute left-3 sm:left-4 top-3 bottom-4 w-0.5 bg-slate-200 -translate-x-1/2"></div>

        {/* Step 1 */}
        <div className="relative flex items-start gap-4">
          <div className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center ring-4 ring-white shadow-xs border border-emerald-200">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex-1 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <span className="text-xs text-brand-dark font-bold">
                BÆ°á»›c 1: Khá»Ÿi táº¡o dá»± Ã¡n &amp; GÃ¡n PM Ä‘iá»u hÃ nh
              </span>
              <span className="font-mono text-[11px] text-slate-500">15/06/2026 â€¢ 09:30</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Thá»±c hiá»‡n bá»Ÿi <strong className="text-brand-dark">Supervisor Nguyá»…n VÄƒn An</strong>. BÃ n giao Ä‘áº§y Ä‘á»§ há»“ sÆ¡ phÃ¡p lÃ½ vÃ  quyá»n quáº£n trá»‹ tuyáº¿n cho <strong className="text-brand-dark">PM Äá»— Quá»‘c HoÃ ng</strong>.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="relative flex items-start gap-4">
          <div className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center ring-4 ring-white shadow-xs border border-emerald-200">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex-1 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <span className="text-xs text-brand-dark font-bold">
                BÆ°á»›c 2: Dá»±ng tim tuyáº¿n &amp; Duyá»‡t hÃ¬nh há»c WGS84 (WF-02)
              </span>
              <span className="font-mono text-[11px] text-slate-500">20/06/2026 â€¢ KÃ½ sá»‘ SHA-256</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              ÄÃ£ náº¯n 14 Ä‘á»‰nh tá»a Ä‘á»™ gÃ³c, chia 5 phÃ¢n Ä‘oáº¡n lÃ½ trÃ¬nh chuáº©n. Supervisor Ä‘Ã£ kÃ½ duyá»‡t chá»©ng thÆ° sá»‘ mÃ£ hÃ³a tá»a Ä‘á»™ WGS84 lÃªn há»‡ thá»‘ng báº£o an.
            </p>
            <div className="mt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => onNavigate(`${basePath}/projects/${projectId}/alignment`)}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-dark bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded shadow-2xs transition-colors"
              >
                <Map className="w-3 h-3 text-brand-gold" />
                Xem báº£n Ä‘á»“ tim tuyáº¿n &amp; Slabs (WF-02) â†’
              </button>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="relative flex items-start gap-4">
          <div className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center ring-4 ring-white shadow-xs border border-emerald-200">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex-1 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <span className="text-xs text-brand-dark font-bold">
                BÆ°á»›c 3: Bay Drone láº­p Baseline dá»¯ liá»‡u ban Ä‘áº§u (WF-09)
              </span>
              <span className="font-mono text-[11px] text-slate-500">05/07/2026 â€¢ Matrice 300 RTK</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Äá»™i bay hoÃ n thÃ nh quÃ©t khÃ´ng áº£nh 21.5 km vá»›i Ä‘á»™ phÃ¢n giáº£i 1.2 cm/pixel, láº­p mÃ¢y Ä‘iá»ƒm 3D vÃ  khÃ³a má»‘c máº·t Ä‘Æ°á»ng lÃ m cÄƒn cá»© Ä‘á»‘i soÃ¡t khiáº¿u náº¡i phÃ¡t sinh.
            </p>
            <div className="mt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => onNavigate(`${basePath}/surveys/srv-01/review`)}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#8F7212] bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/30 px-2.5 py-1 rounded shadow-2xs transition-colors"
              >
                <PlaneTakeoff className="w-3 h-3 text-brand-gold" />
                Má»Ÿ Canvas Tháº©m Ä‘á»‹nh AI (WF-09) â†’
              </button>
            </div>
          </div>
        </div>

        {/* Step 4 (ACTIVE) */}
        <div className="relative flex items-start gap-4">
          <div className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-brand-gold text-white flex items-center justify-center ring-4 ring-brand-gold/30 shadow-md animate-pulse">
            <Play className="w-3 h-3 fill-current ml-0.5" />
          </div>
          <div className="bg-amber-50/40 border-2 border-brand-gold/50 rounded-xl p-4 flex-1 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-brand-dark font-bold">
                  BÆ°á»›c 4: Váº­n hÃ nh báº£o hÃ nh &amp; Triage khiáº¿m khuyáº¿t (WF-04, 05, 07, 08)
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-gold text-white uppercase tracking-wide">
                  Active Running
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-[#8F7212]">
                Äang thá»±c thi liÃªn tá»¥c
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Äang theo dÃµi 12 khiáº¿m khuyáº¿t máº·t Ä‘Æ°á»ng. Ban Ä‘iá»u hÃ nh Ä‘ang phá»‘i há»£p vá»›i Tá»• tuáº§n kiá»ƒm hiá»‡n trÆ°á»ng vÃ  xá»­ lÃ½ 02 gÃ³i sá»­a chá»¯a báº£o trÃ¬ Ä‘á»‹nh ká»³.
            </p>
            <div className="mt-2.5 pt-2.5 flex items-center justify-between text-xs bg-white border border-brand-border p-2 rounded-lg">
              <span className="text-slate-500">TrÃ¡ch nhiá»‡m phÃª duyá»‡t hiá»‡n táº¡i:</span>
              <span className="font-semibold text-[#8F7212]">
                Ká»¹ sÆ° Nguyá»…n VÄƒn An (Supervisor)
              </span>
            </div>
          </div>
        </div>

        {/* Step 5 (LOCKED) */}
        <div className="relative flex items-start gap-4 opacity-60">
          <div className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center ring-4 ring-white">
            <Lock className="w-3 h-3" />
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <span className="text-xs text-slate-500 font-medium">
                BÆ°á»›c 5: Quyáº¿t toÃ¡n bÃ n giao &amp; ÄÃ³ng gÃ³i lÆ°u trá»¯ phÃ¡p lÃ½ (+5 nÄƒm)
              </span>
              <span className="font-mono text-[11px] text-slate-400">Dá»± kiáº¿n: 31/08/2027</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              KÃ­ch hoáº¡t khi háº¿t háº¡n báº£o hÃ nh 36 thÃ¡ng. ÄÃ³ng bÄƒng dá»¯ liá»‡u WGS84, bÃ¡o cÃ¡o IRI/PCI vÃ  chuyá»ƒn vÃ o kho lÆ°u trá»¯ sá»‘ vÄ©nh viá»…n theo Luáº­t XÃ¢y dá»±ng.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
