import React, { useRef, useState, useEffect } from 'react'

export interface TableWrapperProps {
  children: React.ReactNode
  className?: string
  minWidth?: string
}

export const TableWrapper: React.FC<TableWrapperProps> = ({
  children,
  className = '',
  minWidth = '980px'
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    const el = containerRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4)
  }

  useEffect(() => {
    checkScroll()
    const el = containerRef.current
    if (!el) return

    window.addEventListener('resize', checkScroll)
    return () => {
      window.removeEventListener('resize', checkScroll)
    }
  }, [])

  return (
    <div className={`relative w-full rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden ${className}`}>
      {/* Chỉ báo bóng mờ cuộn trái */}
      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/10 to-transparent z-20 transition-opacity" />
      )}

      {/* Chỉ báo bóng mờ cuộn phải */}
      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/10 to-transparent z-20 transition-opacity" />
      )}

      <div
        ref={containerRef}
        onScroll={checkScroll}
        className="overflow-x-auto w-full scroll-smooth custom-scrollbar"
      >
        <div style={{ minWidth }} className="w-full">
          {children}
        </div>
      </div>
    </div>
  )
}
