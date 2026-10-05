import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
  delay?: number
}

interface Coords {
  top: number
  left: number
  actualPosition: 'top' | 'bottom' | 'left' | 'right'
  horizontalAlign: 'center' | 'left-aligned' | 'right-aligned'
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
  delay = 100
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState<Coords | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const gap = 8

    let actualPosition = position

    // Tự động kiểm tra không gian trên viewport để chống tràn / cắt chữ
    if (position === 'top' && rect.top < 65) {
      // Nếu ở sát mép trên màn hình, tự động lật xuống dưới
      actualPosition = 'bottom'
    } else if (position === 'bottom' && rect.bottom > window.innerHeight - 65) {
      // Nếu ở sát đáy màn hình, lật lên trên
      actualPosition = 'top'
    }

    let horizontalAlign: 'center' | 'left-aligned' | 'right-aligned' = 'center'
    let top = 0
    let left = 0

    if (actualPosition === 'top' || actualPosition === 'bottom') {
      top = actualPosition === 'top' ? rect.top - gap : rect.bottom + gap

      // Nếu phần tử trigger nằm sát cạnh phải màn hình (ít hơn 240px từ lề phải)
      if (rect.right > window.innerWidth - 240) {
        horizontalAlign = 'right-aligned'
        left = Math.min(rect.right, window.innerWidth - 16)
      } else if (rect.left < 240) {
        horizontalAlign = 'left-aligned'
        left = Math.max(rect.left, 16)
      } else {
        horizontalAlign = 'center'
        left = rect.left + rect.width / 2
      }
    } else if (actualPosition === 'left') {
      top = rect.top + rect.height / 2
      left = rect.left - gap
    } else if (actualPosition === 'right') {
      top = rect.top + rect.height / 2
      left = rect.right + gap
    }

    setCoords({ top, left, actualPosition, horizontalAlign })
  }, [position])

  const showTooltip = () => {
    timerRef.current = setTimeout(() => {
      updatePosition()
      setIsVisible(true)
    }, delay)
  }

  const hideTooltip = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    setIsVisible(false)
  }

  // Cập nhật vị trí hoặc ẩn khi cuộn trang
  useEffect(() => {
    if (!isVisible) return

    const handleScrollOrResize = () => {
      updatePosition()
    }

    window.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize)

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize)
    }
  }, [isVisible, updatePosition])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  if (!content) {
    return <>{children}</>
  }

  const actualPosition = coords?.actualPosition || position
  const hAlign = coords?.horizontalAlign || 'center'

  const positionStyles: React.CSSProperties = {
    position: 'fixed',
    top: coords ? coords.top : 0,
    left: coords ? coords.left : 0,
    zIndex: 99999,
    transform:
      actualPosition === 'top'
        ? hAlign === 'right-aligned'
          ? 'translate(-100%, -100%)'
          : hAlign === 'left-aligned'
          ? 'translate(0, -100%)'
          : 'translate(-50%, -100%)'
        : actualPosition === 'bottom'
        ? hAlign === 'right-aligned'
          ? 'translate(-100%, 0)'
          : hAlign === 'left-aligned'
          ? 'translate(0, 0)'
          : 'translate(-50%, 0)'
        : actualPosition === 'left'
        ? 'translate(-100%, -50%)'
        : 'translate(0, -50%)',
    pointerEvents: 'none'
  }

  const arrowClasses = {
    top: `top-full ${hAlign === 'right-aligned' ? 'right-6' : hAlign === 'left-aligned' ? 'left-6' : 'left-1/2 -translate-x-1/2'} border-t-slate-900 border-x-transparent border-b-transparent border-t-[5px] border-x-[5px] border-b-0`,
    bottom: `bottom-full ${hAlign === 'right-aligned' ? 'right-6' : hAlign === 'left-aligned' ? 'left-6' : 'left-1/2 -translate-x-1/2'} border-b-slate-900 border-x-transparent border-t-transparent border-b-[5px] border-x-[5px] border-t-0`,
    left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-900 border-y-transparent border-r-transparent border-l-[5px] border-y-[5px] border-r-0',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-900 border-y-transparent border-l-transparent border-r-[5px] border-y-[5px] border-l-0'
  }[actualPosition]

  return (
    <>
      <div
        ref={triggerRef}
        className={`inline-flex items-center ${className}`}
        title=""
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </div>

      {isVisible &&
        coords &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            style={positionStyles}
            className="px-3.5 py-1.5 text-xs font-medium leading-snug text-white bg-slate-900/95 backdrop-blur-md rounded-lg shadow-2xl border border-slate-700/60 w-max max-w-sm sm:max-w-md transition-opacity duration-150 animate-in fade-in-0 zoom-in-95 text-center break-words select-none"
          >
            {content}
            <div className={`absolute w-0 h-0 border-solid ${arrowClasses}`} />
          </div>,
          document.body
        )}
    </>
  )
}
