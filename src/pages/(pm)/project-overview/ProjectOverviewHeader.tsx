import React from 'react'
import {
  Home,
  ChevronRight,
  Route as RouteIcon,
  MapPin,
  ShieldCheck,
  Settings,
  Clock,
  ArrowRight
} from 'lucide-react'

interface ProjectOverviewHeaderProps {
  basePath: string
  isSupervisor: boolean
  onNavigate: (path: string) => void
  onUpdateInfo: () => void
}

export const ProjectOverviewHeader: React.FC<ProjectOverviewHeaderProps> = ({
  basePath,
  isSupervisor,
  onNavigate,
  onUpdateInfo
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <button
            onClick={() => onNavigate(`${basePath}/dashboard`)}
            className="hover:text-brand-gold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Trang chá»§</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button
            onClick={() => onNavigate(`${basePath}/projects`)}
            className="hover:text-brand-gold cursor-pointer transition-colors"
          >
            Dá»± Ã¡n
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-brand-dark font-semibold">QL1A - Giai Ä‘oáº¡n 2</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-brand-gold font-bold">Tá»•ng quan &amp; NhÃ¢n sá»±</span>
        </nav>
      </div>

      {/* Main Header Card */}
      <div className="bg-white border border-brand-border rounded-xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-dark tracking-tight">
              Quá»‘c lá»™ 1A - Giai Ä‘oáº¡n 2
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
              PRJ-QL1A-02
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-gold/10 text-[#8F7212] border border-brand-gold/30 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse"></span>
              Äang trong thá»i háº¡n báº£o hÃ nh
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1 font-mono text-brand-dark font-semibold">
              <RouteIcon className="w-3.5 h-3.5 text-brand-gold" />
              <span>Km 1024+000 â†’ Km 1045+500</span>
            </div>
            <span className="text-slate-300">â€¢</span>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Khu vá»±c: Thá»«a ThiÃªn Huáº¿ â€“ TP. ÄÃ  Náºµng</span>
            </div>
            <span className="text-slate-300">â€¢</span>
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Chá»§ Ä‘áº§u tÆ°: Ban Quáº£n lÃ½ Dá»± Ã¡n ÄÆ°á»ng bá»™</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onUpdateInfo}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-50 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors border border-slate-200 shadow-xs cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Cáº­p nháº­t thÃ´ng tin</span>
          </button>
        </div>
      </div>

      {/* Workflow Handover Status Banner */}
      <div className="bg-white border border-brand-border rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-brand-dark">
                Äang chá» Supervisor duyá»‡t: 02 Äá» xuáº¥t phÆ°Æ¡ng Ã¡n ká»¹ thuáº­t sá»­a chá»¯a (WF-07)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wide border border-red-200">
                SLA Cáº¢NH BÃO
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              TrÃ¡ch nhiá»‡m hiá»‡n táº¡i:{' '}
              <strong className="font-semibold text-brand-dark">Supervisor Nguyá»…n VÄƒn An</strong>. Háº¡n cam káº¿t pháº£n há»“i:{' '}
              <span className="font-mono font-bold text-red-600">cÃ²n 14 giá»</span> trÆ°á»›c khi vi pháº¡m chuáº©n quy trÃ¬nh O&amp;M.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
          <button
            onClick={() => onNavigate(`${basePath}/proposals`)}
            type="button"
            className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-brand-gold hover:bg-[#B38E1F] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <span>{isSupervisor ? 'Má»Ÿ nhanh WF-07 Ä‘á»ƒ duyá»‡t' : 'Xem cÃ¡c Ä‘á» xuáº¥t Ä‘Ã£ trÃ¬nh (WF-07)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
