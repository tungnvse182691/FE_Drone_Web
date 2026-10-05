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
                <PlaneTakeoff className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-bold text-slate-900 text-base">Lập Lệnh Bay Quét Bổ Sung (Re-flight)</h3>
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
                <strong>Điểm mù trắc địa hiện tại:</strong> Khu vực Km 1027+100 bị khuất bóng cây và rào chắn, độ phủ dải giữa chỉ đạt 68%. Cần bay quét góc nghiêng Oblique 45° để bù đắp dữ liệu.
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Chỉ dẫn kỹ thuật cho Phi công Drone:</label>
              <textarea
                rows={3}
                value={pilotNote}
                onChange={(e) => setPilotNote(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-400 block">Thiết bị dự kiến:</span>
                <span className="font-bold text-slate-800">DJI Matrice 300 RTK</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-400 block">Độ phân giải GSD yêu cầu:</span>
                <span className="font-bold text-slate-800">≤ 0.35 cm/pixel</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsReFlightModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={onSubmitReFlight}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#C9A227] hover:bg-[#B38E1F] text-white shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <PlaneTakeoff className="w-3.5 h-3.5" />
                <span>Xác nhận phát lệnh bay bù</span>
              </button>
            </div>
          </div>
        </div>
  )
}
