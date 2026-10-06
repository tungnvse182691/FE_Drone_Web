import React from 'react'
import {
  X,
  MapPin
} from 'lucide-react'
import { RepairItemDetail } from './types'

export interface DefectPhotoModalProps {
  viewingPhotoItem: RepairItemDetail | null
  onClose: () => void
}

export const DefectPhotoModal: React.FC<DefectPhotoModalProps> = ({
  viewingPhotoItem,
  onClose
}) => {
  if (!viewingPhotoItem) return null

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      ></div>

      <div className="relative bg-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl max-w-4xl w-full z-10 border border-slate-700 max-h-[95vh] flex flex-col">
        <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-[#C9A227]">{viewingPhotoItem.item_code}</span>
            <span className="text-slate-400">•</span>
            <span className="font-semibold text-sm">{viewingPhotoItem.defect_title}</span>
            <span className="text-xs text-slate-400 font-mono">({viewingPhotoItem.chainage})</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative bg-black flex items-center justify-center overflow-hidden flex-1 min-h-[380px] max-h-[550px]">
          <img
            src={viewingPhotoItem.image_url}
            alt={viewingPhotoItem.defect_title}
            className="max-h-full max-w-full object-contain"
          />

          <div className="absolute top-1/4 left-1/3 w-40 h-28 border-2 border-[#C9A227] bg-[#C9A227]/20 rounded-md pointer-events-none">
            <span className="absolute -top-6 left-0 bg-[#C9A227] text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
              {viewingPhotoItem.defect_measurements}
            </span>
          </div>
        </div>

        <div className="p-4 bg-slate-800 border-t border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-slate-300 font-mono text-[11px]">
            <span className="flex items-center gap-1 text-[#C9A227] font-semibold">
              <MapPin className="w-3.5 h-3.5" /> GPS: {viewingPhotoItem.gps_coords}
            </span>
            <span className="text-slate-400">|</span>
            <span>
              Đợt bay: <strong className="text-white">{viewingPhotoItem.survey_code || '#MS-2026-08'}</strong>
            </span>
            <span>
              Thiết bị: <strong className="text-white">{viewingPhotoItem.drone_model || 'DJI Matrice 350 RTK'}</strong>
            </span>
            <span>
              Phi công UAV: <strong className="text-white">{viewingPhotoItem.pilot_name || 'Kỹ sư UAV Trần Hùng'}</strong>
            </span>
            <span className="text-slate-400">|</span>
            <span>File: {viewingPhotoItem.ortho_code}</span>
            <span>Độ phân giải: {viewingPhotoItem.resolution}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#C9A227] text-white font-bold rounded-xl text-xs hover:bg-[#B38E1F] transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
export default DefectPhotoModal
