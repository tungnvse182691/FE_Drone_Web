import React, { useState, useRef, useCallback } from 'react'
import { Defect } from '../../../types/domain'
import { Icon } from '../../../components/ui/Icon'

interface DefectTemporalComparisonProps {
  defect: Defect
}

export const DefectTemporalComparison: React.FC<DefectTemporalComparisonProps> = ({ defect }) => {
  const hasPreviousEpoch = Boolean(defect.previous_epoch_image_url)

  // Vị trí thanh trượt Split-screen (0% -> 100%)
  const [sliderPos, setSliderPos] = useState<number>(50)
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false)
  const [comparisonMode, setComparisonMode] = useState<'SPLIT_SLIDER' | 'SIDE_BY_SIDE'>('SPLIT_SLIDER')
  const sliderContainerRef = useRef<HTMLDivElement>(null)

  // Tính toán diện tích hiện tại
  const currentArea = ((defect.length_m || 0.85) * (defect.width_m || 0.65)).toFixed(2)
  const isCrackType = defect.defect_type.includes('CRACK')

  // Ngày chụp thực tế 2 kỳ
  const epochPrevDate = '15/06/2026'
  const epochPrevMission = 'QL1A-MS-02 (Đợt 2)'
  const epochCurrDate = '24/09/2026'
  const epochCurrMission = `Đợt bay ${defect.survey_id || 'srv-01'}`
  const deltaDays = 101

  // Xử lý kéo thanh trượt
  const handleSliderMove = useCallback((clientX: number) => {
    if (!sliderContainerRef.current) return
    const rect = sliderContainerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percent = Math.min(Math.max(0, (x / rect.width) * 100), 100)
    setSliderPos(Math.round(percent))
  }, [])

  // Lắng nghe sự kiện toàn cục khi đang kéo thả để di chuyển chuột mượt mà không bị ngắt
  useEffect(() => {
    if (!isDraggingSlider) return

    const handleWindowMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      handleSliderMove(e.clientX)
    }

    const handleWindowMouseUp = () => {
      setIsDraggingSlider(false)
    }

    const handleWindowTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        handleSliderMove(e.touches[0].clientX)
      }
    }

    const handleWindowTouchEnd = () => {
      setIsDraggingSlider(false)
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

  return (
    <div className="space-y-4">
      {/* 1. TRƯỜNG HỢP CÓ DỮ LIỆU ĐA KỲ (CÓ ẢNH KỲ TRƯỚC T-1 ĐỂ SO SÁNH) */}
      {hasPreviousEpoch ? (
        <div className="space-y-4">
          {/* Header trạng thái so sánh & chuyển đổi chế độ */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#E2E5E9] flex-wrap">
            <div className="flex items-center gap-2">
              <Icon name="compare" size={18} className="text-[#8C6D1F]" />
              <div>
                <span className="text-xs font-bold text-[#1A1D20] block">
                  So sánh ảnh đa kỳ (Temporal Epoch Analysis)
                </span>
                <span className="text-[11px] text-slate-500">
                  Chu kỳ T-1 ({epochPrevDate}) đối chiếu Chu kỳ T0 ({epochCurrDate}) • Khoảng cách: {deltaDays} ngày (~3.3 tháng)
                </span>
              </div>
            </div>

            {/* Chuyển đổi giữa Split Slider và Side-by-Side */}
            <div className="flex items-center bg-[#F8F9FA] p-0.5 rounded-lg border border-[#E2E5E9] text-xs">
              <button
                type="button"
                onClick={() => setComparisonMode('SPLIT_SLIDER')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-semibold cursor-pointer ${
                  comparisonMode === 'SPLIT_SLIDER'
                    ? 'bg-white text-[#8C6D1F] shadow-2xs border border-[#E2E5E9]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Kéo thanh trượt chồng ảnh Before / After"
              >
                <Icon name="splitscreen" size={14} />
                <span>Thanh trượt (Split)</span>
              </button>
              <button
                type="button"
                onClick={() => setComparisonMode('SIDE_BY_SIDE')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-semibold cursor-pointer ${
                  comparisonMode === 'SIDE_BY_SIDE'
                    ? 'bg-white text-[#8C6D1F] shadow-2xs border border-[#E2E5E9]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Xem song song 2 ảnh cạnh nhau"
              >
                <Icon name="view_column" size={14} />
                <span>Song song (2 cột)</span>
              </button>
            </div>
          </div>

          {/* CHẾ ĐỘ 1: THANH TRƯỢT SPLIT-SCREEN CHỒNG ẢNH TRỰC QUAN */}
          {comparisonMode === 'SPLIT_SLIDER' && (
            <div className="space-y-2">
              <div
                ref={sliderContainerRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                className="relative rounded-xl overflow-hidden border border-slate-300 bg-black aspect-video select-none cursor-ew-resize group shadow-md"
              >
                {/* Lớp ảnh 1: Kỳ trước T-1 (Nằm dưới cùng, chiếm toàn bộ) */}
                <img
                  src={defect.previous_epoch_image_url}
                  alt="Ảnh kỳ trước"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />

                {/* Nhãn Kỳ trước T-1 (Góc trái) */}
                <div className="absolute top-3 left-3 bg-[#1A1D20]/85 text-white backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-medium border border-white/10 pointer-events-none z-10 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Kỳ trước T-1: <strong>{epochPrevDate}</strong> ({epochPrevMission})</span>
                </div>

                {/* Lớp ảnh 2: Kỳ này T0 (Nằm đè lên trên, cắt theo sliderPos) */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{
                    clipPath: `inset(0 0 0 ${sliderPos}%)`
                  }}
                >
                  <img
                    src={defect.image_url}
                    alt="Ảnh kỳ này"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Bounding box AI trên ảnh kỳ này */}
                  <div
                    className="absolute border-2 border-[#C9A227] bg-[#C9A227]/20 rounded"
                    style={{
                      left: `${defect.bounding_box.x * 100}%`,
                      top: `${defect.bounding_box.y * 100}%`,
                      width: `${defect.bounding_box.width * 100}%`,
                      height: `${defect.bounding_box.height * 100}%`
                    }}
                  >
                    <span className="bg-[#8C6D1F] text-white text-[9px] font-bold px-1.5 py-0.5 rounded absolute -top-4 left-0">
                      {defect.defect_type} ({Math.round(defect.confidence_score * 100)}%)
                    </span>
                  </div>
                </div>

                {/* Nhãn Kỳ này T0 (Góc phải) */}
                <div className="absolute top-3 right-3 bg-[#1A1D20]/85 text-white backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-medium border border-white/10 pointer-events-none z-10 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>Kỳ này T0: <strong>{epochCurrDate}</strong> ({epochCurrMission})</span>
                </div>

                {/* Thanh kẻ dọc chia đôi (Divider Line) */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.8)] z-20 pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  {/* Tay cầm kéo tròn (Draggable Knob) */}
                  <div
                    onMouseDown={handleMouseDown}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-[#C9A227] shadow-xl flex items-center justify-center text-[#8C6D1F] pointer-events-auto cursor-ew-resize hover:scale-110 active:scale-95 transition-transform"
                    title="Kéo qua lại để so sánh đối chiếu vết nứt"
                  >
                    <Icon name="compare_arrows" size={18} />
                  </div>
                </div>

                {/* Hướng dẫn kéo trượt ở đáy khung */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white/90 px-3 py-0.5 rounded-full text-[10px] font-medium backdrop-blur-xs pointer-events-none z-10 border border-white/10 flex items-center gap-1.5">
                  <Icon name="drag_handle" size={12} className="text-[#C9A227]" />
                  <span>Kéo thanh trượt qua trái/phải để đối chiếu sự lan rộng của vết nứt</span>
                </div>
              </div>

              {/* Range input trượt mượt mà phụ trợ & Các nút Preset nhanh */}
              <div className="flex items-center justify-between gap-3 px-2 pt-1 flex-wrap">
                <div className="flex-1 flex items-center gap-2 min-w-[220px]">
                  <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
                    Kỳ trước ({epochPrevDate})
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPos}
                    onChange={(e) => setSliderPos(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#C9A227]"
                    title="Kéo trượt để điều chỉnh tỷ lệ hiển thị"
                  />
                  <span className="text-[11px] font-medium text-slate-700 font-bold whitespace-nowrap">
                    Kỳ này ({epochCurrDate})
                  </span>
                </div>

                {/* Các nút Preset nhanh */}
                <div className="flex items-center gap-1 text-[11px]">
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
              </div>
            </div>
          )}

          {/* CHẾ ĐỘ 2: KHUNG ẢNH SONG SONG SIDE-BY-SIDE (2 CỘT) */}
          {comparisonMode === 'SIDE_BY_SIDE' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cột trái: Kỳ trước T-1 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Kỳ trước T-1: <strong>{epochPrevDate}</strong></span>
                  </span>
                  <span className="text-[10px] font-medium text-emerald-800 bg-[#E9F7EC] px-2 py-0.5 rounded border border-emerald-200">
                    Mặt đường nguyên vẹn
                  </span>
                </div>
                <div className="relative rounded-lg overflow-hidden border border-[#E2E5E9] aspect-video bg-black">
                  <img
                    src={defect.previous_epoch_image_url}
                    alt="Ảnh kỳ trước"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-[#1A1D20]/80 text-white px-2 py-0.5 rounded text-[10px] font-medium border border-white/10 flex items-center gap-1">
                    <Icon name="history" size={13} className="text-slate-300" />
                    <span>{epochPrevMission} • Chưa phát sinh khuyết tật</span>
                  </div>
                </div>
              </div>

              {/* Cột phải: Kỳ này T0 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1A1D20] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>Kỳ này T0: <strong>{epochCurrDate}</strong></span>
                  </span>
                  <span className="text-[10px] font-bold text-[#E5484D] bg-[#FDECEC] px-2 py-0.5 rounded border border-red-200">
                    Phát sinh hư hỏng mới
                  </span>
                </div>
                <div className="relative rounded-lg overflow-hidden border-2 border-[#C9A227] aspect-video bg-black">
                  <img
                    src={defect.image_url}
                    alt="Ảnh kỳ này"
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute border-2 border-[#C9A227] bg-[#C9A227]/20 rounded pointer-events-none"
                    style={{
                      left: `${defect.bounding_box.x * 100}%`,
                      top: `${defect.bounding_box.y * 100}%`,
                      width: `${defect.bounding_box.width * 100}%`,
                      height: `${defect.bounding_box.height * 100}%`
                    }}
                  >
                    <span className="bg-[#8C6D1F] text-white text-[9px] font-bold px-1.5 py-0.5 rounded absolute -top-4 left-0">
                      {defect.defect_type} ({Math.round(defect.confidence_score * 100)}%)
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-[#1A1D20]/80 text-white px-2 py-0.5 rounded text-[10px] font-medium border border-white/10 flex items-center gap-1">
                    <Icon name="photo_camera" size={13} className="text-amber-300" />
                    <span>{epochCurrMission}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bảng chỉ số kỹ thuật biến động & Đánh giá tốc độ suy thoái */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-[#F8F9FA] rounded-lg border border-[#E2E5E9] text-xs">
            <div>
              <span className="text-slate-500 text-[11px] block">Diện tích kỳ trước</span>
              <span className="font-mono font-bold text-slate-700">0.00 m²</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Diện tích kỳ này</span>
              <span className="font-mono font-bold text-[#1A1D20]">{currentArea} m²</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Tốc độ mở rộng</span>
              <span className="font-mono font-bold text-[#E5484D] flex items-center gap-1">
                <Icon name="trending_up" size={14} className="text-red-500" />
                <span>Tăng nhanh (+34%/tháng)</span>
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Đánh giá suy thoái</span>
              <span className="font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded text-[10px] inline-block mt-0.5">
                Cần xử lý kịp thời
              </span>
            </div>
          </div>

          {/* Đánh giá phân tích suy thoái từ mô hình AI */}
          <div className="p-3.5 bg-white border border-[#E2E5E9] rounded-lg text-xs space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-1.5 font-bold text-[#1A1D20]">
              <Icon name="analytics" size={16} className="text-[#8C6D1F]" />
              <span>Đánh giá diễn biến theo thời gian (Temporal Analysis):</span>
            </div>
            <p className="text-[12px] text-slate-600 leading-relaxed font-normal">
              Đối chiếu dữ liệu ảnh bay quét giữa Chu kỳ T-1 (<strong>{epochPrevDate}</strong>) và Chu kỳ T0 (<strong>{epochCurrDate}</strong>) xác nhận:
              tại vị trí lý trình Km {defect.chainage_km}, mặt đường bê tông xi măng đã{' '}
              {isCrackType ? 'xuất hiện vết nứt lan rộng với tốc độ nhanh' : 'phát sinh hố sụt lún / vỡ góc bản mới'}{' '}
              sau chu kỳ khai thác và đợt mưa bão ({deltaDays} ngày). Đề xuất PM phê duyệt đưa vào đợt sửa chữa cấp bách để trám chèn khe nứt, ngăn nước thâm nhập phá hoại móng đường.
            </p>
          </div>
        </div>
      ) : (
        /* 2. TRƯỜNG HỢP LẦN ĐẦU GHI NHẬN (BASELINE T0 - CHƯA CÓ LỊCH SỬ KỲ TRƯỚC) */
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#E2E5E9] flex-wrap">
            <div className="flex items-center gap-2">
              <Icon name="history_toggle_off" size={18} className="text-slate-500" />
              <span className="text-xs font-semibold text-[#1A1D20]">
                Khảo sát ban đầu: Ghi nhận mốc chuẩn Baseline (Chu kỳ T0: {epochCurrDate})
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#2D3748] bg-[#F8F9FA] px-2 py-0.5 rounded border border-[#E2E5E9]">
              Mốc chuẩn khởi tạo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cột trái: Trống - Chưa có kỳ trước */}
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
                    Chưa có dữ liệu bay quét lịch sử
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Đoạn tuyến Km {defect.chainage_km} chưa từng có đợt bay quét nào trước đây.
                  </span>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-200 text-slate-700 rounded">
                  Lần đầu ghi nhận (Baseline Epoch)
                </span>
              </div>
            </div>

            {/* Cột phải: Ảnh kỳ này làm mốc Baseline */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#1A1D20]">
                  Kỳ này (Mốc T0: {epochCurrDate})
                </span>
                <span className="text-[10px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Thiết lập mốc chuẩn
                </span>
              </div>
              <div className="relative rounded-lg overflow-hidden border border-[#E2E5E9] aspect-video bg-black">
                <img
                  src={defect.image_url}
                  alt="Ảnh mốc chuẩn Baseline"
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute border-2 border-[#C9A227] bg-[#C9A227]/20 rounded pointer-events-none"
                  style={{
                    left: `${defect.bounding_box.x * 100}%`,
                    top: `${defect.bounding_box.y * 100}%`,
                    width: `${defect.bounding_box.width * 100}%`,
                    height: `${defect.bounding_box.height * 100}%`
                  }}
                >
                  <span className="bg-[#8C6D1F] text-white text-[9px] font-bold px-1.5 py-0.5 rounded absolute -top-4 left-0">
                    Mốc Baseline ({defect.defect_type})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cơ chế quản lý Baseline T0 */}
          <div className="p-3.5 bg-[#F8F9FA] border border-[#E2E5E9] rounded-lg text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#1A1D20]">
              <Icon name="info" size={16} className="text-[#8C6D1F]" />
              <span>Cơ chế quản lý dữ liệu mốc chuẩn (Baseline):</span>
            </div>
            <p className="text-[12px] text-slate-600 leading-relaxed font-normal">
              Do đây là lần đầu tiên ghi nhận khuyết tật tại vị trí Km {defect.chainage_km}, hệ thống sẽ tự động lưu trữ
              tọa độ GPS ({defect.gps_lat}, {defect.gps_lng}) và ảnh chụp hiện tại ({epochCurrDate}) làm <strong>mốc chuẩn ban đầu (Baseline)</strong>.
              Khi thực hiện các đợt bay drone tiếp theo (T+1, T+2), thuật toán AI sẽ tự động kích hoạt tính năng so sánh đa kỳ đối chiếu với mốc này.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default DefectTemporalComparison
