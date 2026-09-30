import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  action?: React.ReactNode
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-brand-border shadow-xs overflow-hidden ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between">
          <div>
            {title && <h3 className="text-base font-semibold text-brand-dark">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}
