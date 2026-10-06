import React from 'react'
import { CheckSquare, Link2, Building2 } from 'lucide-react'
import { TriageCase } from './types'

export interface BatchActionBarProps {
  selectedReportIds: string[]
  cases: TriageCase[]
  onOpenLinkReportsModal: () => void
  onOpenTriageProject: (c: TriageCase, e?: React.MouseEvent) => void
  onClearSelectedReports: () => void
}

export const BatchActionBar: React.FC<BatchActionBarProps> = ({
  selectedReportIds,
  cases,
  onOpenLinkReportsModal,
  onOpenTriageProject,
  onClearSelectedReports
}) => {
  if (selectedReportIds.length === 0) return null

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-2.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-lg border border-amber-400 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-2">
        <CheckSquare className="w-4 h-4 text-slate-950 font-bold" />
        <span className="text-xs font-bold">
          ÄÃ£ chá»n {selectedReportIds.length} pháº£n Ã¡nh hiá»‡n trÆ°á»ng
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={onOpenLinkReportsModal}
          disabled={selectedReportIds.length < 2}
          className="px-3 py-1.5 rounded-lg bg-slate-950 text-white hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          title={
            selectedReportIds.length < 2
              ? 'Chá»n tá»« 2 pháº£n Ã¡nh trá»Ÿ lÃªn Ä‘á»ƒ liÃªn káº¿t bÃ¡o trÃ¹ng'
              : 'LiÃªn káº¿t bÃ¡o trÃ¹ng (PA04)'
          }
        >
          <Link2 className="w-3.5 h-3.5 text-brand-gold" />
          <span>LiÃªn káº¿t bÃ¡o trÃ¹ng (Link Reports - PA04)</span>
        </button>
        <button
          type="button"
          onClick={() => {
            const first = cases.find((c) => selectedReportIds.includes(c.id))
            if (first) onOpenTriageProject(first)
          }}
          className="px-3 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors border border-amber-300"
        >
          <Building2 className="w-3.5 h-3.5 text-amber-700" />
          <span>Äiá»u phá»‘i vÃ o dá»± Ã¡n (PA03)</span>
        </button>
        <button
          type="button"
          onClick={onClearSelectedReports}
          className="px-2.5 py-1.5 rounded-lg text-slate-800 hover:bg-amber-400 text-xs font-semibold cursor-pointer"
        >
          Bá» chá»n
        </button>
      </div>
    </div>
  )
}
