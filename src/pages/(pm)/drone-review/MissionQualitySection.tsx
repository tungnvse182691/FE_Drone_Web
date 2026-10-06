import React from 'react'
import { Verified, Lightbulb, Cpu } from 'lucide-react'

export interface MissionQualitySectionProps {
  coveragePercentage: number
  hasBlindspot: boolean
  setCurrentFrame: (f: number) => void
  showToast: (msg: string) => void
}

export const MissionQualitySection: React.FC<MissionQualitySectionProps> = ({
  coveragePercentage,
  hasBlindspot,
  setCurrentFrame,
  showToast
}) => {
  return (
    <>
      {/* 3-DIMENSIONAL DATA QUALITY INGEST ASSESSMENT (ISO/IEC 19157:2013) */}
      <section className="bg-white border border-brand-border rounded-xl p-4 shadow-2xs flex flex-col gap-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Verified className="w-5 h-5 text-brand-gold" />
            <h2 className="font-bold text-sm text-brand-dark">
              ÄÃ¡nh giÃ¡ 3 chiá»u cháº¥t lÆ°á»£ng dá»¯ liá»‡u bay (Tri-axial Quality Ingest Assessment)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Giao thá»©c kiá»ƒm Ä‘á»‹nh: ISO/IEC 19157:2013</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Dimension 1: Corridor */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between gap-2.5 hover:shadow-xs transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-gold"></span>
                <span className="text-xs text-brand-dark font-bold">1. Vá»‹ trÃ­ & HÃ nh lang (Corridor)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                PASS (Há»£p lá»‡)
              </span>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>Äá»™ lá»‡ch tim bay:</span>
                <span className="font-mono font-bold text-slate-800">0.85m (&lt; 1.2m)</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Táº§n sá»‘ RTK-GPS:</span>
                <span className="font-mono font-semibold text-slate-800">10Hz Äá»“ng bá»™</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>GÃ³c nghiÃªng Gimbal:</span>
                <span className="font-mono font-semibold text-slate-800">90Â° Nadir Chuáº©n</span>
              </div>
            </div>
          </div>

          {/* Dimension 2: Integrity & SRT */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between gap-2.5 hover:shadow-xs transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-gold"></span>
                <span className="text-xs text-brand-dark font-bold">2. ToÃ n váº¹n tá»‡p & SRT Metadata</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                PASS
              </span>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>MÃ£ bÄƒm SHA-256:</span>
                <span className="font-mono font-bold text-slate-800">4f9d..a82e (OK)</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Äá»“ng bá»™ RTK:</span>
                <span className="font-mono font-semibold text-slate-800">1,920 / 1,920 frames</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Tá»‘c Ä‘á»™ tráº­p:</span>
                <span className="font-mono font-semibold text-slate-800">1/1200s (Sáº¯c nÃ©t)</span>
              </div>
            </div>
          </div>

          {/* Dimension 3: Coverage */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between gap-2.5 hover:shadow-xs transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D97706]"></span>
                <span className="text-xs text-brand-dark font-bold">3. Tá»· lá»‡ phá»§ hÃ¬nh áº£nh</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  coveragePercentage >= 95
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {coveragePercentage >= 95 ? `Äáº T (${coveragePercentage}%)` : `Cáº¢NH BÃO (${coveragePercentage}%)`}
              </span>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>Phá»§ dá»c / Phá»§ ngang:</span>
                <span className="font-mono font-bold text-slate-800">
                  {coveragePercentage >= 95 ? '92% | 85%' : '82% | 68%'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Äiá»ƒm mÃ¹ tráº¯c Ä‘á»‹a:</span>
                <button
                  onClick={() => {
                    if (hasBlindspot) {
                      setCurrentFrame(1680)
                      showToast('ÄÃ£ Ä‘á»‹nh vá»‹ camera tá»›i Ä‘iá»ƒm mÃ¹ dáº£i phÃ¢n cÃ¡ch giá»¯a táº¡i Km 1027+100')
                    }
                  }}
                  className={`font-mono font-bold truncate max-w-[150px] cursor-pointer hover:underline ${
                    hasBlindspot ? 'text-amber-700' : 'text-emerald-700'
                  }`}
                >
                  {hasBlindspot ? 'Km 1027+100 (Xem)' : 'KhÃ´ng cÃ³ (ÄÃ£ phá»§ kÃ­n)'}
                </button>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>YÃªu cáº§u tiÃªu chuáº©n:</span>
                <span className="font-mono font-semibold text-slate-800">â‰¥ 95% Äá»“ng nháº¥t</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Ingest Guideline Callout */}
        <div className="flex items-start gap-2 bg-sky-50 text-sky-900 p-2.5 rounded-lg border border-sky-200 text-xs">
          <Lightbulb className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Quy táº¯c tháº©m Ä‘á»‹nh háº¡ táº§ng:</strong> Bay Ä‘Ãºng hÃ nh lang khÃ´ng Ä‘á»“ng nghÄ©a Ä‘á»§ Ä‘á»™ phá»§. Há»‡ thá»‘ng yÃªu cáº§u tá»‘i thiá»ƒu <span className="font-bold underline decoration-sky-500 decoration-2">â‰¥ 95% Ä‘á»™ phá»§ chuáº©n tráº¯c Ä‘á»‹a</span> Ä‘á»ƒ cáº¥p phÃ©p khÃ³a Baseline Ä‘oáº¡n Ä‘Æ°á»ng vÃ  káº¿t xuáº¥t báº£n Ä‘á»“ hoÃ n cÃ´ng sá»‘.
          </p>
        </div>
      </section>

      {/* ASYNC AI JOB PROGRESS BAR */}
      <section className="bg-white border border-brand-border rounded-xl p-3.5 shadow-2xs flex flex-col gap-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 text-xs">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-brand-gold animate-pulse" />
            <span className="font-bold text-slate-800">
              MÃ´ hÃ¬nh nháº­n diá»‡n Road-YOLOv9 (Civil Infrastructure Edge AI) - Äang xá»­ lÃ½ báº¥t Ä‘á»“ng bá»™
            </span>
          </div>
          <span className="text-slate-500">
            Tiáº¿n Ä‘á»™: <strong className="text-slate-800 font-mono">74%</strong> (ÄÃ£ phÃ¢n tÃ­ch 1,420 / 1,920 frames) â€¢ Æ¯á»›c tÃ­nh cÃ²n láº¡i: ~ 1 phÃºt 20 giÃ¢y
          </span>
        </div>

        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-brand-gold rounded-full transition-all duration-500 relative flex items-center justify-end pr-1"
            style={{ width: '74%' }}
          >
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Batch Size: 16
            </span>
            <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full font-mono font-medium">
              Tá»‘c Ä‘á»™: 42 FPS
            </span>
            <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full font-mono font-medium">
              GPU: NVIDIA RTX 4090 Cloud Instance
            </span>
          </div>
          <span className="text-[#8F7212] font-semibold">Tá»± Ä‘á»™ng náº¡p khung phÃ¡t hiá»‡n theo thá»i gian thá»±c</span>
        </div>
      </section>
    </>
  )
}
