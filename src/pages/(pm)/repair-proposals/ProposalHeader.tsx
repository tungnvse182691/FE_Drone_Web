import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  SlidersHorizontal,
  FileText,
  Plus
} from 'lucide-react'

export interface ProposalHeaderProps {
  basePath: string
  totalPackagesCount: number
  isPM: boolean
  onOpenPDFPreviewModal: () => void
  onOpenCreateModal: () => void
}

export const ProposalHeader: React.FC<ProposalHeaderProps> = ({
  basePath,
  totalPackagesCount,
  isPM,
  onOpenPDFPreviewModal,
  onOpenCreateModal,
}) => {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
      <div className="space-y-1">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <button onClick={() => navigate(`${basePath}/projects`)} className="hover:text-brand-gold cursor-pointer transition-colors">
            Dá»± Ã¡n
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="hover:text-brand-gold cursor-pointer transition-colors">QL1A - Giai Ä‘oáº¡n 2</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="hover:text-brand-gold cursor-pointer transition-colors">Sá»­a chá»¯a</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-brand-gold font-semibold">GÃ³i Ä‘á» xuáº¥t ká»¹ thuáº­t</span>
        </nav>

        <div className="flex items-center gap-3 pt-1 flex-wrap">
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
            Danh má»¥c gÃ³i Ä‘á» xuáº¥t sá»­a chá»¯a ká»¹ thuáº­t
          </h1>
          <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-brand-dark font-mono text-xs font-bold shadow-2xs">
            PRJ-QL1A-02 â€¢ {totalPackagesCount} GÃ³i cÃ´ng viá»‡c
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Táº­p há»£p cÃ¡c Ä‘iá»ƒm khiáº¿m khuyáº¿t máº·t Ä‘Æ°á»ng thÃ nh gÃ³i thi cÃ´ng, xÃ¡c Ä‘á»‹nh biá»‡n phÃ¡p ká»¹ thuáº­t vÃ  trÃ¬nh ná»™p GiÃ¡m sÃ¡t trÆ°á»Ÿng phÃª duyá»‡t.
        </p>
      </div>

      {/* Action Buttons Top Bar */}
      <div className="flex items-center gap-2.5 flex-wrap shrink-0">

        <button
          onClick={onOpenPDFPreviewModal}
          type="button"
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-white text-slate-700 text-xs font-semibold shadow-2xs hover:bg-slate-50 border border-slate-200 cursor-pointer transition-colors"
        >
          <FileText className="w-4 h-4 text-slate-500" />
          <span>Xuáº¥t káº¿ hoáº¡ch ká»¹ thuáº­t (PDF)</span>
        </button>

        {isPM && (
          <button
            onClick={onOpenCreateModal}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-brand-gold hover:bg-[#B38E1F] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Táº¡o gÃ³i Ä‘á» xuáº¥t má»›i</span>
          </button>
        )}
      </div>
    </div>
  )
}
