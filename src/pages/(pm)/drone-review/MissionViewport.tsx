import React, { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { AIDetectionItem } from './types'

export interface MissionViewportProps {
  viewerMode: 'ORTHO' | 'GIS_MAP'
  corridorMapContainerRef: React.RefObject<HTMLDivElement | null>
  isAiOverlayVisible: boolean
  detections: AIDetectionItem[]
  selectedDetectionId: string | null
  onSelectDetection: (item: AIDetectionItem) => void
  selectedItem?: AIDetectionItem | null
}

// Map hình ảnh trích xuất mặt đường phân giải cao (sử dụng các URL ổn định 100%)
const DEFECT_IMAGE_MAP: Record<string, string> = {
  'DET-01': 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1200&auto=format&fit=crop&q=80', // Ổ gà sâu
  'DET-02': 'https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?w=1200&auto=format&fit=crop&q=80', // Vết nứt dọc
  'DET-03': 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=1200&auto=format&fit=crop&q=80', // Vỡ mép thảm
  'DET-04': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80', // Nước phản xạ
  'DET-05': 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=1200&auto=format&fit=crop&q=80', // Nứt chéo khe co giãn
  'DET-06': 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=1200&auto=format&fit=crop&q=80', // Bong tróc vi mô
  'DET-07': 'https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?w=1200&auto=format&fit=crop&q=80', // Hằn lún sống trâu
  'DET-08': 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1200&auto=format&fit=crop&q=80', // Nứt ngang
}

export const MissionViewport: React.FC<MissionViewportProps> = ({
  viewerMode,
  corridorMapContainerRef,
  isAiOverlayVisible,
  detections,
  selectedDetectionId,
  onSelectDetection,
  selectedItem
}) => {
  const activeItem = selectedItem || detections.find((d) => d.id === selectedDetectionId) || null
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({})

  const handleImageError = (id: string) => {
    setImageErrorMap((prev) => ({ ...prev, [id]: true }))
  }

  const isCurrentImgError = activeItem ? imageErrorMap[activeItem.id] : false

  return (
    <div className="relative w-full aspect-[16/10] bg-slate-900 overflow-hidden select-none group">
      {viewerMode === 'GIS_MAP' ? (
        <div className="w-full h-full relative">
          <div ref={corridorMapContainerRef} className="w-full h-full" />
          <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-md px-3.5 py-2 rounded-xl text-white font-mono text-[11px] border border-white/10 z-10 pointer-events-none shadow-lg">
            <div className="flex items-center gap-1.5 font-bold text-[#C9A227]">
              <Icon name="flight_takeoff" size={14} />
              <span>Hành lang bay Drone 6.0 km (Km 1024+000 → Km 1030+000)</span>
            </div>
            <div className="text-slate-300 text-[10px] mt-0.5">
              8 điểm phát hiện AI được ghim trực tiếp theo tọa độ WGS84 • Bấm marker để xem chi tiết
            </div>
          </div>
        </div>
      ) : activeItem ? (
        <>
          {/* Lớp nền bề mặt thảm bê tông nhựa (Asphalt Road Surface Fallback) - Không bao giờ bị đen kịt */}
          <div className="absolute inset-0 bg-[#2b2e35] overflow-hidden pointer-events-none">
            {/* Vân hạt cốt liệu đá bê tông nhựa C19 */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'radial-gradient(#475569 1px, transparent 1px), radial-gradient(#1e293b 1px, transparent 1px)',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 8px 8px'
              }}
            ></div>

            {/* Vạch sơn tim đường phản quang trắc địa màu vàng */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-3 border-r-4 border-dashed border-amber-400/50"></div>

            {/* Vạch sơn mép lề đường màu trắng */}
            <div className="absolute top-0 bottom-0 left-12 w-1.5 bg-white/40"></div>
            <div className="absolute top-0 bottom-0 right-12 w-1.5 bg-white/40"></div>

            {/* Mô phỏng hình học khiếm khuyết bên trong Bounding Box khi ảnh chưa tải */}
            {isCurrentImgError && activeItem.bbox && (
              <div
                style={{
                  top: activeItem.bbox?.top || '30%',
                  left: activeItem.bbox?.left || '30%',
                  width: activeItem.bbox?.width || '30%',
                  height: activeItem.bbox?.height || '30%'
                }}
                className="absolute bg-slate-950/60 rounded flex items-center justify-center border border-white/15"
              >
                <div className="text-center p-2">
                  <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-slate-800/80 border border-slate-600 flex items-center justify-center text-amber-400">
                    <Icon name="road" size={18} />
                  </div>
                  <span className="text-[10px] text-slate-300 block font-mono">Bề mặt hư hỏng {activeItem.type}</span>
                  <span className="text-[9px] text-slate-400">{activeItem.metrics?.area || activeItem.metrics?.length || ''}</span>
                </div>
              </div>
            )}
          </div>

          {/* Ảnh trích xuất không ảnh Drone thực tế (Nếu load thành công sẽ phủ lên nền) */}
          {!isCurrentImgError && (
            <img
              key={activeItem.id}
              alt={`Khung hình trích xuất mặt đường ${activeItem.code}`}
              className="w-full h-full object-cover transition-opacity duration-300 animate-in fade-in"
              src={
                DEFECT_IMAGE_MAP[activeItem.id] ||
                'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1200&auto=format&fit=crop&q=80'
              }
              onError={() => handleImageError(activeItem.id)}
            />
          )}

          {/* Vignette Shadow Overlay trắc địa */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none"></div>

          {/* Huy hiệu thông tin trích xuất góc trên bên trái */}
          <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-3 py-1.5 text-white flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-xs font-bold text-[#FEF08A]">{activeItem.code}</span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs font-semibold">{activeItem.stationing}</span>
            <span className="text-slate-400 text-xs">({activeItem.lane})</span>
            {isCurrentImgError && (
              <span className="text-[10px] text-amber-300 bg-amber-950/70 border border-amber-700/60 px-1.5 py-0.5 rounded">
                Mô phỏng trắc địa
              </span>
            )}
          </div>

          {/* AI BOUNDING BOX: Hộp giới hạn phát hiện khiếm khuyết của Road-YOLOv9 */}
          {isAiOverlayVisible && activeItem.bbox && (
            <div
              key={`bbox-${activeItem.id}`}
              onClick={() => onSelectDetection(activeItem)}
              style={{
                top: activeItem.bbox?.top || '30%',
                left: activeItem.bbox?.left || '30%',
                width: activeItem.bbox?.width || '30%',
                height: activeItem.bbox?.height || '30%',
                borderColor: activeItem.bbox?.borderColor || '#C9A227'
              }}
              className={`absolute border-2 rounded-lg transition-all cursor-pointer shadow-[0_0_24px_rgba(201,162,39,0.7)] ring-2 ring-white/90 scale-101 ${
                activeItem.bbox?.isDashed ? 'border-dashed' : 'border-solid'
              }`}
            >
              {/* 4 Góc ngắm trắc địa (Precision Corner Marks) */}
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white"></div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white"></div>
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white"></div>
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white"></div>

              {/* Tag nhãn AI phía trên Bounding Box */}
              <div
                style={{ backgroundColor: activeItem.bbox?.borderColor || '#C9A227' }}
                className="absolute -top-7 left-0 text-white px-2 py-0.5 rounded shadow flex items-center gap-1.5 whitespace-nowrap text-[11px] font-mono font-bold"
              >
                <Icon name="auto_awesome" size={13} className="text-white" />
                <span>
                  [AI {activeItem.code}] {activeItem.type} • {activeItem.confidence}%
                </span>
              </div>

              {/* Kích thước hình học đo đạc phía dưới */}
              <div className="absolute -bottom-6 right-0 bg-slate-900/95 backdrop-blur-md text-white px-2 py-0.5 rounded font-mono text-[10px] shadow border border-slate-700/60 whitespace-nowrap">
                {activeItem.bbox?.dims || ''}
              </div>
            </div>
          )}

          {/* Tâm ngắm trắc địa Drone Nadir Reticle */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
            <div className="w-12 h-12 border border-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>

          {/* Telemetry HUD Overlay góc dưới bên trái */}
          <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center gap-2.5 text-[11px] font-mono pointer-events-none shadow-md border border-slate-700/60">
            <span className="flex items-center gap-1 text-sky-300">
              <Icon name="place" size={13} />
              16.0544° N, 108.2022° E
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-200">{activeItem.stationing}</span>
            <span className="text-slate-500">|</span>
            <span>AGL: 45.0m</span>
            <span className="text-slate-500">|</span>
            <span className="text-[#FEF08A] font-bold">GSD: 0.35 cm/px</span>
          </div>
        </>
      ) : (
        /* Màn hình chờ khi chưa chọn lỗi nào */
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-900">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-[#C9A227] mb-3 shadow-lg">
            <Icon name="touch_app" size={32} />
          </div>
          <h4 className="text-white text-sm font-bold mb-1">Chưa trích xuất khung hình</h4>
          <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
            Vui lòng bấm vào một khiếm khuyết trong <strong>Danh sách phát hiện AI</strong> bên phải để trích xuất khung ảnh độ phân giải cao và Bounding Box trắc địa.
          </p>
        </div>
      )}
    </div>
  )
}
