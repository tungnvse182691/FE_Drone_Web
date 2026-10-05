import React from 'react'
import {
  SplitSquareVertical,
  Sliders,
  Grid,
  Sparkles,
  Plus,
  AlertTriangle,
  Link2,
  Check,
  Edit2,
  Trash2,
  ShieldCheck
} from 'lucide-react'
import { SegmentItem, SlabItem } from './types'

export interface AlignmentSidebarProps {
  rightTab: 'SEGMENTS' | 'WIDTH_PROFILE' | 'SLABS'
  onSetRightTab: (tab: 'SEGMENTS' | 'WIDTH_PROFILE' | 'SLABS') => void
  segments: SegmentItem[]
  selectedSegmentId: string | null
  onSelectSegment: (seg: SegmentItem) => void
  splitDistance: number
  onSetSplitDistance: (val: number) => void
  splitSortOrder: 'asc' | 'desc'
  onSetSplitSortOrder: (val: 'asc' | 'desc') => void
  onApplyAutoSplit: () => void
  onOpenAddSegmentModal: () => void
  onSelectAllRoute: () => void
  currentKmPoints: number[]
  importedLengthKm: number
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
  onOpenSplitModal: (seg: SegmentItem) => void
  onEditSegment: (seg: SegmentItem) => void
  onDeleteSegment: (id: string) => void
  onSnapSegment: (id: string) => void
  onUpdateSegmentWidth: (id: string, width: number) => void
  onUpdateAllWidths: (width: number) => void
  slabs: SlabItem[]
  showToast: (msg: string) => void
}

export const AlignmentSidebar: React.FC<AlignmentSidebarProps> = ({
  rightTab,
  onSetRightTab,
  segments,
  selectedSegmentId,
  onSelectSegment,
  splitDistance,
  onSetSplitDistance,
  splitSortOrder,
  onSetSplitSortOrder,
  onApplyAutoSplit,
  onOpenAddSegmentModal,
  onSelectAllRoute,
  currentKmPoints,
  importedLengthKm,
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
  onOpenSplitModal,
  onEditSegment,
  onDeleteSegment,
  onSnapSegment,
  onUpdateSegmentWidth,
  onUpdateAllWidths,
  slabs,
  showToast,
}) => {
  return (
    <div className="xl:col-span-4 flex flex-col gap-3">
      <div className="bg-white rounded-xl p-4 shadow-2xs border border-brand-border flex flex-col gap-3">
        {/* Tabs: Segments vs Road Width Profile vs Slabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg gap-1">
          <button
            type="button"
            onClick={() => onSetRightTab('SEGMENTS')}
            className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              rightTab === 'SEGMENTS'
                ? 'bg-white text-brand-dark shadow-2xs'
                : 'text-slate-500 hover:text-brand-dark'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5 text-[#C9A227]" />
            <span className="truncate">Phân đoạn</span>
            <span className="text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-[#C9A227]">
              {segments.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onSetRightTab('WIDTH_PROFILE')}
            className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              rightTab === 'WIDTH_PROFILE'
                ? 'bg-white text-brand-dark shadow-2xs'
                : 'text-slate-500 hover:text-brand-dark'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#C9A227]" />
            <span className="truncate">Bề rộng (m)</span>
            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
              v2.2
            </span>
          </button>
          <button
            type="button"
            onClick={() => onSetRightTab('SLABS')}
            className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              rightTab === 'SLABS'
                ? 'bg-white text-brand-dark shadow-2xs'
                : 'text-slate-500 hover:text-brand-dark'
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-[#C9A227]" />
            <span className="truncate">Tấm & Khe</span>
            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
              TCVN
            </span>
          </button>
        </div>

        {/* TAB CONTENT: SEGMENTS */}
        {rightTab === 'SEGMENTS' && (
          <>
            {/* Quick Split Module */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                  <SplitSquareVertical className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Chia đoạn theo cự ly Km</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500 font-semibold">
                  Tuyến dài: {importedLengthKm >= 1 ? `${importedLengthKm.toFixed(2)} km` : `${(importedLengthKm * 1000).toFixed(0)} m`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="relative flex items-center">
                  <input
                    type="number"
                    step="0.05"
                    min="0.01"
                    max="50"
                    value={splitDistance}
                    onChange={(e) => onSetSplitDistance(parseFloat(e.target.value) || 0.1)}
                    className="w-full h-8.5 pl-3 pr-14 bg-white border border-slate-300 rounded-lg font-mono text-xs font-bold text-brand-dark focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                    placeholder="Nhập km..."
                  />
                  <span className="absolute right-2.5 text-[11px] text-slate-500 font-medium pointer-events-none">
                    km/đoạn
                  </span>
                </div>

                <select
                  value={splitSortOrder}
                  onChange={(e) => onSetSplitSortOrder(e.target.value as any)}
                  className="h-8.5 px-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                >
                  <option value="asc">Km tăng dần</option>
                  <option value="desc">Km giảm dần</option>
                </select>
              </div>

              {/* Nút chọn nhanh cự ly mẫu */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                <span className="text-[10px] text-slate-400 font-semibold shrink-0">Mẫu:</span>
                {[0.2, 0.25, 0.5, 1.0, 2.5, 5.0].map((kmVal) => (
                  <button
                    key={kmVal}
                    type="button"
                    onClick={() => {
                      onSetSplitDistance(kmVal)
                      setTimeout(() => onApplyAutoSplit(), 50)
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer shrink-0 ${
                      splitDistance === kmVal
                        ? 'bg-[#C9A227] text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-[#C9A227]'
                    }`}
                  >
                    {kmVal >= 1 ? `${kmVal}km` : `${kmVal * 1000}m`}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={onApplyAutoSplit}
                  className="h-8.5 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Áp dụng chia đoạn</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenAddSegmentModal}
                  className="h-8.5 rounded-lg border border-[#C9A227] text-[#8F7212] hover:bg-amber-50/60 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm đoạn mới</span>
                </button>
              </div>
            </div>

            {/* Segment List Stack */}
            <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-0.5">
              {/* MỤC TOÀN TUYẾN */}
              {(() => {
                const isAllSelected = selectedSegmentId === 'ALL'
                const totalLen = segments.reduce((sum, s) => sum + (s.lengthKm || 0), 0) || (importedLengthKm || 25.0)
                const minKm = currentKmPoints[0] || (segments[0]?.startKm ?? 1020.0)
                const maxKm = currentKmPoints[currentKmPoints.length - 1] || (segments[segments.length - 1]?.endKm ?? 1045.0)
                const slabLen = Math.max(1.0, slabLengthM || 5.0)
                const totalSlabsEst = Math.floor((totalLen * 1000) / slabLen) * 2

                return (
                  <div
                    onClick={onSelectAllRoute}
                    className={`p-3 rounded-xl border transition-all flex flex-col gap-2 cursor-pointer ${
                      isAllSelected
                        ? 'bg-amber-50/70 border-[#C9A227] ring-2 ring-[#C9A227]/40 shadow-xs'
                        : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full shrink-0 shadow-2xs border border-white bg-[#C9A227] flex items-center justify-center text-[9px] text-white font-bold">
                          ★
                        </span>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-brand-dark">Toàn Tuyến Tuyến Đường</span>
                            <span className="text-[10px] font-mono font-bold text-[#8F7212] bg-amber-100/70 px-1.5 py-0.2 rounded border border-amber-200">
                              {segments.length} phân đoạn
                            </span>
                          </div>
                          <span className="font-mono text-xs font-bold text-[#8F7212]">
                            Km {minKm.toFixed(3)} - Km {maxKm.toFixed(3)}
                          </span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isAllSelected
                          ? 'bg-[#C9A227] text-white border-[#C9A227]'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {isAllSelected ? 'Đang chọn' : 'Toàn tuyến'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-slate-500 text-[11px]">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-full font-mono font-semibold text-slate-700">
                        Tổng dài: {totalLen >= 1 ? `${totalLen.toFixed(2)} km` : `${Math.round(totalLen * 1000)} mét`}
                      </span>
                      <span className="bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-full font-mono font-bold">
                        Quy mô: ~{totalSlabsEst.toLocaleString()} tấm BTXM
                      </span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded-full">4 làn xe</span>
                    </div>
                  </div>
                )
              })()}

              {segments.map((seg) => {
                const isSelected = seg.id === selectedSegmentId
                return (
                  <div
                    key={seg.id}
                    onClick={() => onSelectSegment(seg)}
                    className={`p-3 rounded-xl border transition-all flex flex-col gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/50 border-[#C9A227] ring-2 ring-[#C9A227]/40 shadow-xs'
                        : seg.hasGap
                        ? 'bg-amber-50/30 border-amber-300 hover:border-amber-400'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          style={{ backgroundColor: seg.color }}
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs border border-white"
                        ></span>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-brand-dark">{seg.code}</span>
                          <span className="font-mono text-xs font-bold text-[#8F7212]">
                            Km {seg.startKm.toFixed(3)} - Km {seg.endKm.toFixed(3)}
                          </span>
                        </div>
                      </div>

                      {seg.hasGap ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-amber-50 text-amber-800 border-amber-300 flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          {seg.statusText}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                          {seg.statusText}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-slate-500 text-[11px]">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-full font-mono font-semibold text-slate-700">
                        Dài: {seg.lengthKm >= 1 ? `${seg.lengthKm.toFixed(2)} km` : `${Math.round(seg.lengthKm * 1000)} mét`}
                      </span>
                      <span className="bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-full font-mono font-bold">
                        Rộng: {seg.roadWidthM || 8.0}m (±{((seg.roadWidthM || 8.0) / 2).toFixed(1)}m)
                      </span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded-full">{seg.laneCount} làn</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded-full">{seg.surfaceMaterial}</span>
                    </div>

                    {/* Cảnh báo khoảng hở & Nút nối tiếp giáp */}
                    {seg.hasGap && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-200 text-xs mt-1">
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-800">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          {seg.gapDistance && seg.gapDistance > 0
                            ? `Hở ${seg.gapDistance}m so với đoạn trước`
                            : `Chồng lấn ${Math.abs(seg.gapDistance || 0)}m`}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onSnapSegment(seg.id)
                          }}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-[10px] font-bold shadow-2xs cursor-pointer flex items-center gap-1 transition-all active:scale-95"
                          title="Khép kín khoảng hở với phân đoạn liền trước"
                        >
                          <Link2 className="w-3 h-3" />
                          <span>Nối tiếp giáp</span>
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-slate-500 text-xs border-t border-slate-100 mt-0.5">
                      {seg.hasGap ? (
                        <span className="flex items-center gap-1 text-[11px] text-amber-700 font-medium">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Chưa khép kín
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                          <Check className="w-3 h-3 text-emerald-600" />
                          Tiếp giáp khép kín
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEditSegment(seg)
                          }}
                          className="p-1.5 hover:bg-amber-100/60 rounded-md text-slate-500 hover:text-[#8F7212] transition-colors cursor-pointer"
                          title="Chỉnh sửa lý trình & thông số"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onOpenSplitModal(seg)
                          }}
                          className="p-1.5 hover:bg-sky-100/60 rounded-md text-slate-500 hover:text-sky-700 transition-colors cursor-pointer"
                          title="Tách phân đoạn này tại mốc Km"
                        >
                          <SplitSquareVertical className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteSegment(seg.id)
                          }}
                          className="p-1.5 hover:bg-red-100/60 rounded-md text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Xóa phân đoạn"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* TAB CONTENT: WIDTH_PROFILE */}
        {rightTab === 'WIDTH_PROFILE' && (
          <div className="flex flex-col gap-3">
            <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Hồ sơ Bề rộng mặt đường (RoadWidthProfile)</span>
                </span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                  Chuẩn v2.2
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Khai báo bề rộng mặt đường (mét) từng đoạn từ điểm A đến B. Hệ thống tự động tính bán rộng tim đường
                (±W/2 mỗi bên) để vẽ tim đường trên bản đồ và phục vụ bay drone quét ranh giới hư hỏng.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-200/60">
                <div className="bg-white/80 p-2 rounded-lg border border-amber-100 flex flex-col">
                  <span className="text-[10px] text-slate-500 font-semibold">Tổng diện tích mặt đường</span>
                  <span className="text-xs font-mono font-bold text-brand-dark">
                    {Math.round(
                      segments.reduce((acc, s) => acc + (s.lengthKm * 1000 * (s.roadWidthM || 8.0)), 0)
                    ).toLocaleString()} m²
                  </span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-amber-100 flex flex-col">
                  <span className="text-[10px] text-slate-500 font-semibold">Bề rộng bình quân</span>
                  <span className="text-xs font-mono font-bold text-[#8F7212]">
                    {(
                      segments.reduce((acc, s) => acc + (s.lengthKm * (s.roadWidthM || 8.0)), 0) /
                      Math.max(0.001, segments.reduce((acc, s) => acc + s.lengthKm, 0))
                    ).toFixed(1)} m
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-0.5">
              {segments.map((seg) => {
                const width = seg.roadWidthM || 8.0
                const halfWidth = (width / 2).toFixed(1)
                const areaM2 = Math.round(seg.lengthKm * 1000 * width)

                return (
                  <div
                    key={seg.id}
                    className={`p-3 rounded-xl border transition-all flex flex-col gap-2.5 ${
                      seg.id === selectedSegmentId
                        ? 'bg-amber-50/40 border-[#C9A227] ring-1 ring-[#C9A227]/30 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          style={{ backgroundColor: seg.color }}
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs border border-white"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-brand-dark">{seg.code}</span>
                          <span className="font-mono text-xs font-bold text-[#8F7212]">
                            Km {seg.startKm.toFixed(3)} → Km {seg.endKm.toFixed(3)}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Dài: {seg.lengthKm >= 1 ? `${seg.lengthKm.toFixed(2)} km` : `${Math.round(seg.lengthKm * 1000)}m`}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <span>Bề rộng mặt đường (W):</span>
                        </label>
                        <span className="text-[11px] font-mono font-bold text-brand-dark bg-white px-2 py-0.5 rounded border border-slate-200">
                          Trái ±{halfWidth}m | Phải ±{halfWidth}m
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            step="0.5"
                            min="2"
                            max="60"
                            value={width}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 3.0
                              onUpdateSegmentWidth(seg.id, val)
                            }}
                            className="w-full h-8 pl-3 pr-10 bg-white rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                          />
                          <span className="absolute right-2.5 top-2 text-[11px] font-bold text-slate-400 pointer-events-none">
                            mét
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {[3.0, 4.0, 6.0, 8.0, 10.0].map((wVal) => (
                            <button
                              key={wVal}
                              type="button"
                              onClick={() => onUpdateSegmentWidth(seg.id, wVal)}
                              className={`px-2 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                                width === wVal
                                  ? 'bg-[#C9A227] text-white shadow-2xs'
                                  : 'bg-white border border-slate-200 text-slate-700 hover:border-[#C9A227]'
                              }`}
                              title={`Đặt bề rộng đoạn này là ${wVal}m`}
                            >
                              {wVal}m
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <span>Diện tích bề mặt bảo hành:</span>
                        <span className="font-mono font-bold text-slate-700">{areaM2.toLocaleString()} m²</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Đặt nhanh tất cả các đoạn */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Đặt nhanh tất cả các đoạn:</span>
              <div className="flex items-center gap-1">
                {[3.0, 4.0, 6.0, 8.0, 10.0].map((wVal) => (
                  <button
                    key={wVal}
                    type="button"
                    onClick={() => onUpdateAllWidths(wVal)}
                    className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-[#C9A227] text-slate-700 text-[10px] font-mono font-bold transition-all cursor-pointer"
                  >
                    Đồng loạt {wVal}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: SLABS & JOINTS */}
        {rightTab === 'SLABS' && (
          <div className="flex flex-col gap-3">
            <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                  <Grid className="w-3.5 h-3.5 text-[#C9A227]" />
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
                        className="w-full h-8 pl-2.5 pr-8 bg-white rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
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
                        className="w-full h-8 pl-2.5 pr-8 bg-white rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
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
                          ? 'bg-[#C9A227] text-white shadow-2xs'
                          : 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-[#C9A227]'
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
                        className="w-full h-8 pl-2.5 pr-8 bg-white rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
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
                        className="w-full h-8 pl-2.5 pr-8 bg-white rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
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
                          ? 'bg-[#C9A227] text-white shadow-2xs'
                          : 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-[#C9A227]'
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
                      <span className="w-2.5 h-2.5 rounded-full bg-[#C9A227]/80 shrink-0" />
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
        )}

        {/* Summary Statistics Footer */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-2">
          <div className="grid grid-cols-3 gap-2 text-center pb-2 border-b border-slate-200">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-brand-dark font-mono">
                {(() => {
                  const totalLen = segments.reduce((sum, s) => sum + (s.lengthKm || 0), 0)
                  const displayLen = totalLen > 0 ? totalLen : (importedLengthKm || 25.0)
                  return displayLen >= 1
                    ? `${displayLen.toFixed(displayLen >= 10 ? 1 : 2)} km`
                    : `${Math.round(displayLen * 1000)} mét`
                })()}
              </span>
              <span className="text-[10px] text-slate-500">Tổng chiều dài</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-brand-dark font-mono">{segments.length} đoạn</span>
              <span className="text-[10px] text-slate-500">Phân đoạn</span>
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-bold font-mono ${segments.some((s) => s.hasGap) ? 'text-amber-600 animate-pulse' : 'text-emerald-600'}`}>
                {segments.some((s) => s.hasGap) ? 'Cảnh báo hở' : 'Đạt chuẩn'}
              </span>
              <span className="text-[10px] text-slate-500">
                {segments.some((s) => s.hasGap) ? 'Cần khép kín' : 'Sẵn sàng duyệt'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-1.5 text-slate-500 text-[11px] leading-relaxed">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C9A227] shrink-0 mt-0.5" />
            <span>
              Trạng thái <strong>CONFIRMED</strong> sẽ gắn hàm băm SHA-256 bất biến phục vụ nghiệm thu bảo hành.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
