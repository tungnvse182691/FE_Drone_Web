import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { HubProject } from './types'

interface ProjectGridViewProps {
  filteredProjects: HubProject[]
  isSupervisor: boolean
  onOpenCreateModal: () => void
  onNavigateAlignment: (projectId: string) => void
  onNavigateDetail: (projectId: string) => void
  onOpenCloseModal?: (prj: HubProject) => void
}

export const ProjectGridView: React.FC<ProjectGridViewProps> = ({
  filteredProjects,
  isSupervisor,
  onOpenCreateModal,
  onNavigateAlignment,
  onNavigateDetail,
  onOpenCloseModal
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 font-body">
      {filteredProjects.map((prj) => {
        // Kiểm tra trạng thái 403 Restricted khi xem ở góc nhìn PM
        const isRestrictedForCurrentPM = !isSupervisor && prj.is_restricted_for_pm

        return (
          <div
            key={prj.id}
            className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden group relative"
          >
            {/* IDOR 403 Restricted Overlay khi ở vai trò PM xem dự án ngoài thẩm quyền */}
            {isRestrictedForCurrentPM && (
              <div className="absolute inset-0 z-30 bg-slate-900/80 backdrop-blur-[2px] p-5 flex flex-col items-center justify-center text-center gap-3 select-none">
                <div className="w-11 h-11 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Icon name="lock" size={24} />
                </div>
                <div className="flex flex-col gap-1 max-w-xs">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="font-mono px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px]">
                      403 RESTRICTED
                    </span>
                    <span className="text-xs text-rose-300 font-semibold">Chính sách Scope &amp; IDOR</span>
                  </div>
                  <span className="text-sm text-white font-bold mt-1">Dự án ngoài phạm vi phụ trách</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Bạn hiện chỉ được cấp quyền quản lý các tuyến được Supervisor chỉ định (BR-02).
                  </p>
                </div>
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
                <span className="font-mono px-2 py-0.5 bg-white/95 rounded-md text-[11px] text-slate-900 font-bold shadow-2xs">
                  {prj.code}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-black/40 text-white font-medium">
                  {prj.region}
                </span>
              </div>

              <div className="absolute top-3 right-3">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-2xs flex items-center gap-1 ${
                    prj.status === 'CLOSED'
                      ? 'bg-slate-200 text-slate-800'
                      : prj.status === 'NEAR_EXPIRY'
                      ? 'bg-[#FEE2E2] text-rose-700 font-bold'
                      : prj.status === 'PENDING_ALIGNMENT'
                      ? 'bg-[#FEF3C7] text-[#D97706]'
                      : 'bg-[#EDF7ED] text-[#1B5E20]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      prj.status === 'CLOSED'
                        ? 'bg-slate-600'
                        : prj.status === 'NEAR_EXPIRY'
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
                  <Icon name="alt_route" size={14} className="text-brand-gold" />
                  <span>{prj.stationing_text}</span>
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

                {/* PM Info Block (BR-01) */}
                {prj.is_assigned ? (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {prj.pm_avatar ? (
                        <img
                          alt={prj.pm_name}
                          className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                          src={prj.pm_avatar}
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
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
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#FFFBEB] border border-amber-200/60">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon name="warning" size={16} className="text-[#D97706] shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-[#92400E] font-bold">Chưa phân công PM</span>
                        <span className="text-[10px] text-[#B45309] truncate">Cần PM trước khi kích hoạt tuyến (BR-01)</span>
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
                          <Icon name="warning" size={14} /> Cần lập hồ sơ bàn giao
                        </span>
                      ) : (
                        'Thời hạn bảo hành'
                      )}
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        prj.status === 'NEAR_EXPIRY' ? 'text-rose-600' : 'text-slate-800'
                      }`}
                    >
                      {prj.warranty_passed_percent}%{' '}
                      <span className="font-normal text-slate-500 text-[11px]">(Còn {prj.days_remaining} ngày)</span>
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
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Chiều dài</span>
                    <span className="font-mono text-xs font-bold text-slate-800">{prj.length_km} km</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Lỗi mở</span>
                    <span
                      className={`font-mono text-xs font-bold ${
                        prj.open_defects > 0 ? 'text-rose-600' : 'text-slate-600'
                      }`}
                    >
                      {prj.open_defects} điểm
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Gói sửa</span>
                    <span className="font-mono text-xs font-bold text-slate-800">{prj.repair_packages} gói</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="pt-2 border-t border-slate-100">
                {prj.status === 'CLOSED' ? (
                  <button
                    type="button"
                    onClick={() => onNavigateDetail(prj.id)}
                    className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-98"
                  >
                    <Icon name="inventory_2" size={16} />
                    <span>Tra cứu hồ sơ lưu trữ (BC10)</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    {prj.status === 'PENDING_ALIGNMENT' ? (
                      <button
                        type="button"
                        onClick={() => onNavigateAlignment(prj.id)}
                        className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Icon name="alt_route" size={16} className="text-brand-gold" />
                        <span>Xem thiết lập tuyến</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onNavigateDetail(prj.id)}
                        className="flex-1 py-2 px-3 bg-brand-gold hover:bg-brand-goldMuted text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-98"
                      >
                        <span>Vào quản lý dự án</span>
                        <Icon name="arrow_forward" size={16} />
                      </button>
                    )}

                    {isSupervisor && onOpenCloseModal && (
                      <button
                        type="button"
                        title="Đóng dự án khi hết hạn bảo hành (DA12)"
                        onClick={(e) => {
                          e.stopPropagation()
                          onOpenCloseModal(prj)
                        }}
                        className="p-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-lg text-xs font-semibold transition border border-slate-200 hover:border-rose-200 cursor-pointer shrink-0"
                      >
                        <Icon name="lock" size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* CARD CALLOUT QUICK ADD (DÀNH CHO SUPERVISOR) */}
      {isSupervisor && (
        <div
          onClick={onOpenCreateModal}
          className="bg-slate-50/60 border border-dashed border-brand-gold/60 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3.5 hover:bg-slate-100/70 hover:border-brand-gold transition cursor-pointer min-h-[340px] group shadow-2xs"
        >
          <div className="w-12 h-12 rounded-xl bg-white text-brand-gold shadow-2xs flex items-center justify-center transition-transform group-hover:scale-105 border border-slate-200">
            <Icon name="domain_add" size={26} />
          </div>
          <div className="flex flex-col gap-1 max-w-xs">
            <h4 className="text-sm font-bold text-slate-900 font-headline">Tạo hồ sơ dự án mới</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-body">
              Khởi tạo hồ sơ quản lý bảo hành công trình &amp; chỉ định 1 PM chính (BR-01, FR-04).
            </p>
          </div>
          <button
            type="button"
            className="px-3.5 py-1.5 bg-brand-gold hover:bg-brand-goldMuted text-white rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer mt-1"
          >
            <Icon name="add" size={16} />
            <span>Mở form khởi tạo</span>
          </button>
        </div>
      )}
    </div>
  )
}
