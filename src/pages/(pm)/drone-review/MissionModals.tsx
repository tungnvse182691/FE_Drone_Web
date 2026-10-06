import React from 'react'
import { AlertTriangle, Send, X, PlaneTakeoff } from 'lucide-react'

export interface MissionModalsProps {
  isReFlightModalOpen: boolean
  setIsReFlightModalOpen: (open: boolean) => void
  pilotNote: string
  setPilotNote: (note: string) => void
  onSubmitReFlight: () => void
}

export const MissionModals: React.FC<MissionModalsProps> = ({
  isReFlightModalOpen,
  setIsReFlightModalOpen,
  pilotNote,
  setPilotNote,
  onSubmitReFlight
}) => {
  if (!isReFlightModalOpen) return null

  return (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PlaneTakeoff className="w-5 h-5 text-brand-gold" />
                <h3 className="font-bold text-slate-900 text-base">Láº­p Lá»‡nh Bay QuÃ©t Bá»• Sung (Re-flight)</h3>
              </div>
              <button
                onClick={() => setIsReFlightModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Äiá»ƒm mÃ¹ tráº¯c Ä‘á»‹a hiá»‡n táº¡i:</strong> Khu vá»±c Km 1027+100 bá»‹ khuáº¥t bÃ³ng cÃ¢y vÃ  rÃ o cháº¯n, Ä‘á»™ phá»§ dáº£i giá»¯a chá»‰ Ä‘áº¡t 68%. Cáº§n bay quÃ©t gÃ³c nghiÃªng Oblique 45Â° Ä‘á»ƒ bÃ¹ Ä‘áº¯p dá»¯ liá»‡u.
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Chá»‰ dáº«n ká»¹ thuáº­t cho Phi cÃ´ng Drone:</label>
              <textarea
                rows={3}
                value={pilotNote}
                onChange={(e) => setPilotNote(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-400 block">Thiáº¿t bá»‹ dá»± kiáº¿n:</span>
                <span className="font-bold text-slate-800">DJI Matrice 300 RTK</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-400 block">Äá»™ phÃ¢n giáº£i GSD yÃªu cáº§u:</span>
                <span className="font-bold text-slate-800">â‰¤ 0.35 cm/pixel</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsReFlightModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Há»§y bá»
              </button>
              <button
                onClick={onSubmitReFlight}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-gold hover:bg-[#B38E1F] text-white shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <PlaneTakeoff className="w-3.5 h-3.5" />
                <span>XÃ¡c nháº­n phÃ¡t lá»‡nh bay bÃ¹</span>
              </button>
            </div>
          </div>
        </div>
  )
}
