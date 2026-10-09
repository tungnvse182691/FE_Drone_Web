import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Rpt06RiskSegment } from './types'

export interface RiskDeteriorationSectionProps {
  segments: Rpt06RiskSegment[]
  activeSegmentId: string
  activeSegment: Rpt06RiskSegment | undefined
  mapContainerRef: React.RefObject<HTMLDivElement | null>
  mapLayer: 'satellite' | 'vector'
  setMapLayer: (l: 'satellite' | 'vector') => void
  onFocusSegment: (segment: Rpt06RiskSegment) => void
  onToggleSurveyPlan: (segmentId: string) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onFitBounds: () => void
  projectName: string
}

export const RiskDeteriorationSection: React.FC<RiskDeteriorationSectionProps> = ({
  segments,
  activeSegmentId,
  activeSegment,
  mapContainerRef,
  mapLayer,
  setMapLayer,
  onFocusSegment,
  onToggleSurveyPlan,
  onZoomIn,
  onZoomOut,
  onFitBounds,
  projectName
}) => {
  const navigate = useNavigate()

  const criticalCount = segments.filter((s) => s.risk_level === 'CRITICAL').length
  const watchCount = segments.filter((s) => s.risk_level === 'WATCH').length
  const moderateCount = segments.filter((s) => s.risk_level === 'MODERATE').length

  return (
    <div className="space-y-4">
      {/* SECTION HEADER & CONTROL BAR */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-brand-gold flex items-center justify-center shrink-0 border border-amber-200/60">
            <span className="material-symbols-outlined text-[20px]">warning</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Bản đồ & Phân tích nguy cơ suy thoái mặt đường theo lý trình (RPT-06)
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {projectName}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              So sánh đa kỳ (Temporal Epoch) giữa đợt bay gốc Baseline và hiện tại • Đánh giá các đoạn nguy cơ cao để lập kế hoạch bay khảo sát
            </p>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
              <div className="flex items-center gap-1">
                <div className="w-3.5 h-1 bg-slate-400 rounded-full"></div>
                <span>Tim tuyến dự án</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3.5 h-1.5 bg-rose-500 rounded-full shadow-xs"></div>
                <span>Đoạn nguy cơ rất cao</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3.5 h-1.5 bg-amber-500 rounded-full"></div>
                <span>Đoạn cần theo dõi</span>
              </div>
            </div>
          </div>
        </div>

        {/* RISK BADGES & LAYER SWITCH */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              Rất cao ({criticalCount})
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Theo dõi ({watchCount})
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Trung bình ({moderateCount})
            </span>
          </div>

          <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          {/* Map Layer Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setMapLayer('satellite')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                mapLayer === 'satellite'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">satellite_alt</span>
              <span>Ảnh vệ tinh</span>
            </button>
            <button
              type="button"
              onClick={() => setMapLayer('vector')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                mapLayer === 'vector'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">map</span>
              <span>Bản đồ số</span>
            </button>
          </div>
        </div>
      </div>

      {/* GIS MAP CONTAINER WITH FLOATING HUD */}
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-xs">
        <div className="relative w-full h-[360px] bg-slate-950 overflow-hidden select-none">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Floating Map HUD Card */}
          {activeSegment && (
            <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-700 text-white text-xs space-y-2 max-w-sm shadow-xl">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div>
                  <span className="font-bold text-amber-400 text-sm block">
                    {activeSegment.chainage_display}
                  </span>
                  <span className="text-slate-300 text-[11px]">{activeSegment.section_name}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    activeSegment.risk_level === 'CRITICAL'
                      ? 'bg-rose-600 text-white'
                      : activeSegment.risk_level === 'WATCH'
                      ? 'bg-amber-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {activeSegment.risk_level_label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="bg-slate-800/60 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Diện tích hư hỏng</span>
                  <span className="font-bold font-mono text-rose-300">{activeSegment.damaged_area_m2} m²</span>
                </div>
                <div className="bg-slate-800/60 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Tốc độ suy thoái</span>
                  <span className="font-bold font-mono text-amber-300">+{activeSegment.deterioration_rate_pct}% / kỳ</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-300 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Mức độ khẩn cấp (Urgency):</span>
                  <span className="font-semibold text-rose-400">
                    {activeSegment.risk_level === 'CRITICAL' ? 'Cấp bách' : activeSegment.risk_level === 'WATCH' ? 'Cần theo dõi' : 'Bình thường'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Hạn cam kết xử lý (SLA):</span>
                  <span className="font-semibold text-rose-400">{activeSegment.sla_remaining}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 truncate">{activeSegment.defect_summary}</span>
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/pm/surveys/create?project=${activeSegment.project_id}&startKm=${activeSegment.start_km_num}&endKm=${activeSegment.end_km_num}`
                    )
                  }
                  className="px-2.5 py-1 rounded bg-brand-gold text-slate-900 font-bold hover:bg-amber-400 transition text-[11px] shrink-0 cursor-pointer flex items-center gap-1 shadow-xs"
                  title="Chuyển sang trang Lập yêu cầu bay với phân đoạn này"
                >
                  <span className="material-symbols-outlined text-[13px]">flight_takeoff</span>
                  <span>Lập đợt bay</span>
                </button>
              </div>
            </div>
          )}

          {/* Map Controls */}
          <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1.5 shadow-md">
            <button
              onClick={onZoomIn}
              type="button"
              className="w-8 h-8 bg-white hover:bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center text-sm font-bold transition shadow-xs cursor-pointer border border-slate-200"
              title="Phóng to"
            >
              +
            </button>
            <button
              onClick={onZoomOut}
              type="button"
              className="w-8 h-8 bg-white hover:bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center text-sm font-bold transition shadow-xs cursor-pointer border border-slate-200"
              title="Thu nhỏ"
            >
              -
            </button>
            <button
              onClick={onFitBounds}
              type="button"
              className="w-8 h-8 bg-white hover:bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center text-xs font-semibold transition shadow-xs cursor-pointer border border-slate-200"
              title="Căn giữa toàn tuyến"
            >
              <span className="material-symbols-outlined text-[16px]">crop_free</span>
            </button>
          </div>
        </div>
      </div>

      {/* RPT-06 DETERIORATION DATA TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-slate-700">analytics</span>
            <h3 className="text-sm font-bold text-slate-900">
              Danh sách phân đoạn rủi ro suy thoái kỹ thuật theo lý trình Km ({segments.length} đoạn)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Định mức kỹ thuật: TCVN 8819:2011 • TCVN 8864
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Lý trình &amp; Phân đoạn</th>
                <th className="py-3 px-4">Mức độ rủi ro</th>
                <th className="py-3 px-4">Khối lượng hư hỏng</th>
                <th className="py-3 px-4">Diễn biến đa kỳ (So sánh Baseline)</th>
                <th className="py-3 px-4">Đánh giá kỹ thuật &amp; SLA</th>
                <th className="py-3 px-4 text-center">Đưa vào kế hoạch bay</th>
                <th className="py-3 px-4 text-right">Định vị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {segments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Không có phân đoạn nguy cơ nào được ghi nhận cho dự án này.
                  </td>
                </tr>
              ) : (
                segments.map((seg) => {
                  const isSelected = seg.id === activeSegmentId
                  return (
                    <tr
                      key={seg.id}
                      onClick={() => onFocusSegment(seg)}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                        isSelected ? 'bg-amber-50/40 border-l-4 border-l-brand-gold' : ''
                      }`}
                    >
                      {/* Cột 1: Lý trình & Phân đoạn */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 font-mono text-xs flex items-center gap-1.5">
                          <span>{seg.chainage_display}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{seg.section_name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{seg.defect_summary}</div>
                      </td>

                      {/* Cột 2: Mức độ rủi ro */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                              seg.risk_level === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : seg.risk_level === 'WATCH'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {seg.risk_level === 'CRITICAL' ? 'RẤT CAO' : seg.risk_level === 'WATCH' ? 'THEO DÕI' : 'TRUNG BÌNH'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                          {seg.risk_level_label}
                        </div>
                      </td>

                      {/* Cột 3: Khối lượng hư hỏng kỹ thuật */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 font-mono text-xs">
                          {seg.damaged_area_m2} m²
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Nứt: <span className="font-mono">{seg.crack_length_m} m</span> • Sâu: <span className="font-mono">{seg.avg_depth_cm} cm</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {seg.open_defects_count} vị trí hư hỏng mở
                        </div>
                      </td>

                      {/* Cột 4: Diễn biến đa kỳ (So sánh Baseline) */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                            +{seg.deterioration_rate_pct}% / kỳ
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            (Tăng {seg.temporal_comparison.growth_pct.toFixed(0)}% so với gốc)
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 leading-snug">
                          {seg.temporal_comparison.severity_progression}
                        </div>
                      </td>

                      {/* Cột 5: Đánh giá kỹ thuật & SLA */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="text-[11px] text-slate-800 leading-snug">
                          {seg.recommended_action}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-rose-600">
                          <span className="material-symbols-outlined text-[13px]">alarm</span>
                          <span>Hạn xử lý: {seg.sla_remaining}</span>
                        </div>
                      </td>

                      {/* Cột 6: Đưa vào kế hoạch bay khảo sát định kỳ */}
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onToggleSurveyPlan(seg.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                              seg.survey_plan_suggested
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold hover:bg-amber-200'
                                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-300'
                            }`}
                            title="Đánh dấu phân đoạn này để đưa vào kế hoạch bay khảo sát định kỳ tiếp theo"
                          >
                            <span className="material-symbols-outlined text-[15px] text-brand-gold">
                              {seg.survey_plan_suggested ? 'check_box' : 'add_task'}
                            </span>
                            <span>{seg.survey_plan_suggested ? 'Đã đề xuất' : 'Đề xuất'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/pm/surveys/create?project=${seg.project_id}&startKm=${seg.start_km_num}&endKm=${seg.end_km_num}`
                              )
                            }
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-800 border border-slate-200 hover:border-amber-300 transition cursor-pointer flex items-center"
                            title="Chuyển ngay sang trang Tạo yêu cầu bay khảo sát với lý trình đoạn này"
                          >
                            <span className="material-symbols-outlined text-[16px]">flight_takeoff</span>
                          </button>
                        </div>
                      </td>

                      {/* Cột 7: Thao tác định vị */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onFocusSegment(seg)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                          title="Phóng to vị trí trên bản đồ vệ tinh"
                        >
                          <span className="material-symbols-outlined text-[18px]">my_location</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
