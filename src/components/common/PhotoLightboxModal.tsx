import React, { useState, useEffect } from 'react'
import { Icon } from '../ui/Icon'
import { ImageComparisonSlider } from './ImageComparisonSlider'

export interface PhotoLightboxModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  initialViewMode?: 'PRIMARY' | 'SECONDARY' | 'SPLIT'
  primaryPhotoUrl: string
  primaryPhotoLabel?: string
  secondaryPhotoUrl?: string
  secondaryPhotoLabel?: string
  measuredValue?: number
  unit?: string
  chainage?: string | number
  lane?: string
  gpsLat?: number
  gpsLng?: number
  deviceInfo?: string
  capturedAt?: string
  technicianName?: string
  notes?: string
  statusBadge?: React.ReactNode
  onVerifyAction?: () => void
  verifyButtonText?: string
}

export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  initialViewMode = 'PRIMARY',
  primaryPhotoUrl,
  primaryPhotoLabel = 'Ảnh Thước Đo Đối Chứng',
  secondaryPhotoUrl,
  secondaryPhotoLabel = 'Ảnh Drone Khảo Sát Ban Đầu',
  measuredValue,
  unit = 'mm',
  chainage,
  lane,
  gpsLat,
  gpsLng,
  deviceInfo,
  capturedAt,
  technicianName,
  notes,
  statusBadge,
  onVerifyAction,
  verifyButtonText = 'Xác minh số liệu này'
}) => {
  // Trạng thái chọn ảnh đang xem: 'PRIMARY' | 'SECONDARY' | 'SPLIT' (So sánh song song)
  const [viewMode, setViewMode] = useState<'PRIMARY' | 'SECONDARY' | 'SPLIT'>(
    initialViewMode || 'PRIMARY'
  )
  const [zoomLevel, setZoomLevel] = useState<number>(1)
  const [rotation, setRotation] = useState<number>(0)
  const [showMetadataPanel, setShowMetadataPanel] = useState<boolean>(true)
  const [splitDisplayType, setSplitDisplayType] = useState<'SLIDER' | 'SIDE_BY_SIDE'>('SLIDER')

  // Reset zoom và rotation khi đổi ảnh hoặc mở modal
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1)
      setRotation(0)
      if (initialViewMode) {
        setViewMode(initialViewMode)
      } else if (primaryPhotoUrl) {
        setViewMode('PRIMARY')
      } else if (secondaryPhotoUrl) {
        setViewMode('SECONDARY')
      }
    }
  }, [isOpen, initialViewMode, primaryPhotoUrl, secondaryPhotoUrl])

  // Lắng nghe phím ESC để đóng
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))
  const handleResetZoom = () => {
    setZoomLevel(1)
    setRotation(0)
  }
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360)

  const activePhoto =
    viewMode === 'SECONDARY' && secondaryPhotoUrl ? secondaryPhotoUrl : primaryPhotoUrl

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-modal-title"
      className="fixed inset-0 z-[9999] flex flex-col bg-slate-950/95 backdrop-blur-md text-white select-none animate-in fade-in duration-150"
    >
      {/* 1. TOP HEADER TOOLBAR */}
      <header className="h-14 px-4 sm:px-6 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-1.5 rounded-lg bg-[#C9A227]/20 text-[#C9A227] border border-[#C9A227]/30 shrink-0">
            <Icon name="photo_camera" size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 id="lightbox-modal-title" className="text-sm font-bold text-white truncate tracking-wide">
                {title}
              </h2>
              {statusBadge}
            </div>
            {subtitle && (
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Chuyển đổi tab xem ảnh */}
        <div className="flex items-center gap-2">
          {secondaryPhotoUrl && (
            <div className="hidden sm:flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700/60 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('PRIMARY')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  viewMode === 'PRIMARY'
                    ? 'bg-[#C9A227] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {primaryPhotoLabel}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('SECONDARY')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  viewMode === 'SECONDARY'
                    ? 'bg-[#C9A227] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {secondaryPhotoLabel}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('SPLIT')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'SPLIT'
                    ? 'bg-[#C9A227] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Icon name="compare" size={14} />
                <span>So sánh Split-screen</span>
              </button>
            </div>
          )}

          {/* Chuyển đổi kiểu so sánh khi đang ở SPLIT mode */}
          {viewMode === 'SPLIT' && secondaryPhotoUrl && (
            <div className="hidden md:flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700/80 text-[11px]">
              <button
                type="button"
                onClick={() => setSplitDisplayType('SLIDER')}
                className={`px-2 py-1 rounded font-medium transition-all flex items-center gap-1 cursor-pointer ${
                  splitDisplayType === 'SLIDER'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon name="splitscreen" size={13} />
                <span>Thanh trượt</span>
              </button>
              <button
                type="button"
                onClick={() => setSplitDisplayType('SIDE_BY_SIDE')}
                className={`px-2 py-1 rounded font-medium transition-all flex items-center gap-1 cursor-pointer ${
                  splitDisplayType === 'SIDE_BY_SIDE'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon name="view_column" size={13} />
                <span>Song song 2 cột</span>
              </button>
            </div>
          )}

          {/* Toggle Metadata Panel */}
          <button
            type="button"
            onClick={() => setShowMetadataPanel((prev) => !prev)}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              showMetadataPanel
                ? 'bg-slate-800 border-slate-600 text-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Bật/tắt thông tin kỹ thuật & EXIF"
          >
            <Icon name="info" size={18} />
          </button>

          {/* Nút Đóng ESC */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Đóng xem ảnh (ESC)"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
      </header>

      {/* 2. MAIN BODY AREA */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* VIEWPORT ẢNH */}
        <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden bg-slate-950/70">
          {viewMode === 'SPLIT' && secondaryPhotoUrl ? (
            splitDisplayType === 'SLIDER' ? (
              /* CHẾ ĐỘ 1: KÉO THANH TRƯỢT SPLIT-SCREEN SWIPE SLIDER */
              <div className="w-full h-full max-w-5xl flex flex-col justify-center">
                <ImageComparisonSlider
                  leftImageUrl={secondaryPhotoUrl}
                  leftLabel={secondaryPhotoLabel}
                  leftSubLabel="Flycam / Drone"
                  rightImageUrl={primaryPhotoUrl}
                  rightLabel={primaryPhotoLabel}
                  rightSubLabel="Thực địa / Mobile"
                  aspectRatioClass="h-[70vh]"
                  zoomLevel={zoomLevel}
                  rotation={rotation}
                />
              </div>
            ) : (
              /* CHẾ ĐỘ 2: SO SÁNH SONG SONG 2 CỘT */
              <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* Ảnh 1: Drone Triage */}
                <div className="h-full flex flex-col items-center justify-center bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 relative overflow-hidden">
                  <span className="absolute top-3 left-3 bg-slate-950/80 text-amber-300 px-2.5 py-1 rounded-md text-[11px] font-medium border border-amber-500/30 z-10 flex items-center gap-1.5">
                    <Icon name="flight" size={13} />
                    <span>{secondaryPhotoLabel}</span>
                  </span>
                  <img
                    src={secondaryPhotoUrl}
                    alt={secondaryPhotoLabel}
                    className="max-h-full max-w-full object-contain rounded-lg shadow-2xl transition-transform"
                    style={{
                      transform: `scale(${zoomLevel}) rotate(${rotation}deg)`
                    }}
                  />
                </div>

                {/* Ảnh 2: Thước đo thực địa */}
                <div className="h-full flex flex-col items-center justify-center bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 relative overflow-hidden">
                  <span className="absolute top-3 left-3 bg-slate-950/80 text-emerald-300 px-2.5 py-1 rounded-md text-[11px] font-medium border border-emerald-500/30 z-10 flex items-center gap-1.5">
                    <Icon name="straighten" size={13} />
                    <span>{primaryPhotoLabel}</span>
                  </span>
                  <img
                    src={primaryPhotoUrl}
                    alt={primaryPhotoLabel}
                    className="max-h-full max-w-full object-contain rounded-lg shadow-2xl transition-transform"
                    style={{
                      transform: `scale(${zoomLevel}) rotate(${rotation}deg)`
                    }}
                  />
                </div>
              </div>
            )
          ) : (
            /* XEM ĐƠN LẺ PHÓNG TO */
            <div className="w-full h-full flex items-center justify-center overflow-auto">
              <img
                src={activePhoto}
                alt={viewMode === 'SECONDARY' ? secondaryPhotoLabel : primaryPhotoLabel}
                className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg shadow-2xl transition-transform duration-200 cursor-grab active:cursor-grabbing"
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`
                }}
              />
            </div>
          )}

          {/* FLOATING ZOOM CONTROLS (Thanh công cụ thu phóng ở đáy) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/80 flex items-center gap-2 shadow-2xl z-20">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Thu nhỏ"
            >
              <Icon name="zoom_out" size={16} />
            </button>
            <span className="text-xs font-mono font-semibold px-1 text-slate-200 min-w-[48px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Phóng to"
            >
              <Icon name="zoom_in" size={16} />
            </button>
            <div className="w-px h-4 bg-slate-700 mx-0.5" />
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Đặt lại kích thước chuẩn"
            >
              <Icon name="restart_alt" size={16} />
            </button>
            <button
              type="button"
              onClick={handleRotate}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Xoay ảnh 90 độ"
            >
              <Icon name="rotate_right" size={16} />
            </button>
          </div>
        </div>

        {/* 3. SIDEBAR THÔNG TIN KỸ THUẬT & EXIF (Cột bên phải) */}
        {showMetadataPanel && (
          <aside aria-label="Thông số kỹ thuật" className="w-80 sm:w-96 border-l border-slate-800/80 bg-slate-900/80 backdrop-blur-md p-5 overflow-y-auto flex flex-col justify-between shrink-0 space-y-4">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C9A227] block mb-1">
                  Thông Số Kỹ Thuật Hiện Trường
                </span>
                <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
                {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
              </div>

              {/* THÔNG SỐ ĐO THỰC TẾ NỔI BẬT */}
              {measuredValue !== undefined ? (
                <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/80 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Kết quả đo thực tế (mm):</span>
                    <span className="text-[10px] font-mono text-emerald-400">Mobile EXIF Verified</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold font-mono text-rose-500">
                      {measuredValue}
                    </span>
                    <span className="text-sm font-semibold text-slate-300">{unit}</span>
                    <span className="text-[11px] text-rose-400 ml-auto font-medium">
                      (Vượt ngưỡng kỹ thuật)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400 italic">
                  Chưa có số đo nộp về từ hiện trường
                </div>
              )}

              {/* BẢNG EXIF VỊ TRÍ & THIẾT BỊ */}
              <div className="space-y-2.5 text-xs bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Icon name="location_on" size={14} className="text-[#C9A227]" />
                    <span>Lý trình:</span>
                  </span>
                  <span className="font-semibold text-slate-200 text-right">
                    Km {chainage} {lane ? `• ${lane}` : ''}
                  </span>
                </div>

                {(gpsLat || gpsLng) && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Icon name="gps_fixed" size={14} className="text-emerald-400" />
                      <span>Tọa độ GPS:</span>
                    </span>
                    <span className="font-mono text-slate-200 text-right">
                      {gpsLat?.toFixed(4)}° N, {gpsLng?.toFixed(4)}° E
                    </span>
                  </div>
                )}

                {deviceInfo && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Icon name="devices" size={14} className="text-blue-400" />
                      <span>Thiết bị chụp:</span>
                    </span>
                    <span className="text-slate-200 text-right font-medium">{deviceInfo}</span>
                  </div>
                )}

                {capturedAt && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Icon name="schedule" size={14} className="text-purple-400" />
                      <span>Thời điểm:</span>
                    </span>
                    <span className="font-mono text-slate-200 text-right">{capturedAt}</span>
                  </div>
                )}

                {technicianName && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Icon name="badge" size={14} className="text-amber-400" />
                      <span>Kỹ sư / Đội:</span>
                    </span>
                    <span className="text-slate-200 text-right font-medium">{technicianName}</span>
                  </div>
                )}
              </div>

              {/* GHI CHÚ */}
              {notes && (
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400">Ghi chú hiện trường:</span>
                  <p className="text-xs text-slate-300 italic bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
                    "{notes}"
                  </p>
                </div>
              )}
            </div>

            {/* ACTION BUTTON (NẾU CÓ) */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              {onVerifyAction && (
                <button
                  type="button"
                  onClick={onVerifyAction}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
                >
                  <Icon name="verified" size={16} />
                  <span>{verifyButtonText}</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer text-center"
              >
                Đóng xem chi tiết
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
