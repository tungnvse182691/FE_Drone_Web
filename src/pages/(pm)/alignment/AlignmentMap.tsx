import React from 'react'
import {
  Layers,
  Map as MapIcon,
  Grid,
  Plus,
  Minus,
  Ruler,
  Maximize2
} from 'lucide-react'
import { SegmentItem } from './types'

export interface AlignmentMapProps {
  mapContainerRef: React.RefObject<HTMLDivElement | null>
  mapRef: React.RefObject<any>
  mapLayer: 'SATELLITE' | 'VECTOR' | 'PLANNING'
  onSetMapLayer: (layer: 'SATELLITE' | 'VECTOR' | 'PLANNING') => void
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
}) => {
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
                  ? 'bg-[#C9A227] text-white shadow-xs'
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
                  ? 'bg-[#C9A227] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Vector OSM</span>
            </button>
            <button
              type="button"
              onClick={() => onSetMapLayer('PLANNING')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                mapLayer === 'PLANNING'
                  ? 'bg-[#C9A227] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Toàn Tuyến</span>
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
              <span>Tấm & Khe BTXM</span>
              <span className={`w-1.5 h-1.5 rounded-full ${showSlabsAndJoints ? 'bg-white' : 'bg-slate-500'}`} />
            </button>
          </div>

          {/* Live Cursor Readout */}
          <div className="pointer-events-auto hidden lg:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full font-mono text-xs text-white shadow-lg border border-slate-700/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{cursorPos.lat}° N, {cursorPos.lng}° E</span>
            <span className="text-slate-500">|</span>
            <span className="text-[#C9A227] font-semibold">H: {cursorPos.elevation}</span>
            <span className="text-slate-500">|</span>
            <span className="text-amber-300 font-bold">{cursorPos.station}</span>
          </div>

          {/* GIS Map Tools */}
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
                rulerActive ? 'bg-[#C9A227] text-white' : 'hover:bg-slate-700'
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

        {/* MAPLIBRE GL JS CONTAINER */}
        <div ref={mapContainerRef} className="absolute inset-0 z-10 w-full h-full" />

        {/* MAP FLOATING BOTTOM OVERLAYS */}
        <div className="relative z-30 p-3 flex flex-col md:flex-row items-end justify-between gap-3 pointer-events-none">
          {/* Bottom Left: Engineering Cross-Section & Slabs HUD */}
          <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md p-3 rounded-xl text-white shadow-2xl flex flex-col gap-2.5 max-w-sm md:max-w-md w-full border border-slate-700/80 text-xs">
            {(() => {
              const isAll = selectedSegmentId === 'ALL' || !selectedSegmentId
              const currSeg = isAll ? null : (segments.find((s) => s.id === selectedSegmentId) || segments[0])
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

              return (
                <>
                  {/* HUD Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="font-bold text-slate-100 text-xs tracking-wide uppercase flex items-center gap-1.5">
                        <span>Mặt Cắt Ngang & Thông Số Kỹ Thuật</span>
                        <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/60">
                          v2.2
                        </span>
                      </span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-amber-300">
                      {isAll ? 'Toàn tuyến' : currSeg ? currSeg.code : 'Toàn tuyến'}
                    </span>
                  </div>

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
                        <span>🧱 Mã & Kích thước tấm BTXM</span>
                      </span>
                      <span className="font-mono font-bold text-white text-xs">
                        {slabLengthM.toFixed(1)}m × {halfW}m × {slabThicknessCm}cm
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {isAll ? 'Toàn tuyến: ' : 'Đoạn này: '}~<strong className="text-slate-200">{estSlabs.toLocaleString()} tấm</strong> ({isAll ? 'Toàn bộ 2 làn' : 'SLAB-001L/R'})
                      </span>
                    </div>

                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex flex-col gap-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <span>⚡ Khe co & Khe giãn nở</span>
                      </span>
                      <span className="font-mono font-bold text-amber-400 text-[11px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                        Khe giãn: {expansionGapMm}mm (mỗi {expansionSpacingM}m)
                      </span>
                      <span className="font-mono text-sky-400 text-[10px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                        Khe co: {contractionSpacingM}m (Dowel phi 25)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {isAll ? 'Toàn tuyến: ' : 'Đoạn này: '}~<strong className="text-slate-200">{estContraction.toLocaleString()} khe co</strong> • ~<strong className="text-amber-300">{estExpansion.toLocaleString()} khe giãn</strong>
                      </span>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>

          {/* Bottom Right: GIS Map Legend */}
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md p-3 rounded-xl text-white shadow-xl flex flex-col gap-1.5 w-56 border border-slate-700/60 text-xs">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Chú giải bản đồ GIS
            </span>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1.5 rounded-full bg-[#C9A227]"></span>
              <span className="text-slate-200 text-[11px]">Tim tuyến chính</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 rounded bg-sky-400 inline-block"></span>
              <span className="text-sky-300 text-[11px]">Mép trái</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 rounded bg-amber-400 inline-block"></span>
              <span className="text-amber-300 text-[11px]">Mép phải</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 rounded bg-[#38BDF8] inline-block"></span>
              <span className="text-slate-200 text-[11px]">Khe co giãn</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1.5 rounded bg-[#EF4444] inline-block"></span>
              <span className="text-slate-200 text-[11px]">Khe giãn nở</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3 rounded border border-white/80 bg-slate-700 inline-block"></span>
              <span className="text-slate-200 text-[11px]">Lưới tấm BTXM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
