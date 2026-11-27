import { useAuthStore } from '../../../store/authStore'
import { apiClient } from '../../../api/client'
import React, { useState, useEffect, useRef } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { AIDetectionItem } from './types'

export interface MissionViewportProps {
  isPlaying: boolean
  setIsPlaying: (value: boolean) => void
  playbackSpeed: number
  currentTimeMs: number
  onTimeChange: (value: number) => void
  onDuration: (value: number) => void
  viewerMode: 'ORTHO' | 'GIS_MAP'
  corridorMapContainerRef: React.RefObject<HTMLDivElement | null>
  isAiOverlayVisible: boolean
  detections: AIDetectionItem[]
  selectedDetectionId: string | null
  onSelectDetection: (item: AIDetectionItem) => void
  selectedItem?: AIDetectionItem | null
}

export const MissionViewport: React.FC<MissionViewportProps> = ({
  viewerMode,
  corridorMapContainerRef,
  isAiOverlayVisible,
  detections,
  selectedDetectionId,
  onSelectDetection,
  selectedItem, isPlaying, setIsPlaying, playbackSpeed, currentTimeMs, onTimeChange, onDuration
}) => {
  const activeItem = selectedItem || detections.find((d) => d.id === selectedDetectionId) || null
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({})

  const handleImageError = (id: string) => {
    setImageErrorMap((prev) => ({ ...prev, [id]: true }))
  }

  const epoch = useAuthStore(state => state.authEpoch)
  const fileId = activeItem?.frameFileId
  const fileVersion = activeItem?.frameFileVersion
  const imageKey = `${epoch}:${fileId}:${fileVersion}`
  const [frame, setFrame] = useState<{ key: string; url: string } | null>(null)
  const [frameError, setFrameError] = useState('')
  useEffect(() => {
    const controller = new AbortController(); let objectUrl = ''
    setFrame(null); setFrameError('')
    if (!fileId || !fileVersion) return () => controller.abort()
    apiClient.get<Blob>(`/files/${encodeURIComponent(fileId)}/content`, {responseType:'blob',signal:controller.signal}).then(response => {
      if (controller.signal.aborted) return
      if (!['image/jpeg','image/png'].includes(response.data.type.split(';')[0])) throw new Error('Không phải ảnh')
      objectUrl = URL.createObjectURL(response.data); setFrame({key:imageKey,url:objectUrl})
    }).catch(() => { if (!controller.signal.aborted) setFrameError('Không thể tải ảnh nguồn trong phiên và quyền hiện tại.') })
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [epoch, fileId, fileVersion])
  const frameUrl = frame?.key === imageKey ? frame.url : ''
  const isCurrentImgError = activeItem ? imageErrorMap[activeItem.id] : false

  const video = useRef<HTMLVideoElement>(null)
  const videoId = activeItem?.sourceVideoFileId
  const [videoError, setVideoError] = useState('')
  useEffect(() => { setVideoError(''); setIsPlaying(false) }, [epoch, videoId, setIsPlaying])
  useEffect(() => {
    const element = video.current
    if (!element) return
    element.playbackRate = playbackSpeed
    if (isPlaying) void element.play().catch(() => { setVideoError('Không phát được video nguồn trong phiên hiện tại.'); setIsPlaying(false) })
    else element.pause()
  }, [isPlaying, playbackSpeed, videoId, viewerMode, setIsPlaying])
  useEffect(() => {
    if (video.current && Math.abs(video.current.currentTime * 1000 - currentTimeMs) > 300) video.current.currentTime = currentTimeMs / 1000
  }, [currentTimeMs])
  useEffect(() => {
    if (activeItem) onTimeChange(activeItem.timestampMs || 0)
  }, [activeItem?.id, onTimeChange])

  return (
    <div className="relative w-full aspect-[16/10] bg-slate-900 overflow-hidden select-none group">
      {viewerMode === 'GIS_MAP' ? (
        <div className="w-full h-full relative">
          <div ref={corridorMapContainerRef} className="w-full h-full" />
          <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-md px-3.5 py-2 rounded-xl text-white font-mono text-[11px] border border-white/10 z-10 pointer-events-none shadow-lg">
            <div className="flex items-center gap-1.5 font-bold text-[#C9A227]">
              <Icon name="flight_takeoff" size={14} />
              <span>Hành lang bay Drone ({activeItem?.stationing ? `Lý trình ${activeItem.stationing}` : "Toàn tuyến"})</span>
            </div>
            <div className="text-slate-300 text-[10px] mt-0.5">
              {detections.length} điểm phát hiện AI được ghim trực tiếp theo tọa độ WGS84 • Bấm marker để xem chi tiết
            </div>
          </div>
        </div>
      ) : activeItem ? (
        <>
          {(!frameUrl || isCurrentImgError) && <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-400 gap-2"><Icon name="image_not_supported" size={32} /><p className="text-xs">{frameError || 'Chưa có bằng chứng hình ảnh được phép đọc.'}</p></div>}
          {/* Ảnh trích xuất không ảnh Drone thực tế (Nếu load thành công sẽ phủ lên nền) */}
          {!isCurrentImgError && frameUrl && (
            <img
              key={activeItem.id}
              alt={`Khung hình trích xuất mặt đường ${activeItem.code}`}
              className="w-full h-full object-cover transition-opacity duration-300 animate-in fade-in"
              src={frameUrl}
              onError={() => handleImageError(activeItem.id)}
            />
          )}

          {videoId && <video key={`${epoch}:${videoId}`} ref={video}
            src={`/api/v1/files/${encodeURIComponent(videoId)}/content`} poster={frameUrl || undefined}
            className="absolute inset-0 w-full h-full object-cover" playsInline preload="metadata"
            onLoadedMetadata={e => { onDuration(Number.isFinite(e.currentTarget.duration) ? Math.max(1, e.currentTarget.duration * 1000) : 1); e.currentTarget.currentTime = (activeItem.timestampMs || 0) / 1000 }}
            onTimeUpdate={e => onTimeChange(e.currentTarget.currentTime * 1000)}
            onEnded={() => setIsPlaying(false)}
            onError={() => { setVideoError('Không tải được video nguồn trong phiên hiện tại.'); setIsPlaying(false) }} />}
          {videoError && <p role="alert" className="absolute bottom-10 left-3 text-xs text-white bg-slate-900">{videoError}</p>}
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
          {isAiOverlayVisible && Math.abs(currentTimeMs - (activeItem.timestampMs || 0)) < 300 && activeItem.bbox && (
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
              <div
                className={`absolute -bottom-6 right-0 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-medium shadow border whitespace-nowrap flex items-center gap-1 ${
                  activeItem.status === 'APPROVED'
                    ? 'bg-slate-900/95 text-emerald-300 border-emerald-600/70'
                    : 'bg-slate-900/95 text-amber-300 border-slate-700/60'
                }`}
              >
                <Icon
                  name={activeItem.status === 'APPROVED' ? 'check_circle' : 'straighten'}
                  size={12}
                  className={activeItem.status === 'APPROVED' ? 'text-emerald-400' : 'text-amber-400'}
                />
                <span>{activeItem.bbox?.dims || 'Chờ đo thực tế'}</span>
              </div>
            </div>
          )}

          {/* Tâm ngắm trắc địa Drone Nadir Reticle */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
            <div className="w-12 h-12 border border-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>

          {/* Thông tin trích xuất trắc địa góc dưới bên trái */}
          <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-[11px] font-mono pointer-events-none shadow-md border border-slate-700/60">
            <Icon name="place" size={13} className="text-[#C9A227]" />
            <span className="text-slate-200">{activeItem.stationing}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">{activeItem.lane}</span>
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
            Vui lòng bấm vào một khiếm khuyết trong <strong>Danh sách phát hiện AI</strong> bên phải để trích xuất khung ảnh độ phân giải cao và khung nhận diện trắc địa.
          </p>
        </div>
      )}
    </div>
  )
}
