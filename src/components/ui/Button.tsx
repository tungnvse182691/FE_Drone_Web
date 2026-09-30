import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  }[size]

  const variantStyles = {
    primary: 'bg-brand-gold hover:bg-brand-goldDark text-white focus:ring-brand-gold shadow-sm',
    secondary: 'bg-brand-navy hover:bg-[#1f2633] text-white focus:ring-brand-navy shadow-sm',
    outline: 'border border-brand-border bg-white text-brand-dark hover:bg-brand-surfaceAlt focus:ring-brand-navy',
    danger: 'bg-brand-error hover:bg-[#c93b40] text-white focus:ring-brand-error shadow-sm',
    ghost: 'text-brand-dark hover:bg-black/5 focus:ring-brand-navy',
  }[variant]

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  )
}
