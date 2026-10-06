import React from 'react'
import { FileText, Maximize2, X } from 'lucide-react'
import type { TriageCase } from './types'

export interface DrawerHeaderProps {
  selectedCase: TriageCase
  onOpenPhotoZoomModal: () => void
  handleClose?: () => void
}

export const DrawerHeader: React.FC<DrawerHeaderProps> = ({
  selectedCase,
  onOpenPhotoZoomModal,
  handleClose,
}) => {
  return (
    <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/90 flex items-center justify-center text-brand-gold shadow-2xs shrink-0">
          <FileText className="w-5 h-5 text-brand-gold" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-base text-brand-dark">Há»“ SÆ¡ Tháº©m Äá»‹nh</span>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-gold/15 text-[#8F7212] border border-brand-gold/30">
              {selectedCase.code}
            </span>
            {selectedCase.master_case_id && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                ÄÃ£ gá»™p trÃ¹ng
              </span>
            )}
            {selectedCase.linked_report_ids && selectedCase.linked_report_ids.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                Master Case ({selectedCase.linked_report_ids.length})
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gá»­i lÃºc {selectedCase.created_at} bá»Ÿi {selectedCase.source_detail} â€¢ Tháº©m Ä‘á»‹nh thÃ´ng sá»‘ ká»¹ thuáº­t vÃ  ra quyáº¿t Ä‘á»‹nh xá»­ lÃ½
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-slate-400">
        <button
          onClick={onOpenPhotoZoomModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          title="Má»Ÿ rá»™ng chi tiáº¿t"
          type="button"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>PhÃ³ng to áº£nh</span>
        </button>
        {handleClose && (
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="ÄÃ³ng há»“ sÆ¡ tháº©m Ä‘á»‹nh"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
