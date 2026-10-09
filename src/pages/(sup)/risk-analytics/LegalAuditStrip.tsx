import React from 'react'

export const LegalAuditStrip: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
      <div className="flex items-start gap-3 flex-1">
        <span className="material-symbols-outlined text-[20px] text-[#8C6D1F] shrink-0 mt-0.5">
          verified_user
        </span>
        <div className="space-y-0.5">
          <span className="font-sansation text-sm text-slate-900 block font-bold">
            Tiêu chuẩn pháp lý & Toàn vẹn chứng từ số
          </span>
          <p className="text-slate-500 leading-relaxed text-[11px] lg:text-xs">
            Hồ sơ kỹ thuật xuất từ hệ thống RoadGuard tự động gắn mã băm SHA-256 Checksum cho từng tệp ảnh đối chứng và gói nén, đáp ứng đầy đủ tiêu chuẩn kiểm toán kỹ thuật công trình giao thông (TCVN 8819:2011 &amp; TCVN 8864).
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg self-start md:self-auto">
        <span className="material-symbols-outlined text-[18px] text-emerald-600 shrink-0">
          check_circle
        </span>
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 text-xs">Mã băm SHA-256: Hợp lệ</span>
          <span className="font-mono text-[10px] text-slate-500">Chuẩn đối soát bảo hành: v2.2</span>
        </div>
      </div>
    </div>
  )
}
