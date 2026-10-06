import React, { useState } from 'react'
import { Sparkles, AlertTriangle, Database, Info } from 'lucide-react'
import { Defect } from '../../../types/domain'

interface DefectTemporalComparisonProps {
  defect: Defect
}

export const DefectTemporalComparison: React.FC<DefectTemporalComparisonProps> = ({ defect }) => {
  const [temporalMode, setTemporalMode] = useState<'EVOLUTION' | 'FRESH_DEFECT' | 'INITIAL_BASELINE'>('FRESH_DEFECT')

  return (
    <div className="space-y-4">
      {/* Scenario Switcher Tabs */}
      <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center justify-between gap-1 flex-wrap">
        <div className="flex items-center gap-1 text-[11px] font-semibold flex-wrap">
          <button
            type="button"
            onClick={() => setTemporalMode('FRESH_DEFECT')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              temporalMode === 'FRESH_DEFECT'
                ? 'bg-white text-emerald-800 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Lá»—i má»›i phÃ¡t sinh (Ká»³ trÆ°á»›c bÃ¬nh thÆ°á»ng)</span>
          </button>

          <button
            type="button"
            onClick={() => setTemporalMode('EVOLUTION')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              temporalMode === 'EVOLUTION'
                ? 'bg-white text-rose-800 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Váº¿t ná»©t tiáº¿n triá»ƒn (+18%)</span>
          </button>

          <button
            type="button"
            onClick={() => setTemporalMode('INITIAL_BASELINE')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              temporalMode === 'INITIAL_BASELINE'
                ? 'bg-white text-blue-800 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>Láº§n Ä‘áº§u ghi nháº­n (ChÆ°a cÃ³ áº£nh ká»³ trÆ°á»›c)</span>
          </button>
        </div>
      </div>

      {/* Scenario 1: HÆ¯ Há»ŽNG Má»šI PHÃT SINH */}
      {temporalMode === 'FRESH_DEFECT' && (
        <div className="space-y-3 animate-in fade-in">
          <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Äa Ká»³: Ká»³ TrÆ°á»›c (Máº·t Ä‘Æ°á»ng nguyÃªn váº¹n) vs Ká»³ NÃ y (Má»›i xuáº¥t hiá»‡n)</span>
            </span>
            <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px]">
              âœ¨ HÆ° há»ng má»›i phÃ¡t sinh (Fresh Defect)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">Ká»³ TrÆ°á»›c (ThÃ¡ng 06/2026 - Chu ká»³ T-1)</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  âœ“ Máº·t Ä‘Æ°á»ng nguyÃªn váº¹n
                </span>
              </div>
              <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-black group">
                <img
                  src="https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&auto=format&fit=crop&q=80"
                  alt="Ká»³ trÆ°á»›c máº·t Ä‘Æ°á»ng nguyÃªn váº¹n"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-emerald-950/80 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-medium border border-emerald-400/30">
                  Km 1024+300 â€¢ Káº¿t cáº¥u á»•n Ä‘á»‹nh
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8F7212]">Ká»³ NÃ y (ThÃ¡ng 10/2026 - Chu ká»³ T0)</span>
                <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                  âš  PhÃ¡t sinh á»• gÃ  / ná»©t
                </span>
              </div>
              <div className="relative rounded-lg overflow-hidden border-2 border-brand-gold aspect-video bg-black">
                <img
                  src={defect.image_url}
                  alt="Ká»³ nÃ y má»›i ná»©t"
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute border-2 border-red-500 bg-red-500/20 rounded shadow-md pointer-events-none"
                  style={{
                    left: `${defect.bounding_box.x * 100}%`,
                    top: `${defect.bounding_box.y * 100}%`,
                    width: `${defect.bounding_box.width * 100}%`,
                    height: `${defect.bounding_box.height * 100}%`
                  }}
                >
                  <span className="bg-red-600 text-white text-[9px] font-bold px-1 py-0.5 rounded absolute -top-4 left-0">
                    Lá»—i má»›i (SÃ¢u {defect.depth_mm ? (defect.depth_mm / 10).toFixed(1) : '7.0'}cm)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs space-y-1 text-emerald-950">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Káº¿t luáº­n tháº©m Ä‘á»‹nh so sÃ¡nh Ä‘a ká»³:</span>
            </div>
            <p className="text-[11px] text-emerald-900 leading-relaxed">
              Camera Drone á»Ÿ ká»³ bay trÆ°á»›c (T-1) Ä‘Ã£ chá»¥p quÃ©t qua vá»‹ trÃ­ nÃ y vÃ  xÃ¡c nháº­n <strong>máº·t Ä‘Æ°á»ng cÃ²n nguyÃªn váº¹n, chÆ°a cÃ³ váº¿t ná»©t</strong>. HÆ° há»ng nÃ y xuáº¥t hiá»‡n Ä‘á»™t ngá»™t trong chu ká»³ hiá»‡n táº¡i (Tá»· lá»‡ tÄƒng diá»‡n tÃ­ch: <strong>0% â†’ 100%</strong>, phÃ¡t sinh má»›i sau Ä‘á»£t mÆ°a bÃ£o). Äá» xuáº¥t Ä‘Æ°a vÃ o káº¿ hoáº¡ch sá»­a chá»¯a ngay Ä‘á»ƒ ngÄƒn nÆ°á»›c tháº¥m phÃ¡ hoáº¡i mÃ³ng Ä‘Æ°á»ng.
            </p>
          </div>
        </div>
      )}

      {/* Scenario 2: Váº¾T Ná»¨T TIáº¾N TRIá»‚N */}
      {temporalMode === 'EVOLUTION' && (
        <div className="space-y-3 animate-in fade-in">
          <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Äa Ká»³: Theo DÃµi Tá»‘c Äá»™ Ná»©t Lan Tá»a (Crack Growth Evolution)</span>
            </span>
            <span className="text-rose-600 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-[11px]">
              Tá»‘c Ä‘á»™ má»Ÿ rá»™ng váº¿t ná»©t: +18%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">Ká»³ Kháº£o SÃ¡t TrÆ°á»›c (ThÃ¡ng 06/2026)</span>
                <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                  Diá»‡n tÃ­ch: 0.32 mÂ²
                </span>
              </div>
              <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-black">
                <img
                  src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80"
                  alt="Ká»³ trÆ°á»›c ná»©t nhá»"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1/4 left-1/3 w-1/4 h-1/4 border-2 border-amber-400 bg-amber-400/20 rounded pointer-events-none">
                  <span className="bg-amber-500 text-slate-950 text-[9px] font-bold px-1 py-0.2 rounded absolute -top-3.5 left-0">
                    Ná»©t chÃ¢n chim (0.32 mÂ²)
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8F7212]">Ká»³ Kháº£o SÃ¡t NÃ y (ThÃ¡ng 10/2026)</span>
                <span className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded font-mono font-bold">
                  Diá»‡n tÃ­ch: {((defect.length_m || 1.2) * (defect.width_m || 0.8)).toFixed(2)} mÂ² (+18%)
                </span>
              </div>
              <div className="relative rounded-lg overflow-hidden border-2 border-brand-gold aspect-video bg-black">
                <img
                  src={defect.image_url}
                  alt="Ká»³ nÃ y ná»©t to"
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute border-2 border-rose-500 bg-rose-500/20 rounded pointer-events-none"
                  style={{
                    left: `${defect.bounding_box.x * 100}%`,
                    top: `${defect.bounding_box.y * 100}%`,
                    width: `${defect.bounding_box.width * 100}%`,
                    height: `${defect.bounding_box.height * 100}%`
                  }}
                >
                  <span className="bg-rose-600 text-white text-[9px] font-bold px-1 py-0.2 rounded absolute -top-3.5 left-0">
                    Ná»©t lÆ°á»›i lan rá»™ng ({((defect.length_m || 1.2) * (defect.width_m || 0.8)).toFixed(2)} mÂ²)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-1 text-amber-950">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Cáº£nh bÃ¡o tiáº¿n triá»ƒn suy thoÃ¡i káº¿t cáº¥u:</span>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              Váº¿t ná»©t tá»« dáº¡ng sá»£i Ä‘Æ¡n láº» á»Ÿ ká»³ trÆ°á»›c Ä‘Ã£ xÃ© rá»™ng thÃ nh dáº¡ng máº¡ng lÆ°á»›i cÃ¡ sáº¥u (Alligator cracking) vá»›i tá»‘c Ä‘á»™ tÄƒng trÆ°á»Ÿng <strong>+18% sau 4 thÃ¡ng</strong>. Cáº§n gom Ä‘á»£t xá»­ lÃ½ cÃ o bÃ³c tháº£m láº¡i Ä‘á»ƒ trÃ¡nh gÃ£y vá»¡ táº§ng base.
            </p>
          </div>
        </div>
      )}

      {/* Scenario 3: Láº¦N Äáº¦U GHI NHáº¬N */}
      {temporalMode === 'INITIAL_BASELINE' && (
        <div className="space-y-3 animate-in fade-in">
          <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Äa Ká»³: Kháº£o SÃ¡t Ban Äáº§u (Baseline Initial Epoch T0)</span>
            </span>
            <span className="text-blue-700 font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full text-[11px]">
              ðŸ“Œ Má»‘c Chuáº©n Ban Äáº§u (Baseline T0)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500">Dá»¯ Liá»‡u Kháº£o SÃ¡t Ká»³ TrÆ°á»›c (T-1)</span>
              <div className="rounded-lg border-2 border-dashed border-slate-300 aspect-video bg-slate-50 flex flex-col items-center justify-center p-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                  <Database className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-700 block">ChÆ°a CÃ³ Dá»¯ Liá»‡u áº¢nh Lá»‹ch Sá»­</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Äoáº¡n tuyáº¿n Km {defect.chainage_km ? defect.chainage_km.toFixed(1) : '1024.3'} chÆ°a tá»«ng cÃ³ dá»¯ liá»‡u bay quÃ©t trÆ°á»›c Ä‘Ã¢y.
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full">
                  Ká»³ kháº£o sÃ¡t Ä‘áº§u tiÃªn (Baseline Epoch)
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8F7212]">Ká»³ Kháº£o SÃ¡t NÃ y (ThÃ¡ng 10/2026 - Má»‘c T0)</span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                  Äang ghi nháº­n
                </span>
              </div>
              <div className="relative rounded-lg overflow-hidden border-2 border-brand-gold aspect-video bg-black">
                <img
                  src={defect.image_url}
                  alt="Ká»³ nÃ y má»‘c chuáº©n"
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute border-2 border-brand-gold bg-brand-gold/20 rounded pointer-events-none"
                  style={{
                    left: `${defect.bounding_box.x * 100}%`,
                    top: `${defect.bounding_box.y * 100}%`,
                    width: `${defect.bounding_box.width * 100}%`,
                    height: `${defect.bounding_box.height * 100}%`
                  }}
                >
                  <span className="bg-brand-gold text-white text-[9px] font-bold px-1 py-0.2 rounded absolute -top-3.5 left-0">
                    Má»‘c gá»‘c Baseline ({defect.defect_type})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs space-y-1 text-blue-950">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <Database className="w-4 h-4 text-blue-600 shrink-0" />
              <span>CÆ¡ cháº¿ quáº£n lÃ½ dá»¯ liá»‡u Baseline T0:</span>
            </div>
            <p className="text-[11px] text-blue-900 leading-relaxed">
              Do Ä‘Ã¢y lÃ  láº§n Ä‘áº§u ghi nháº­n hÆ° há»ng táº¡i vá»‹ trÃ­ Km nÃ y, há»‡ thá»‘ng sáº½ tá»± Ä‘á»™ng <strong>lÆ°u tá»a Ä‘á»™ vÃ  áº£nh chá»¥p ká»³ nÃ y lÃ m má»‘c chuáº©n (Baseline)</strong>. Trong cÃ¡c ká»³ bay drone tiáº¿p theo (T+1, T+2), AI sáº½ Ä‘á»‘i chiáº¿u song song vá»›i má»‘c nÃ y Ä‘á»ƒ phÃ¢n tÃ­ch tá»‘c Ä‘á»™ phÃ¡t triá»ƒn hÆ° há»ng.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
