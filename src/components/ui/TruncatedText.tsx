import React from 'react'
import { Tooltip } from './Tooltip'

export interface TruncatedTextProps {
  text: string | null | undefined
  maxWidth?: string | number
  lines?: number
  className?: string
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right'
}

export const TruncatedText: React.FC<TruncatedTextProps> = ({
  text,
  maxWidth,
  lines = 1,
  className = '',
  tooltipPosition = 'top'
}) => {
  if (!text) return null

  const style: React.CSSProperties = {}
  if (maxWidth) {
    style.maxWidth = typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth
  }

  const isMultiLine = lines > 1
  const truncationClasses = isMultiLine
    ? `line-clamp-${lines} overflow-hidden text-ellipsis break-words`
    : 'truncate inline-block align-bottom max-w-full'

  return (
    <Tooltip content={text} position={tooltipPosition} className="max-w-full">
      <span
        style={style}
        className={`${truncationClasses} cursor-help ${className}`}
        title="" // Xóa title mặc định của browser
      >
        {text}
      </span>
    </Tooltip>
  )
}
