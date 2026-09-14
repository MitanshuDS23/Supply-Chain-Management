import { useEffect } from 'react'
import { X, Inbox, AlertTriangle } from 'lucide-react'

/* ------------------------------ Format ------------------------------ */
export const money = (n) =>
  n == null || isNaN(n) ? '—' : '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const num = (n) => (n == null || isNaN(n) ? '—' : Number(n).toLocaleString('en-IN'))
export const dt = (s) => {
  if (!s) return '—'
  const d = new Date(s)
  if (isNaN(d)) return '—'
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
export const dtTime = (s) => {
  if (!s) return '—'
  const d = new Date(s)
  if (isNaN(d)) return '—'
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
export const initials = (s) => (s ? String(s).trim().slice(0, 2).toUpperCase() : '?')

/* ------------------------------ Button ------------------------------ */
export function Button({ variant = 'default', size, icon: Icon, children, className = '', ...rest }) {
  const cls = ['btn', variant !== 'default' && `btn-${variant}`, size === 'sm' && 'btn-sm', className].filter(Boolean).join(' ')
  return (
    <button className={cls} {...rest}>
      {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  )
}

/* ------------------------------- Card ------------------------------- */
export function Card({ title, actions, children, bodyClass = 'card-body', noBody }) {
  return (
    <div className="card">
      {(title || actions) && (
        <div className="card-head">
          {typeof title === 'string' ? <h3>{title}</h3> : title}
          {actions}
        </div>
      )}
      {noBody ? children : <div className={bodyClass}>{children}</div>}
    </div>
  )
}

/* ------------------------------ Badge ------------------------------- */
export function Badge({ tone = 'neutral', dot, children }) {
  return (
    <span className={`badge badge-${tone}`}>
      {dot && <span className="dot" />}
      {children}
    </span>
  )
}

// Map a variety of domain statuses to a badge tone.
export function StatusBadge({ status }) {
  const s = String(status || '').toLowerCase()
  const map = {
    placed: 'info', accepted: 'primary', transferred: 'warning', delivered: 'success',
    cancelled: 'danger', pending: 'warning',
    critical: 'danger', high: 'warning', medium: 'info', low: 'neutral',
    admin: 'primary', staff: 'info', manager: 'primary',
  }
  return <Badge tone={map[s] || 'neutral'} dot>{status || '—'}</Badge>
}

/* ------------------------------ Fields ------------------------------ */
export function Field({ label, hint, children, full }) {
  return (
    <div className={`field ${full ? 'full' : ''}`}>
      {label && <label>{label} {hint && <span className="hint">{hint}</span>}</label>}
      {children}
    </div>
  )
}
export const Input = (p) => <input className="input" {...p} />
export const Textarea = (p) => <textarea className="textarea" {...p} />
export function Select({ children, ...p }) { return <select className="select" {...p}>{children}</select> }

/* ------------------------------ Modal ------------------------------- */
export function Modal({ open, onClose, title, children, footer, size }) {
  useEffect(() => {
    if (!open) return
    const h = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className={`modal ${size === 'lg' ? 'lg' : ''}`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = 'Delete', busy }) {
  return (
    <Modal
      open={open} onClose={onClose} title={title || 'Are you sure?'}
      footer={<>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} disabled={busy}>{busy ? 'Working…' : confirmText}</Button>
      </>}
    >
      <div className="row" style={{ gap: 14, alignItems: 'flex-start' }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--danger-soft)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <AlertTriangle size={20} color="var(--danger)" />
        </div>
        <p className="muted" style={{ margin: 0 }}>{message}</p>
      </div>
    </Modal>
  )
}

/* --------------------------- State blocks --------------------------- */
export function Loading({ label = 'Loading…' }) {
  return <div className="loading-block"><div style={{ textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto 12px' }} /><div className="faint">{label}</div></div></div>
}
export function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', message, action }) {
  return (
    <div className="empty">
      <div className="e-icon"><Icon size={24} /></div>
      <h4>{title}</h4>
      {message && <p className="muted" style={{ maxWidth: 360, margin: '0 auto 14px' }}>{message}</p>}
      {action}
    </div>
  )
}

/* ------------------------------ Table ------------------------------- */
export function Table({ columns, children }) {
  return (
    <div className="table-wrap">
      <table className="tbl">
        <thead><tr>{columns.map((c, i) => <th key={i} className={c.num ? 'num' : ''} style={c.width ? { width: c.width } : undefined}>{c.label}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
