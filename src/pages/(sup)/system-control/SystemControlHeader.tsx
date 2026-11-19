import React from 'react'

interface SystemControlHeaderProps {
  isSupervisor: boolean
}

export const SystemControlHeader: React.FC<SystemControlHeaderProps> = ({
  isSupervisor
}) => {
  return (
    <div className="flex flex-col gap-3 bg-white border-[1.5px] border-[#E2E5E9] p-5 rounded-[20px] shadow-2xs relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-600 via-[#C9A227] to-slate-200" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="hover:text-slate-800 transition-colors cursor-pointer">
            Trang chủ
          </span>
          <span className="text-slate-300">/</span>
          <span className="hover:text-slate-800 transition-colors cursor-pointer">
            Báo cáo &amp; Hồ sơ
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-semibold">Lưu trữ hồ sơ bảo hành</span>
        </nav>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
            <span className="material-symbols-outlined text-[15px] text-[#C9A227]">
              {isSupervisor ? 'admin_panel_settings' : 'engineering'}
            </span>
            <span>
              {isSupervisor
                ? 'Giám sát: Phong tỏa pháp lý & cơ sở lưu trữ'
                : 'Chỉ huy trưởng: Theo dõi lưu trữ dự án phụ trách'}
            </span>
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div className="space-y-1 max-w-4xl">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {isSupervisor
              ? 'Quản Trị Lưu Trữ Hồ Sơ & Phong Tỏa Pháp Lý'
              : 'Lưu Trữ Bảo Hành & Phong Tỏa Pháp Lý'}
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isSupervisor
              ? 'Giám sát thời hạn lưu trữ hồ sơ công trình, kiểm soát mô hình AI và kích hoạt chế độ phong tỏa hồ sơ phục vụ thanh tra theo quy chuẩn BR-45.'
              : 'Theo dõi tình trạng lưu trữ chứng cứ kỹ thuật công trình (hết bảo hành + 5 năm) và lập đề xuất giải phóng dữ liệu khi đủ điều kiện.'}
          </p>
        </div>

      </div>
    </div>
  )
}
