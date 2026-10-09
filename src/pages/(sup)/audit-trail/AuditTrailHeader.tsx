import React from 'react'

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
    <div className="space-y-4">
      {/* 1. BREADCRUMB & METADATA PHẠM VI */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <nav className="flex items-center gap-1.5 text-slate-500 font-medium">
          <span>Báo cáo &amp; Hồ sơ</span>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Nhật ký hoạt động</span>
        </nav>

        <div className="flex items-center gap-2">
          {isSupervisor ? (
            <div className="flex items-center gap-1 text-slate-700 font-medium">
              <span className="material-symbols-outlined text-[16px] text-brand-gold">verified_user</span>
              <span>Giám sát (Toàn hệ thống)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-slate-700 font-medium">
              <span className="material-symbols-outlined text-[16px] text-blue-600">lock</span>
              <span>Chỉ huy trưởng (Phạm vi dự án phụ trách)</span>
            </div>
          )}
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 text-slate-500">
            <span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
            <span>Thời hạn lưu trữ (Hết bảo hành + 5 năm)</span>
          </div>
        </div>
      </div>

      {/* 2. HEADER BANNER & BỘ ĐIỀU KHIỂN DỰ ÁN */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div className="space-y-1 max-w-3xl">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Nhật Ký Hoạt Động &amp; Truy Vết Hệ Thống
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Dòng sự kiện bất biến ghi nhận mọi thao tác kỹ thuật, trình duyệt hồ sơ đợt sửa chữa và nghiệm thu hiện trường theo thời gian thực.
          </p>
        </div>

        {/* Thanh chọn Dự án & Thao tác */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Chọn dự án */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
            <span className="material-symbols-outlined text-[18px] text-slate-400">folder_open</span>
            <span className="text-slate-500 font-medium hidden sm:inline">Dự án:</span>
            <select
              value={selectedProject}
              onChange={(e) => onSelectProject(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none text-xs cursor-pointer"
            >
              <option value="all">Tất cả dự án phụ trách</option>
              <option value="proj-01">QL1A - Giai đoạn 2 (Km 1020 - Km 1045)</option>
              <option value="proj-02">Cao tốc Bắc - Nam XL-03 (Km 14 - Km 22)</option>
            </select>
          </div>

          {/* Nút Làm mới */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
            title="Tải mới dữ liệu sự kiện"
          >
            <span className={`material-symbols-outlined text-[16px] text-slate-500 ${isRefreshing ? 'animate-spin text-brand-gold' : ''}`}>
              refresh
            </span>
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          {/* Nút Xuất nhật ký (1 CTA duy nhất màu vàng đồng) */}
          <button
            type="button"
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-gold hover:bg-brand-goldDark text-white font-semibold text-xs transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Xuất nhật ký</span>
          </button>
        </div>
      </div>
    </div>
  )
}
