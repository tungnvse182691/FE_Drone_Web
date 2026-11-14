import React from 'react'
import { Grid } from 'lucide-react'
import { SlabItem, SegmentItem } from './types'
import { pavementInputIssues, pavementNumber } from './alignmentPavementHelpers'

export interface SidebarSlabsTabProps {
  asBuiltDraft?: boolean
  layoutKind?: string
  serverSnapshot?: boolean
  stripWidthMeters: number | string
  onSetStripWidthMeters: (val: number | string) => void
  slabLengthM: number | string
  onSetSlabLengthM: (val: number | string) => void
  slabThicknessCm: number | string
  onSetSlabThicknessCm: (val: number | string) => void
  syncJointWithSlab: boolean
  onSetSyncJointWithSlab: (val: boolean) => void
  contractionSpacingM: number | string
  onSetContractionSpacingM: (val: number | string) => void
  expansionSpacingM: number | string
  onSetExpansionSpacingM: (val: number | string) => void
  expansionGapMm: number | string
  onSetExpansionGapMm: (val: number | string) => void
  segments: SegmentItem[]
  selectedSegmentId: string | null
  slabs: (SlabItem & { segmentId?: string })[]
  showToast: (msg: string) => void
}

export const SidebarSlabsTab: React.FC<SidebarSlabsTabProps> = ({
  asBuiltDraft = false,
  layoutKind,
  serverSnapshot = false,
  stripWidthMeters,
  onSetStripWidthMeters,
  slabLengthM,
  onSetSlabLengthM,
  slabThicknessCm,
  onSetSlabThicknessCm,
  contractionSpacingM,
  onSetContractionSpacingM,
  expansionSpacingM,
  onSetExpansionSpacingM,
  expansionGapMm,
  onSetExpansionGapMm,
  slabs,
  segments,
  selectedSegmentId,
  showToast
}) => {
  const scopedSegments = selectedSegmentId === 'ALL' || !selectedSegmentId ? segments : segments.filter(segment => segment.id === selectedSegmentId)
  const scopedSlabs = slabs.filter(slab => scopedSegments.some(segment => segment.id === slab.segmentId))
  const issues = serverSnapshot ? [] : pavementInputIssues(segments, { stripWidthMeters, slabLenM: slabLengthM, thicknessCm: slabThicknessCm, contractionSpacingM, expansionSpacingM, expansionGapMm }).filter(issue => !issue.segmentId || scopedSegments.some(segment => segment.id === issue.segmentId))
  const notice = asBuiltDraft ? 'Tấm thực tế trong bản nhập hoàn công chưa lưu; đường bao và số đo do Chỉ huy trưởng nhập.' : serverSnapshot ? 'Tấm đã lưu trên máy chủ; khe co, khe giãn chưa được xác nhận hình học.' : !segments.length ? 'Chưa có phạm vi lý trình kỹ thuật để xem trước.' : !scopedSegments.length ? 'Chưa chọn đoạn hoặc toàn tuyến để xem trước.'
    : issues.map(issue => issue.message).join('; ')
  const inputValue = (value: number | string) => typeof value === 'string' ? value : Number.isFinite(value) ? value : ''
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
            <Grid className="w-3.5 h-3.5 text-brand-gold" />
            <span>Cấu Hình Tấm & Khe Nối BTXM{layoutKind === 'AS_BUILT' ? ' — thiết kế nguồn' : ''}</span>
          </span>
          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
            PM Tự chỉnh sửa
          </span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          {notice || 'Chỉnh kích thước tấm và khe theo hồ sơ thiết kế để xem thử trên bản đồ. Đây là bản chỉnh cục bộ, chưa lưu hoặc xác nhận trên máy chủ.'}
        </p>

        {/* THIẾT LẬP KÍCH THƯỚC TẤM BÊ TÔNG */}
        <div className="bg-white p-2.5 rounded-lg border border-amber-200/80 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
              <span>🧱 Kích thước tấm BTXM (Dài × Dày):</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-[#8F7212] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {Number.isFinite(pavementNumber(slabLengthM)) && pavementNumber(slabLengthM) > 0 && Number.isFinite(pavementNumber(slabThicknessCm)) && pavementNumber(slabThicknessCm) > 0 ? `${slabLengthM}m × ${slabThicknessCm}cm` : 'Chưa đủ thông số hợp lệ'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                Chiều dài tấm L (m):
              </label>
              <div className="relative flex items-center">
                <input
                  type="text" inputMode="decimal"
                  aria-label="Chiều dài tấm L (m)"
                  value={inputValue(slabLengthM)} placeholder="Chưa có dữ liệu"
                  onChange={(e) => {
                    const val = e.target.value
                    onSetSlabLengthM(val)
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
                  type="text" inputMode="decimal"
                  aria-label="Chiều dày tấm H (cm)"
                  value={inputValue(slabThicknessCm)} placeholder="Chưa có dữ liệu"
                  onChange={(e) => onSetSlabThicknessCm(e.target.value)}
                  className="w-full h-8 pl-2.5 pr-8 bg-white rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
                <span className="absolute right-2 text-[10px] font-bold text-slate-400 pointer-events-none">cm</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-600 block mb-1">Bề rộng tấm (m):</label>
            <div className="relative flex items-center">
              <input
                type="text" inputMode="decimal" aria-label="Bề rộng tấm (m)"
                value={inputValue(stripWidthMeters)} placeholder="Chưa có dữ liệu"
                onChange={(e) => onSetStripWidthMeters(e.target.value)}
                className="w-full h-8 pl-2.5 pr-8 bg-white rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
              <span className="absolute right-2 text-[10px] font-bold text-slate-400 pointer-events-none">mét</span>
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
                  showToast(`Đã đổi chiều dài tấm: ${lVal}m`)
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  pavementNumber(slabLengthM) === lVal
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
                  type="text" inputMode="decimal"
                  aria-label="Khoảng cách Khe co (m)"
                  value={inputValue(contractionSpacingM)} placeholder="Chưa có dữ liệu"
                  onChange={(e) => onSetContractionSpacingM(e.target.value)}
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
                  type="text" inputMode="decimal"
                  aria-label="Khoảng cách Khe giãn (m)"
                  value={inputValue(expansionSpacingM)} placeholder="Chưa có dữ liệu"
                  onChange={(e) => onSetExpansionSpacingM(e.target.value)}
                  className="w-full h-8 pl-2.5 pr-8 bg-white rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
                <span className="absolute right-2 text-[10px] font-bold text-slate-400 pointer-events-none">mét</span>
              </div>
            </div>
          </div>

          {/* Bề rộng khe giãn nhiệt mm */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="text-[10px] text-slate-600 font-semibold">Độ hở khe giãn (mm):</span>
            <input
              type="text" inputMode="decimal"
              aria-label="Độ hở khe giãn (mm)"
              value={inputValue(expansionGapMm)} placeholder="Chưa có dữ liệu"
              onChange={(e) => onSetExpansionGapMm(e.target.value)}
              className="w-28 h-8 px-2.5 bg-white rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>
        </div>
      </div>

      {/* Bảng danh sách mã tấm Slab */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-brand-dark flex items-center gap-1">
            <span>{layoutKind === 'AS_BUILT' ? 'Danh Sách Tấm Thực Tế' : 'Danh Sách Tấm BTXM'} ({scopedSlabs.length})</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {Number.isFinite(pavementNumber(slabLengthM)) && pavementNumber(slabLengthM) > 0 ? `L = ${slabLengthM}m` : 'Chưa có chiều dài tấm hợp lệ'}
          </span>
        </div>

        {scopedSlabs.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-[24px] text-slate-300 mb-1">grid_off</span>
            <span className="text-xs font-semibold text-slate-600">Chưa có dữ liệu phân tấm BTXM</span>
            <span className="text-[11px] text-slate-400 mt-0.5 max-w-[260px]">
              {!segments.length || !scopedSegments.length ? notice : issues.filter(issue => issue.kind === 'slab' || issue.kind === 'shared').map(issue => issue.message).join('; ') || 'Không có tấm trong phạm vi đang chọn.'}
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto pr-0.5">
            {scopedSlabs.map((slab) => (
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
                  <span className="text-[11px] font-mono font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    Dài {Number.isFinite(slab.lengthM) ? `${slab.lengthM}m` : 'Chưa có dữ liệu'} × Rộng {Number.isFinite(slab.widthM) ? `${slab.widthM}m` : 'Chưa có dữ liệu'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

