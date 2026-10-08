import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Defect } from '../../../types/domain'
import { Icon } from '../../../components/ui/Icon'
import { DefectType } from '../../../types/enums'

interface BoundingBoxCoords {
  x: number // 0..1 (left)
  y: number // 0..1 (top)
  width: number // 0..1
  height: number // 0..1
}

interface DefectBoundingBoxViewerProps {
  defect: Defect
  currentType?: DefectType
  onBboxChange?: (newBbox: BoundingBoxCoords, lengthM: number, widthM: number) => void
}

type ResizeDirection = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e'

export const DefectBoundingBoxViewer: React.FC<DefectBoundingBoxViewerProps> = ({
  defect,
  currentType,
  onBboxChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  // Bounding box state (normalized 0..1)
  const [bbox, setBbox] = useState<BoundingBoxCoords>(defect.bounding_box)
  const [isModified, setIsModified] = useState<boolean>(false)
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false)

  // Mouse interaction state
  const [dragAction, setDragAction] = useState<
    | { type: 'MOVE'; startX: number; startY: number; origBbox: BoundingBoxCoords }
    | { type: 'RESIZE'; handle: ResizeDirection; startX: number; startY: number; origBbox: BoundingBoxCoords }
    | { type: 'DRAW'; startX: number; startY: number }
    | null
  >(null)

  // Reset state when defect changes
  useEffect(() => {
    setBbox(defect.bounding_box)
    setIsModified(false)
    setIsDrawingMode(false)
  }, [defect.id])

  // Tính kích thước thực tế dựa trên bbox (chuẩn hóa tương quan tỷ lệ ảnh)
  const calculateRealDimensions = useCallback(
    (b: BoundingBoxCoords) => {
      // Giả định góc chụp drone 20m có chiều rộng khung nhìn đường ~ 7.5m và chiều dài ~ 8.5m
      const calculatedLength = parseFloat(Math.max(0.2, b.height * 8.5).toFixed(2))
      const calculatedWidth = parseFloat(Math.max(0.15, b.width * 7.5).toFixed(2))
      return { lengthM: calculatedLength, widthM: calculatedWidth }
    },
    []
  )

  // Cập nhật khi bbox thay đổi
  const updateBbox = useCallback(
    (newB: BoundingBoxCoords, markModified = true) => {
      setBbox(newB)
      if (markModified) setIsModified(true)
      const dims = calculateRealDimensions(newB)
      if (onBboxChange) {
        onBboxChange(newB, dims.lengthM, dims.widthM)
      }
    },
    [calculateRealDimensions, onBboxChange]
  )

  // Reset về khung gốc do AI dự đoán
  const handleResetToAI = () => {
    updateBbox(defect.bounding_box, false)
    setIsModified(false)
    setIsDrawingMode(false)
  }

  // Chuyển đổi tọa độ chuột thành tỉ lệ 0..1
  const getNormalizedPoint = (e: React.MouseEvent | MouseEvent): { x: number; y: number } | null => {
    if (!containerRef.current) return null
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.min(Math.max(0, (e.clientX - rect.left) / rect.width), 1)
    const y = Math.min(Math.max(0, (e.clientY - rect.top) / rect.height), 1)
    return { x, y }
  }

  // Bắt đầu di chuyển hộp
  const handleStartMove = (e: React.MouseEvent) => {
    if (isDrawingMode) return
    e.stopPropagation()
    const pt = getNormalizedPoint(e)
    if (!pt) return
    setDragAction({
      type: 'MOVE',
      startX: pt.x,
      startY: pt.y,
      origBbox: { ...bbox }
    })
  }

  // Bắt đầu co giãn góc/cạnh
  const handleStartResize = (e: React.MouseEvent, handle: ResizeDirection) => {
    if (isDrawingMode) return
    e.stopPropagation()
    const pt = getNormalizedPoint(e)
    if (!pt) return
    setDragAction({
      type: 'RESIZE',
      handle,
      startX: pt.x,
      startY: pt.y,
      origBbox: { ...bbox }
    })
  }

  // Bắt đầu vẽ khung mới
  const handleContainerMouseDown = (e: React.MouseEvent) => {
    if (!isDrawingMode) return
    const pt = getNormalizedPoint(e)
    if (!pt) return
    setDragAction({
      type: 'DRAW',
      startX: pt.x,
      startY: pt.y
    })
  }

  // Global mousemove & mouseup listener
  useEffect(() => {
    if (!dragAction) return

    const handleMouseMove = (e: MouseEvent) => {
      const pt = getNormalizedPoint(e)
      if (!pt) return

      if (dragAction.type === 'MOVE') {
        const dx = pt.x - dragAction.startX
        const dy = pt.y - dragAction.startY
        const newX = Math.min(Math.max(0, dragAction.origBbox.x + dx), 1 - dragAction.origBbox.width)
        const newY = Math.min(Math.max(0, dragAction.origBbox.y + dy), 1 - dragAction.origBbox.height)
        updateBbox({
          ...dragAction.origBbox,
          x: newX,
          y: newY
        })
      } else if (dragAction.type === 'RESIZE') {
        const { handle, origBbox, startX, startY } = dragAction
        const dx = pt.x - startX
        const dy = pt.y - startY

        let newX = origBbox.x
        let newY = origBbox.y
        let newW = origBbox.width
        let newH = origBbox.height

        const MIN_SIZE = 0.04

        if (handle.includes('w')) {
          const proposedW = origBbox.width - dx
          if (proposedW >= MIN_SIZE) {
            newX = origBbox.x + dx
            newW = proposedW
          }
        }
        if (handle.includes('e')) {
          const proposedW = origBbox.width + dx
          if (proposedW >= MIN_SIZE) {
            newW = Math.min(proposedW, 1 - origBbox.x)
          }
        }
        if (handle.includes('n')) {
          const proposedH = origBbox.height - dy
          if (proposedH >= MIN_SIZE) {
            newY = origBbox.y + dy
            newH = proposedH
          }
        }
        if (handle.includes('s')) {
          const proposedH = origBbox.height + dy
          if (proposedH >= MIN_SIZE) {
            newH = Math.min(proposedH, 1 - origBbox.y)
          }
        }

        updateBbox({
          x: Math.max(0, newX),
          y: Math.max(0, newY),
          width: newW,
          height: newH
        })
      } else if (dragAction.type === 'DRAW') {
        const x1 = Math.min(dragAction.startX, pt.x)
        const y1 = Math.min(dragAction.startY, pt.y)
        const x2 = Math.max(dragAction.startX, pt.x)
        const y2 = Math.max(dragAction.startY, pt.y)
        const w = Math.max(0.04, x2 - x1)
        const h = Math.max(0.04, y2 - y1)
        updateBbox({ x: x1, y: y1, width: w, height: h })
      }
    }

    const handleMouseUp = () => {
      if (dragAction.type === 'DRAW') {
        setIsDrawingMode(false)
      }
      setDragAction(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragAction, updateBbox])

  const dimensions = calculateRealDimensions(bbox)
  const displayType = currentType || defect.defect_type

  return (
    <div className="space-y-3">
      {/* Thanh công cụ tương tác Bounding Box */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <Icon name="crop_free" size={16} className="text-[#C9A227]" />
            <span>Thẩm định Bounding Box AI</span>
          </span>
          {isModified ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Đã chỉnh sửa thủ công
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Khung AI gốc ({(defect.confidence_score * 100).toFixed(0)}%)
            </span>
          )}
        </div>

        {/* Nút thao tác tương tác */}
        <div className="flex items-center gap-1.5">
          {/* Nút bật/tắt vẽ lại khung */}
          <button
            type="button"
            onClick={() => setIsDrawingMode(!isDrawingMode)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isDrawingMode
                ? 'bg-[#C9A227] text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
            title="Nhấn để kéo chuột vẽ lại khung nhận diện mới trên ảnh"
          >
            <Icon name="draw" size={14} />
            <span>{isDrawingMode ? 'Đang vẽ khung...' : 'Vẽ lại khung'}</span>
          </button>

          {/* Nút khôi phục khung gốc AI */}
          {isModified && (
            <button
              type="button"
              onClick={handleResetToAI}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all cursor-pointer"
              title="Đặt lại khung hộp ban đầu do AI nhận diện"
            >
              <Icon name="restart_alt" size={14} />
              <span>Khôi phục gốc</span>
            </button>
          )}
        </div>
      </div>

      {/* Viewport ảnh & Hộp Bounding Box tương tác */}
      <div
        ref={containerRef}
        onMouseDown={handleContainerMouseDown}
        className={`relative rounded-xl overflow-hidden border border-slate-300 bg-slate-950 aspect-video flex items-center justify-center select-none ${
          isDrawingMode ? 'cursor-crosshair' : 'cursor-default'
        }`}
      >
        <img
          src={defect.image_url}
          alt={defect.code}
          className="w-full h-full object-cover pointer-events-none"
        />

        {/* Hướng dẫn khi đang bật chế độ vẽ lại */}
        {isDrawingMode && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/90 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-xs flex items-center gap-1.5 shadow-lg pointer-events-none z-30 animate-pulse">
            <Icon name="touch_app" size={14} />
            <span>Nhấp và kéo chuột trên ảnh để vẽ hộp Bounding Box mới</span>
          </div>
        )}

        {/* Interactive Bounding Box */}
        <div
          onMouseDown={handleStartMove}
          className={`absolute border-2 transition-shadow group ${
            isModified
              ? 'border-[#C9A227] bg-[#C9A227]/25 shadow-[0_0_15px_rgba(201,162,39,0.4)]'
              : 'border-[#C9A227] bg-[#C9A227]/15'
          } ${isDrawingMode ? 'pointer-events-none' : 'cursor-move'}`}
          style={{
            left: `${bbox.x * 100}%`,
            top: `${bbox.y * 100}%`,
            width: `${bbox.width * 100}%`,
            height: `${bbox.height * 100}%`
          }}
        >
          {/* Nhãn loại lỗi & kích thước phía trên khung */}
          <div className="absolute -top-6 left-0 flex items-center gap-1 bg-[#1A1D20]/95 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-md border border-white/20 whitespace-nowrap pointer-events-none">
            <span className="text-[#C9A227]">{displayType}</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-200">
              {displayType.includes('CRACK')
                ? `Dài L: ${dimensions.lengthM}m`
                : `${dimensions.lengthM}m × ${dimensions.widthM}m`}
            </span>
          </div>

          {/* 8 Điểm neo co giãn khung (Resize Handles) */}
          {!isDrawingMode && (
            <>
              {/* 4 Góc */}
              <div
                onMouseDown={(e) => handleStartResize(e, 'nw')}
                className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#C9A227] border-2 border-white rounded-full cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                title="Kéo co giãn góc trên trái"
              />
              <div
                onMouseDown={(e) => handleStartResize(e, 'ne')}
                className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#C9A227] border-2 border-white rounded-full cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
                title="Kéo co giãn góc trên phải"
              />
              <div
                onMouseDown={(e) => handleStartResize(e, 'sw')}
                className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#C9A227] border-2 border-white rounded-full cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
                title="Kéo co giãn góc dưới trái"
              />
              <div
                onMouseDown={(e) => handleStartResize(e, 'se')}
                className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#C9A227] border-2 border-white rounded-full cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                title="Kéo co giãn góc dưới phải"
              />

              {/* 4 Cạnh */}
              <div
                onMouseDown={(e) => handleStartResize(e, 'n')}
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-[#C9A227] border border-white rounded-sm cursor-ns-resize shadow-sm hover:scale-110 transition-transform"
                title="Kéo cạnh trên"
              />
              <div
                onMouseDown={(e) => handleStartResize(e, 's')}
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-[#C9A227] border border-white rounded-sm cursor-ns-resize shadow-sm hover:scale-110 transition-transform"
                title="Kéo cạnh dưới"
              />
              <div
                onMouseDown={(e) => handleStartResize(e, 'w')}
                className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-4 bg-[#C9A227] border border-white rounded-sm cursor-ew-resize shadow-sm hover:scale-110 transition-transform"
                title="Kéo cạnh trái"
              />
              <div
                onMouseDown={(e) => handleStartResize(e, 'e')}
                className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-4 bg-[#C9A227] border border-white rounded-sm cursor-ew-resize shadow-sm hover:scale-110 transition-transform"
                title="Kéo cạnh phải"
              />
            </>
          )}
        </div>

        {/* Thanh ghi chú thao tác dưới chân ảnh */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-white/80 bg-slate-950/70 backdrop-blur-xs px-3 py-1 rounded-lg border border-white/10 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <Icon name="open_with" size={13} className="text-amber-400" />
            <span>Kéo thân hộp để dịch chuyển • Kéo các điểm neo tròn để co giãn kích thước</span>
          </div>
          <div className="font-mono text-amber-300 font-bold">
            S = {(dimensions.lengthM * dimensions.widthM).toFixed(2)} m²
          </div>
        </div>
      </div>
    </div>
  )
}

export default DefectBoundingBoxViewer
