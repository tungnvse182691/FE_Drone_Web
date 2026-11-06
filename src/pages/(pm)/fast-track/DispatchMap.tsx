import React from 'react'
import { Icon } from '../../../components/ui/Icon'

/** Layout retained without the old route coordinates or map fallback. */
export const DispatchMap: React.FC = () => <section className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 min-w-0">
  <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-xs font-bold text-[#1A1D20] flex items-center gap-2"><Icon name="location_on" size={18} className="text-[#C9A227]" />Bản đồ hiện trường &amp; Lộ trình tuyến</h3><div className="inline-flex rounded-lg bg-white p-0.5 border border-slate-200 text-[11px] shadow-2xs"><button type="button" disabled className="px-2 py-1 text-slate-400">Vệ tinh</button><button type="button" disabled className="px-2 py-1 text-slate-400">Bản đồ tuyến</button></div></div>
  <div className="relative w-full h-72 rounded-xl border border-slate-200 bg-slate-100 flex flex-col items-center justify-center gap-3 text-slate-400"><Icon name="map" size={36} /><p className="text-sm">Chưa cập nhật</p><p className="text-xs text-center px-4">Chưa có dữ liệu vị trí đã xác minh để hiển thị trên bản đồ.</p></div>
</section>
