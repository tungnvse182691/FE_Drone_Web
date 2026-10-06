import React from 'react'
import { Send, X, AlertTriangle, Info } from 'lucide-react'
import { RouteConfig, DefectItem, WorkMode, CrewTeam, PolicyThresholdConfig } from './types'

export interface FastTrackDispatchModalProps {
  isOpen: boolean
  onClose: () => void
  workMode: WorkMode
  currentRouteConfig: RouteConfig
  selectedDefectIds: string[]
  surveyDistanceM: number
  selectedItems: DefectItem[]
  selectedDispatchCrew: string
  setSelectedDispatchCrew: (crew: string) => void
  crewTeams: CrewTeam[]
  dispatchNotes: string
  setDispatchNotes: (notes: string) => void
  handleExecuteDispatch: () => void
  currentPolicy: PolicyThresholdConfig
}

export const FastTrackDispatchModal: React.FC<FastTrackDispatchModalProps> = ({
  isOpen,
  onClose,
  workMode,
  currentRouteConfig,
  selectedDefectIds,
  surveyDistanceM,
  selectedItems,
  selectedDispatchCrew,
  setSelectedDispatchCrew,
  crewTeams,
  dispatchNotes,
  setDispatchNotes,
  handleExecuteDispatch,
  currentPolicy
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-brand-border space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-brand-gold">
              <Send className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">
                {workMode === 'MEASURE_ONLY'
                  ? 'Lá»‡nh Kháº£o SÃ¡t Äo Äáº¡c Hiá»‡n TrÆ°á»ng'
                  : workMode === 'INSPECT_AND_REPAIR'
                  ? 'Lá»‡nh Äo & Sá»­a Ngay Fast Track Táº¡i Chá»—'
                  : 'Lá»‡nh á»¨ng Cá»©u Kháº©n Cáº¥p Máº·t ÄÆ°á»ng 24/7'}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <span className="font-semibold text-brand-dark">{currentRouteConfig.code}</span>
                <span>â€¢</span>
                <span className="font-mono">{selectedDefectIds.length} háº¡ng má»¥c</span>
                <span>â€¢</span>
                <span>Cá»± ly: {surveyDistanceM} m</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Danh sÃ¡ch háº¡ng má»¥c tÃ³m táº¯t */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
              <span>CÃ¡c vá»‹ trÃ­ khiáº¿m khuyáº¿t Ä‘Æ°á»£c giao ({selectedItems.length})</span>
              <span className="text-slate-500 font-mono text-[10px]">Tuyáº¿n: {currentRouteConfig.name}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedItems.map((d) => (
                <span
                  key={d.id}
                  className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border ${
                    d.isFastTrackEligible
                      ? 'bg-white text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {d.code} ({d.stationing})
                </span>
              ))}
            </div>
          </div>

          {/* Chá»n tá»• Ä‘á»™i thi cÃ´ng / Ä‘o Ä‘áº¡c */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700 uppercase text-[11px]">
              Chá»‰ Ä‘á»‹nh Tá»• Ä‘á»™i ká»¹ thuáº­t tiáº¿p nháº­n nhiá»‡m vá»¥
            </label>
            <select
              value={selectedDispatchCrew}
              onChange={(e) => setSelectedDispatchCrew(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
            >
              {crewTeams.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} â€” Phá»¥ trÃ¡ch: {c.leader} ({c.memberCount} nhÃ¢n sá»±) {c.isAvailable ? 'â€¢ Sáºµn sÃ ng' : 'â€¢ Äang báº­n'}
                </option>
              ))}
            </select>

            {/* ThÃ´ng tin chi tiáº¿t cá»§a tá»• Ä‘á»™i Ä‘Æ°á»£c chá»n */}
            {(() => {
              const currentCrewObj = crewTeams.find((c) => c.name === selectedDispatchCrew) || crewTeams[0]
              return (
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-amber-50/60 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                  <div>
                    <span className="text-slate-500">Chá»‰ huy tá»•:</span>{' '}
                    <strong>{currentCrewObj.leader}</strong> ({currentCrewObj.memberCount} ká»¹ thuáº­t viÃªn)
                  </div>
                  <div>
                    <span className="text-slate-500">Tráº¡ng thÃ¡i:</span>{' '}
                    <strong className={currentCrewObj.isAvailable ? 'text-emerald-700' : 'text-amber-700'}>
                      {currentCrewObj.isAvailable ? 'Sáºµn sÃ ng xuáº¥t quÃ¢n' : 'Äang thá»±c hiá»‡n nhiá»‡m vá»¥ khÃ¡c'}
                    </strong>
                  </div>
                  <div className="col-span-2 text-slate-600">
                    <span className="text-slate-500">Trang thiáº¿t bá»‹ mang theo:</span>{' '}
                    <span className="font-medium text-slate-800">{currentCrewObj.equipment}</span>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Cáº£nh bÃ¡o nghiÃªm ngáº·t khi chá»n lá»—i chÆ°a vÆ°á»£t ngÆ°á»¡ng á»Ÿ cháº¿ Ä‘á»™ Kháº©n cáº¥p */}
          {workMode === 'EMERGENCY' && selectedItems[0]?.isFastTrackEligible && (
            <div className="p-3 bg-amber-50/90 border-2 border-amber-300 rounded-xl space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Cáº¢NH BÃO QUY TRÃŒNH: HÆ¯ Há»ŽNG CHÆ¯A VÆ¯á»¢T NGÆ¯á» NG AN TOÃ€N ({selectedItems[0]?.code})</span>
              </div>
              <p className="text-amber-800 leading-relaxed text-[11px]">
                Khiáº¿m khuyáº¿t nÃ y cÃ³ diá»‡n tÃ­ch <strong>{selectedItems[0]?.areaM2} mÂ²</strong> (&le; {currentPolicy.maxAreaM2} mÂ²) vÃ  Ä‘á»™ sÃ¢u <strong>{selectedItems[0]?.depthCm} cm</strong> (&le; {currentPolicy.maxDepthCm} cm). ÄÃ¢y lÃ  hÆ° há»ng nhá» Ä‘áº¡t chuáº©n <strong>Äo &amp; Sá»­a ngay (Fast Track)</strong> thÃ´ng thÆ°á»ng.
              </p>
              <div className="text-[11px] text-amber-950 font-bold bg-white/80 p-2 rounded-lg border border-amber-200">
                âš¡ Báº¯t buá»™c Chá»‰ huy trÆ°á»Ÿng (PM) pháº£i nháº­p lÃ½ do xuáº¥t quÃ¢n kháº©n cáº¥p Ä‘áº·c biá»‡t vÃ o Ã´ bÃªn dÆ°á»›i (tá»‘i thiá»ƒu 15 kÃ½ tá»±) Ä‘á»ƒ phá»¥c vá»¥ thanh tra dá»± Ã¡n!
              </div>
            </div>
          )}

          {/* Chá»‰ Ä‘áº¡o & Ghi chÃº cá»§a PM */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-700 uppercase text-[11px]">
                Chá»‰ Ä‘áº¡o cá»§a Chá»‰ huy trÆ°á»Ÿng (PM Dispatch Notes)
              </label>
              {workMode === 'EMERGENCY' && selectedItems[0]?.isFastTrackEligible && (
                <span className="text-[10px] text-amber-700 font-bold">
                  * Báº¯t buá»™c giáº£i trÃ¬nh ({dispatchNotes.trim().length}/15 kÃ½ tá»±)
                </span>
              )}
            </div>
            <textarea
              rows={2}
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
              placeholder={
                workMode === 'EMERGENCY' && selectedItems[0]?.isFastTrackEligible
                  ? 'Báº®T BUá»˜C: Nháº­p lÃ½ do xuáº¥t quÃ¢n kháº©n cáº¥p cho lá»—i chÆ°a vÆ°á»£t ngÆ°á»¡ng (VD: Pháº£n Ã¡nh tá»« CSGT, khÃºc cua nguy hiá»ƒm...)'
                  : 'Ghi rÃµ yÃªu cáº§u an toÃ n, rÃ o cháº¯n phÃ¢n luá»“ng, phÆ°Æ¡ng tiá»‡n Ä‘o...'
              }
              className={`w-full px-3 py-2 bg-white border rounded-xl text-xs focus:outline-none ${
                workMode === 'EMERGENCY' && selectedItems[0]?.isFastTrackEligible && dispatchNotes.trim().length < 15
                  ? 'border-amber-400 focus:ring-2 focus:ring-amber-400'
                  : 'border-slate-300 focus:border-brand-gold'
              }`}
            />
          </div>

          {/* Há»™p quy cháº¿ nháº¯c nhá»Ÿ */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
            <span>
              {workMode === 'MEASURE_ONLY' && (
                <>
                  <strong>Quy chuáº©n MEASURE_ONLY:</strong> Lá»‡nh chá»‰ cáº¥p quyá»n Ä‘o Ä‘áº¡c vÃ  chá»¥p áº£nh tráº¯c Ä‘á»‹a. Tá»• Ä‘á»™i tuyá»‡t Ä‘á»‘i khÃ´ng Ä‘Æ°á»£c tá»± Ã½ cÃ o bÃ³c hay sá»­a chá»¯a khi chÆ°a cÃ³ biÃªn báº£n dá»± toÃ¡n BOQ Ä‘Æ°á»£c duyá»‡t.
                </>
              )}
              {workMode === 'INSPECT_AND_REPAIR' && (
                <>
                  <strong>Quy chuáº©n FAST TRACK:</strong> Tá»• Ä‘á»™i mang váº­t liá»‡u vÃ¡ nguá»™i vÃ  Ä‘Æ°á»£c phÃ©p thi cÃ´ng dá»©t Ä‘iá»ƒm táº¡i hiá»‡n trÆ°á»ng náº¿u sá»‘ Ä‘o thá»±c táº¿ Ä‘áº¡t chuáº©n chÃ­nh sÃ¡ch ({currentPolicy.version}).
                </>
              )}
              {workMode === 'EMERGENCY' && (
                <>
                  <strong>Quy chuáº©n EMERGENCY:</strong> Cáº¯m biá»ƒn bÃ¡o nguy hiá»ƒm vÃ  phÃ¢n luá»“ng ngay láº­p tá»©c. ÄÆ°á»£c phÃ©p kháº¯c phá»¥c táº¡m thá»i trÆ°á»›c Ä‘á»ƒ báº£o Ä‘áº£m an toÃ n giao thÃ´ng thÃ´ng suá»‘t.
                </>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 bg-white text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            Há»§y bá»
          </button>
          <button
            onClick={handleExecuteDispatch}
            type="button"
            className="px-5 py-2 bg-brand-gold hover:bg-[#B38E1F] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>PhÃ¡t lá»‡nh xuáº¥t quÃ¢n (Äá»“ng bá»™ App Mobile)</span>
          </button>
        </div>
      </div>
    </div>
  )
}
