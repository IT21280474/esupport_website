import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { Link } from 'react-router'
import Icon from '../../components/common/Icon'
import { cx } from '../../lib/format'

const BTN_BASE =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-4 py-2 text-[.78rem] font-bold uppercase tracking-[.1em] transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50'
const BTN = {
  primary: 'border-navy-900 bg-navy-900 text-white hover:bg-navy-700',
  secondary: 'border-grey-200 bg-white text-navy-900 hover:border-grey-400 hover:bg-off',
  danger: 'border-danger bg-danger text-white hover:bg-[#912018]',
  ghost: 'border-transparent bg-transparent text-navy-900 hover:bg-off',
  subtle: 'border-transparent bg-off text-navy-900 hover:bg-grey-100',
}

/** Admin button; renders a router link when `to` is given. */
export function Btn({ variant = 'primary', icon, to, children, className, size, ...props }) {
  const classes = cx(BTN_BASE, BTN[variant], size === 'sm' && 'min-h-8 px-2.5 py-1 text-[.7rem]', className)
  const content = (
    <>
      {icon && <Icon name={icon} className="size-4" />}
      {children}
    </>
  )
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    )
  }
  return (
    <button type="button" className={classes} {...props}>
      {content}
    </button>
  )
}

/** Square icon-only button with an accessible label (also shown as a tooltip). */
export function IconBtn({ icon, label, className, tone = 'default', ...props }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={cx(
        'grid size-8 place-items-center rounded-md transition-colors disabled:opacity-40',
        tone === 'danger' ? 'text-danger hover:bg-danger-soft' : 'text-grey-600 hover:bg-off hover:text-navy-900',
        className,
      )}
      {...props}
    >
      <Icon name={icon} className="size-4" />
    </button>
  )
}

/** Title, breadcrumbs and page actions. */
export function PageHeader({ title, crumbs = [], description, actions }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="grid gap-1.5">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap gap-2 font-mono text-[.66rem] uppercase tracking-[.14em] text-grey-600">
              {crumbs.map((crumb, i) => (
                <li key={crumb.label} className={cx(i > 0 && 'before:mr-2 before:opacity-50 before:content-["/"]')}>
                  {crumb.to ? (
                    <Link to={crumb.to} className="hover:text-navy-900">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="text-[1.6rem] tracking-[-.02em] text-navy-950">{title}</h1>
        {description && <p className="max-w-2xl text-sm text-grey-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  )
}

export function Card({ title, actions, children, className, padded = true }) {
  return (
    <section className={cx('rounded-md border border-grey-200 bg-white', className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-4 border-b border-grey-100 px-5 py-3.5">
          {title && <h2 className="font-mono text-[.7rem] font-medium uppercase tracking-[.16em] text-grey-600">{title}</h2>}
          {actions}
        </div>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </section>
  )
}

const BADGE_TONES = {
  green: 'bg-csr-soft text-csr',
  red: 'bg-danger-soft text-danger',
  amber: 'bg-warn-soft text-warn',
  navy: 'bg-navy-100 text-navy-700',
  grey: 'bg-grey-100 text-grey-600',
  gold: 'bg-cream-deep text-hotel',
}

export function Badge({ tone = 'grey', children }) {
  return (
    <span className={cx('inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[.7rem] font-semibold', BADGE_TONES[tone])}>
      {children}
    </span>
  )
}

/** Status → badge colour for inquiries, applications and jobs. */
export const STATUS_TONES = {
  new: 'navy',
  in_progress: 'amber',
  reviewing: 'amber',
  shortlisted: 'gold',
  resolved: 'green',
  hired: 'green',
  published: 'green',
  available: 'green',
  archived: 'grey',
  draft: 'grey',
  closed: 'grey',
  rejected: 'red',
  unavailable: 'red',
}

export function Spinner({ label = 'Loading…', className }) {
  return (
    <div role="status" className={cx('flex items-center justify-center gap-3 py-16 text-sm text-grey-600', className)}>
      <span className="size-5 animate-spin rounded-full border-2 border-grey-200 border-t-navy-700" />
      {label}
    </div>
  )
}

export function EmptyState({ icon = 'inbox', title, text, action }) {
  return (
    <div className="grid justify-items-center gap-3 px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-off text-grey-400">
        <Icon name={icon} className="size-6" />
      </span>
      <p className="font-bold text-navy-900">{title}</p>
      {text && <p className="max-w-md text-sm text-grey-600">{text}</p>}
      {action}
    </div>
  )
}

export function ErrorNotice({ error, onRetry }) {
  if (!error) return null
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-md border-l-3 border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
      <span>{error.message || 'Something went wrong.'}</span>
      {onRetry && (
        <Btn variant="secondary" size="sm" onClick={onRetry}>
          Retry
        </Btn>
      )}
    </div>
  )
}

/** Accessible on/off switch. */
export function Toggle({ checked, onChange, label, disabled, id }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={Boolean(checked)}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-50',
        checked ? 'bg-csr' : 'bg-grey-200',
      )}
    >
      <span className={cx('inline-block size-5 rounded-full bg-white shadow transition-transform duration-200', checked ? 'translate-x-5.5' : 'translate-x-0.5')} />
    </button>
  )
}

export function Pagination({ meta, onPage }) {
  if (!meta || meta.last_page <= 1) return null
  const { current_page: page, last_page: last, total, from, to } = meta

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-grey-100 px-5 py-3 text-sm text-grey-600">
      <span>
        {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-1">
        <IconBtn icon="left" label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)} />
        <span className="px-2 font-mono text-xs">
          {page} / {last}
        </span>
        <IconBtn icon="right" label="Next page" disabled={page >= last} onClick={() => onPage(page + 1)} />
      </div>
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search…' }) {
  const [text, setText] = useState(value || '')
  const emit = useEffectEvent((next) => onChange(next))

  // Debounce typing before searching
  useEffect(() => {
    const timer = setTimeout(() => text !== (value || '') && emit(text), 300)
    return () => clearTimeout(timer)
  }, [text, value])

  return (
    <label className="relative block min-w-[220px] flex-1 sm:max-w-xs">
      <span className="sr-only">{placeholder}</span>
      <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-grey-400" />
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border border-grey-200 bg-white pl-9 pr-3 text-sm focus:border-navy-600 focus:outline-none focus:ring-3 focus:ring-navy-600/15"
      />
    </label>
  )
}

export const adminControl =
  'h-10 w-full rounded-md border border-grey-200 bg-white px-3 text-sm text-ink transition-colors hover:border-grey-400 focus:border-navy-600 focus:outline-none focus:ring-3 focus:ring-navy-600/15 aria-invalid:border-danger disabled:bg-off'

export function FilterSelect({ value, onChange, options, label }) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={cx(adminControl, 'select-arrow w-auto min-w-40')}>
        <option value="">{label}: all</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

/** Native <dialog> modal: focus trap, Escape to close, backdrop click closes. */
export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={title}
      className={cx(
        'm-auto max-h-[90vh] w-[calc(100vw-2rem)] overflow-hidden rounded-md bg-white p-0 text-ink shadow-lift backdrop:bg-navy-950/60 backdrop:backdrop-blur-[2px]',
        { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' }[size],
      )}
    >
      {open && (
        <div className="flex max-h-[90vh] flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-grey-100 px-5 py-4">
            <h2 className="text-lg tracking-[-.01em]">{title}</h2>
            <IconBtn icon="x" label="Close" onClick={onClose} />
          </div>
          <div className="flex-1 overflow-y-auto p-5">{children}</div>
          {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-grey-100 bg-off/60 px-5 py-3">{footer}</div>}
        </div>
      )}
    </dialog>
  )
}

/**
 * Promise-style confirmation: `const ok = await confirm({...})`.
 * Render <ConfirmHost/> once (AdminLayout does).
 */
let confirmListener = null
export function confirmDialog(options) {
  return new Promise((resolve) => confirmListener?.({ ...options, resolve }))
}

export function ConfirmHost() {
  const [request, setRequest] = useState(null)
  useEffect(() => {
    confirmListener = setRequest
    return () => {
      confirmListener = null
    }
  }, [])

  const close = (result) => {
    request?.resolve(result)
    setRequest(null)
  }

  return (
    <Modal
      open={Boolean(request)}
      onClose={() => close(false)}
      title={request?.title || 'Are you sure?'}
      size="sm"
      footer={
        <>
          <Btn variant="secondary" onClick={() => close(false)}>
            Cancel
          </Btn>
          <Btn variant={request?.danger === false ? 'primary' : 'danger'} onClick={() => close(true)} autoFocus>
            {request?.confirmLabel || 'Delete'}
          </Btn>
        </>
      }
    >
      <p className="text-sm text-grey-600">{request?.message}</p>
    </Modal>
  )
}
