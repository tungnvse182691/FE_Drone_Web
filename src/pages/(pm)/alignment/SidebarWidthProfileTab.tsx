import React from 'react'
import { Sliders } from 'lucide-react'
import { SegmentItem } from './types'

export interface SidebarWidthProfileTabProps {
  segments: SegmentItem[]
  selectedSegmentId: string | null
  onUpdateSegmentWidth: (id: string, width: number) => void
  onUpdateAllWidths: (width: number) => void
}

export const SidebarWidthProfileTab: React.FC<SidebarWidthProfileTabProps> = ({
  segments,
  selectedSegmentId,
  onUpdateSegmentWidth,
  onUpdateAllWidths
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-brand-gold" />
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
                  ? 'bg-amber-50/40 border-brand-gold ring-1 ring-brand-gold/30 shadow-xs'
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
                      className="w-full h-8 pl-3 pr-10 bg-white rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-gold"
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
                            ? 'bg-brand-gold text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-brand-gold'
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
              className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-brand-gold text-slate-700 text-[10px] font-mono font-bold transition-all cursor-pointer"
            >
              Đồng loạt {wVal}m
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
