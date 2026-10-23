import { Suspense, lazy, useId, useState } from 'react'
import Icon, { ICON_NAMES } from '../../components/common/Icon'
import { useApi } from '../../hooks/useApi'
import { cx } from '../../lib/format'
import { GalleryField, MediaField } from './media'
import { Btn, IconBtn, Modal, Spinner, Toggle, adminControl } from './ui'

const RichTextEditor = lazy(() => import('./RichTextEditor'))

/** Registry select options come as {value: label}; module configs may use [{value, label}]. */
function normalizeOptions(options) {
  if (Array.isArray(options)) return options
  return Object.entries(options || {}).map(([value, label]) => ({ value, label }))
}

/** Label, help text and error around a control. */
export function FormRow({ label, help, error, required, children, full = true, htmlFor }) {
  return (
    <div className={cx('grid content-start gap-1.5', full ? 'col-span-full' : 'col-span-full sm:col-span-1')}>
      {label && (
        <label htmlFor={htmlFor} className="text-[.72rem] font-bold uppercase tracking-[.1em] text-grey-600">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      {children}
      {help && !error && <p className="text-xs text-grey-600">{help}</p>}
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

function IconPicker({ value, onChange, id }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-md border border-grey-200 bg-off text-navy-700">
          {value ? <Icon name={value} className="size-6" strokeWidth={1.4} /> : <Icon name="x" className="size-4 text-grey-400" />}
        </span>
        <Btn id={id} variant="secondary" size="sm" onClick={() => setOpen(true)}>
          {value ? 'Change icon' : 'Choose icon'}
        </Btn>
        {value && (
          <Btn variant="ghost" size="sm" onClick={() => onChange(null)}>
            Clear
          </Btn>
        )}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Choose an icon" size="lg">
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {ICON_NAMES.filter((name) => !['x', 'left', 'right', 'up', 'down', 'menu', 'drag', 'logout', 'trash', 'edit', 'copy', 'grid', 'cog', 'eye', 'eye-off', 'lock', 'layers', 'inbox', 'activity', 'file', 'page', 'plus', 'external', 'download', 'image', 'user'].includes(name)).map((name) => (
            <button
              key={name}
              type="button"
              title={name}
              onClick={() => {
                onChange(name)
                setOpen(false)
              }}
              className={cx('grid aspect-square place-items-center gap-1 rounded-md border p-2 text-navy-700 hover:border-navy-600 hover:bg-off', value === name ? 'border-navy-600 bg-navy-100' : 'border-grey-200')}
            >
              <Icon name={name} className="size-6" strokeWidth={1.4} />
              <span className="truncate text-[.6rem] text-grey-600">{name}</span>
            </button>
          ))}
        </div>
      </Modal>
    </>
  )
}

function TagsInput({ value = [], onChange, id, max = 20 }) {
  const [text, setText] = useState('')
  const tags = value || []
  const add = () => {
    const tag = text.trim()
    if (tag && !tags.includes(tag) && tags.length < max) onChange([...tags, tag])
    setText('')
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-grey-200 bg-white p-2 focus-within:border-navy-600 focus-within:ring-3 focus-within:ring-navy-600/15">
      {tags.map((tag, index) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-navy-100 py-1 pl-3 pr-1 text-xs font-semibold text-navy-700">
          {tag}
          <button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(tags.filter((_, i) => i !== index))} className="grid size-5 place-items-center rounded-full hover:bg-white">
            <Icon name="x" className="size-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            add()
          } else if (e.key === 'Backspace' && !text && tags.length) {
            onChange(tags.slice(0, -1))
          }
        }}
        onBlur={add}
        placeholder={tags.length >= max ? 'Maximum reached' : 'Type and press Enter'}
        disabled={tags.length >= max}
        className="min-w-32 flex-1 px-1 text-sm focus:outline-none"
      />
    </div>
  )
}

function ListField({ field, value = [], onChange, errors, path }) {
  const items = value || []
  const [openIndex, setOpenIndex] = useState(items.length === 1 ? 0 : -1)
  const max = field.max || 20
  const labelOf = (item, index) => {
    const raw = item?.[field.item_label] || item?.title || item?.label || item?.name
    return raw ? String(raw).replace(/\n/g, ' ') : `Item ${index + 1}`
  }
  const update = (index, next) => onChange(items.map((item, i) => (i === index ? next : item)))
  const move = (index, delta) => {
    const next = [...items]
    const [moved] = next.splice(index, 1)
    next.splice(index + delta, 0, moved)
    onChange(next)
    setOpenIndex(index + delta)
  }

  return (
    <div className="grid gap-2">
      {items.map((item, index) => {
        const open = openIndex === index
        const hasError = Object.keys(errors).some((k) => k.startsWith(`${path}.${index}.`))
        return (
          <div key={index} className={cx('rounded-md border bg-white', hasError ? 'border-danger' : 'border-grey-200')}>
            <div className="flex items-center gap-1 px-2 py-1.5">
              <button type="button" aria-expanded={open} onClick={() => setOpenIndex(open ? -1 : index)} className="flex min-w-0 flex-1 items-center gap-2 px-1 py-1 text-left text-sm font-semibold">
                <Icon name={open ? 'down' : 'right'} className="size-4 text-grey-400" />
                <span className="font-mono text-[.66rem] text-grey-400">{String(index + 1).padStart(2, '0')}</span>
                <span className="truncate">{labelOf(item, index)}</span>
              </button>
              <IconBtn icon="up" label="Move up" disabled={index === 0} onClick={() => move(index, -1)} />
              <IconBtn icon="down" label="Move down" disabled={index === items.length - 1} onClick={() => move(index, 1)} />
              <IconBtn icon="copy" label="Duplicate" disabled={items.length >= max} onClick={() => onChange([...items.slice(0, index + 1), structuredClone(item), ...items.slice(index + 1)])} />
              <IconBtn icon="trash" tone="danger" label="Remove" onClick={() => onChange(items.filter((_, i) => i !== index))} />
            </div>
            {open && (
              <div className="border-t border-grey-100 bg-off/50 p-4">
                <SchemaForm fields={field.fields} value={item || {}} onChange={(next) => update(index, next)} errors={errors} errorPrefix={`${path}.${index}.`} />
              </div>
            )}
          </div>
        )
      })}
      <div>
        <Btn
          variant="secondary"
          size="sm"
          icon="plus"
          disabled={items.length >= max}
          onClick={() => {
            onChange([...items, {}])
            setOpenIndex(items.length)
          }}
        >
          Add {field.add_label || 'item'}
        </Btn>
        {items.length >= max && <span className="ml-3 text-xs text-grey-600">Maximum of {max} reached</span>}
      </div>
    </div>
  )
}

function RelationSelect({ field, value, onChange, id, multiple }) {
  const { data } = useApi(`/admin/${field.endpoint}`, { per_page: 200 }, { cache: false })
  const options = (data?.data || []).map((row) => ({ value: row.id, label: row.name || row.title }))

  if (multiple) {
    const selected = value || []
    return (
      <div className="flex flex-wrap gap-2">
        {!data && <span className="text-sm text-grey-600">Loading…</span>}
        {options.map((option) => {
          const checked = selected.includes(option.value)
          return (
            <label key={option.value} className={cx('inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm', checked ? 'border-navy-600 bg-navy-100 text-navy-700' : 'border-grey-200')}>
              <input
                type="checkbox"
                className="accent-navy-700"
                checked={checked}
                onChange={() => onChange(checked ? selected.filter((v) => v !== option.value) : [...selected, option.value])}
              />
              {option.label}
            </label>
          )
        })}
      </div>
    )
  }

  return (
    <select id={id} value={value ?? ''} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)} className={cx(adminControl, 'select-arrow')}>
      <option value="">{field.placeholder || '— None —'}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

/** One control for one field definition. */
export function FieldControl({ field, value, onChange, error, errors = {}, path }) {
  const id = useId()
  const invalid = error ? 'true' : undefined
  let control

  switch (field.type) {
    case 'textarea':
      control = <textarea id={id} rows={field.rows || 3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} aria-invalid={invalid} className={cx(adminControl, 'h-auto py-2 leading-relaxed')} />
      break
    case 'richtext':
      control = (
        <Suspense fallback={<Spinner label="Loading editor…" className="py-6" />}>
          <RichTextEditor id={id} value={value} onChange={onChange} invalid={Boolean(error)} />
        </Suspense>
      )
      break
    case 'media':
      control = <MediaField id={id} value={value} onChange={onChange} type={field.media_type || 'image'} />
      break
    case 'gallery':
      control = <GalleryField value={value} onChange={onChange} />
      break
    case 'select':
      control = (
        <select id={id} value={value ?? ''} onChange={(e) => onChange(e.target.value || null)} aria-invalid={invalid} className={cx(adminControl, 'select-arrow')}>
          {!field.required && <option value="">{field.placeholder || '— Default —'}</option>}
          {normalizeOptions(field.options).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )
      break
    case 'toggle':
      control = (
        <div className="flex items-center gap-3">
          <Toggle id={id} checked={Boolean(value)} onChange={onChange} label={field.label} />
          <span className="text-sm text-grey-600">{value ? field.on_label || 'On' : field.off_label || 'Off'}</span>
        </div>
      )
      break
    case 'number':
      control = (
        <input id={id} type="number" min={field.min} max={field.max} step={field.step} value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} aria-invalid={invalid} className={adminControl} />
      )
      break
    case 'icon':
      control = <IconPicker id={id} value={value} onChange={onChange} />
      break
    case 'tags':
      control = <TagsInput id={id} value={value} onChange={onChange} max={field.max} />
      break
    case 'list':
      control = <ListField field={field} value={value} onChange={onChange} errors={errors} path={path} />
      break
    case 'relation':
      control = <RelationSelect id={id} field={field} value={value} onChange={onChange} />
      break
    case 'relations':
      control = <RelationSelect id={id} field={field} value={value} onChange={onChange} multiple />
      break
    default:
      control = (
        <input
          id={id}
          type={{ url: 'text', email: 'email', password: 'password', date: 'date' }[field.type] || 'text'}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          autoComplete={field.type === 'password' ? 'new-password' : undefined}
          aria-invalid={invalid}
          className={adminControl}
        />
      )
  }

  return (
    <FormRow label={field.type === 'toggle' && field.inline ? null : field.label} help={field.help} error={error} required={field.required} full={!field.half} htmlFor={id}>
      {control}
    </FormRow>
  )
}

/**
 * Renders a list of field definitions (the same format the backend serves for
 * page sections and settings) as a controlled form.
 */
export default function SchemaForm({ fields, value, onChange, errors = {}, errorPrefix = '' }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {fields.map((field) => {
        const path = `${errorPrefix}${field.key}`
        return (
          <FieldControl
            key={field.key}
            field={field}
            value={value?.[field.key]}
            onChange={(next) => onChange({ ...value, [field.key]: next })}
            error={[].concat(errors[path] || [])[0]}
            errors={errors}
            path={path}
          />
        )
      })}
    </div>
  )
}
