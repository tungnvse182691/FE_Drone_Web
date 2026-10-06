import React from 'react'
import { X } from 'lucide-react'
import { DefectItem } from './types'

export interface DefectDetailModalProps {
  detailDefect: DefectItem | null
  onClose: () => void
}

export const DefectDetailModal: React.FC<DefectDetailModalProps> = ({
  detailDefect,
  onClose
}) => {
  if (!detailDefect) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-brand-dark">{detailDefect.code}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  detailDefect.isFastTrackEligible
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {detailDefect.isFastTrackEligible ? 'Äáº¡t chuáº©n' : 'Vi pháº¡m ngÆ°á»¡ng'}
              </span>
            </div>
            <p className="text-xs text-slate-500">{detailDefect.stationing} â€¢ {detailDefect.lane}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl overflow-hidden aspect-video bg-black border border-slate-200">
            <img src={detailDefect.image} alt={detailDefect.code} className="w-full h-full object-cover" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500">Diá»‡n tÃ­ch sÆ¡ bá»™:</span>
              <div className="font-bold text-sm text-brand-dark">{detailDefect.areaM2} mÂ²</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500">Äá»™ sÃ¢u laser:</span>
              <div className="font-bold text-sm text-brand-dark">{detailDefect.depthCm} cm</div>
            </div>
          </div>

          <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>Tá»a Ä‘á»™ GPS: <strong>{detailDefect.gps.lat}Â° N, {detailDefect.gps.lng}Â° E</strong></div>
            <div>Äá»™i phá»¥ trÃ¡ch: <strong>{detailDefect.assignedCrew}</strong></div>
            <div>Äá»™ tin cáº­y AI: <strong>{detailDefect.aiConfidence}%</strong></div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-brand-gold text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            ÄÃ³ng cá»­a sá»•
          </button>
        </div>
      </div>
    </div>
  )
}
