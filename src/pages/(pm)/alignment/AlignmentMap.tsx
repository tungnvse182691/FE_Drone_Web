import React, { useState } from 'react'
import {
  Layers,
  Map as MapIcon,
  Grid,
  Plus,
  Minus,
  Ruler,
  Maximize2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Undo2,
  Trash2,
  Check,
  X
} from 'lucide-react'
import { SegmentItem } from './types'
import { AlignmentMapLegend } from './AlignmentMapLegend'
import { calculateCoordsLengthKm } from './alignmentGeometryHelpers'

export interface AlignmentMapProps {
  mapContainerRef: React.RefObject<HTMLDivElement | null>
  mapRef: React.RefObject<any>
  mapLayer: 'SATELLITE' | 'VECTOR'
  onSetMapLayer: (layer: 'SATELLITE' | 'VECTOR') => void
  showSlabsAndJoints: boolean
  onToggleSlabsAndJoints: () => void
  cursorPos: { lat: number; lng: number; elevation: string; station: string }
  rulerActive: boolean
  onToggleRuler: () => void
  onSelectAllRoute: () => void
  selectedSegmentId: string | null
  segments: SegmentItem[]
  importedLengthKm: number
  slabLengthM: number
  slabThicknessCm: number
  contractionSpacingM: number
  expansionSpacingM: number
  expansionGapMm: number
  // Props cho tuyến nhánh và phân đoạn kích hoạt
  branches?: any[]
  selectedTargetType?: string
  currentBranch?: any
  // Props cho chế độ chấm điểm tim tuyến trên bản đồ
  isPickingOnMap?: boolean
  pickedCoords?: [number, number][]
  detectedDivergeStation?: { km: number; stationText: string; distanceMeters: number } | null
  onRemoveLastPickedCoord?: () => void
  onClearAllPickedCoords?: () => void
  onFinishPickingCoords?: () => void
  onCancelPickingCoords?: () => void
}

export const AlignmentMap: React.FC<AlignmentMapProps> = ({
  mapContainerRef,
  mapRef,
  mapLayer,
  onSetMapLayer,
  showSlabsAndJoints,
  onToggleSlabsAndJoints,
  cursorPos,
  rulerActive,
  onToggleRuler,
  onSelectAllRoute,
  selectedSegmentId,
  segments,
  importedLengthKm,
  slabLengthM,
  slabThicknessCm,
  contractionSpacingM,
  expansionSpacingM,
  expansionGapMm,
  branches = [],
  selectedTargetType = 'MAINLINE',
  currentBranch = null,
  isPickingOnMap = false,
  pickedCoords = [],
  detectedDivergeStation = null,
  onRemoveLastPickedCoord,
  onClearAllPickedCoords,
  onFinishPickingCoords,
  onCancelPickingCoords
}) => {
  // Trạng thái thu gọn/mở rộng bảng Mặt cắt ngang & Thông số kỹ thuật
  const [isCrossSectionMinimized, setIsCrossSectionMinimized] = useState<boolean>(false)
  const pickedLenKm = calculateCoordsLengthKm(pickedCoords)

  return (
    <div className="xl:col-span-8 flex flex-col gap-2">
      <div className="relative w-full h-[660px] rounded-xl overflow-hidden shadow-md bg-slate-950 select-none flex flex-col justify-between border border-slate-800">
        {/* MAP TOP FLOATING CONTROLS */}
        <div className="relative z-30 p-3 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-b from-slate-950/90 to-transparent pointer-events-none">
          {/* Layer Switchers */}
          <div className="pointer-events-auto flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg shadow-lg border border-slate-700/60">
            <button
              type="button"
              onClick={() => onSetMapLayer('SATELLITE')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                mapLayer === 'SATELLITE'
                  ? 'bg-brand-gold text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ảnh vệ tinh HD</span>
            </button>
            <button
              type="button"
              onClick={() => onSetMapLayer('VECTOR')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                mapLayer === 'VECTOR'
                  ? 'bg-brand-gold text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Bản đồ số</span>
            </button>
            <button
              type="button"
              onClick={onToggleSlabsAndJoints}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                showSlabsAndJoints
                  ? 'bg-amber-500 text-white shadow-xs ring-1 ring-amber-300/50'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Bật/Tắt hiển thị lưới tấm bê tông, khe co giãn, khe giãn nở và thông số 2 mép đường"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Tấm & Khe bê tông</span>
              <span className={`w-1.5 h-1.5 rounded-full ${showSlabsAndJoints ? 'bg-white' : 'bg-slate-500'}`} />
            </button>
          </div>

          {/* Live Cursor Readout */}
          <div className="pointer-events-auto hidden lg:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full font-mono text-xs text-white shadow-lg border border-slate-700/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{cursorPos.lat}° N, {cursorPos.lng}° E</span>
            <span className="text-slate-500">|</span>
            <span className="text-brand-gold font-semibold">H: {cursorPos.elevation}</span>
            <span className="text-slate-500">|</span>
            <span className="text-amber-300 font-bold">{cursorPos.station}</span>
          </div>

          {/* GIS Map Tools (Bộ nút điều khiển duy nhất) */}
          <div className="pointer-events-auto flex items-center gap-0.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg shadow-lg text-white border border-slate-700/60">
            <button
              onClick={() => mapRef.current?.zoomIn()}
              className="w-7 h-7 rounded hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              title="Phóng to"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => mapRef.current?.zoomOut()}
              className="w-7 h-7 rounded hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              title="Thu nhỏ"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onToggleRuler}
              className={`w-7 h-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
                rulerActive ? 'bg-brand-gold text-white' : 'hover:bg-slate-700'
              }`}
              title="Đo khoảng cách (Ruler)"
            >
              <Ruler className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onSelectAllRoute}
              className="w-7 h-7 rounded hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              title="Xem toàn tuyến / Vừa khung hình"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* FLOATING ACTION BAR: CHẾ ĐỘ CHẤM ĐIỂM TIM TUYẾN TRÊN BẢN ĐỒ */}
        {isPickingOnMap && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-auto flex items-center gap-3 bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-2xl text-white shadow-2xl border border-amber-500/70 animate-in fade-in zoom-in-95 max-w-2xl w-[94%] sm:w-full">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg animate-pulse shrink-0">
                <MapPin className="w-4 h-4" />
              </span>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-300 truncate">
                    Chế độ chấm điểm tim tuyến nhánh (Click trên bản đồ)
                  </span>
                  {detectedDivergeStation && (
                    <span className="text-[10px] font-mono font-bold bg-amber-950/80 border border-amber-500/60 text-amber-300 px-2 py-0.5 rounded-md shrink-0">
                      Rẽ tại {detectedDivergeStation.stationText} ({detectedDivergeStation.distanceMeters}m từ tim)
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-300 font-mono">
                  Đã chấm <strong className="text-white">{pickedCoords.length}</strong> điểm • Dài:{' '}
                  <strong className="text-amber-400">
                    {pickedLenKm >= 1 ? `${pickedLenKm.toFixed(2)} km` : `${Math.round(pickedLenKm * 1000)} m`}
                  </strong>
                  {pickedCoords.length === 0 && (
                    <span className="text-slate-400 italic"> (Click điểm đầu tiên gần tim đường để tự nhận diện điểm rẽ)</span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={onRemoveLastPickedCoord}
                disabled={pickedCoords.length === 0}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                title="Hoàn tác điểm vừa chấm gần nhất"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hoàn tác</span>
              </button>

              <button
                type="button"
                onClick={onClearAllPickedCoords}
                disabled={pickedCoords.length === 0}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-red-900/60 disabled:opacity-40 text-xs font-semibold text-slate-300 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                title="Xóa hết tất cả các điểm đã chấm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xóa tất cả</span>
              </button>

              <button
                type="button"
                onClick={onFinishPickingCoords}
                className="px-3 py-1.5 rounded-lg bg-brand-gold hover:bg-[#B38E1F] text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
                title="Hoàn tất và lưu tọa độ"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Hoàn tất</span>
              </button>

              <button
                type="button"
                onClick={onCancelPickingCoords}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Hủy bỏ"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* MAPLIBRE GL JS CONTAINER */}
        <div ref={mapContainerRef} className="absolute inset-0 z-10 w-full h-full" />

        {/* MAP FLOATING BOTTOM OVERLAYS */}
        <div className="relative z-30 p-3 flex flex-col md:flex-row items-end justify-between gap-3 pointer-events-none">
          {/* Bottom Left: Engineering Cross-Section & Slabs HUD */}
          <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md p-3 rounded-xl text-white shadow-2xl flex flex-col gap-2 max-w-sm md:max-w-md w-full border border-slate-700/80 text-xs transition-all">
            {(() => {
              const isAll = selectedSegmentId === 'ALL' || !selectedSegmentId
              let targetItem: any = null
              let branchNamePrefix = ''

              // 1. Nếu đang ở ngữ cảnh Tuyến Nhánh (selectedTargetType !== 'MAINLINE')
              if (currentBranch && selectedTargetType === currentBranch.id) {
                const branchSegs = currentBranch.segments || []
                const matchedSeg = !isAll ? branchSegs.find((s: any) => s.id === selectedSegmentId) : null
                if (matchedSeg) {
                  targetItem = {
                    ...matchedSeg,
                    name: `${currentBranch.name} - ${matchedSeg.code}`,
                    roadWidthM: matchedSeg.roadWidthM || currentBranch.roadWidthM || 8.0,
                    isBranch: true,
                    branchCode: currentBranch.code
                  }
                  branchNamePrefix = `[${currentBranch.code}] `
                } else if (!isAll && branchSegs.length > 0) {
                  const firstSeg = branchSegs[0]
                  targetItem = {
                    ...firstSeg,
                    name: `${currentBranch.name} - ${firstSeg.code}`,
                    roadWidthM: firstSeg.roadWidthM || currentBranch.roadWidthM || 8.0,
                    isBranch: true,
                    branchCode: currentBranch.code
                  }
                  branchNamePrefix = `[${currentBranch.code}] `
                } else {
                  targetItem = {
                    id: currentBranch.id,
                    code: currentBranch.code,
                    name: currentBranch.name,
                    roadWidthM: currentBranch.roadWidthM || 8.0,
                    lengthKm: currentBranch.lengthKm || 1.85,
                    surfaceMaterial: currentBranch.surfaceMaterial || 'Mặt BTN C12.5',
                    isBranch: true,
                    branchCode: currentBranch.code
                  }
                  branchNamePrefix = `[${currentBranch.code}] `
                }
              }

              // 2. Nếu đang ở Trục Chính hoặc chưa tìm thấy
              if (!targetItem) {
                targetItem = !isAll ? segments.find((s) => s.id === selectedSegmentId) : null
              }

              // 3. Tìm trong các tuyến nhánh khác nếu có
              if (!targetItem && !isAll && branches && branches.length > 0) {
                for (const b of branches) {
                  if (b.id === selectedSegmentId) {
                    targetItem = {
                      id: b.id,
                      code: b.code,
                      name: b.name,
                      roadWidthM: b.roadWidthM || 8.0,
                      lengthKm: b.lengthKm || 1.85,
                      surfaceMaterial: b.surfaceMaterial || 'Mặt BTN C12.5',
                      isBranch: true
                    }
                    branchNamePrefix = `[${b.code}] `
                    break
                  }
                  if (b.segments && Array.isArray(b.segments)) {
                    const foundSeg = b.segments.find((s: any) => s.id === selectedSegmentId)
                    if (foundSeg) {
                      targetItem = {
                        ...foundSeg,
                        name: `${b.name} - ${foundSeg.code}`,
                        roadWidthM: foundSeg.roadWidthM || b.roadWidthM || 8.0,
                        isBranch: true,
                        branchCode: b.code
                      }
                      branchNamePrefix = `[${b.code}] `
                      break
                    }
                  }
                }
              }

              // 3. Nếu đang ở ngữ cảnh tuyến nhánh và chưa chọn phân đoạn cụ thể
              if (!targetItem && currentBranch && selectedTargetType === currentBranch.id) {
                if (isAll) {
                  targetItem = {
                    code: `${currentBranch.code} - Toàn tuyến nhánh`,
                    roadWidthM: currentBranch.roadWidthM || 8.0,
                    lengthKm: currentBranch.lengthKm || 1.85,
                    isBranch: true
                  }
                  branchNamePrefix = `[${currentBranch.code}] `
                } else {
                  targetItem = currentBranch.segments?.[0] || {
                    code: currentBranch.code,
                    roadWidthM: currentBranch.roadWidthM || 8.0,
                    lengthKm: currentBranch.lengthKm || 1.85,
                    isBranch: true
                  }
                  branchNamePrefix = `[${currentBranch.code}] `
                }
              }

              // Fallback nếu trục chính
              const currSeg = targetItem || (isAll ? null : (segments[0] || null))

              const totalRouteKm = segments.reduce((sum, s) => sum + (s.lengthKm || 0), 0) || (importedLengthKm || 25.0)
              const avgRoadWidth = segments.length > 0
                ? segments.reduce((acc, s) => acc + (s.roadWidthM || 8.0) * s.lengthKm, 0) / Math.max(0.001, totalRouteKm)
                : 8.0
              const currW = isAll ? avgRoadWidth : (currSeg?.roadWidthM || 8.0)
              const halfW = (currW / 2).toFixed(1)
              const slabLen = Math.max(1.0, slabLengthM || 5.0)
              const targetLenKm = isAll ? totalRouteKm : (currSeg?.lengthKm || 1.0)
              const targetLenM = targetLenKm * 1000
              const estSlabs = Math.floor(targetLenM / slabLen) * 2

              const contractionSpacing = Math.max(1.0, contractionSpacingM || 5.0)
              const expansionSpacing = Math.max(5.0, expansionSpacingM || 50.0)
              const estContraction = Math.floor(targetLenM / contractionSpacing)
              const estExpansion = Math.floor(targetLenM / expansionSpacing)

              const displayTitle = isAll
                ? (currentBranch && selectedTargetType === currentBranch.id ? `[${currentBranch.code}] Toàn tuyến nhánh` : 'Toàn tuyến trục chính')
                : currSeg
                ? `${branchNamePrefix}${currSeg.code}`
                : 'Toàn tuyến'

              return (
                <>
                  {/* HUD Header với Nút Minimize/Expand */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="font-bold text-slate-100 text-xs tracking-wide uppercase flex items-center gap-1.5">
                        <span>Mặt Cắt Ngang & Thông Số</span>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                          currSeg?.isBranch
                            ? 'bg-amber-950/80 border-amber-600/70 text-amber-300'
                            : 'bg-sky-950/80 border-sky-600/70 text-sky-300'
                        }`}>
                          {currSeg?.isBranch ? 'Tuyến Nhánh' : 'Trục Chính'}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-amber-300 truncate max-w-[140px]" title={displayTitle}>
                        {displayTitle}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsCrossSectionMinimized(!isCrossSectionMinimized)}
                        className="w-6 h-6 rounded hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        title={isCrossSectionMinimized ? 'Mở rộng bảng' : 'Thu nhỏ bảng'}
                      >
                        {isCrossSectionMinimized ? (
                          <ChevronUp className="w-4 h-4 text-amber-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Phần nội dung có thể thu gọn */}
                  {!isCrossSectionMinimized && (
                    <div className="flex flex-col gap-2 pt-0.5">
                      {/* 1. THÔNG SỐ 2 MÉP ĐƯỜNG & BỀ RỘNG W */}
                      <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-medium">
                            {isAll ? 'Bề rộng mặt đường TB (W):' : 'Bề rộng mặt đường (W):'}
                          </span>
                          <span className="font-mono font-bold text-amber-400 text-xs">{currW.toFixed(1)} mét</span>
                        </div>

                        {/* Sơ đồ mặt cắt đồ họa trực quan */}
                        <div className="relative mt-1 pt-4 pb-2 px-2 bg-slate-950 rounded border border-slate-800/80 flex flex-col items-center">
                          <div className="absolute top-1 inset-x-2 flex items-center justify-between text-[9px] font-mono text-emerald-400">
                            <span>|←</span>
                            <span className="font-bold">W = {currW.toFixed(1)}m</span>
                            <span>→|</span>
                          </div>

                          <div className="w-full h-5 rounded flex items-center overflow-hidden border border-slate-600 bg-slate-800 text-[10px] font-mono font-bold">
                            <div className="flex-1 h-full bg-sky-950/80 border-r border-dashed border-white flex items-center justify-center text-sky-300">
                              Làn Trái ({halfW}m)
                            </div>
                            <div className="flex-1 h-full bg-amber-950/80 flex items-center justify-center text-amber-300">
                              Làn Phải ({halfW}m)
                            </div>
                          </div>

                          <div className="w-full flex items-center justify-between text-[10px] font-mono font-bold mt-1.5 pt-1 border-t border-slate-800/80">
                            <span className="text-sky-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" />
                              Mép Trái: -{halfW}m
                            </span>
                            <span className="text-slate-400 text-[9px]">CL (0.0m)</span>
                            <span className="text-amber-400 flex items-center gap-1">
                              Mép Phải: +{halfW}m
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 2. THÔNG SỐ TẤM BÊ TÔNG & KHE CO / KHE GIÃN NỞ */}
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex flex-col gap-0.5">
                          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                            <span>Tấm BTXM</span>
                          </span>
                          <span className="font-mono font-bold text-white text-xs">
                            {slabLengthM.toFixed(1)}m × {halfW}m × {slabThicknessCm}cm
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {isAll ? 'Toàn tuyến: ' : 'Đoạn này: '}~<strong className="text-slate-200">{estSlabs.toLocaleString()} tấm</strong>
                          </span>
                        </div>

                        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex flex-col gap-0.5">
                          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                            <span>Khe co & khe giãn</span>
                          </span>
                          <span className="font-mono font-bold text-amber-400 text-[11px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                            Giãn: {expansionGapMm}mm (mỗi {expansionSpacingM}m)
                          </span>
                          <span className="font-mono text-sky-400 text-[10px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                            Co: {contractionSpacingM}m
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )
            })()}
          </div>

          {/* Bottom Right: GIS Map Legend */}
          <AlignmentMapLegend />
        </div>
      </div>
    </div>
  )
}
