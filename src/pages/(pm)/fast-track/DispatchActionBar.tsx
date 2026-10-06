import React from 'react'
import { Users2, Send, Wrench, AlertOctagon, AlertTriangle, Flame } from 'lucide-react'
import { DefectItem, WorkMode } from './types'

export interface DispatchActionBarProps {
  selectedDefectIds: string[]
  surveyDistanceM: number
  selectedItems: DefectItem[]
  setSelectedDefectIds: React.Dispatch<React.SetStateAction<string[]>>
  showToast: (msg: string) => void
  workMode: WorkMode
  handleDispatchBatch: () => void
  handleRepairDirect: () => void
  handleEmergencyDispatch: () => void
  hasViolationItem: boolean
}

export const DispatchActionBar: React.FC<DispatchActionBarProps> = ({
  selectedDefectIds,
  surveyDistanceM,
  selectedItems,
  setSelectedDefectIds,
  showToast,
  workMode,
  handleDispatchBatch,
  handleRepairDirect,
  handleEmergencyDispatch,
  hasViolationItem
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
      {/* Selection Summary */}
      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-brand-dark text-sm">
            ÄÃ£ chá»n: {selectedDefectIds.length} khiáº¿m khuyáº¿t
          </span>
          <span className="text-slate-400">â€¢</span>
          <span className="text-slate-600">
            Tá»•ng chiá»u dÃ i kháº£o sÃ¡t:{' '}
            <strong className="text-brand-dark font-mono font-bold">{surveyDistanceM} m</strong>
          </span>
        </div>
        <div className="text-slate-500 flex items-center gap-1.5 flex-wrap text-[11px]">
          <Users2 className="w-3.5 h-3.5 text-brand-gold" />
          <span>
            PhÃ¢n bá»• sÆ¡ bá»™: <strong className="text-brand-dark font-semibold">{selectedItems[0]?.assignedCrew || 'ChÆ°a chá»‰ Ä‘á»‹nh'}</strong> (Báº¥m nÃºt bÃªn pháº£i Ä‘á»ƒ phÃ¡t lá»‡nh chÃ­nh thá»©c)
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 flex-wrap justify-end">
        <button
          onClick={() => setSelectedDefectIds([])}
          type="button"
          className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
        >
          Há»§y chá»n
        </button>
        <button
          onClick={() => showToast('ÄÃ£ lÆ°u nhÃ¡p cáº¥u hÃ¬nh phÃ¢n bá»• nhiá»‡m vá»¥ vÃ o há»“ sÆ¡ dá»± Ã¡n.')}
          type="button"
          className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
        >
          LÆ°u nhÃ¡p phÃ¢n cÃ´ng
        </button>

        {/* Dynamic Buttons based on workMode */}
        {workMode === 'MEASURE_ONLY' && (
          <button
            onClick={handleDispatchBatch}
            disabled={selectedDefectIds.length === 0}
            type="button"
            className={`px-5 py-2 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 ${
              selectedDefectIds.length === 0
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-brand-gold hover:bg-[#B38E1F] cursor-pointer'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Giao viá»‡c gom lÃ´ Ä‘o Ä‘áº¡c ({selectedDefectIds.length} khiáº¿m khuyáº¿t)</span>
          </button>
        )}

        {workMode === 'INSPECT_AND_REPAIR' && (
          <div className="relative group">
            <button
              onClick={handleRepairDirect}
              disabled={hasViolationItem || selectedDefectIds.length !== 1}
              type="button"
              className={`px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all ${
                hasViolationItem || selectedDefectIds.length !== 1
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>PhÃ¡t lá»‡nh Äo & Sá»­a ngay (1 khiáº¿m khuyáº¿t)</span>
            </button>
            {(hasViolationItem || selectedDefectIds.length !== 1) && (
              <div className="absolute bottom-full mb-2 right-0 hidden group-hover:flex items-center px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-medium whitespace-nowrap shadow-lg z-30 pointer-events-none">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400 mr-1" />
                {hasViolationItem
                  ? 'KhÃ³a: Khiáº¿m khuyáº¿t Ä‘Æ°á»£c chá»n vÆ°á»£t ngÆ°á»¡ng chÃ­nh sÃ¡ch Fast Track'
                  : 'Quy táº¯c BR-08: Cháº¿ Ä‘á»™ Äo & Sá»­a ngay chá»‰ Ã¡p dá»¥ng cho Ä‘Ãºng 1 lá»—i Ä‘áº¡t chuáº©n'}
              </div>
            )}
          </div>
        )}

        {workMode === 'EMERGENCY' && (
          <div className="flex items-center gap-2.5">
            {selectedItems[0]?.isFastTrackEligible && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs font-semibold animate-pulse">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>LÆ°u Ã½: HÆ° há»ng #{selectedItems[0]?.code} chÆ°a vÆ°á»£t ngÆ°á»¡ng an toÃ n!</span>
              </div>
            )}
            <div className="relative group">
              <button
                onClick={handleEmergencyDispatch}
                disabled={selectedDefectIds.length !== 1}
                type="button"
                className={`px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all ${
                  selectedDefectIds.length !== 1
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>PhÃ¡t lá»‡nh Xá»­ lÃ½ kháº©n cáº¥p (24/7 Priority)</span>
              </button>
              {selectedDefectIds.length !== 1 && (
                <div className="absolute bottom-full mb-2 right-0 hidden group-hover:flex items-center px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-medium whitespace-nowrap shadow-lg z-30 pointer-events-none">
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-400 mr-1" />
                  Chá»‰ chá»n Ä‘Ãºng 1 vá»‹ trÃ­ nguy hiá»ƒm Ä‘á»ƒ Ä‘iá»u Ä‘á»™ng xe kháº©n cáº¥p
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
