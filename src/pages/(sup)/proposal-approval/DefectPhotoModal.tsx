import React from 'react'
import { Icon } from '../../../components/ui/Icon'
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
    <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 font-body" role="dialog">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
      ></div>

      <div className="relative bg-slate-900 text-white rounded-xl overflow-hidden shadow-2xl max-w-4xl w-full z-10 border border-slate-700 max-h-[95vh] flex flex-col">
        <div className="p-3.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-brand-gold text-xs">{viewingPhotoItem.item_code}</span>
            <span className="text-slate-400">•</span>
            <span className="font-semibold text-xs">{viewingPhotoItem.defect_title}</span>
            <span className="text-[11px] text-slate-400 font-mono">({viewingPhotoItem.chainage})</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center justify-center transition cursor-pointer"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="relative bg-black flex items-center justify-center overflow-hidden flex-1 min-h-[360px] max-h-[520px]">
          <img
            src={viewingPhotoItem.image_url}
            alt={viewingPhotoItem.defect_title}
            className="max-h-full max-w-full object-contain"
          />

          <div className="absolute top-1/4 left-1/3 w-36 h-24 border border-brand-gold bg-brand-gold/15 rounded pointer-events-none">
            <span className="absolute -top-5 left-0 bg-brand-gold text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
              {viewingPhotoItem.defect_measurements}
            </span>
          </div>
        </div>

        <div className="p-3 bg-slate-800 border-t border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-300 font-mono text-[11px]">
            <span className="flex items-center gap-1 text-brand-gold font-medium">
              <Icon name="location_on" size={14} /> GPS: {viewingPhotoItem.gps_coords}
            </span>
            <span className="text-slate-500">•</span>
            <span>File: {viewingPhotoItem.ortho_code}</span>
            <span className="text-slate-500">•</span>
            <span>Độ phân giải: {viewingPhotoItem.resolution}</span>
            {viewingPhotoItem.pilot_name && (
              <>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{viewingPhotoItem.pilot_name} ({viewingPhotoItem.drone_model})</span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            type="button"
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-medium cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
export default DefectPhotoModal
