import React from 'react'
import { ShieldCheck } from 'lucide-react'

export const LegalAuditStrip: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 lg:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
      <div className="flex items-start gap-3 flex-1">
        <ShieldCheck className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-sansation text-sm text-slate-900 block font-bold">
            Tiêu chuẩn pháp lý & Toàn vẹn chứng từ số (RPT-07)
          </span>
          <p className="text-slate-500 leading-relaxed text-[11px] lg:text-xs">
            Hồ sơ kỹ thuật xuất từ hệ thống RoadGuard (Nhà thầu Hoàng Hải) tự động đính kèm mã băm SHA-256 Checksum cho từng tệp ảnh và gói nén, đáp ứng đầy đủ tiêu chuẩn nghiệm thu và kiểm toán kỹ thuật công trình giao thông (TCVN 8819 &amp; TCVN 8864).
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl self-start md:self-auto">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <div className="flex flex-col">
          <span className="font-sansation font-bold text-slate-900 text-xs">Mã băm SHA-256: Toàn vẹn</span>
          <span className="font-mono text-[10px] text-slate-500 font-semibold">Chuẩn đối soát bảo hành: v2.2</span>
        </div>
      </div>
    </div>
  )
}
