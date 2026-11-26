import React from 'react'
import { Icon } from './Icon'

/** Bộ khối dựng chung cho panel nối API (xem docs/integration/UI-DONG-BO-20261116.md, mục "Hiện đại hóa panel nối API"). */

interface PanelShellProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  icon: string
  title: string
  subtitle?: string
  actions?: React.ReactNode
  as?: 'section' | 'div'
}

export const PanelShell: React.FC<PanelShellProps> = ({ icon, title, subtitle, actions, as = 'section', className = '', children, ...rest }) => {
  const Tag = as
  return (
    <Tag className={`rg-panel ${className}`} {...rest}>
      <div className="rg-panel-head">
        <span className="rg-panel-icon"><Icon name={icon} size={18} /></span>
        <div className="min-w-0 flex-1">
          <h4 className="rg-panel-title">{title}</h4>
          {subtitle && <p className="rg-panel-sub">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center justify-end gap-2">{actions}</div>}
      </div>
      {children}
    </Tag>
  )
}

/** Tiêu đề phụ trong panel (có icon). Icon nằm ngoài thẻ chữ để không lẫn vào nội dung. */
export const SectionTitle: React.FC<{ icon: string; children: React.ReactNode }> = ({ icon, children }) => (
  <div className="rg-section-title"><Icon name={icon} size={16} className="text-brand-navy" /><p>{children}</p></div>
)

export const Field: React.FC<{ label: string; hint?: string; span?: string; children: React.ReactNode }> = ({ label, hint, span = 'col-span-12', children }) => (
  <div className={span}>
    <span className="rg-label">{label}</span>
    {children}
    {hint && <p className="rg-hint">{hint}</p>}
  </div>
)

export const Feedback: React.FC<{ error?: string; message?: string }> = ({ error, message }) => (
  <>
    {error && <div className="rg-alert rg-alert-error"><Icon name="error" size={16} className="mt-px" /><p role="alert" className="min-w-0 break-words">{error}</p></div>}
    {message && <div className="rg-alert rg-alert-ok"><Icon name="check_circle" size={16} className="mt-px" /><p role="status" className="min-w-0 break-words">{message}</p></div>}
  </>
)

export const Empty: React.FC<{ icon?: string; children: React.ReactNode }> = ({ icon = 'inbox', children }) => (
  <div className="rg-empty"><Icon name={icon} size={18} className="text-slate-400" /><p>{children}</p></div>
)

export const Loading: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className="space-y-2"><div className="rg-skeleton" /><p className="text-slate-500">{children}</p></div>
)

export const Spinner: React.FC = () => <span className="rg-spin" aria-hidden="true" />

/** Nút chuẩn: variant secondary (outline) | primary (navy) | danger. Có spinner khi loading; không đổi chữ nút. */
export const PanelButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'secondary' | 'primary' | 'danger'; loading?: boolean }> = ({ variant = 'secondary', loading, className = '', children, ...rest }) => (
  <button type="button" className={`rg-btn ${variant === 'primary' ? 'rg-btn-primary' : variant === 'danger' ? 'rg-btn-danger' : ''} ${className}`} {...rest}>
    {loading && <Spinner />}
    {children}
  </button>
)

/** Cặp nhãn xám nhỏ + giá trị đậm. */
export const KV: React.FC<{ items: { k: string; v: React.ReactNode; mono?: boolean }[]; testId?: string }> = ({ items, testId }) => (
  <dl className="rg-kv" data-testid={testId}>
    {items.map((it) => (
      <div key={it.k} className="min-w-0">
        <dt className="rg-kv-k">{it.k}</dt>
        <dd className={`rg-kv-v ${it.mono ? 'font-mono' : ''}`}>{it.v}</dd>
      </div>
    ))}
  </dl>
)

export const Pill: React.FC<{ tone?: 'ok' | 'bad' | 'warn' | 'info' | 'neutral'; children: React.ReactNode }> = ({ tone = 'neutral', children }) => (
  <span className={`rg-pill rg-pill-${tone}`}>{children}</span>
)
