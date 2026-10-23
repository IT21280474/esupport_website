import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '../../components/common/Icon'
import { api } from '../../lib/api'
import { cx, formatBytes } from '../../lib/format'
import { useToast } from './Toast'
import { Btn, EmptyState, IconBtn, Modal, Pagination, SearchInput, Spinner } from './ui'

/* ---------------------------------------------------------------------------
 * Media lookup cache: forms store media ids; previews resolve them here.
 * ------------------------------------------------------------------------- */
const mediaCache = new Map()
const listeners = new Set()

export function rememberMedia(items) {
  ;[].concat(items || []).forEach((item) => item?.id && mediaCache.set(item.id, item))
  listeners.forEach((listener) => listener())
}

/** Resolve media ids to media objects, fetching any not yet cached. */
export function useMediaItems(ids) {
  const key = (ids || []).filter(Boolean).join(',')
  const [, force] = useState(0)

  useEffect(() => {
    const rerender = () => force((n) => n + 1)
    listeners.add(rerender)
    return () => listeners.delete(rerender)
  }, [])

  useEffect(() => {
    const missing = key.split(',').filter(Boolean).map(Number).filter((id) => !mediaCache.has(id))
    if (!missing.length) return
    api.get('/admin/media', { ids: missing, per_page: missing.length }).then((res) => rememberMedia(res.data)).catch(() => {})
  }, [key])

  return (ids || []).map((id) => mediaCache.get(Number(id)) || null)
}

export function MediaThumb({ media, className }) {
  if (!media) return <div className={cx('grid place-items-center bg-off text-grey-400', className)}><Icon name="image" className="size-6" /></div>
  if (media.type !== 'image') {
    return (
      <div className={cx('grid place-items-center gap-1 bg-off p-2 text-center text-grey-600', className)}>
        <Icon name="file" className="size-6" />
        <span className="line-clamp-2 break-all text-[.65rem]">{media.original_name}</span>
      </div>
    )
  }
  return <img src={media.thumb || media.url} alt={media.alt || ''} loading="lazy" className={cx('bg-off object-cover', className)} />
}

/* ---------------------------------------------------------------------------
 * Upload zone (multi-file, drag & drop) used by the picker and the library.
 * ------------------------------------------------------------------------- */
export function UploadZone({ onUploaded, accept = 'image/*', compact = false }) {
  const toast = useToast()
  const input = useRef(null)
  const [busy, setBusy] = useState(null)
  const [dragging, setDragging] = useState(false)

  const upload = async (files) => {
    const list = [...files]
    if (!list.length) return
    const uploaded = []
    for (const [index, file] of list.entries()) {
      setBusy(`Uploading ${index + 1} of ${list.length}…`)
      const body = new FormData()
      body.append('file', file)
      try {
        uploaded.push(await api.post('/admin/media', body))
      } catch (error) {
        toast.error(`${file.name}: ${error.errors?.file?.[0] || error.message}`)
      }
    }
    setBusy(null)
    if (input.current) input.current.value = ''
    if (uploaded.length) {
      rememberMedia(uploaded)
      toast.success(`${uploaded.length} file${uploaded.length > 1 ? 's' : ''} uploaded.`)
      onUploaded?.(uploaded)
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        upload(e.dataTransfer.files)
      }}
      className={cx(
        'grid place-items-center gap-2 rounded-md border-[1.5px] border-dashed text-center text-sm text-grey-600 transition-colors',
        compact ? 'p-4' : 'p-8',
        dragging ? 'border-navy-600 bg-navy-100/40' : 'border-grey-200 bg-off',
      )}
    >
      {busy ? (
        <span className="flex items-center gap-2">
          <span className="size-4 animate-spin rounded-full border-2 border-grey-200 border-t-navy-700" /> {busy}
        </span>
      ) : (
        <>
          <Icon name="upload" className="size-6 text-navy-700" />
          <p>
            Drag files here or{' '}
            <button type="button" className="font-bold text-navy-700 underline" onClick={() => input.current?.click()}>
              browse
            </button>
          </p>
          <small>JPG, PNG, WebP or GIF up to 8 MB · PDF or Word up to 10 MB</small>
        </>
      )}
      <input ref={input} type="file" multiple accept={accept} className="sr-only" tabIndex={-1} onChange={(e) => upload(e.target.files)} />
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Picker modal: choose one or several items from the media library.
 * ------------------------------------------------------------------------- */
export function MediaPicker({ open, onClose, onSelect, multiple = false, type = 'image' }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState(null)
  const [selected, setSelected] = useState([])

  const load = useCallback(() => {
    api.get('/admin/media', { search, type, page, per_page: 24 }).then((res) => {
      rememberMedia(res.data)
      setResult(res)
    })
  }, [search, type, page])

  useEffect(() => {
    if (open) load()
  }, [open, load])

  useEffect(() => {
    if (!open) setSelected([])
  }, [open])

  const toggle = (item) => {
    if (!multiple) {
      onSelect(item)
      onClose()
      return
    }
    setSelected((list) => (list.some((m) => m.id === item.id) ? list.filter((m) => m.id !== item.id) : [...list, item]))
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={multiple ? 'Choose images' : 'Choose from media library'}
      size="xl"
      footer={
        multiple && (
          <>
            <span className="mr-auto self-center text-sm text-grey-600">{selected.length} selected</span>
            <Btn variant="secondary" onClick={onClose}>
              Cancel
            </Btn>
            <Btn
              disabled={!selected.length}
              onClick={() => {
                onSelect(selected)
                onClose()
              }}
            >
              Add selected
            </Btn>
          </>
        )
      }
    >
      <div className="grid gap-5">
        <UploadZone
          compact
          accept={type === 'image' ? 'image/jpeg,image/png,image/webp,image/gif' : undefined}
          onUploaded={(items) => {
            if (multiple) setSelected((list) => [...list, ...items])
            else {
              onSelect(items[0])
              onClose()
            }
            setPage(1)
            load()
          }}
        />
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          placeholder="Search by name or alt text"
        />
        {!result ? (
          <Spinner />
        ) : result.data.length ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {result.data.map((item) => {
              const isSelected = selected.some((m) => m.id === item.id)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggle(item)}
                  aria-pressed={multiple ? isSelected : undefined}
                  title={item.original_name}
                  className={cx('group relative overflow-hidden rounded-md border-2 text-left', isSelected ? 'border-navy-600' : 'border-transparent hover:border-grey-200')}
                >
                  <MediaThumb media={item} className="aspect-square w-full" />
                  {isSelected && (
                    <span className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-navy-600 text-white">
                      <Icon name="check" className="size-4" />
                    </span>
                  )}
                  <span className="block truncate px-1 py-1 text-[.68rem] text-grey-600">{item.original_name}</span>
                </button>
              )
            })}
          </div>
        ) : (
          <EmptyState icon="image" title="No files found" text="Upload a file above to add it to the library." />
        )}
        {result && <Pagination meta={result.meta} onPage={setPage} />}
      </div>
    </Modal>
  )
}

/** Single media field: preview + choose / remove. Value is a media id. */
export function MediaField({ value, onChange, type = 'image', id }) {
  const [open, setOpen] = useState(false)
  const [media] = useMediaItems(value ? [value] : [])

  return (
    <div className="flex flex-wrap items-center gap-4">
      <MediaThumb media={value ? media : null} className="size-24 rounded-md border border-grey-200" />
      <div className="grid gap-1.5">
        {value && media && (
          <span className="max-w-xs truncate text-xs text-grey-600">
            {media.original_name} {media.width ? `· ${media.width}×${media.height}` : ''} {media.size ? `· ${formatBytes(media.size)}` : ''}
          </span>
        )}
        <div className="flex gap-2">
          <Btn id={id} variant="secondary" size="sm" icon="image" onClick={() => setOpen(true)}>
            {value ? 'Change' : 'Choose'}
          </Btn>
          {value && (
            <Btn variant="ghost" size="sm" onClick={() => onChange(null)}>
              Remove
            </Btn>
          )}
        </div>
      </div>
      <MediaPicker open={open} type={type} onClose={() => setOpen(false)} onSelect={(item) => onChange(item.id)} />
    </div>
  )
}

/** Ordered gallery of media ids with add / remove / move. */
export function GalleryField({ value = [], onChange }) {
  const [open, setOpen] = useState(false)
  const ids = value || []
  const items = useMediaItems(ids)
  const move = (index, delta) => {
    const next = [...ids]
    const [moved] = next.splice(index, 1)
    next.splice(index + delta, 0, moved)
    onChange(next)
  }

  return (
    <div className="grid gap-3">
      {ids.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {ids.map((mediaId, index) => (
            <li key={mediaId} className="overflow-hidden rounded-md border border-grey-200 bg-white">
              <MediaThumb media={items[index]} className="aspect-square w-full" />
              <div className="flex justify-between px-1 py-1">
                <IconBtn icon="left" label="Move earlier" disabled={index === 0} onClick={() => move(index, -1)} />
                <IconBtn icon="trash" tone="danger" label="Remove from gallery" onClick={() => onChange(ids.filter((v) => v !== mediaId))} />
                <IconBtn icon="right" label="Move later" disabled={index === ids.length - 1} onClick={() => move(index, 1)} />
              </div>
            </li>
          ))}
        </ul>
      )}
      <div>
        <Btn variant="secondary" size="sm" icon="plus" onClick={() => setOpen(true)}>
          Add images
        </Btn>
      </div>
      <MediaPicker open={open} multiple onClose={() => setOpen(false)} onSelect={(picked) => onChange([...new Set([...ids, ...picked.map((m) => m.id)])])} />
    </div>
  )
}
