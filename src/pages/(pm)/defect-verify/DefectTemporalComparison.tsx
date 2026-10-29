import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Defect } from '../../../types/domain'
import { Icon } from '../../../components/ui/Icon'

interface DefectTemporalComparisonProps {
  defect: Defect
}

export const DefectTemporalComparison: React.FC<DefectTemporalComparisonProps> = ({ defect }) => {
  const hasPreviousEpoch = Boolean(defect.previous_epoch_image_url || defect.previous_epoch_bbox)

  const [sliderPos, setSliderPos] = useState<number>(50)
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false)
  const [comparisonMode, setComparisonMode] = useState<'SPLIT_SLIDER' | 'SIDE_BY_SIDE'>('SPLIT_SLIDER')
  const [prevImgFailed, setPrevImgFailed] = useState<boolean>(false)
  const [currImgFailed, setCurrImgFailed] = useState<boolean>(false)
  const sliderContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPrevImgFailed(false)
    setCurrImgFailed(false)
  }, [defect.id, defect.previous_epoch_image_url, defect.image_url])

  const epochPrevLabel = defect.previous_epoch_label || 'Chu kỳ khảo sát trước (T-1)'
  const epochCurrLabel =
    defect.current_epoch_label ||
    `Chu kỳ hiện tại (${defect.fixture_version || 'Road-YOLOv9'} • Đợt #${(defect.run_id || '').slice(0, 8).toUpperCase()})`
  const prevBbox = defect.previous_epoch_bbox || defect.bounding_box
  const defectTypeVi =
    defect.defect_type === 'POTHOLE' ? 'Ổ gà mặt đường' : 'Vết nứt mặt đường'

  const handleSliderMove = useCallback((clientX: number) => {
    if (!sliderContainerRef.current) return
    const rect = sliderContainerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percent = Math.min(Math.max(0, (x / rect.width) * 100), 100)
    setSliderPos(Math.round(percent))
  }, [])

  useEffect(() => {
    if (!isDraggingSlider) return

    const handleWindowMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      handleSliderMove(e.clientX)
    }
    const handleWindowMouseUp = () => setIsDraggingSlider(false)
    const handleWindowTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleSliderMove(e.touches[0].clientX)
    }
    const handleWindowTouchEnd = () => setIsDraggingSlider(false)

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
  }, [isDraggingSlider, handleSliderMove])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDraggingSlider(true)
    handleSliderMove(e.clientX)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      setIsDraggingSlider(true)
      handleSliderMove(e.touches[0].clientX)
    }
  }

  const renderSyntheticRoadSurface = (label: string, variant: 'PREV' | 'CURR') => (
    <div
      className={`absolute inset-0 ${
        variant === 'PREV' ? 'bg-[#18222D]' : 'bg-[#1B1F24]'
      } flex flex-col justify-between p-4 pointer-events-none`}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
          backgroundSize: '36px 36px'
        }}
      />
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[72%] bg-[#22272E] border-x-2 border-slate-500/40">
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l-2 border-dashed border-amber-400/50" />
      </div>
      <div className="relative z-10 text-[10px] font-mono text-slate-400 self-end mt-auto">
        {label}
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {hasPreviousEpoch ? (
        <div className="space-y-4">
          {/* Header trạng thái so sánh & chuyển đổi chế độ */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#E2E5E9] flex-wrap">
            <div className="flex items-center gap-2">
              <Icon name="compare" size={18} className="text-[#8C6D1F]" />
              <div>
                <span className="text-xs font-bold text-[#1A1D20] block">
                  So sánh đối chiếu ảnh đa kỳ từ CSDL
                </span>
                <span className="text-[11px] text-slate-500">
                  {epochPrevLabel} ↔ {epochCurrLabel}
                </span>
              </div>
            </div>

            <div className="flex items-center bg-[#F8F9FA] p-0.5 rounded-lg border border-[#E2E5E9] text-xs">
              <button
                type="button"
                onClick={() => setComparisonMode('SPLIT_SLIDER')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-semibold cursor-pointer ${
                  comparisonMode === 'SPLIT_SLIDER'
                    ? 'bg-white text-[#8C6D1F] shadow-2xs border border-[#E2E5E9]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon name="splitscreen" size={14} />
                <span>Thanh trượt</span>
              </button>
              <button
                type="button"
                onClick={() => setComparisonMode('SIDE_BY_SIDE')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-semibold cursor-pointer ${
                  comparisonMode === 'SIDE_BY_SIDE'
                    ? 'bg-white text-[#8C6D1F] shadow-2xs border border-[#E2E5E9]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon name="view_column" size={14} />
                <span>Song song (2 cột)</span>
              </button>
            </div>
          </div>

          {/* CHẾ ĐỘ 1: SPLIT SLIDER */}
          {comparisonMode === 'SPLIT_SLIDER' && (
            <div className="space-y-2">
              <div
                ref={sliderContainerRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                className="relative rounded-xl overflow-hidden border border-slate-300 bg-black aspect-video select-none cursor-ew-resize group shadow-md"
              >
                {/* Lớp 1: Kỳ trước (T-1) */}
                {defect.previous_epoch_image_url && !prevImgFailed ? (
                  <img
                    src={defect.previous_epoch_image_url}
                    alt="Kỳ trước"
                    onError={() => setPrevImgFailed(true)}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />
                ) : (
                  renderSyntheticRoadSurface(epochPrevLabel, 'PREV')
                )}

                {/* Khung bao kỳ trước */}
                <div
                  className="absolute border-2 border-emerald-400 bg-emerald-400/15 rounded pointer-events-none"
                  style={{
                    left: `${prevBbox.x * 100}%`,
                    top: `${prevBbox.y * 100}%`,
                    width: `${prevBbox.width * 100}%`,
                    height: `${prevBbox.height * 100}%`
                  }}
                >
                  <span className="bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded absolute -top-4 left-0 whitespace-nowrap">
                    Kỳ T-1 ({prevBbox.width.toFixed(2)}×{prevBbox.height.toFixed(2)})
                  </span>
                </div>

                <div className="absolute top-3 left-3 bg-[#1A1D20]/85 text-white backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-medium border border-white/10 pointer-events-none z-10 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>{epochPrevLabel}</span>
                </div>

                {/* Lớp 2: Kỳ này (T0) */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
                >
                  {defect.image_url && !currImgFailed ? (
                    <img
                      src={defect.image_url}
                      alt="Kỳ này"
                      onError={() => setCurrImgFailed(true)}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    renderSyntheticRoadSurface(epochCurrLabel, 'CURR')
                  )}
                  <div
                    className="absolute border-2 border-[#C9A227] bg-[#C9A227]/20 rounded"
                    style={{
                      left: `${defect.bounding_box.x * 100}%`,
                      top: `${defect.bounding_box.y * 100}%`,
                      width: `${defect.bounding_box.width * 100}%`,
                      height: `${defect.bounding_box.height * 100}%`
                    }}
                  >
                    <span className="bg-[#8C6D1F] text-white text-[9px] font-bold px-1.5 py-0.5 rounded absolute -top-4 left-0 whitespace-nowrap">
                      Kỳ T0: {defectTypeVi} ({Math.round(defect.confidence_score * 100)}%)
                    </span>
                  </div>
                </div>

                <div className="absolute top-3 right-3 bg-[#1A1D20]/85 text-white backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-medium border border-white/10 pointer-events-none z-10 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>{epochCurrLabel}</span>
                </div>

                {/* Thanh kẻ chia đôi */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.8)] z-20 pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div
                    onMouseDown={handleMouseDown}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-[#C9A227] shadow-xl flex items-center justify-center text-[#8C6D1F] pointer-events-auto cursor-ew-resize"
                  >
                    <Icon name="compare_arrows" size={18} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 px-2 pt-1 flex-wrap">
                <div className="flex-1 flex items-center gap-2 min-w-[220px]">
                  <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">T-1</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPos}
                    onChange={(e) => setSliderPos(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#C9A227]"
                  />
                  <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">T0</span>
                </div>
              </div>
            </div>
          )}

          {/* CHẾ ĐỘ 2: SIDE BY SIDE */}
          {comparisonMode === 'SIDE_BY_SIDE' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{epochPrevLabel}</span>
                  </span>
                </div>
                <div className="relative rounded-lg overflow-hidden border border-[#E2E5E9] aspect-video bg-black">
                  {defect.previous_epoch_image_url && !prevImgFailed ? (
                    <img
                      src={defect.previous_epoch_image_url}
                      alt="Kỳ trước"
                      onError={() => setPrevImgFailed(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    renderSyntheticRoadSurface(epochPrevLabel, 'PREV')
                  )}
                  <div
                    className="absolute border-2 border-emerald-400 bg-emerald-400/20 rounded pointer-events-none"
                    style={{
                      left: `${prevBbox.x * 100}%`,
                      top: `${prevBbox.y * 100}%`,
                      width: `${prevBbox.width * 100}%`,
                      height: `${prevBbox.height * 100}%`
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1A1D20] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>{epochCurrLabel}</span>
                  </span>
                </div>
                <div className="relative rounded-lg overflow-hidden border-2 border-[#C9A227] aspect-video bg-black">
                  {defect.image_url && !currImgFailed ? (
                    <img
                      src={defect.image_url}
                      alt="Kỳ này"
                      onError={() => setCurrImgFailed(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    renderSyntheticRoadSurface(epochCurrLabel, 'CURR')
                  )}
                  <div
                    className="absolute border-2 border-[#C9A227] bg-[#C9A227]/20 rounded pointer-events-none"
                    style={{
                      left: `${defect.bounding_box.x * 100}%`,
                      top: `${defect.bounding_box.y * 100}%`,
                      width: `${defect.bounding_box.width * 100}%`,
                      height: `${defect.bounding_box.height * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bảng đối chiếu khung nhận diện giữa 2 đợt trong CSDL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#F8F9FA] rounded-lg border border-[#E2E5E9] text-xs">
            <div>
              <span className="text-slate-500 text-[11px] block">Khung bao Chu kỳ T-1</span>
              <span className="font-mono font-bold text-slate-700">
                ({prevBbox.x.toFixed(2)}, {prevBbox.y.toFixed(2)}, {prevBbox.width.toFixed(2)}, {prevBbox.height.toFixed(2)})
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Khung bao Chu kỳ T0</span>
              <span className="font-mono font-bold text-[#1A1D20]">
                ({defect.bounding_box.x.toFixed(2)}, {defect.bounding_box.y.toFixed(2)},{' '}
                {defect.bounding_box.width.toFixed(2)}, {defect.bounding_box.height.toFixed(2)})
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Độ tin cậy AI (T0)</span>
              <span className="font-mono font-bold text-amber-800">
                {(defect.confidence_score * 100).toFixed(1)}% ({defect.fixture_version || 'Road-YOLOv9'})
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* TRƯỜNG HỢP CHỈ CÓ 1 CHU KỲ TRONG CSDL (BASELINE T0) */
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#E2E5E9] flex-wrap">
            <div className="flex items-center gap-2">
              <Icon name="history_toggle_off" size={18} className="text-slate-500" />
              <span className="text-xs font-semibold text-[#1A1D20]">
                Ghi nhận mốc chuẩn Baseline từ CSDL ({epochCurrLabel})
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#2D3748] bg-[#F8F9FA] px-2 py-0.5 rounded border border-[#E2E5E9]">
              Mốc chuẩn T0
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 block">
                Dữ liệu khảo sát kỳ trước (T-1)
              </span>
              <div className="rounded-lg border border-dashed border-slate-300 aspect-video bg-[#F8F9FA] flex flex-col items-center justify-center p-4 text-center space-y-2">
                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                  <Icon name="database" size={18} />
                </div>
                <div>
                  <span className="font-semibold text-xs text-slate-700 block">
                    Chưa có đợt chạy AI Run trước đó tại vị trí này trong CSDL
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Lý trình Km {defect.chainage_km.toFixed(3)} chỉ mới có 1 đợt ghi nhận trong CSDL.
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#1A1D20]">{epochCurrLabel}</span>
              </div>
              <div className="relative rounded-lg overflow-hidden border border-[#E2E5E9] aspect-video bg-black">
                {defect.image_url && !currImgFailed ? (
                  <img
                    src={defect.image_url}
                    alt="Ảnh mốc chuẩn Baseline"
                    onError={() => setCurrImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  renderSyntheticRoadSurface(epochCurrLabel, 'CURR')
                )}
                <div
                  className="absolute border-2 border-[#C9A227] bg-[#C9A227]/20 rounded pointer-events-none"
                  style={{
                    left: `${defect.bounding_box.x * 100}%`,
                    top: `${defect.bounding_box.y * 100}%`,
                    width: `${defect.bounding_box.width * 100}%`,
                    height: `${defect.bounding_box.height * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DefectTemporalComparison
