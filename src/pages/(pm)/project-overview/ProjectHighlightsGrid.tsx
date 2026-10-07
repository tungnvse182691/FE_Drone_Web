import React from 'react'
import { Calendar, Layers, CheckCircle2 } from 'lucide-react'

export const ProjectHighlightsGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Card 1: Thời hạn bảo hành */}
      <div className="bg-white border border-brand-border rounded-xl p-5 shadow-xs flex flex-col justify-between gap-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Thời hạn bảo hành hợp đồng
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-purple-700">Còn 342 ngày</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shadow-xs border border-purple-100">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Hết hạn: <strong className="text-brand-dark">31/08/2027</strong></span>
            <span className="font-mono font-semibold text-purple-700">38% đã qua</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: '38%' }}></div>
          </div>
          {/* Tiêu chuẩn kiểm định */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500 font-medium">Tiêu chuẩn kiểm định (v2.2):</span>
            <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              TCVN 8819:2011
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Tuyến & Phân đoạn */}
      <div className="bg-white border border-brand-border rounded-xl p-5 shadow-xs flex flex-col justify-between gap-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Khối lượng tuyến &amp; Phân đoạn
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-brand-gold">21.5 km</span>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                4 làn chính
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-gold/10 text-brand-gold flex items-center justify-center shadow-xs border border-brand-gold/20">
            <Layers className="w-5 h-5" />
          </div>
        </div>
        <div className="flex flex-col gap-1 text-xs text-slate-500">
          <div className="flex items-center justify-between">
            <span>5 Phân đoạn lý trình (Segments)</span>
            <span className="font-semibold text-brand-dark">860 tấm Slab bê tông</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="font-mono text-[11px] text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
              Mã tim tuyến WGS84: CT-GEO-884
            </span>
          </div>
        </div>
      </div>

      {/* Card 3: Thống kê khiếm khuyết */}
      <div className="bg-white border border-brand-border rounded-xl p-5 shadow-xs flex flex-col justify-between gap-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Thống kê khiếm khuyết mặt đường
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-brand-dark">46 / 58</span>
              <span className="text-xs font-semibold text-[#8F7212] bg-brand-gold/10 px-2 py-0.5 rounded-full border border-brand-gold/30">
                điểm đã nghiệm thu
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-brand-gold flex items-center justify-center shadow-xs border border-amber-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">
              Đang mở: <strong className="text-red-600">12 điểm</strong> (4 nặng, 8 TB)
            </span>
            <span className="font-mono font-bold text-[#8F7212]">79.3% SLA</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
            <div className="bg-brand-gold h-full" style={{ width: '79.3%' }} title="Đã hoàn thành"></div>
            <div className="bg-red-500 h-full" style={{ width: '20.7%' }} title="Đang mở"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
