import React from 'react'
import {
  ShieldCheck,
  Lock,
  Download,
  Building2,
  RefreshCw,
  Info
} from 'lucide-react'

interface AuditTrailHeaderProps {
  isSupervisor: boolean
  isPM: boolean
  selectedProject: string
  onSelectProject: (projectId: string) => void
  isRefreshing: boolean
  onRefresh: () => void
  onOpenExportModal: () => void
}

export const AuditTrailHeader: React.FC<AuditTrailHeaderProps> = ({
  isSupervisor,
  isPM,
  selectedProject,
  onSelectProject,
  isRefreshing,
  onRefresh,
  onOpenExportModal
}) => {
  return (
    <>
      {/* 1. TOP BREADCRUMB & ROLE SCOPE RIBBON */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1 hover:text-brand-dark transition-colors">
            Trang chủ
          </span>
          <span>/</span>
          <span className="hover:text-brand-dark transition-colors">Báo cáo &amp; Giám sát</span>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Lịch sử hoạt động (RPT-10)</span>
        </nav>

        {/* Role Scope Badges (v2.2 US-29-AC-02 & BR-45) */}
        <div className="flex items-center gap-2.5">
          {/* Phân định vai trò hiển thị rõ ràng */}
          {isSupervisor ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
              <span>GIÁM SÁT / CHỦ ĐẦU TƯ (THEO DÕI TOÀN HỆ THỐNG)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-700 text-white text-xs font-semibold shadow-xs">
              <Lock className="w-3.5 h-3.5" />
              <span>PROJECT MANAGER (CHỈ XEM DỰ ÁN PHỤ TRÁCH - US-29-AC-02)</span>
            </div>
          )}

          {/* Lưu trữ bảo hành BR-45 */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium shadow-xs">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>LƯU TRỮ BR-45 (HẾT BẢO HÀNH +5 NĂM)</span>
          </div>
        </div>
      </div>

      {/* 2. HEADER SECTION & PROJECT SCOPE SELECTOR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col gap-1.5 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-brand-goldDark font-mono text-xs font-semibold border border-amber-200">
              Mã báo cáo: RPT-10
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-medium border border-slate-200">
              Căn cứ: FR-34, US-29, BR-45
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono text-xs font-medium border border-emerald-200">
              Chế độ: CHỈ ĐỌC (READ-ONLY)
            </span>
            {isPM && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-semibold border border-blue-200 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Khóa phạm vi: QL1A - Giai đoạn 2
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            Lịch sử hoạt động &amp; Nhật ký kiểm toán dự án (RPT-10)
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Hộp đen ghi nhận mọi sự kiện nghiệp vụ thành công theo thời gian thực (Durable Events), lưu trữ lịch sử tác nghiệp bất biến phục vụ công tác đối chiếu, kiểm tra và bảo hành hạ tầng đường bộ (BR-45, US-29).
          </p>

          {/* Cảnh báo phạm vi quyền hạn cho PM theo US-29-AC-02 & UAT-08 */}
          {isPM && (
            <div className="mt-1 flex items-center gap-2 text-xs text-blue-800 bg-blue-50/80 px-3 py-1.5 rounded-lg border border-blue-200">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Tuân thủ US-29-AC-02:</strong> Chỉ huy trưởng (PM) chỉ có thẩm quyền theo dõi dòng sự kiện trong phạm vi dự án được phân công (QL1A - Giai đoạn 2). Dữ liệu của các tuyến khác không thuộc quyền quản lý bị tự động ẩn.
              </span>
            </div>
          )}
        </div>

        {/* Action Group & Project Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {/* Thanh chọn Dự án - Khóa cứng nếu là PM, mở chọn nếu là Supervisor */}
          <div className="flex flex-col gap-1 min-w-[250px]">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Phạm vi Tuyến / Dự án</span>
              {isPM ? (
                <span className="text-blue-700 flex items-center gap-0.5 font-normal">
                  <Lock className="w-3 h-3" /> Bị khóa cứng
                </span>
              ) : (
                <span className="text-emerald-700 font-normal">Toàn quyền giám sát</span>
              )}
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                disabled={isPM}
                value={selectedProject}
                onChange={(e) => onSelectProject(e.target.value)}
                className={`w-full h-10 pl-9 pr-8 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-gold border transition-all ${
                  isPM
                    ? 'bg-slate-100 text-slate-700 border-slate-300 cursor-not-allowed opacity-90'
                    : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 cursor-pointer shadow-xs'
                }`}
              >
                {isSupervisor && (
                  <option value="all">🌐 Tất cả dự án (Toàn hệ thống)</option>
                )}
                <option value="proj-01">📍 QL1A - Giai đoạn 2 (Km 1024 - 1045)</option>
                {isSupervisor && (
                  <>
                    <option value="proj-02">📍 QL1A - Giai đoạn 1 (Km 990 - 1024)</option>
                    <option value="proj-03">📍 Cao tốc Bắc - Nam (Km 45 - Km 80)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 sm:pt-0">
            {/* Nút Làm mới dữ liệu (Refresh theo v2.2 Điều 11.1) */}
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs transition-colors border border-slate-200 shadow-xs"
              title="Tải mới dữ liệu (Cập nhật sau 60 giây theo v2.2)"
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 ${isRefreshing ? 'animate-spin text-brand-gold' : ''}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            {/* Nút xuất báo cáo RPT-10 (CTA màu vàng đồng Hoàng Hải - Brand Color) */}
            <button
              type="button"
              onClick={onOpenExportModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-gold text-white font-semibold text-xs hover:bg-brand-goldDark transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Xuất nhật ký (PDF/CSV)</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
