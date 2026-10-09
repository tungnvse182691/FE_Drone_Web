import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Icon } from '../ui/Icon'

export interface ImageComparisonSliderProps {
  leftImageUrl: string
  leftLabel: string
  leftSubLabel?: string
  rightImageUrl: string
  rightLabel: string
  rightSubLabel?: string
  initialPosition?: number
  aspectRatioClass?: string
  className?: string
  showControls?: boolean
  showPresets?: boolean
  zoomLevel?: number
  rotation?: number
}

export const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({
  leftImageUrl,
  leftLabel,
  leftSubLabel,
  rightImageUrl,
  rightLabel,
  rightSubLabel,
  initialPosition = 50,
  aspectRatioClass = 'aspect-video',
  className = '',
  showControls = true,
  showPresets = true,
  zoomLevel = 1,
  rotation = 0
}) => {
  const [sliderPos, setSliderPos] = useState<number>(initialPosition)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Tính toán vị trí phần trăm theo tọa độ X
  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percent = Math.min(Math.max(0, (x / rect.width) * 100), 100)
    setSliderPos(Math.round(percent))
  }, [])

  // Xử lý sự kiện kéo thả toàn cục (window listener) để không bị đứt đoạn khi chuột ra khỏi khung
  useEffect(() => {
    if (!isDragging) return

    const handleWindowMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      updatePosition(e.clientX)
    }

    const handleWindowMouseUp = () => {
      setIsDragging(false)
    }

    const handleWindowTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        updatePosition(e.touches[0].clientX)
      }
    }

    const handleWindowTouchEnd = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleWindowMouseMove)
    window.addEventListener('mouseup', handleWindowMouseUp)
    window.addEventListener('touchmove', handleWindowTouchMove, { passive: false })
    window.addEventListener('touchend', handleWindowTouchEnd)

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove)
      window.removeEventListener('mouseup', handleWindowMouseUp)
      window.removeEventListener('touchmove', handleWindowTouchMove)
      window.removeEventListener('touchend', handleWindowTouchEnd)
    }
  }, [isDragging, updatePosition])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    updatePosition(e.clientX)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      setIsDragging(true)
      updatePosition(e.touches[0].clientX)
    }
  }

  return (
    <div className={`space-y-2 select-none ${className}`}>
      {/* Khung hiển thị thanh trượt Split-screen */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`relative w-full ${aspectRatioClass} rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950 cursor-ew-resize shadow-lg group`}
      >
        {/* LỚP 1: ẢNH BÊN TRÁI (Nằm dưới cùng) */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={leftImageUrl}
            alt={leftLabel}
            className="w-full h-full object-cover transition-transform"
            style={{
              transform: `scale(${zoomLevel}) rotate(${rotation}deg)`
            }}
          />
        </div>

        {/* Nhãn Ảnh Trái (Kỳ trước / Drone) */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <div className="bg-slate-900/85 backdrop-blur-md text-white border border-slate-700/80 px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-emerald-300">{leftLabel}</span>
            {leftSubLabel && <span className="text-slate-300 text-[10px]">({leftSubLabel})</span>}
          </div>
        </div>

        {/* LỚP 2: ẢNH BÊN PHẢI (Cắt theo vị trí thanh trượt clip-path) */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
          style={{
            clipPath: `inset(0 0 0 ${sliderPos}%)`
          }}
        >
          <img
            src={rightImageUrl}
            alt={rightLabel}
            className="absolute inset-0 w-full h-full object-cover transition-transform"
            style={{
              transform: `scale(${zoomLevel}) rotate(${rotation}deg)`
            }}
          />
        </div>

        {/* Nhãn Ảnh Phải (Kỳ này / Thước đo) */}
        <div className="absolute top-3 right-3 z-10 pointer-events-none">
          <div className="bg-slate-900/85 backdrop-blur-md text-white border border-slate-700/80 px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-semibold text-amber-300">{rightLabel}</span>
            {rightSubLabel && <span className="text-slate-300 text-[10px]">({rightSubLabel})</span>}
          </div>
        </div>

        {/* THANH KẺ DỌC CHIA ĐÔI & TAY CẦM TRƯỢT (SLIDER KNOB) */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-[#C9A227] shadow-[0_0_12px_rgba(201,162,39,0.9)] z-20 pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          {/* Tay cầm trượt tròn */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white border-2 border-[#C9A227] text-[#8C6D1F] shadow-2xl flex items-center justify-center cursor-ew-resize transition-transform duration-75 pointer-events-auto ${
              isDragging ? 'scale-115 ring-4 ring-[#C9A227]/40 shadow-[#C9A227]/50' : 'group-hover:scale-105'
            }`}
            title="Kéo thanh trượt qua trái/phải để so sánh đối chiếu"
          >
            <Icon name="compare_arrows" size={18} className="text-[#8C6D1F]" />
          </div>

          {/* Vạch chỉ số % trên thanh trượt */}
          <div className="absolute bottom-2 -translate-x-1/2 bg-slate-900/90 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-tight shadow-md whitespace-nowrap pointer-events-none">
            {sliderPos}%
          </div>
        </div>

        {/* Hướng dẫn thao tác kéo trượt ở đáy khung */}
        <div className="absolute bottom-2 left-3 bg-slate-950/80 backdrop-blur-xs text-slate-300 border border-slate-800 px-2 py-0.5 rounded text-[10px] pointer-events-none z-10 flex items-center gap-1">
          <Icon name="swipe" size={12} className="text-[#C9A227]" />
          <span>Kéo thanh trượt để so sánh vết nứt</span>
        </div>
      </div>

      {/* THANH ĐIỀU KHIỂN & CÁC NÚT PRESET NHANH */}
      {showControls && (
        <div className="flex items-center justify-between gap-3 px-1 pt-1 flex-wrap text-xs">
          {/* Range Slider điều khiển mịn */}
          <div className="flex-1 flex items-center gap-2 min-w-[200px]">
            <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
              0% ({leftLabel})
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#C9A227]"
              title="Kéo trượt điều chỉnh tỷ lệ hiển thị"
            />
            <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
              100% ({rightLabel})
            </span>
          </div>

          {/* Các nút Preset nhanh 25% / 50% / 75% */}
          {showPresets && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400 mr-1">Vị trí:</span>
              <button
                type="button"
                onClick={() => setSliderPos(25)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                  sliderPos === 25
                    ? 'bg-[#C9A227] text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                25%
              </button>
              <button
                type="button"
                onClick={() => setSliderPos(50)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                  sliderPos === 50
                    ? 'bg-[#C9A227] text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                50% (Cân bằng)
              </button>
              <button
                type="button"
                onClick={() => setSliderPos(75)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                  sliderPos === 75
                    ? 'bg-[#C9A227] text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                75%
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
