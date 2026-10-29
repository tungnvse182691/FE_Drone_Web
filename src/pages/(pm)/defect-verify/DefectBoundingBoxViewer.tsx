import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Defect } from '../../../types/domain'
import { Icon } from '../../../components/ui/Icon'
import { DefectType } from '../../../types/enums'
import { formatDefectTypeLabel } from '../../../api/services/surveyService'

export interface BoundingBoxCoords {
  x: number // 0..1 (left)
  y: number // 0..1 (top)
  width: number // 0..1
  height: number // 0..1
}

interface DefectBoundingBoxViewerProps {
  defect: Defect
  currentType?: DefectType | string
  customTypeLabel?: string
  onBboxChange?: (newBbox: BoundingBoxCoords) => void
  onSaveBbox?: (newBbox: BoundingBoxCoords) => Promise<void> | void
  isSavingBbox?: boolean
}

type ResizeDirection = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e'

export const DefectBoundingBoxViewer: React.FC<DefectBoundingBoxViewerProps> = ({
  defect,
  currentType,
  customTypeLabel,
  onBboxChange,
  onSaveBbox,
  isSavingBbox = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const [bbox, setBbox] = useState<BoundingBoxCoords>(defect.bounding_box)
  const [savedBbox, setSavedBbox] = useState<BoundingBoxCoords>(defect.bounding_box)
  const [isModified, setIsModified] = useState<boolean>(false)
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false)
  const [imageLoadFailed, setImageLoadFailed] = useState<boolean>(false)

  const [dragAction, setDragAction] = useState<
    | { type: 'MOVE'; startX: number; startY: number; origBbox: BoundingBoxCoords }
    | { type: 'RESIZE'; handle: ResizeDirection; startX: number; startY: number; origBbox: BoundingBoxCoords }
    | { type: 'DRAW'; startX: number; startY: number }
    | null
  >(null)

  useEffect(() => {
    setBbox(defect.bounding_box)
    setSavedBbox(defect.bounding_box)
    setIsModified(false)
    setIsDrawingMode(false)
    setImageLoadFailed(false)
  }, [defect.id])

  const updateBbox = useCallback(
    (newB: BoundingBoxCoords, markModified = true) => {
      setBbox(newB)
      if (markModified) setIsModified(true)
      if (onBboxChange) {
        onBboxChange(newB)
      }
    },
    [onBboxChange]
  )

  const handleResetToAI = () => {
    updateBbox(savedBbox, false)
    setIsModified(false)
    setIsDrawingMode(false)
  }

  const handleSaveCurrentBbox = async () => {
    if (!onSaveBbox) return
    await onSaveBbox(bbox)
    setSavedBbox(bbox)
    setIsModified(false)
  }

  const getNormalizedPoint = (e: React.MouseEvent | MouseEvent): { x: number; y: number } | null => {
    if (!containerRef.current) return null
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.min(Math.max(0, (e.clientX - rect.left) / rect.width), 1)
    const y = Math.min(Math.max(0, (e.clientY - rect.top) / rect.height), 1)
    return { x, y }
  }

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

  const displayType = currentType || defect.defect_type
  const displayTypeLabel = formatDefectTypeLabel(displayType, customTypeLabel)
  const stationingLabel = `Km ${Math.floor(defect.chainage_km)}+${String(Math.round((defect.chainage_km % 1) * 1000)).padStart(3, '0')}`

  return (
    <div className="space-y-3">
      {/* Thanh công cụ tương tác Khung nhận diện */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <Icon name="crop_free" size={16} className="text-[#C9A227]" />
            <span>Thẩm định khung nhận diện AI</span>
          </span>
          {isModified ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Đã chỉnh khung ({bbox.x.toFixed(2)}, {bbox.y.toFixed(2)}, {bbox.width.toFixed(2)}, {bbox.height.toFixed(2)}) — Nhấn &quot;Lưu khung nhận diện&quot;
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Khung nhận diện ({(defect.confidence_score * 100).toFixed(0)}%)
            </span>
          )}
        </div>

        {/* Nút thao tác tương tác */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {isModified && onSaveBbox && (
            <button
              type="button"
              disabled={isSavingBbox}
              onClick={handleSaveCurrentBbox}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#C9A227] hover:bg-[#8C6D1F] text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="Lưu tọa độ khung bao đã chỉnh sửa vào CSDL"
            >
              <Icon name="save" size={14} />
              <span>{isSavingBbox ? 'Đang lưu...' : 'Lưu khung nhận diện'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsDrawingMode(!isDrawingMode)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isDrawingMode
                ? 'bg-[#C9A227] text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
            title="Nhấn để kéo chuột vẽ lại khung nhận diện mới trên khung hình"
          >
            <Icon name="draw" size={14} />
            <span>{isDrawingMode ? 'Đang vẽ khung...' : 'Vẽ lại khung nhận diện'}</span>
          </button>

          {isModified && (
            <button
              type="button"
              onClick={handleResetToAI}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all cursor-pointer"
              title="Khôi phục về tọa độ khung trước khi chỉnh"
            >
              <Icon name="restart_alt" size={14} />
              <span>Hoàn tác</span>
            </button>
          )}
        </div>
      </div>

      {/* Viewport Khung hình & Hộp nhận diện tương tác */}
      <div
        ref={containerRef}
        onMouseDown={handleContainerMouseDown}
        className={`relative rounded-xl overflow-hidden border border-slate-300 bg-[#14171A] aspect-video flex items-center justify-center select-none ${
          isDrawingMode ? 'cursor-crosshair' : 'cursor-default'
        }`}
      >
        {defect.image_url && !imageLoadFailed ? (
          <img
            src={defect.image_url}
            alt={defect.code}
            onError={() => setImageLoadFailed(true)}
            className="w-full h-full object-cover pointer-events-none"
          />
        ) : (
          /* Khung trực giao kỹ thuật khi tệp CSDL là khung hình mô phỏng */
          <div className="absolute inset-0 bg-[#1B1F24] flex flex-col justify-between p-4 pointer-events-none">
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
            <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-300">
              <span className="bg-slate-900/80 px-2.5 py-1 rounded border border-slate-700">
                Vị trí: {stationingLabel}
                {defect.timestamp_ms != null ? ` • Trích xuất tại mốc ${defect.timestamp_ms}ms (${(defect.timestamp_ms / 1000).toFixed(2)}s)` : ''}
              </span>
              <span className="bg-slate-900/80 px-2.5 py-1 rounded border border-slate-700">
                Mô hình AI: {defect.fixture_version || 'Road-YOLOv9'}
              </span>
            </div>
          </div>
        )}

        {/* Hướng dẫn khi đang bật chế độ vẽ lại */}
        {isDrawingMode && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/90 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-xs flex items-center gap-1.5 shadow-lg pointer-events-none z-30 animate-pulse">
            <Icon name="touch_app" size={14} />
            <span>Nhấp và kéo chuột trên khung hình để vẽ khung nhận diện mới</span>
          </div>
        )}

        {/* Interactive Bounding Box */}
        <div
          onMouseDown={handleStartMove}
          className={`absolute border-2 transition-shadow group z-20 ${
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
          {/* Nhãn loại lỗi & nhận diện AI phía trên khung */}
          <div className="absolute -top-6 left-0 flex items-center gap-1 bg-[#1A1D20]/95 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-md border border-white/20 whitespace-nowrap pointer-events-none">
            <span className="text-[#C9A227]">{displayTypeLabel}</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-200 font-mono">
              {(defect.confidence_score * 100).toFixed(0)}%
            </span>
          </div>

          {/* 8 Điểm neo co giãn khung (Resize Handles) */}
          {!isDrawingMode && (
            <>
              <div
                onMouseDown={(e) => handleStartResize(e, 'nw')}
                className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#C9A227] border-2 border-white rounded-full cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
              />
              <div
                onMouseDown={(e) => handleStartResize(e, 'ne')}
                className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#C9A227] border-2 border-white rounded-full cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
              />
              <div
                onMouseDown={(e) => handleStartResize(e, 'sw')}
                className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#C9A227] border-2 border-white rounded-full cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
              />
              <div
                onMouseDown={(e) => handleStartResize(e, 'se')}
                className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#C9A227] border-2 border-white rounded-full cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
              />
              <div
                onMouseDown={(e) => handleStartResize(e, 'n')}
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-[#C9A227] border border-white rounded-sm cursor-ns-resize shadow-sm hover:scale-110 transition-transform"
              />
              <div
                onMouseDown={(e) => handleStartResize(e, 's')}
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-[#C9A227] border border-white rounded-sm cursor-ns-resize shadow-sm hover:scale-110 transition-transform"
              />
              <div
                onMouseDown={(e) => handleStartResize(e, 'w')}
                className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-4 bg-[#C9A227] border border-white rounded-sm cursor-ew-resize shadow-sm hover:scale-110 transition-transform"
              />
              <div
                onMouseDown={(e) => handleStartResize(e, 'e')}
                className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-4 bg-[#C9A227] border border-white rounded-sm cursor-ew-resize shadow-sm hover:scale-110 transition-transform"
              />
            </>
          )}
        </div>

        {/* Thanh ghi chú thao tác dưới chân khung hình */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-white/80 bg-slate-950/75 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10 pointer-events-none z-20">
          <div className="flex items-center gap-1.5">
            <Icon name="open_with" size={13} className="text-amber-400" />
            <span>Kéo thân khung để dịch chuyển • Kéo các điểm neo để hiệu chỉnh vùng nhận diện</span>
          </div>
          <div className="text-amber-300 font-mono font-semibold text-[11px]">
            Khung bao: [{bbox.x.toFixed(2)}, {bbox.y.toFixed(2)}, {bbox.width.toFixed(2)}, {bbox.height.toFixed(2)}]
          </div>
        </div>
      </div>
    </div>
  )
}

export default DefectBoundingBoxViewer
