import React from 'react'
import { FileText, X } from 'lucide-react'
import type { ProposalWorkPackage } from './types'

export interface ProposalPDFPreviewModalProps {
  isPDFPreviewModalOpen: boolean
  setIsPDFPreviewModalOpen: (open: boolean) => void
  packages: ProposalWorkPackage[]
  showToast: (msg: string) => void
}

export const ProposalPDFPreviewModal: React.FC<ProposalPDFPreviewModalProps> = ({
  isPDFPreviewModalOpen,
  setIsPDFPreviewModalOpen,
  packages,
  showToast,
}) => {
  if (!isPDFPreviewModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-gold" />
            <h3 className="font-bold text-base text-brand-dark">Káº¿ Hoáº¡ch Sá»­a Chá»¯a Ká»¹ Thuáº­t (PDF)</h3>
          </div>
          <button
            onClick={() => setIsPDFPreviewModalOpen(false)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
          <div className="font-bold text-slate-800">CÃ”NG TY Cá»” PHáº¦N Äáº¦U TÆ¯ XÃ‚Y Dá»°NG HOÃ€NG Háº¢I</div>
          <div className="text-slate-600">Ban Äiá»u HÃ nh Dá»± Ãn Báº£o TrÃ¬ Quá»‘c Lá»™ 1A (PK-04)</div>
          <div className="font-mono text-[11px] text-slate-500">MÃ£ vÄƒn báº£n: KH-2026/QL1A-PK04-O&amp;M</div>
          <div className="pt-2 border-t border-slate-200 text-slate-700">
            Táº­p há»£p tá»•ng há»£p <strong>{packages.length} gÃ³i Ä‘á» xuáº¥t ká»¹ thuáº­t</strong> vá»›i tá»•ng sá»‘{' '}
            <strong className="text-brand-dark font-mono">
              {packages.reduce((sum, p) => sum + p.defect_count, 0)} háº¡ng má»¥c khiáº¿m khuyáº¿t
            </strong>{' '}
            Ä‘Æ°á»£c láº­p phÆ°Æ¡ng Ã¡n thi cÃ´ng trÃªn toÃ n tuyáº¿n.
          </div>
          <div className="text-[11px] text-slate-500">
            â€¢ Tráº¡ng thÃ¡i há»“ sÆ¡: ÄÃ£ Ä‘á»“ng bá»™ vá»›i mÃ¡y chá»§ O&amp;M HoÃ ng Háº£i
            <br />
            â€¢ TiÃªu chuáº©n nghiá»‡m thu: TCVN 8819:2011 &amp; QCVN 41:2019/BGTVT
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setIsPDFPreviewModalOpen(false)}
            type="button"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
          >
            ÄÃ³ng
          </button>
          <button
            onClick={() => {
              setIsPDFPreviewModalOpen(false)
              showToast('Äang táº¡o vÃ  táº£i xuá»‘ng file PDF: Ke_hoach_ky_thuat_QL1A_PK04.pdf')
            }}
            type="button"
            className="px-4 py-2 bg-brand-gold hover:bg-[#B38E1F] text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <FileText className="w-4 h-4" />
            <span>Táº£i xuá»‘ng file PDF</span>
          </button>
        </div>
      </div>
    </div>
  )
}
