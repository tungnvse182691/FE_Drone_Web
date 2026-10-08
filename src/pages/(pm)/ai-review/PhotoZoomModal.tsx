import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import type { TriageCase } from './types'

export interface PhotoZoomModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCase: TriageCase
}

export const PhotoZoomModal: React.FC<PhotoZoomModalProps> = ({
  isOpen,
  onClose,
  selectedCase,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl max-w-3xl w-full p-4 shadow-2xl border border-slate-700 space-y-3 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-white">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-brand-gold">{selectedCase.code}</span>
            <span className="text-xs text-slate-300">
              • {selectedCase.defect_title} ({selectedCase.stationing})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="w-full h-96 rounded-xl overflow-hidden bg-black flex items-center justify-center">
          <img
            src={selectedCase.image_url}
            alt="Full resolution inspection"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Độ phân giải thực: 0.3 cm/px • Nguồn chụp: Matrice 300 RTK</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
