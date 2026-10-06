import React from 'react'
import {
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Layers,
  Ruler,
  HardDriveDownload,
  Split,
  AlertTriangle,
  Smartphone
} from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { SyncConflictItem, FieldTask } from '../../../types/domain'

export interface FieldTasksHeaderProps {
  isSupervisor: boolean
  isPM: boolean
  activeTab: 'CONFLICTS' | 'MEASUREMENTS'
  setActiveTab: (tab: 'CONFLICTS' | 'MEASUREMENTS') => void
  conflicts: SyncConflictItem[]
  fieldTasks: FieldTask[]
  stats: {
    total: number
    pending: number
    reassign: number
    policyMismatch: number
    rescuePending: number
  }
  handleResetData: () => void
}

export const FieldTasksHeader: React.FC<FieldTasksHeaderProps> = ({
  isSupervisor,
  isPM: _isPM,
  activeTab,
  setActiveTab,
  conflicts,
  fieldTasks,
  stats,
  handleResetData
}) => {
  return (
    <>
      {/* 1. BREADCRUMB & METADATA OVERLINE */}
      <nav aria-label="ÄÆ°á»ng dáº«n trang" className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <a href="#/pm/dashboard" className="hover:text-slate-800 transition-colors">
          Trang chá»§
        </a>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-600">Ngoáº¡i tuyáº¿n &amp; Äo Ä‘áº¡c</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-900">Xung Ä‘á»™t Ä‘á»“ng bá»™ &amp; Nhiá»‡m vá»¥ hiá»‡n trÆ°á»ng</span>
      </nav>

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-brand-border shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-sansation text-brand-dark tracking-tight">
              Trung TÃ¢m Xá»­ LÃ½ Xung Äá»™t &amp; Äo Äáº¡c Bá»• Sung
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-purple-100 text-purple-800 border border-purple-300">
              WF-15 / FR-22 COMPLIANT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dá»± Ã¡n: <strong className="text-slate-800">QL1A - Giai Ä‘oáº¡n 2 (PRJ-QL1A-02 â€¢ Km 1024 - Km 1045)</strong>. Tiáº¿p
            nháº­n, Ä‘á»‘i soÃ¡t dá»¯ liá»‡u Ä‘o Ä‘áº¡c &amp; thi cÃ´ng gá»­i muá»™n tá»« hiá»‡n trÆ°á»ng theo quy táº¯c{' '}
            <strong className="text-slate-700">D05/Q04</strong> vÃ  cá»©u dá»¯ liá»‡u thiáº¿t bá»‹ há»ng{' '}
            <strong className="text-slate-700">Q17/D06/42A</strong>.
          </p>
        </div>

        {/* Action & Role Pill */}
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
              isSupervisor
                ? 'bg-purple-50 text-purple-800 border-purple-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {isSupervisor
                ? 'Cháº¿ Ä‘á»™ GiÃ¡m SÃ¡t (Kiá»ƒm tra & PhÃª duyá»‡t cá»©u há»™ thiáº¿t bá»‹)'
                : 'Cháº¿ Ä‘á»™ Chá»‰ Huy TrÆ°á»Ÿng PM (Tháº©m quyá»n phÃ¢n giáº£i nghiá»‡p vá»¥)'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleResetData}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="KhÃ´i phá»¥c dá»¯ liá»‡u ban Ä‘áº§u Ä‘á»ƒ test láº¡i"
          >
            <RefreshCw className="w-3.5 h-3.5 text-brand-gold" />
            <span>Reset Data Test</span>
          </button>
        </div>
      </div>

      {/* TABS SWITCHER */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('CONFLICTS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer font-sansation ${
            activeTab === 'CONFLICTS'
              ? 'border-brand-gold text-brand-gold bg-[#FBF6E9]/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>HÃ ng Äá»£i Xá»­ LÃ½ Xung Äá»™t Ngoáº¡i Tuyáº¿n ({stats.pending} ca chá»)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('MEASUREMENTS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer font-sansation ${
            activeTab === 'MEASUREMENTS'
              ? 'border-brand-gold text-brand-gold bg-[#FBF6E9]/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Ruler className="w-4 h-4" />
          <span>Nháº­t KÃ½ Nhiá»‡m Vá»¥ Äo Äáº¡c Hiá»‡n TrÆ°á»ng ({fieldTasks.length} nhiá»‡m vá»¥)</span>
        </button>
      </div>

      {/* KPI & BANNER SECTION (ONLY IN CONFLICTS TAB) */}
      {activeTab === 'CONFLICTS' && (
        <div className="space-y-4">
          {/* BANNER GIÃM SÃT TIáº¾N TRÃŒNH OFFLINE BATCH SYNC */}
          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-gold"></div>
            <div className="flex items-start md:items-center gap-3 pl-2">
              <div className="w-10 h-10 rounded-xl bg-[#FBF6E9] text-brand-gold flex items-center justify-center shrink-0 shadow-2xs">
                <HardDriveDownload className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    HTTP 200 IDEMPOTENT SYNC
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900">
                    HÃ€NG Äá»¢I Äá»’NG Bá»˜: {conflicts.length} GÃ“I Dá»® LIá»†U NGOáº I TUYáº¾N (QL1A PK-04)
                  </span>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                    {conflicts.length - stats.pending} ÄÃ£ PhÃ¢n Giáº£i / ACK
                  </span>
                  <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-semibold border border-amber-200 animate-pulse">
                    {stats.pending} Xung Ä‘á»™t chá» xá»­ lÃ½
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  CÃ¡c gÃ³i nhiá»‡m vá»¥ thi cÃ´ng ngoáº¡i tuyáº¿n tá»± Ä‘á»™ng kiá»ƒm tra xung Ä‘á»™t phiÃªn báº£n mÃ¡y chá»§ khi báº¯t Ä‘Æ°á»£c sÃ³ng 4G/Wifi.
                  ToÃ n bá»™ dá»¯ liá»‡u Ä‘Æ°á»£c báº£o vá»‡ toÃ n váº¹n báº±ng mÃ£ bÄƒm SHA-256 theo tiÃªu chuáº©n{' '}
                  <strong className="text-slate-700">TCVN 8819:2011</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 pl-2 lg:pl-0">
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">TiÃªu chuáº©n kiá»ƒm toÃ¡n:</span>
                <span className="font-mono text-xs font-bold text-slate-800">BR-15 â€¢ BR-19 â€¢ D05</span>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Äá»™ tin cáº­y vá»‹ trÃ­ GPS:</span>
                <span className="font-mono text-xs font-bold text-emerald-700">RTK Sub-meter (&lt;1.5m)</span>
              </div>
            </div>
          </div>

          {/* 4 THáºº CHá»ˆ Sá» KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-white border border-brand-border relative overflow-hidden group hover:border-brand-gold transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Tá»•ng ca xung Ä‘á»™t
                  </span>
                  <h3 className="text-xl font-bold font-sansation text-slate-900 mt-1">HÃ ng Ä‘á»£i Conflict</h3>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#FBF6E9] text-brand-gold flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-sansation text-brand-gold">{stats.total}</span>
                <span className="text-xs text-slate-500">há»“ sÆ¡ ghi nháº­n</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Äang chá» phÃ¢n giáº£i:</span>
                <span className="font-bold text-amber-600 font-mono">{stats.pending} ca</span>
              </div>
            </Card>

            <Card className="p-4 bg-white border border-brand-border relative overflow-hidden group hover:border-brand-gold transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Äá»•i Ä‘á»™i khi ngoáº¡i tuyáº¿n
                  </span>
                  <h3 className="text-xl font-bold font-sansation text-slate-900 mt-1">Reassigned (D05)</h3>
                </div>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Split className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-sansation text-slate-900">{stats.reassign}</span>
                <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                  Q04 Rule
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>NguyÃªn táº¯c:</span>
                <span className="font-medium text-slate-700">KhÃ´ng ghi Ä‘Ã¨ dá»¯ liá»‡u cÅ©</span>
              </div>
            </Card>

            <Card className="p-4 bg-white border border-brand-border relative overflow-hidden group hover:border-brand-gold transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Lá»‡ch chÃ­nh sÃ¡ch Fast Track
                  </span>
                  <h3 className="text-xl font-bold font-sansation text-slate-900 mt-1">Policy Mismatch</h3>
                </div>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-sansation text-slate-900">{stats.policyMismatch}</span>
                <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
                  Snapshot Stale
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Xá»­ lÃ½:</span>
                <span className="font-medium text-slate-700">Chuyá»ƒn tháº©m duyá»‡t cÃ³ GiÃ¡m sÃ¡t</span>
              </div>
            </Card>

            <Card className="p-4 bg-white border border-brand-border relative overflow-hidden group hover:border-brand-gold transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Cá»©u dá»¯ liá»‡u thiáº¿t bá»‹ há»ng
                  </span>
                  <h3 className="text-xl font-bold font-sansation text-slate-900 mt-1">Rescue Data (Q17)</h3>
                </div>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-sansation text-purple-700">{stats.rescuePending}</span>
                <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-full">
                  Cáº§n Sup KÃ½
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Tháº©m quyá»n:</span>
                <span className="font-bold text-purple-800">D06 / Quyáº¿t Ä‘á»‹nh 42A</span>
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  )
}
