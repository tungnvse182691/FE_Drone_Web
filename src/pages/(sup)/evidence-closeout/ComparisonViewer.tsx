import React from 'react'
import {
  Check,
  Milestone,
  Wrench,
  Lock,
  Columns,
  SlidersHorizontal,
  Fingerprint,
  Camera,
  MapPin,
  Clock,
  HardHat,
  Truck,
  ShieldCheck,
  CheckCircle2,
  CheckSquare,
  Square
} from 'lucide-react'
import { CaseItem } from './types'

export interface ComparisonViewerProps {
  currentItem: CaseItem
  viewMode: 'side' | 'slider' | 'meta'
  setViewMode: (mode: 'side' | 'slider' | 'meta') => void
  sliderPosition: number
  setSliderPosition: (pos: number) => void
  isPMView: boolean
  onToggleCitizenPublish: () => void
}

export const ComparisonViewer: React.FC<ComparisonViewerProps> = ({
  currentItem,
  viewMode,
  setViewMode,
  sliderPosition,
  setSliderPosition,
  isPMView,
  onToggleCitizenPublish
}) => {
  return (
    <section className="bg-white rounded-2xl p-6 border border-[#E2E5E9] shadow-xs space-y-4">
      {/* BEFORE vs AFTER INTEGRITY AUDIT (3 MODES: SIDE-BY-SIDE / SLIDER CURTAIN / METADATA SHA-256) */}
        {/* Section Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2 font-sansation">
              <Camera className="w-5 h-5 text-[#C9A227]" />
              Đối chứng bằng chứng hình ảnh hiện trường (BEFORE vs AFTER Integrity Audit)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Xác minh ảnh chụp gốc, tọa độ đo đạc không gian RTK và chữ ký số thiết bị máy rải/xe lu Dynapac.
            </p>
          </div>

          {/* View Mode Switcher: Song song, Vuốt trượt, Metadata */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shadow-2xs self-start sm:self-auto border border-slate-200">
            <button
              onClick={() => setViewMode('side')}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'side' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Chế độ song song</span>
            </button>

            <button
              onClick={() => setViewMode('slider')}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'slider' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Vuốt trượt (Curtain)</span>
            </button>

            <button
              onClick={() => setViewMode('meta')}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'meta' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5 text-purple-700" />
              <span>Đối chiếu metadata SHA-256</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------------------- */}
        {/* VIEW MODE 1 & 3: SIDE-BY-SIDE HOẶC METADATA OVERLAY                      */}
        {/* ------------------------------------------------------------------------- */}
        {viewMode !== 'slider' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: BEFORE EVIDENCE */}
            <div className="flex flex-col bg-white rounded-xl overflow-hidden border border-[#E2E5E9] shadow-2xs">
              {/* Column Header */}
              <div className="p-3.5 bg-slate-50 border-b border-[#E2E5E9] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="text-xs text-slate-900 font-bold uppercase tracking-wider">
                    Ảnh trước sửa (BEFORE EVIDENCE)
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                  {currentItem.defect_code} • Khuyết tật ban đầu
                </span>
              </div>

              {/* Photo Container */}
              <div className="relative group aspect-video w-full overflow-hidden bg-slate-900">
                <img
                  src={currentItem.before_image}
                  alt="Hiện trạng hư hỏng mặt đường trước khi sửa chữa"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* HUD Overlays */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs text-slate-900 shadow-xs flex items-center gap-1.5 border border-slate-200 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>{currentItem.chainage}</span>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-mono flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  EXIF UNALTERED
                </div>

                {/* Expandable SHA-256 HUD Overlay (khi bật viewMode === 'meta') */}
                <div
                  className={`transition-opacity duration-200 absolute inset-0 bg-slate-900/90 backdrop-blur-xs p-5 text-white flex flex-col justify-between ${
                    viewMode === 'meta' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#C9A227] font-bold">
                      Bảo mật tệp &amp; Cảm biến hình ảnh
                    </span>
                    <p className="font-mono text-xs text-slate-200">Hash SHA-256: {currentItem.before_hash}</p>
                    <p className="text-xs text-slate-300">
                      Độ phân giải gốc: 4032 × 3024 px (12.2 MP) • Tiêu cự: 26mm f/1.8
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#C9A227] font-bold">
                      Dữ liệu không gian RTK chuẩn
                    </span>
                    <p className="font-mono text-xs text-slate-200">{currentItem.before_gps}</p>
                    <p className="text-xs text-slate-300">
                      Vệ tinh: GPS + GLONASS (18 Sats lock) • Sai số đo đạc: ±1.8 cm
                    </p>
                  </div>
                </div>
              </div>

              {/* Proof Metadata Box */}
              <div className="p-4 space-y-2.5 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Milestone className="w-4 h-4 text-[#C9A227] shrink-0" />
                  <span>
                    Nguồn ghi nhận: <strong className="text-slate-900 font-semibold">{currentItem.before_source}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Thời gian ghi nhận:</span>
                    <span className="font-mono font-semibold text-slate-900 text-xs">{currentItem.before_time}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Tọa độ GPS chuẩn:</span>
                    <span className="font-mono font-semibold text-slate-900 text-xs">{currentItem.before_gps.split(' (')[0]}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Kích thước ban đầu:</span>
                    <span className="font-semibold text-slate-900 text-xs">
                      Sâu {currentItem.depth_cm} cm | S = {currentItem.area_m2} m²
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Toàn vẹn số:</span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-mono font-bold text-xs">
                      <Lock className="w-3.5 h-3.5" />
                      PASS: {currentItem.before_hash.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: AFTER EVIDENCE */}
            <div className="flex flex-col bg-white rounded-xl overflow-hidden border border-[#E2E5E9] shadow-2xs">
              {/* Column Header */}
              <div className="p-3.5 bg-slate-50 border-b border-[#E2E5E9] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span className="text-xs text-slate-900 font-bold uppercase tracking-wider">
                    Ảnh sau sửa (AFTER EVIDENCE)
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Đã thảm nhựa C12.5 • Đạt lu lèn K98 ({currentItem.compaction_k98})
                </span>
              </div>

              {/* Photo Container */}
              <div className="relative group aspect-video w-full overflow-hidden bg-slate-900">
                <img
                  src={currentItem.after_image}
                  alt="Mặt đường bê tông nhựa sau khi vá phẳng phiu, lu lèn chặt chẽ"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* HUD Overlays */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs text-slate-900 shadow-xs flex items-center gap-1.5 border border-slate-200 font-medium">
                  <Wrench className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Crew 02 • Máy Dynapac F1200CS</span>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-mono flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  EXIF UNALTERED
                </div>

                {/* Expandable SHA-256 HUD Overlay (khi bật viewMode === 'meta') */}
                <div
                  className={`transition-opacity duration-200 absolute inset-0 bg-slate-900/90 backdrop-blur-xs p-5 text-white flex flex-col justify-between ${
                    viewMode === 'meta' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#C9A227] font-bold">
                      Chữ ký số thiết bị thi công &amp; SHA-256
                    </span>
                    <p className="font-mono text-xs text-slate-200">Hash: {currentItem.after_hash}</p>
                    <p className="text-xs text-slate-300">
                      Độ phân giải: 4000 × 3000 px • Thiết bị: Cat S62 Pro Rugged Inspection
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#C9A227] font-bold">
                      Tọa độ hoàn công &amp; Nhiệt độ vật lý
                    </span>
                    <p className="font-mono text-xs text-slate-200">{currentItem.after_gps}</p>
                    <p className="text-xs text-slate-300">
                      Nhiệt độ thảm lúc rải: {currentItem.pave_temp_c}°C • Sau lu lèn: {currentItem.compact_temp_c}°C • K98: {currentItem.compaction_k98}
                    </p>
                  </div>
                </div>
              </div>

              {/* Proof Metadata Box */}
              <div className="p-4 space-y-2.5 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <HardHat className="w-4 h-4 text-[#C9A227] shrink-0" />
                  <span>
                    Đơn vị thực hiện: <strong className="text-slate-900 font-semibold">{currentItem.after_crew}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Thời gian hoàn công:</span>
                    <span className="font-mono font-semibold text-slate-900 text-xs">{currentItem.after_time}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Trùng khớp vị trí:</span>
                    <span className="font-mono font-bold text-emerald-700 text-xs">99.8% sai số &lt; 2cm</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Thiết bị thi công:</span>
                    <span className="font-semibold text-slate-900 text-xs truncate block" title={currentItem.after_equipment}>
                      {currentItem.after_equipment}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Toàn vẹn số:</span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-mono font-bold text-xs">
                      <Lock className="w-3.5 h-3.5" />
                      PASS: {currentItem.after_hash.slice(0, 8)}...
                    </span>
                  </div>
                </div>

                {/* Citizen app publish selector */}
                <label className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2 cursor-pointer bg-slate-50 p-2.5 rounded-lg">
                  <input
                    type="checkbox"
                    checked={currentItem.citizen_published}
                    onChange={onToggleCitizenPublish}
                    className="w-4 h-4 rounded text-[#C9A227] accent-[#C9A227] focus:ring-[#C9A227]"
                  />
                  <span className="text-xs text-slate-800 font-semibold">
                    Chọn ảnh này làm ảnh chuẩn công bố cho ứng dụng dân cư (Citizen App &amp; Cổng thông tin giao thông)
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------------- */}
        {/* VIEW MODE 2: INTERACTIVE SLIDER CURTAIN (VUỐT TRƯỢT SO SÁNH TRỰC QUAN)     */}
        {/* ------------------------------------------------------------------------- */}
        {viewMode === 'slider' && (
          <div className="space-y-4">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-md select-none bg-slate-900 border border-slate-200">
              {/* After image (Lớp nền dưới) */}
              <img
                src={currentItem.after_image}
                alt="After"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Before image (Lớp phủ trên được clip theo sliderPosition) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
              >
                <img
                  src={currentItem.before_image}
                  alt="Before"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Tag BEFORE */}
                <div className="absolute top-4 left-4 bg-rose-600/90 text-white font-bold text-xs px-3 py-1 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  <span>BEFORE (Trước sửa)</span>
                </div>
              </div>

              {/* Tag AFTER */}
              <div className="absolute top-4 right-4 bg-emerald-600/90 text-white font-bold text-xs px-3 py-1 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>AFTER (Sau hoàn công)</span>
              </div>

              {/* Vạch chia Slider Divider Line */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize flex items-center justify-center"
                style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
              >
                <div className="w-8 h-8 rounded-full bg-white text-slate-800 shadow-xl border-2 border-[#C9A227] flex items-center justify-center text-xs font-bold pointer-events-none">
                  ↔
                </div>
              </div>

              {/* Thanh kéo input ngầm */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="font-semibold text-rose-700">← Kéo sang trái để xem toàn bộ ảnh AFTER</span>
              <span className="font-mono font-bold text-slate-800">Tỷ lệ vuốt: {sliderPosition}%</span>
              <span className="font-semibold text-emerald-700">Kéo sang phải để xem toàn bộ ảnh BEFORE →</span>
            </div>
          </div>
        )}
      </section>

  )
}