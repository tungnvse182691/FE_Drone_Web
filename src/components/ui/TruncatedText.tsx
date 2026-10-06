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

  const lineClampClasses: Record<number, string> = {
    1: 'line-clamp-1',
    2: 'line-clamp-2',
    3: 'line-clamp-3',
    4: 'line-clamp-4',
    5: 'line-clamp-5',
    6: 'line-clamp-6',
  }
  const isMultiLine = lines > 1
  const truncationClasses = isMultiLine
    ? `${lineClampClasses[lines] || 'line-clamp-2'} overflow-hidden text-ellipsis break-words`
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
