import React from 'react'
import type { Rpt06RiskSegment } from './types'

export interface RiskDeteriorationSectionProps {
  loading?: boolean
  error?: string
  warnings?: string[]
  hasMapGeometry?: boolean
  segments: Rpt06RiskSegment[]
  activeSegmentId: string
  activeSegment?: Rpt06RiskSegment
  mapContainerRef: React.RefObject<HTMLDivElement | null>
  mapLayer: 'satellite' | 'vector'
  setMapLayer: (l: 'satellite' | 'vector') => void
  onFocusSegment: (segment: Rpt06RiskSegment) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onFitBounds: () => void
  projectName: string
}

export const RiskDeteriorationSection: React.FC<RiskDeteriorationSectionProps> = ({
  loading,
  error,
  warnings = [],
  hasMapGeometry,
  segments,
  activeSegmentId,
  mapContainerRef,
  mapLayer,
  setMapLayer,
  onFocusSegment,
  onZoomIn,
  onZoomOut,
  onFitBounds,
  projectName
}) => {
  return (
    <section className="space-y-4">
      {/* Header card */}
      <div className="relative bg-white rounded-[20px] border border-[#E2E5E9] shadow-2xs overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1E40AF] via-[#C9A227] to-slate-200" />
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C9A227] ring-4 ring-[#C9A227]/20" />
              <h2 className="font-sansation text-lg font-bold text-slate-900">
                Bình đồ tuyến và phân đoạn kỹ thuật
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Dự án: <span className="font-semibold text-slate-700">{projectName || 'Chưa chọn dự án'}</span> · Hệ tọa độ WGS84 / UTM Zone 48N
            </p>
          </div>

          {/* Map Layer switcher */}
          <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setMapLayer('satellite')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                mapLayer === 'satellite'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] text-[#C9A227]">satellite_alt</span>
              <span>Vệ tinh</span>
            </button>
            <button
              type="button"
              onClick={() => setMapLayer('vector')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                mapLayer === 'vector'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] text-[#1E40AF]">map</span>
              <span>Bản đồ số</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div role="alert" className="flex items-start gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs">
          <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0 mt-0.5">error</span>
          <div>
            <p className="font-bold">Không tải được tuyến và phân đoạn.</p>
            <p className="mt-0.5 text-rose-700">{error}</p>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="relative h-[420px] rounded-[20px] overflow-hidden border border-[#E2E5E9] shadow-2xs bg-slate-900">
        <div ref={mapContainerRef} className={`w-full h-full ${hasMapGeometry ? '' : 'invisible'}`} />

        {!hasMapGeometry && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-slate-400 bg-slate-900/90 backdrop-blur-xs">
            <span className="material-symbols-outlined text-[40px] text-slate-500 mb-2">
              {loading ? 'hourglass_top' : error ? 'map_off' : 'explore_off'}
            </span>
            <p className="text-sm font-semibold text-slate-200">
              {loading
                ? 'Đang tải bản đồ tuyến…'
                : error
                ? 'Chưa thể hiển thị bản đồ tuyến.'
                : 'Chưa có hình học phù hợp để hiển thị bản đồ tuyến.'}
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              {loading
                ? 'Đang đọc tọa độ tim tuyến WGS84 và các phân đoạn từ máy chủ...'
                : 'Bản đồ yêu cầu tuyến đường có gói hình học hoặc phiên bản tuyến đã công bố.'}
            </p>
          </div>
        )}

        {/* Map Control Buttons */}
        <div className="absolute bottom-5 right-5 flex flex-col gap-2 z-10">
          <button
            type="button"
            disabled={!hasMapGeometry}
            onClick={onZoomIn}
            aria-label="Phóng to"
            title="Phóng to bản đồ"
            className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-xs border border-slate-200 shadow-md text-slate-700 hover:text-slate-900 hover:bg-white flex items-center justify-center transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
          <button
            type="button"
            disabled={!hasMapGeometry}
            onClick={onZoomOut}
            aria-label="Thu nhỏ"
            title="Thu nhỏ bản đồ"
            className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-xs border border-slate-200 shadow-md text-slate-700 hover:text-slate-900 hover:bg-white flex items-center justify-center transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">remove</span>
          </button>
          <button
            type="button"
            disabled={!hasMapGeometry}
            onClick={onFitBounds}
            aria-label="Xem toàn tuyến"
            title="Xem toàn bộ tim tuyến"
            className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-xs border border-slate-200 shadow-md text-slate-700 hover:text-[#C9A227] hover:bg-white flex items-center justify-center transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">filter_center_focus</span>
          </button>
        </div>
      </div>

      {/* Warnings / Coordinate Info */}
      {!!warnings.length && (
        <details className="text-xs text-slate-600 bg-amber-50/60 border border-amber-200/80 rounded-xl p-3">
          <summary className="font-bold text-amber-900 cursor-pointer flex items-center gap-1.5 select-none">
            <span className="material-symbols-outlined text-[16px] text-[#C9A227]">info</span>
            <span>Thông tin hiển thị bản đồ ({warnings.length} lưu ý)</span>
          </summary>
          <div className="mt-2 space-y-1 pl-5 border-l-2 border-amber-300">
            {warnings.map((w, i) => (
              <p key={i} className="text-slate-700">{w}</p>
            ))}
          </div>
        </details>
      )}

      {/* Segments Table */}
      <div className="bg-white border border-[#E2E5E9] rounded-[20px] shadow-2xs overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#EDEFF2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#1E40AF]">segment</span>
            <h3 className="font-sansation font-bold text-slate-900 text-sm">
              Danh sách phân đoạn kỹ thuật {loading ? '' : `(${segments.length})`}
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Số liệu lý trình chuẩn công trình từ gói hình học công bố
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FA] text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-[#EDEFF2]">
              <tr>
                <th className="py-3 px-4">Tên đoạn</th>
                <th className="py-3 px-4">Lý trình</th>
                <th className="py-3 px-4">Chiều dài</th>
                <th className="py-3 px-4 text-center">Định vị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEFF2]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500" role="status">
                    <div className="inline-flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] animate-spin text-[#8C6D1F]">progress_activity</span>
                      <span>Đang tải phân đoạn…</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-rose-700">
                    <div className="inline-flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-rose-500">error</span>
                      <span>Không tải được phân đoạn.</span>
                    </div>
                  </td>
                </tr>
              ) : !segments.length ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    <div className="inline-flex flex-col items-center gap-1.5">
                      <span className="material-symbols-outlined text-[24px] text-slate-400">inbox</span>
                      <span>Chưa có phân đoạn đã công bố trong phạm vi này.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                segments.map((s) => {
                  const isSelected = s.id === activeSegmentId
                  return (
                    <tr
                      key={s.id}
                      className={`transition-colors hover:bg-slate-50/80 ${
                        isSelected ? 'bg-amber-50/70 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-slate-900 font-medium">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#C9A227] ring-2 ring-[#C9A227]/30' : 'bg-[#1E40AF]'}`} />
                          <span>{s.section_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {s.chainage_display}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {((s.end_km_num - s.start_km_num) * 1000).toLocaleString('vi-VN', {
                          maximumFractionDigits: 2
                        })}{' '}
                        m
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          disabled={s.coordinates.length < 2}
                          onClick={() => onFocusSegment(s)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                            isSelected
                              ? 'bg-[#C9A227] text-white border-[#C9A227] shadow-2xs hover:bg-[#8C6D1F]'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                          title={
                            s.coordinates.length < 2
                              ? 'Chưa hỗ trợ hệ tọa độ của đoạn'
                              : 'Phóng to toàn bộ đoạn trên bản đồ'
                          }
                        >
                          <span className="material-symbols-outlined text-[14px]">my_location</span>
                          <span>Xem đoạn</span>
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
    </section>
  )
}
