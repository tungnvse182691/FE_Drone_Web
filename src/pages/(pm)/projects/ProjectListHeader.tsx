import React from 'react'
import {
  FolderKanban,
  ChevronRight,
  Download,
  PlusCircle
} from 'lucide-react'

interface ProjectListHeaderProps {
  isSupervisor: boolean
  onNavigateHome: () => void
  onExportGis: () => void
  onOpenCreateModal: () => void
}

export const ProjectListHeader: React.FC<ProjectListHeaderProps> = ({
  isSupervisor,
  onNavigateHome,
  onExportGis,
  onOpenCreateModal
}) => {
  return (
    <>
      {/* TOP CONTEXT BAR: BREADCRUMB */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span
            onClick={onNavigateHome}
            className="hover:text-brand-gold transition-colors cursor-pointer flex items-center gap-1"
          >
            <FolderKanban className="w-3.5 h-3.5" />
            Trang chá»§
          </span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-800 font-semibold">Danh má»¥c dá»± Ã¡n háº¡ táº§ng</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-mono text-brand-goldMuted bg-brand-gold/15 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            INFRA-HUB-V2.4
          </span>
        </div>
      </div>

      {/* PAGE HEADER & PRIMARY ACTIONS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 max-w-3xl">
          <div className="w-12 h-12 rounded-xl bg-brand-gold/15 text-brand-gold flex items-center justify-center shrink-0 shadow-2xs">
            <FolderKanban className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight font-headline">
              Quáº£n lÃ½ danh má»¥c dá»± Ã¡n báº£o hÃ nh Ä‘Æ°á»ng bá»™
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Theo dÃµi tiáº¿n Ä‘á»™ báº£o hÃ nh, má»©c Ä‘á»™ rá»§i ro hÆ° há»ng máº·t Ä‘Æ°á»ng vÃ  phÃ¢n bá»• nguá»“n lá»±c ká»¹ sÆ° quáº£n lÃ½ dá»± Ã¡n (PM) trÃªn toÃ n máº¡ng lÆ°á»›i cao tá»‘c &amp; quá»‘c lá»™.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={onExportGis}
            className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuáº¥t dá»¯ liá»‡u GIS</span>
          </button>

          {/* Supervisor Only Button */}
          {isSupervisor && (
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="px-4 py-2.5 bg-brand-gold hover:bg-brand-goldMuted text-white rounded-xl text-xs font-semibold transition shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.4]" />
              <span>Khá»Ÿi táº¡o dá»± Ã¡n má»›i</span>
            </button>
          )}
        </div>
      </div>
    </>
  )
}
