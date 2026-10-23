import { useId, useState } from 'react'
import { cx, formatBytes } from '../../lib/format'
import Icon from '../common/Icon'

const CONTROL =
  'w-full min-h-13 rounded-xs border px-4 py-3.5 text-base transition-[border-color,box-shadow] duration-250 ' +
  'focus:outline-none focus:ring-3 aria-invalid:border-danger'

const TONES = {
  light: 'border-grey-200 bg-white text-ink hover:border-grey-400 focus:border-navy-600 focus:ring-navy-600/15',
  dark: 'border-white/16 bg-white/5 text-white placeholder:text-silver-dim hover:border-white/30 focus:border-silver focus:ring-white/10',
}

/** Label + control + error message, wired together for screen readers. */
export function Field({ label, required, error, hint, full, dark, children, className }) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className={cx('grid content-start gap-2', full && 'col-span-full', className)}>
      {label && (
        <label htmlFor={id} className={cx('text-[.72rem] font-bold uppercase tracking-[.12em]', dark ? 'text-silver' : 'text-grey-600')}>
          {label} {required && <span className="text-danger" aria-hidden="true">*</span>}
        </label>
      )}
      {children({ id, 'aria-describedby': error ? errorId : undefined, 'aria-required': required || undefined })}
      {hint && !error && <span className={cx('text-xs', dark ? 'text-silver-dim' : 'text-grey-600')}>{hint}</span>}
      {error && (
        <span id={errorId} className={cx('text-[.8rem]', dark ? 'text-[#ffb4ab]' : 'text-danger')}>
          {error}
        </span>
      )}
    </div>
  )
}

export function Input({ dark, className, ...props }) {
  return <input className={cx(CONTROL, TONES[dark ? 'dark' : 'light'], className)} {...props} />
}

export function Textarea({ dark, className, ...props }) {
  return <textarea className={cx(CONTROL, 'min-h-[150px] resize-y', TONES[dark ? 'dark' : 'light'], className)} {...props} />
}

export function Select({ dark, className, children, ...props }) {
  return (
    <select className={cx(CONTROL, 'select-arrow', dark && 'select-arrow-light', TONES[dark ? 'dark' : 'light'], className)} {...props}>
      {children}
    </select>
  )
}

/** Drag-and-drop / click file picker (prototype .file-drop). */
export function FileDrop({ id, accept, onFile, file, hint, ...aria }) {
  const [dragging, setDragging] = useState(false)

  return (
    <label
      htmlFor={id}
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        if (event.dataTransfer.files?.[0]) onFile(event.dataTransfer.files[0])
      }}
      className={cx(
        'relative grid min-h-30 cursor-pointer place-items-center gap-1.5 rounded-xs border-[1.5px] border-dashed bg-off p-5 text-center text-[.9rem] text-grey-600 transition-colors duration-250',
        'hover:border-navy-600 focus-within:border-navy-600',
        dragging ? 'border-navy-600' : 'border-grey-200',
      )}
    >
      <Icon name="upload" className="size-5 text-navy-700" />
      <span>
        <b className="text-navy-700">Choose a file</b> or drag it here
      </span>
      {hint && <small>{hint}</small>}
      <span className="font-medium text-ink">{file ? `${file.name} · ${formatBytes(file.size)}` : 'No file selected'}</span>
      <input
        id={id}
        type="file"
        accept={accept}
        className="absolute inset-0 cursor-pointer opacity-0"
        onChange={(event) => onFile(event.target.files?.[0] || null)}
        {...aria}
      />
    </label>
  )
}

/** Success / error message after submit; announced to screen readers. */
export function FormStatus({ status }) {
  if (status.state !== 'success' && status.state !== 'error') return <p role="status" aria-live="polite" className="sr-only" />
  const success = status.state === 'success'

  return (
    <p
      role={success ? 'status' : 'alert'}
      className={cx(
        'col-span-full border-l-3 px-5 py-4 text-[.95rem] text-ink animate-fade-in',
        success ? 'border-csr bg-csr-soft' : 'border-danger bg-danger-soft',
      )}
    >
      {status.message}
    </p>
  )
}

/** Hidden field that only bots fill in (checked server-side). */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Company website
        <input type="text" name="company_website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  )
}

/** Reads the honeypot value from the submitted form element. */
export function honeypotValue(form) {
  return form?.querySelector('[name="company_website"]')?.value || ''
}
