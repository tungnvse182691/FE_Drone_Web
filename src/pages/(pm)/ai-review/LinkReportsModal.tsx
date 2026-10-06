import React from 'react'
import { Link2, X, AlertCircle } from 'lucide-react'
import type { TriageCase } from './types'

export interface LinkReportsModalProps {
  isOpen: boolean
  onClose: () => void
  cases: TriageCase[]
  selectedReportIds: string[]
  linkMasterCaseId: string
  setLinkMasterCaseId: (id: string) => void
  linkAuditNotes: string
  setLinkAuditNotes: (notes: string) => void
  onConfirmLinkReports: () => void
}

export const LinkReportsModal: React.FC<LinkReportsModalProps> = ({
  isOpen,
  onClose,
  cases,
  selectedReportIds,
  linkMasterCaseId,
  setLinkMasterCaseId,
  linkAuditNotes,
  setLinkAuditNotes,
  onConfirmLinkReports,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-brand-gold border border-amber-200">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">LiÃªn Káº¿t BÃ¡o TrÃ¹ng Pháº£n Ãnh (PA04)</h3>
              <p className="text-xs text-slate-500">
                Quy chuáº©n BR-30, BR-31: Há»£p nháº¥t nhiá»u bÃ¡o cÃ¡o thÃ nh 1 Master Case
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs">
          {/* Pick Master Case */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              1. Chá»n Há»“ SÆ¡ Tiáº¿p Nháº­n ChÃ­nh (Master Case):
            </label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {cases
                .filter((c) => selectedReportIds.includes(c.id))
                .map((c) => (
                  <label
                    key={c.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      linkMasterCaseId === c.id
                        ? 'bg-amber-50 border-brand-gold text-brand-dark'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="masterCaseSelect"
                        checked={linkMasterCaseId === c.id}
                        onChange={() => setLinkMasterCaseId(c.id)}
                        className="text-brand-gold focus:ring-brand-gold accent-brand-gold"
                      />
                      <div>
                        <span className="font-mono font-bold">{c.code}</span>
                        <span className="text-slate-500 ml-2">
                          ({c.stationing} - {c.defect_title})
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500">{c.reporter_name || c.source_label}</span>
                  </label>
                ))}
            </div>
          </div>

          {/* Audit justification */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">
              2. LÃ½ do liÃªn káº¿t &amp; Ä‘á»‘i chiáº¿u khÃ´ng gian (Audit Log):
            </label>
            <textarea
              rows={2}
              value={linkAuditNotes}
              onChange={(e) => setLinkAuditNotes(e.target.value)}
              placeholder="Nháº­p lÃ½ do liÃªn káº¿t (vÃ­ dá»¥: cÃ¡c pháº£n Ã¡nh cÃ¡ch nhau dÆ°á»›i 2m, cÃ¹ng pháº£n Ã¡nh á»• gÃ  Km 1025+390)..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              CÃ¡c pháº£n Ã¡nh vá»‡ tinh sáº½ Ä‘Æ°á»£c gáº¯n cá» <strong>MERGED</strong>, toÃ n bá»™ áº£nh hiá»‡n trÆ°á»ng vÃ  thÃ´ng tin
              ngÆ°á»i dÃ¢n Ä‘Æ°á»£c giá»¯ nguyÃªn vÃ  tá»•ng há»£p vÃ o há»“ sÆ¡ chÃ­nh, Ä‘áº£m báº£o khÃ´ng táº¡o 2 lá»‡nh sá»­a chá»¯a cÃ¹ng 1 lá»—i.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Há»§y bá»
          </button>
          <button
            type="button"
            onClick={onConfirmLinkReports}
            className="px-4 py-2 text-xs font-bold bg-brand-gold hover:bg-[#B38E1F] text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>XÃ¡c Nháº­n LiÃªn Káº¿t {selectedReportIds.length} BÃ¡o CÃ¡o</span>
          </button>
        </div>
      </div>
    </div>
  )
}
