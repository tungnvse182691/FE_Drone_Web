import React from 'react'
import {
  Route,
  ArrowRight,
  Lock,
  Shield,
  AlertCircle,
  Building2,
  PlusCircle
} from 'lucide-react'
import { HubProject } from './types'

interface ProjectGridViewProps {
  filteredProjects: HubProject[]
  isSupervisor: boolean
  onOpenCreateModal: () => void
  onNavigateAlignment: (projectId: string) => void
  onNavigateDetail: (projectId: string) => void
}

export const ProjectGridView: React.FC<ProjectGridViewProps> = ({
  filteredProjects,
  isSupervisor,
  onOpenCreateModal,
  onNavigateAlignment,
  onNavigateDetail
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {filteredProjects.map((prj) => {
        // Kiá»ƒm tra tráº¡ng thÃ¡i 403 Restricted khi xem á»Ÿ gÃ³c nhÃ¬n PM
        const isRestrictedForCurrentPM = !isSupervisor && prj.is_restricted_for_pm

        return (
          <div
            key={prj.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden group relative"
          >
            {/* IDOR 403 Restricted Overlay khi á»Ÿ vai trÃ² PM xem dá»± Ã¡n ngoÃ i tháº©m quyá»n */}
            {isRestrictedForCurrentPM && (
              <div className="absolute inset-0 z-30 bg-slate-900/80 backdrop-blur-[2px] p-5 flex flex-col items-center justify-center text-center gap-3 select-none">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shadow-inner">
                  <Lock className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="flex flex-col gap-1 max-w-xs">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="font-mono px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px]">
                      403 RESTRICTED
                    </span>
                    <span className="text-xs text-rose-300 font-semibold">ChÃ­nh sÃ¡ch Scope &amp; IDOR</span>
                  </div>
                  <span className="text-sm text-white font-bold mt-1">Dá»± Ã¡n ngoÃ i pháº¡m vi phá»¥ trÃ¡ch</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Báº¡n hiá»‡n chá»‰ Ä‘Æ°á»£c cáº¥p quyá»n táº¡i <strong className="text-white">QL1A - Huáº¿</strong>. Má»i thao tÃ¡c truy cáº­p trÃ¡i tháº©m quyá»n Ä‘á»u Ä‘Æ°á»£c ghi láº¡i trong chuá»—i kiá»ƒm toÃ¡n báº£o máº­t.
                  </p>
                </div>
                <button
                  type="button"
                  disabled
                  className="px-3 py-1.5 bg-white/10 text-slate-300 rounded-lg text-xs cursor-not-allowed border border-white/10 flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>YÃªu cáº§u quyá»n truy cáº­p tá»« Supervisor</span>
                </button>
              </div>
            )}

            {/* Card Banner / Spatial Reference */}
            <div className="h-32 relative bg-slate-100 overflow-hidden">
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url('${prj.image_url}')` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>

              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="font-mono px-2.5 py-0.5 bg-white/95 backdrop-blur-md rounded-full text-[11px] text-slate-900 font-bold shadow-2xs">
                  {prj.code}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white font-medium">
                  {prj.region}
                </span>
              </div>

              <div className="absolute top-3 right-3">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-2xs flex items-center gap-1 ${
                    prj.status === 'NEAR_EXPIRY'
                      ? 'bg-[#FEE2E2] text-rose-700 font-bold'
                      : prj.status === 'PENDING_ALIGNMENT'
                      ? 'bg-[#FEF3C7] text-[#D97706]'
                      : 'bg-[#EDF7ED] text-[#1B5E20]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      prj.status === 'NEAR_EXPIRY'
                        ? 'bg-rose-600 animate-ping'
                        : prj.status === 'PENDING_ALIGNMENT'
                        ? 'bg-[#D97706]'
                        : 'bg-[#1B5E20]'
                    }`}
                  ></span>
                  {prj.status_label}
                </span>
              </div>

              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white/95">
                <span className="font-mono text-xs flex items-center gap-1">
                  <Route className="w-3.5 h-3.5 text-brand-gold" />
                  {prj.stationing_text}
                </span>
                <span className="text-[11px] opacity-85">{prj.location_detail}</span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 flex flex-col flex-1 justify-between gap-3.5">
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-gold transition-colors leading-snug font-headline">
                  {prj.name}
                </h3>

                {/* PM Info Block */}
                {prj.is_assigned ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {prj.pm_avatar ? (
                        <img
                          alt={prj.pm_name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                          src={prj.pm_avatar}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {prj.pm_name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-slate-800 truncate font-semibold">{prj.pm_name}</span>
                        <span className="text-[10px] text-slate-500 truncate font-mono">{prj.pm_email}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-brand-gold/15 text-brand-goldMuted text-[10px] font-bold shrink-0">
                      {prj.pm_role_badge}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#FFFBEB] border border-amber-200/60">
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-[#92400E] font-bold">ChÆ°a phÃ¢n cÃ´ng PM</span>
                        <span className="text-[10px] text-[#B45309] truncate">Cáº§n PM trÆ°á»›c khi kÃ­ch hoáº¡t tuyáº¿n</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Warranty Progress Metric */}
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      {prj.status === 'NEAR_EXPIRY' ? (
                        <span className="text-rose-600 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Cáº§n láº­p há»“ sÆ¡ quyáº¿t toÃ¡n
                        </span>
                      ) : (
                        'Thá»i háº¡n báº£o hÃ nh'
                      )}
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        prj.status === 'NEAR_EXPIRY' ? 'text-rose-600' : 'text-slate-800'
                      }`}
                    >
                      {prj.warranty_passed_percent}%{' '}
                      <span className="font-normal text-slate-500 text-[11px]">(CÃ²n {prj.days_remaining} ngÃ y)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        prj.status === 'NEAR_EXPIRY'
                          ? 'bg-rose-500'
                          : prj.status === 'PENDING_ALIGNMENT'
                          ? 'bg-slate-300'
                          : 'bg-brand-gold'
                      }`}
                      style={{ width: `${prj.warranty_passed_percent}%` }}
                    ></div>
                  </div>
                </div>

                {/* 3-Col Mini Technical Spec Grid */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Chiá»u dÃ i</span>
                    <span className="font-mono text-xs font-bold text-slate-800">{prj.length_km} km</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Lá»—i má»Ÿ</span>
                    <span
                      className={`font-mono text-xs font-bold ${
                        prj.open_defects > 0 ? 'text-rose-600' : 'text-slate-600'
                      }`}
                    >
                      {prj.open_defects} Ä‘iá»ƒm
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">GÃ³i sá»­a</span>
                    <span className="font-mono text-xs font-bold text-slate-800">{prj.repair_packages} gÃ³i</span>
                  </div>
                </div>

                {/* Retention Value (v2.2 DA04) */}
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-purple-50/70 border border-purple-100 text-[11px]">
                  <span className="text-slate-500 font-medium">Báº£o lÃ£nh giá»¯ láº¡i:</span>
                  <span className="font-mono font-bold text-purple-700">{prj.retention_amount || '15.5 tá»· â‚« (5% HÄ)'}</span>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="pt-2 border-t border-slate-100">
                {prj.status === 'PENDING_ALIGNMENT' ? (
                  <button
                    type="button"
                    onClick={() => onNavigateAlignment(prj.id)}
                    className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Route className="w-3.5 h-3.5 text-brand-gold" />
                    <span>Xem thiáº¿t láº­p tuyáº¿n (WF-02)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onNavigateDetail(prj.id)}
                    className="w-full py-2.5 px-3 bg-brand-gold hover:bg-brand-goldMuted text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-98"
                  >
                    <span>VÃ o quáº£n lÃ½ dá»± Ã¡n</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* CARD CALLOUT QUICK ADD (DÃ€NH CHO SUPERVISOR) */}
      {isSupervisor && (
        <div
          onClick={onOpenCreateModal}
          className="bg-slate-50/60 border-2 border-dashed border-brand-gold/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3.5 hover:bg-slate-100/70 hover:border-brand-gold transition cursor-pointer min-h-[360px] group shadow-2xs"
        >
          <div className="w-14 h-14 rounded-2xl bg-white text-brand-gold shadow-sm flex items-center justify-center transition-transform group-hover:scale-110">
            <Building2 className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="flex flex-col gap-1 max-w-xs">
            <h4 className="text-base font-bold text-slate-900 font-headline">Táº¡o há»“ sÆ¡ dá»± Ã¡n má»›i</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Báº¯t Ä‘áº§u chu trÃ¬nh bÃ n giao tá»« ban quáº£n lÃ½ dá»± Ã¡n BOT/VEC sang bá»™ pháº­n báº£o hÃ nh háº¡ táº§ng.
            </p>
          </div>
          <button
            type="button"
            className="px-4 py-2 bg-brand-gold hover:bg-brand-goldMuted text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer mt-1"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Má»Ÿ form khá»Ÿi táº¡o</span>
          </button>
        </div>
      )}
    </div>
  )
}
