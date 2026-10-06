import React from 'react'
import { Camera, X, Check } from 'lucide-react'
import type { TriageCase } from './types'

export interface RequestSurveyModalProps {
  isOpen: boolean
  onClose: () => void
  targetTriageCase: TriageCase | null
  surveyMode: 'MEASURE_ONLY' | 'DRONE_RESURVEY'
  setSurveyMode: (m: 'MEASURE_ONLY' | 'DRONE_RESURVEY') => void
  surveyReason: string
  setSurveyReason: React.Dispatch<React.SetStateAction<string>>
  surveyAssignedCrew: string
  setSurveyAssignedCrew: (crew: string) => void
  surveySlaHours: number
  setSurveySlaHours: (hours: number) => void
  onConfirmRequestSurvey: () => void
}

export const RequestSurveyModal: React.FC<RequestSurveyModalProps> = ({
  isOpen,
  onClose,
  targetTriageCase,
  surveyMode,
  setSurveyMode,
  surveyReason,
  setSurveyReason,
  surveyAssignedCrew,
  setSurveyAssignedCrew,
  surveySlaHours,
  setSurveySlaHours,
  onConfirmRequestSurvey,
}) => {
  if (!isOpen || !targetTriageCase) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">Lá»‡nh Kháº£o SÃ¡t &amp; Äo Äáº¡c Bá»• Sung (WF-11)</h3>
              <p className="text-xs text-slate-500">
                NÃªu lÃ½ do ká»¹ thuáº­t, chá»n hÃ¬nh thá»©c vÃ  phÃ¢n cÃ´ng Ä‘Æ¡n vá»‹ Ä‘i Ä‘o / bay drone láº¡i
              </p>
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

        <div className="space-y-4 text-xs">
          {/* Target Defect Info Card */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-brand-dark">{targetTriageCase.code}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {targetTriageCase.source_label}
              </span>
            </div>
            <div className="font-semibold text-slate-800">{targetTriageCase.defect_title}</div>
            <div className="text-slate-500 text-[11px]">
              LÃ½ trÃ¬nh:{' '}
              <span className="font-medium text-slate-700">
                {targetTriageCase.stationing} ({targetTriageCase.lane})
              </span>{' '}
              â€¢ Tuyáº¿n: <span className="font-medium text-slate-700">{targetTriageCase.project_name}</span>
            </div>
          </div>

          {/* 1. Chá»n hÃ¬nh thá»©c kháº£o sÃ¡t */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              1. HÃ¬nh thá»©c kháº£o sÃ¡t / Ä‘o Ä‘áº¡c láº¡i: <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label
                className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                  surveyMode === 'MEASURE_ONLY'
                    ? 'bg-blue-50/80 border-blue-500 shadow-2xs ring-1 ring-blue-500'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="survey_mode"
                    checked={surveyMode === 'MEASURE_ONLY'}
                    onChange={() => {
                      setSurveyMode('MEASURE_ONLY')
                      setSurveyAssignedCrew('Tá»• Ä‘o Ä‘áº¡c hiá»‡n trÆ°á»ng 01 (Km 1020 - Km 1035)')
                    }}
                    className="mt-0.5 accent-blue-600"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">ðŸ“ Äo Ä‘áº¡c hiá»‡n trÆ°á»ng</span>
                    <span className="text-[10px] text-blue-700 font-semibold uppercase">
                      Cháº¿ Ä‘á»™ MEASURE_ONLY (BR-09)
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Ká»¹ sÆ°/Tá»• Ä‘á»™i Ä‘i thá»±c Ä‘á»‹a dÃ¹ng thÆ°á»›c Ä‘o Ä‘á»™ sÃ¢u lÃ²ng há»‘ (depth) vÃ  Ä‘o diá»‡n tÃ­ch ná»©t vá»¡ chuáº©n
                      xÃ¡c.
                    </p>
                  </div>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                  surveyMode === 'DRONE_RESURVEY'
                    ? 'bg-blue-50/80 border-blue-500 shadow-2xs ring-1 ring-blue-500'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="survey_mode"
                    checked={surveyMode === 'DRONE_RESURVEY'}
                    onChange={() => {
                      setSurveyMode('DRONE_RESURVEY')
                      setSurveyAssignedCrew('Äá»™i bay Drone HoÃ ng Háº£i 01 - Phi cÃ´ng: LÃª Minh KhÃ´i')
                    }}
                    className="mt-0.5 accent-blue-600"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">ðŸ›¸ Bay Drone bá»• sung</span>
                    <span className="text-[10px] text-blue-700 font-semibold uppercase">
                      Cháº¿ Ä‘á»™ DRONE_RESURVEY
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Chá»‰ Ä‘á»‹nh phi cÃ´ng bay quÃ©t láº¡i á»Ÿ Ä‘á»™ cao tháº¥p hÆ¡n hoáº·c gÃ³c chá»¥p xiÃªn do áº£nh cÅ© bá»‹ má», ngÆ°á»£c
                      sÃ¡ng.
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* 2. LÃ½ do ká»¹ thuáº­t yÃªu cáº§u Ä‘o láº¡i (Báº¯t buá»™c) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">
                2. LÃ½ do ká»¹ thuáº­t yÃªu cáº§u Ä‘o Ä‘áº¡c láº¡i: <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400">Báº¯t buá»™c theo chuáº©n tháº©m Ä‘á»‹nh</span>
            </div>

            {/* Quick Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                'áº¢nh bá»‹ má» / che khuáº¥t táº§m nhÃ¬n',
                'Cáº§n Ä‘o Ä‘á»™ sÃ¢u lÃ²ng há»‘ (depth)',
                'Nghi ngá» ná»©t káº¿t cáº¥u táº§ng dÆ°á»›i',
                'XÃ¡c Ä‘á»‹nh láº¡i chÃ­nh xÃ¡c lÃ½ trÃ¬nh Km',
                'GÃ³c chá»¥p xiÃªn khÃ´ng Ä‘á»§ cÆ¡ sá»Ÿ tÃ­nh diá»‡n tÃ­ch',
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSurveyReason((prev) => (prev ? `${prev}. ${tag}` : tag))}
                  className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium transition-colors cursor-pointer border border-slate-200"
                >
                  + {tag}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={surveyReason}
              onChange={(e) => setSurveyReason(e.target.value)}
              placeholder="VÃ­ dá»¥: áº¢nh ngÆ°á»i dÃ¢n gá»­i gÃ³c xiÃªn vÃ  bá»‹ ngÆ°á»£c sÃ¡ng, cáº§n tá»• Ä‘á»™i ra Ä‘o thÆ°á»›c kiá»ƒm tra lÃ²ng sÃ¢u há»‘ sá»¥t vÃ  diá»‡n tÃ­ch hÆ° háº¡i thá»±c táº¿..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>

          {/* 3. PhÃ¢n cÃ´ng Ä‘Æ¡n vá»‹ thá»±c hiá»‡n */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              3. PhÃ¢n cÃ´ng Ä‘Æ¡n vá»‹ thá»±c hiá»‡n: <span className="text-red-500">*</span>
            </label>
            <select
              value={surveyAssignedCrew}
              onChange={(e) => setSurveyAssignedCrew(e.target.value)}
              className="w-full bg-white border border-slate-200 font-medium text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer"
            >
              {surveyMode === 'MEASURE_ONLY' ? (
                <>
                  <option value="Tá»• Ä‘o Ä‘áº¡c hiá»‡n trÆ°á»ng 01 (Km 1020 - Km 1035)">
                    Tá»• Ä‘o Ä‘áº¡c hiá»‡n trÆ°á»ng 01 (Km 1020 - Km 1035) â€” TrÆ°á»Ÿng tá»•: Nguyá»…n VÄƒn ThÃ nh
                  </option>
                  <option value="Tá»• Ä‘o Ä‘áº¡c cÆ¡ Ä‘á»™ng 02 (Km 1035 - Km 1060)">
                    Tá»• Ä‘o Ä‘áº¡c cÆ¡ Ä‘á»™ng 02 (Km 1035 - Km 1060) â€” TrÆ°á»Ÿng tá»•: Tráº§n ÄÃ¬nh Trá»ng
                  </option>
                  <option value="Äá»™i ká»¹ thuáº­t pháº£n á»©ng nhanh sá»‘ 3">
                    Äá»™i ká»¹ thuáº­t pháº£n á»©ng nhanh sá»‘ 3 â€” Ká»¹ sÆ°: LÃª VÄƒn Nam
                  </option>
                </>
              ) : (
                <>
                  <option value="Äá»™i bay Drone HoÃ ng Háº£i 01 - Phi cÃ´ng: LÃª Minh KhÃ´i">
                    Äá»™i bay Drone HoÃ ng Háº£i 01 â€” Phi cÃ´ng: LÃª Minh KhÃ´i (DJI Matrice 350 RTK)
                  </option>
                  <option value="Äá»™i bay Kháº£o sÃ¡t 02 - Phi cÃ´ng: HoÃ ng Quá»‘c Tuáº¥n">
                    Äá»™i bay Kháº£o sÃ¡t 02 â€” Phi cÃ´ng: HoÃ ng Quá»‘c Tuáº¥n (DJI Mavic 3 Enterprise)
                  </option>
                  <option value="Tá»• bay cá»©u náº¡n kháº©n cáº¥p 03 - Phi cÃ´ng: Pháº¡m Anh DÅ©ng">
                    Tá»• bay cá»©u náº¡n kháº©n cáº¥p 03 â€” Phi cÃ´ng: Pháº¡m Anh DÅ©ng
                  </option>
                </>
              )}
            </select>
          </div>

          {/* 4. Cam káº¿t thá»i háº¡n SLA */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">4. Cam káº¿t thá»i háº¡n hoÃ n thÃ nh (SLA):</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 24, label: 'Kháº©n cáº¥p (24h)', note: 'Æ¯u tiÃªn hÃ ng Ä‘áº§u' },
                { value: 48, label: 'TiÃªu chuáº©n (48h)', note: 'Theo ca trá»±c chuáº©n' },
                { value: 168, label: 'Äá»‹nh ká»³ (7 ngÃ y)', note: 'Äá»£t kháº£o sÃ¡t tuáº§n' },
              ].map((sla) => (
                <button
                  key={sla.value}
                  type="button"
                  onClick={() => setSurveySlaHours(sla.value)}
                  className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                    surveySlaHours === sla.value
                      ? 'bg-amber-50 border-brand-gold text-[#8F7212] font-bold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs font-bold">{sla.label}</span>
                  <span className="block text-[10px] text-slate-400">{sla.note}</span>
                </button>
              ))}
            </div>
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
            onClick={onConfirmRequestSurvey}
            className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>PhÃ¡t Lá»‡nh Kháº£o SÃ¡t / Äo Láº¡i (WF-11)</span>
          </button>
        </div>
      </div>
    </div>
  )
}
