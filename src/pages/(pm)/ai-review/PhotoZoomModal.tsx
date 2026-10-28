import React, { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import type { TriageCase } from './types'

export interface PhotoZoomModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCase: TriageCase
}

export const PhotoZoomModal: React.FC<PhotoZoomModalProps> = ({
  isOpen,
  onClose,
  selectedCase,
}) => {
  // Chế độ xem trong Modal: 'SINGLE' (Ảnh đơn) hoặc 'SIDE_BY_SIDE' (So sánh song song)
  const [viewMode, setViewMode] = useState<'SINGLE' | 'SIDE_BY_SIDE'>('SINGLE')

  if (!isOpen) return null

  const severityText =
    selectedCase.severity === 'CRITICAL'
      ? 'Khẩn cấp (Cấp 4)'
      : selectedCase.severity === 'HIGH'
      ? 'Nghiêm trọng (Cấp 3)'
      : selectedCase.severity === 'MEDIUM'
      ? 'Vừa (Cấp 2)'
      : 'Nhẹ (Cấp 1)'

  const urgencyText =
    selectedCase.urgency === 'EMERGENCY'
      ? 'Đặc biệt khẩn cấp'
      : selectedCase.urgency === 'URGENT'
      ? 'Khẩn cấp (24 - 48 giờ)'
      : 'Bình thường'

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
      <div className={`bg-slate-900 rounded-2xl ${viewMode === 'SIDE_BY_SIDE' ? 'max-w-5xl' : 'max-w-3xl'} w-full p-4 shadow-2xl border border-slate-700 space-y-3 duration-200`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-white">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-brand-gold">{selectedCase.code}</span>
            <span className="text-xs text-slate-300">
              • {selectedCase.defect_title} ({selectedCase.stationing})
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Nút chuyển chế độ xem: Đơn vs Song song */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-800 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('SINGLE')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'SINGLE'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon name="image" size={13} />
                <span>Xem ảnh đơn</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('SIDE_BY_SIDE')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'SIDE_BY_SIDE'
                    ? 'bg-brand-gold text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon name="compare" size={13} />
                <span>So sánh song song (Side-by-Side)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <Icon name="close" size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body: Single View or Side-by-Side View */}
        {viewMode === 'SINGLE' ? (
          <div className="w-full h-[450px] rounded-xl overflow-hidden bg-black flex items-center justify-center relative">
            <img
              src={selectedCase.image_url}
              alt="Ảnh phóng to chi tiết"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-white font-mono text-xs border border-white/10 flex items-center gap-2">
              <Icon name="location_on" size={13} className="text-brand-gold" />
              <span>{selectedCase.gps.lat}° N, {selectedCase.gps.lng}° E</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-[450px]">
            {/* Cột trái: Ảnh chụp hiện trường phóng to */}
            <div className="flex flex-col h-full bg-black rounded-xl overflow-hidden border border-slate-700 relative">
              <div className="p-2 bg-slate-950/90 text-white text-xs font-bold border-b border-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-brand-gold">
                  <Icon name="photo_camera" size={14} />
                  <span>Ảnh chụp hiện trường tiếp nhận</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{selectedCase.created_at}</span>
              </div>
              <div className="flex-1 overflow-hidden flex items-center justify-center bg-black">
                <img
                  src={selectedCase.image_url}
                  alt="Ảnh hiện trường"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-2 bg-slate-950/90 text-[11px] text-slate-300 border-t border-slate-800 flex items-center justify-between">
                <span>GPS: {selectedCase.gps.lat}°, {selectedCase.gps.lng}°</span>
                <span className="text-amber-400">
                  {selectedCase.source === 'DRONE_AI' ? 'Thiết bị bay Drone RTK' : 'Thiết bị di động công dân'}
                </span>
              </div>
            </div>

            {/* Cột phải: Bản đồ số / Thông số đối chiếu vị trí */}
            <div className="flex flex-col h-full bg-slate-800/80 rounded-xl overflow-hidden border border-slate-700">
              <div className="p-2 bg-slate-950/90 text-white text-xs font-bold border-b border-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Icon name="location_on" size={14} />
                  <span>Vị trí trên tuyến đường &amp; Hồ sơ đối chiếu</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{selectedCase.stationing}</span>
              </div>

              <div className="flex-1 p-3.5 space-y-3 overflow-y-auto text-xs text-white">
                {/* Thông số vị trí công trình */}
                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-700 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Định vị công trình đường bộ:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Dự án:</span>
                      <span className="font-semibold text-slate-200">{selectedCase.project_name || 'Dự án bảo hành'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Lý trình:</span>
                      <span className="font-semibold text-slate-200">{selectedCase.stationing}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Làn đường:</span>
                      <span className="font-semibold text-slate-200">{selectedCase.lane}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Tọa độ GPS:</span>
                      <span className="font-mono text-brand-gold">{selectedCase.gps.lat}°, {selectedCase.gps.lng}°</span>
                    </div>
                  </div>
                </div>

                {/* Thông số thẩm định kỹ thuật */}
                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-700 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Thông số thẩm định:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Mức độ nghiêm trọng:</span>
                      <span className="font-bold text-amber-300">{severityText}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Tính khẩn cấp:</span>
                      <span className="font-bold text-amber-300">{urgencyText}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Kích thước diện tích:</span>
                      <span className="font-semibold text-slate-200">
                        {selectedCase.area_sqm > 0 ? `${selectedCase.area_sqm} m²` : 'Chưa có số đo (Chờ đo đạc)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Độ sâu lớn nhất:</span>
                      <span className="font-semibold text-slate-200">
                        {selectedCase.max_depth_cm > 0 ? `${selectedCase.max_depth_cm} cm` : 'Chưa có số đo (Chờ đo đạc)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Phản ánh ban đầu */}
                {selectedCase.description && (
                  <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-700 text-[11px] space-y-1">
                    <span className="text-slate-500 block">Mô tả hiện trường:</span>
                    <p className="italic text-slate-300">"{selectedCase.description}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1 border-t border-slate-800">
          <span>
            {selectedCase.source === 'DRONE_AI'
              ? 'Độ phân giải thực: 0.3 cm/px • Thiết bị bay Drone RTK'
              : `Ảnh phản ánh từ người dân • Thiết bị di động • Tọa độ: ${selectedCase.gps.lat}° N, ${selectedCase.gps.lng}° E`}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
