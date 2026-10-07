import React from 'react'
import { Grid } from 'lucide-react'
import { SlabItem } from './types'

export interface SidebarSlabsTabProps {
  slabLengthM: number
  onSetSlabLengthM: (val: number) => void
  slabThicknessCm: number
  onSetSlabThicknessCm: (val: number) => void
  syncJointWithSlab: boolean
  onSetSyncJointWithSlab: (val: boolean) => void
  contractionSpacingM: number
  onSetContractionSpacingM: (val: number) => void
  expansionSpacingM: number
  onSetExpansionSpacingM: (val: number) => void
  expansionGapMm: number
  onSetExpansionGapMm: (val: number) => void
  slabs: SlabItem[]
  showToast: (msg: string) => void
}

export const SidebarSlabsTab: React.FC<SidebarSlabsTabProps> = ({
  slabLengthM,
  onSetSlabLengthM,
  slabThicknessCm,
  onSetSlabThicknessCm,
  syncJointWithSlab,
  contractionSpacingM,
  onSetContractionSpacingM,
  expansionSpacingM,
  onSetExpansionSpacingM,
  expansionGapMm,
  onSetExpansionGapMm,
  slabs,
  showToast
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
            <Grid className="w-3.5 h-3.5 text-brand-gold" />
            <span>Cấu Hình Tấm & Khe Nối BTXM</span>
          </span>
          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
            PM Tự chỉnh sửa
          </span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Chỉ huy trưởng (PM) có thể tùy chỉnh kích thước từng tấm bê tông, cự ly cưa cắt khe co giãn và khe giãn nở nhiệt theo hồ sơ thiết kế thi công. Bản đồ và bảng thông số sẽ tự động cập nhật ngay lập tức.
        </p>

        {/* THIẾT LẬP KÍCH THƯỚC TẤM BÊ TÔNG */}
        <div className="bg-white p-2.5 rounded-lg border border-amber-200/80 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
              <span>🧱 Kích thước tấm BTXM (Dài × Dày):</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-[#8F7212] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {slabLengthM.toFixed(1)}m × {slabThicknessCm}cm
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                Chiều dài tấm L (m):
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="0.5"
                  min="2.0"
                  max="12.0"
                  value={slabLengthM}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 5.0
                    onSetSlabLengthM(val)
                    if (syncJointWithSlab) onSetContractionSpacingM(val)
                  }}
                  className="w-full h-8 pl-2.5 pr-8 bg-white rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
                <span className="absolute right-2 text-[10px] font-bold text-slate-400 pointer-events-none">mét</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                Chiều dày tấm H (cm):
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="1"
                  min="15"
                  max="45"
                  value={slabThicknessCm}
                  onChange={(e) => onSetSlabThicknessCm(parseInt(e.target.value) || 26)}
                  className="w-full h-8 pl-2.5 pr-8 bg-white rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
                <span className="absolute right-2 text-[10px] font-bold text-slate-400 pointer-events-none">cm</span>
              </div>
            </div>
          </div>

          {/* Presets chiều dài tấm */}
          <div className="flex items-center gap-1 pt-0.5">
            <span className="text-[10px] text-slate-400 font-semibold shrink-0">Mẫu L:</span>
            {[4.0, 4.5, 5.0, 6.0].map((lVal) => (
              <button
                key={lVal}
                type="button"
                onClick={() => {
                  onSetSlabLengthM(lVal)
                  if (syncJointWithSlab) onSetContractionSpacingM(lVal)
                  showToast(`Đã đổi chiều dài tấm: ${lVal}m`)
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  slabLengthM === lVal
                    ? 'bg-brand-gold text-white shadow-2xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-brand-gold'
                }`}
              >
                {lVal.toFixed(1)}m
              </button>
            ))}
          </div>
        </div>

        {/* THIẾT LẬP KHE CO GIÃN & KHE GIÃN NỞ */}
        <div className="bg-white p-2.5 rounded-lg border border-amber-200/80 flex flex-col gap-2">
          <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
            <span>⚡ Cự ly Khe co giãn & Khe giãn nở:</span>
          </span>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                Khoảng cách Khe co (m):
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="0.5"
                  min="2.0"
                  max="12.0"
                  value={contractionSpacingM}
                  onChange={(e) => onSetContractionSpacingM(parseFloat(e.target.value) || 5.0)}
                  className="w-full h-8 pl-2.5 pr-8 bg-white rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
                <span className="absolute right-2 text-[10px] font-bold text-slate-400 pointer-events-none">mét</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                Khoảng cách Khe giãn (m):
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="5"
                  min="20"
                  max="300"
                  value={expansionSpacingM}
                  onChange={(e) => onSetExpansionSpacingM(parseFloat(e.target.value) || 50.0)}
                  className="w-full h-8 pl-2.5 pr-8 bg-white rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
                <span className="absolute right-2 text-[10px] font-bold text-slate-400 pointer-events-none">mét</span>
              </div>
            </div>
          </div>

          {/* Presets Khe giãn nở */}
          <div className="flex items-center gap-1 pt-0.5">
            <span className="text-[10px] text-slate-400 font-semibold shrink-0">Khe giãn:</span>
            {[30, 50, 60, 100, 150].map((expVal) => (
              <button
                key={expVal}
                type="button"
                onClick={() => {
                  onSetExpansionSpacingM(expVal)
                  showToast(`Đã đổi khoảng cách khe giãn: ${expVal}m`)
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  expansionSpacingM === expVal
                    ? 'bg-brand-gold text-white shadow-2xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-brand-gold'
                }`}
              >
                {expVal}m
              </button>
            ))}
          </div>

          {/* Bề rộng khe giãn nhiệt mm */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="text-[10px] text-slate-600 font-semibold">Độ hở khe giãn (mm):</span>
            <div className="flex items-center gap-1">
              {[15, 20, 25, 30].map((mm) => (
                <button
                  key={mm}
                  type="button"
                  onClick={() => {
                    onSetExpansionGapMm(mm)
                    showToast(`Độ hở khe giãn: ${mm} mm`)
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                    expansionGapMm === mm
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {mm}mm
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bảng danh sách mã tấm Slab */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-brand-dark flex items-center gap-1">
            <span>Danh Sách Tấm BTXM ({slabs.length})</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            L = {slabLengthM}m
          </span>
        </div>

        <div className="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto pr-0.5">
          {slabs.map((slab) => (
            <div
              key={slab.id}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:border-amber-300 flex items-center justify-between text-xs transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-gold/80 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-mono font-bold text-brand-dark text-xs">{slab.id}</span>
                  <span className="text-[10px] text-slate-500">{slab.segmentCode} • {slab.stationing}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    slab.status === 'GOOD'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : slab.status === 'CRACKED'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {slab.status === 'GOOD' ? 'Tốt' : slab.status === 'CRACKED' ? 'Nứt' : 'Lún'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

