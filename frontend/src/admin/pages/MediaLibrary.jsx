import { useEffect, useRef, useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { api } from '../../lib/api'
import { cx, formatBytes, formatDateTime } from '../../lib/format'
import { MediaThumb, UploadZone, rememberMedia } from '../components/media'
import SchemaForm from '../components/SchemaForm'
import { useToast } from '../components/Toast'
import { Btn, Card, EmptyState, ErrorNotice, FilterSelect, Modal, PageHeader, Pagination, SearchInput, Spinner, confirmDialog } from '../components/ui'

function MediaDetails({ item, onClose, onChanged }) {
  const toast = useToast()
  const [values, setValues] = useState({ alt: item.alt, title: item.title, caption: item.caption })
  const [usage, setUsage] = useState(null)
  const [busy, setBusy] = useState(false)
  const replaceInput = useRef(null)

  useEffect(() => {
    api.get(`/admin/media/${item.id}`).then((res) => setUsage(res.usage)).catch(() => setUsage([]))
  }, [item.id])

  const save = async () => {
    setBusy(true)
    try {
      onChanged(await api.put(`/admin/media/${item.id}`, values))
      toast.success('Details saved.')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
  }

  const replace = async (file) => {
    if (!file) return
    const body = new FormData()
    body.append('file', file)
    setBusy(true)
    try {
      const updated = await api.post(`/admin/media/${item.id}/replace`, body)
      rememberMedia(updated)
      onChanged(updated)
      toast.success('File replaced everywhere it is used.')
    } catch (e) {
      toast.error(e.errors?.file?.[0] || e.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    const used = usage?.length ? ` It is used in: ${usage.join(', ')}. Those places will fall back to a placeholder.` : ''
    if (!(await confirmDialog({ title: 'Delete file?', message: `“${item.original_name}” will be deleted permanently.${used}` }))) return
    try {
      await api.delete(`/admin/media/${item.id}`)
      toast.success('File deleted.')
      onChanged(null)
      onClose()
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={item.original_name}
      size="lg"
      footer={
        <>
          <Btn variant="ghost" icon="trash" className="mr-auto text-danger" onClick={remove}>
            Delete
          </Btn>
          <Btn variant="secondary" icon="upload" disabled={busy} onClick={() => replaceInput.current?.click()}>
            Replace file
          </Btn>
          <Btn icon="check" disabled={busy} onClick={save}>
            Save details
          </Btn>
        </>
      }
    >
      <input ref={replaceInput} type="file" className="sr-only" tabIndex={-1} accept={item.type === 'image' ? 'image/jpeg,image/png,image/webp,image/gif' : '.pdf,.doc,.docx'} onChange={(e) => replace(e.target.files?.[0])} />
      <div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
        <div className="grid content-start gap-3">
          <MediaThumb media={{ ...item, thumb: item.src }} className="max-h-80 w-full rounded-md object-contain" />
          <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-1.5 text-xs">
            <dt className="text-grey-600">Type</dt>
            <dd>{item.mime_type}</dd>
            <dt className="text-grey-600">Size</dt>
            <dd>{formatBytes(item.size)}</dd>
            {item.width && (
              <>
                <dt className="text-grey-600">Dimensions</dt>
                <dd>
                  {item.width} × {item.height}px
                </dd>
              </>
            )}
            <dt className="text-grey-600">Uploaded</dt>
            <dd>
              {formatDateTime(item.created_at)} {item.uploaded_by && `by ${item.uploaded_by}`}
            </dd>
            <dt className="text-grey-600">URL</dt>
            <dd className="break-all">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-navy-600 underline">
                {item.url}
              </a>
            </dd>
          </dl>
        </div>
        <div className="grid content-start gap-5">
          <SchemaForm
            fields={[
              { key: 'alt', type: 'text', label: 'Alt text', help: 'Describe the image for screen readers and search engines.' },
              { key: 'title', type: 'text', label: 'Title' },
              { key: 'caption', type: 'textarea', label: 'Caption', rows: 2 },
            ]}
            value={values}
            onChange={setValues}
          />
          <div className="rounded-md bg-off p-3 text-xs">
            <b className="mb-1 block font-mono uppercase tracking-[.12em] text-grey-600">Used in</b>
            {usage === null ? 'Checking…' : usage.length ? <ul className="list-disc pl-4">{usage.map((place) => <li key={place}>{place}</li>)}</ul> : 'Not used anywhere yet.'}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default function MediaLibrary() {
  const [query, setQuery] = useState({ search: '', type: '', page: 1 })
  const { data, error, loading, reload } = useApi('/admin/media', { ...query, per_page: 30 }, { cache: false })
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (data) rememberMedia(data.data)
  }, [data])

  return (
    <>
      <PageHeader title="Media library" crumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Media library' }]} description="Upload once, reuse anywhere. Images are automatically resized and converted to WebP for fast loading." />
      <div className="grid gap-6">
        <UploadZone accept="image/jpeg,image/png,image/webp,image/gif,.pdf,.doc,.docx" onUploaded={() => (query.page === 1 ? reload() : setQuery((q) => ({ ...q, page: 1 })))} />
        <Card padded={false}>
          <div className="flex flex-wrap items-center gap-3 border-b border-grey-100 px-5 py-3">
            <SearchInput value={query.search} onChange={(search) => setQuery((q) => ({ ...q, search, page: 1 }))} placeholder="Search file name, title or alt text" />
            <FilterSelect label="Type" value={query.type} onChange={(type) => setQuery((q) => ({ ...q, type, page: 1 }))} options={[{ value: 'image', label: 'Images' }, { value: 'document', label: 'Documents' }]} />
            {data && <span className="ml-auto text-xs text-grey-600">{data.meta.total} files</span>}
          </div>
          <ErrorNotice error={error} onRetry={reload} />
          {loading && !data ? (
            <Spinner />
          ) : data?.data.length ? (
            <div className={cx('grid grid-cols-2 gap-4 p-5 sm:grid-cols-4 lg:grid-cols-6', loading && 'opacity-60')}>
              {data.data.map((item) => (
                <button key={item.id} type="button" onClick={() => setSelected(item)} className="group grid gap-1.5 text-left">
                  <MediaThumb media={item} className="aspect-square w-full rounded-md border border-grey-200 transition-colors group-hover:border-navy-600" />
                  <span className="truncate text-xs font-semibold">{item.title || item.original_name}</span>
                  <span className="text-[.68rem] text-grey-600">
                    {item.width ? `${item.width}×${item.height} · ` : ''}
                    {formatBytes(item.size)}
                    {item.type === 'image' && !item.alt && <span className="ml-1 text-warn">· no alt</span>}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState icon="image" title="No files" text="Upload images or documents above." />
          )}
          <Pagination meta={data?.meta} onPage={(page) => setQuery((q) => ({ ...q, page }))} />
        </Card>
      </div>
      {selected && (
        <MediaDetails
          key={selected.id}
          item={selected}
          onClose={() => setSelected(null)}
          onChanged={(updated) => {
            if (updated) setSelected(updated)
            reload()
          }}
        />
      )}
    </>
  )
}
