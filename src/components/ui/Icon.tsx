import React from 'react'

interface IconProps {
  name: string
  className?: string
  size?: number | string
  style?: React.CSSProperties
}

/**
 * Standard Material Symbols Outlined Icon Component theo DESIGN.md:
 * `<Icon name="check_circle" className="text-emerald-600" />`
 */
export const Icon: React.FC<IconProps> = ({ name, className = '', size = 20, style = {} }) => {
  const fontStyle: React.CSSProperties = {
    fontSize: typeof size === 'number' ? `${size}px` : size,
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
    userSelect: 'none',
    verticalAlign: 'middle',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style,
  }

  return (
    <span className={`material-symbols-outlined shrink-0 ${className}`} style={fontStyle}>
      {name}
    </span>
  )
}

export default Icon
