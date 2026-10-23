import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Route, Routes, useNavigate, useParams } from 'react-router'
import Icon from '../../components/common/Icon'
import { useApi } from '../../hooks/useApi'
import { api } from '../../lib/api'
import { cx, formatDate } from '../../lib/format'
import { useMeta } from '../useMeta'
import { MediaThumb, rememberMedia } from './media'
import SchemaForm from './SchemaForm'
import { useToast } from './Toast'
import { Badge, Btn, Card, EmptyState, ErrorNotice, FilterSelect, IconBtn, PageHeader, Pagination, SearchInput, Spinner, Toggle, confirmDialog } from './ui'

/* Reusable column renderers for module configs */
export const col = {
  image: (key = 'image', label = '') => ({
    key,
    label,
    className: 'w-16',
    render: (row) => <MediaThumb media={row[key] || row.logo || row.cover} className="size-11 rounded" />,
  }),
  title: (key = 'name', sub) => ({
    key,
    label: 'Name',
    render: (row, { editPath }) => (
      <div className="min-w-0">
        <Link to={editPath(row)} className="font-semibold text-navy-900 hover:text-navy-600">
          {row[key]}
        </Link>
        {sub && sub(row) && <p className="truncate text-xs text-grey-600">{sub(row)}</p>}
      </div>
    ),
  }),
  text: (key, label, format = (v) => v) => ({ key, label, render: (row) => <span className="text-sm text-grey-600">{format(row[key], row) ?? '—'}</span> }),
  badge: (key, label, labels = {}) => ({
    key,
    label,
    render: (row) => <Badge tone={{ published: 'green', available: 'green', draft: 'grey', closed: 'grey', unavailable: 'red' }[row[key]] || 'navy'}>{labels[row[key]] || row[key]}</Badge>,
  }),
  updated: () => ({ key: 'updated_at', label: 'Updated', className: 'whitespace-nowrap', render: (row) => <span className="text-xs text-grey-600">{formatDate(row.updated_at)}</span> }),
}

/** Values for the form from an API record: only the configured field keys. */
function toFormValues(fields, record, defaults = {}) {
  const values = { ...defaults }
  fields.forEach((field) => {
    if (record && record[field.key] !== undefined) values[field.key] = record[field.key]
  })
  return values
}

function ResourceList({ config, basePath }) {
  const toast = useToast()
  const [query, setQuery] = useState({ search: '', page: 1, ...Object.fromEntries((config.filters || []).map((f) => [f.key, ''])) })
  const reorderable = config.reorderable && !query.search && (config.filters || []).every((f) => !query[f.key])
  const { data, error, loading, reload } = useApi(`/admin/${config.endpoint}`, { ...query, per_page: reorderable ? 100 : 25 }, { cache: false })
  const [rows, setRows] = useState([])
  const editPath = useCallback((row) => `${basePath}/${row.id}`, [basePath])

  useEffect(() => setRows(data?.data || []), [data])

  const toggle = async (row, field) => {
    setRows((list) => list.map((r) => (r.id === row.id ? { ...r, [field]: !r[field] } : r)))
    try {
      await api.patch(`/admin/${config.endpoint}/${row.id}/toggle`, { field })
    } catch (e) {
      toast.error(e.message)
      reload()
    }
  }

  const move = async (index, delta) => {
    const next = [...rows]
    const [moved] = next.splice(index, 1)
    next.splice(index + delta, 0, moved)
    setRows(next)
    try {
      await api.post(`/admin/${config.endpoint}/reorder`, { ids: next.map((r) => r.id) })
    } catch (e) {
      toast.error(e.message)
      reload()
    }
  }

  const remove = async (row) => {
    const label = row.name || row.title
    if (!(await confirmDialog({ title: `Delete ${config.singular}?`, message: `“${label}” will be removed${config.softDeletes ? ' from the website' : ' permanently'}.` }))) return
    try {
      await api.delete(`/admin/${config.endpoint}/${row.id}`)
      toast.success(`Deleted “${label}”.`)
      reload()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const setFilter = (key, value) => setQuery((q) => ({ ...q, [key]: value, page: 1 }))
  const toggles = config.toggles ?? ['is_active', 'is_featured']

  return (
    <>
      <PageHeader
        title={config.title}
        crumbs={[{ label: 'Admin', to: '/admin' }, ...(config.crumbs || []), { label: config.title }]}
        description={config.description}
        actions={
          <>
            {config.extraActions}
            <Btn to={`${basePath}/new`} icon="plus">
              Add {config.singular}
            </Btn>
          </>
        }
      />
      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-3 border-b border-grey-100 px-5 py-3">
          <SearchInput value={query.search} onChange={(v) => setFilter('search', v)} placeholder={config.searchPlaceholder || `Search ${config.title.toLowerCase()}`} />
          {(config.filters || []).map((filter) => (
            <FilterSelect key={filter.key} label={filter.label} value={query[filter.key]} options={filter.options} onChange={(v) => setFilter(filter.key, v)} />
          ))}
          {reorderable && rows.length > 1 && <span className="ml-auto text-xs text-grey-600">Use the arrows to change the order on the website.</span>}
        </div>
        <ErrorNotice error={error} onRetry={reload} />
        {loading && !data ? (
          <Spinner />
        ) : rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-grey-100 font-mono text-[.64rem] uppercase tracking-[.14em] text-grey-600">
                <tr>
                  {reorderable && <th className="w-16 px-3 py-2.5"><span className="sr-only">Order</span></th>}
                  {config.columns.map((c) => (
                    <th key={c.key} className={cx('px-3 py-2.5 font-medium', c.className)}>
                      {c.label}
                    </th>
                  ))}
                  {toggles.map((t) => (
                    <th key={t} className="w-20 px-3 py-2.5 font-medium">
                      {t === 'is_active' ? 'Active' : 'Featured'}
                    </th>
                  ))}
                  <th className="w-24 px-3 py-2.5 text-right font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className={cx(loading && 'opacity-60')}>
                {rows.map((row, index) => (
                  <tr key={row.id} className="border-b border-grey-100 last:border-0 hover:bg-off/60">
                    {reorderable && (
                      <td className="px-2 py-2">
                        <div className="flex">
                          <IconBtn icon="up" label="Move up" disabled={index === 0} onClick={() => move(index, -1)} />
                          <IconBtn icon="down" label="Move down" disabled={index === rows.length - 1} onClick={() => move(index, 1)} />
                        </div>
                      </td>
                    )}
                    {config.columns.map((c) => (
                      <td key={c.key} className={cx('px-3 py-2.5 align-middle', c.className)}>
                        {c.render ? c.render(row, { editPath }) : row[c.key]}
                      </td>
                    ))}
                    {toggles.map((t) => (
                      <td key={t} className="px-3 py-2.5">
                        <Toggle checked={row[t]} onChange={() => toggle(row, t)} label={`${t === 'is_active' ? 'Active' : 'Featured'}: ${row.name || row.title}`} />
                      </td>
                    ))}
                    <td className="px-3 py-2.5">
                      <div className="flex justify-end gap-0.5">
                        {config.preview && row.slug && (
                          <a href={config.preview(row)} target="_blank" rel="noopener noreferrer" title="View on website" aria-label="View on website" className="grid size-8 place-items-center rounded-md text-grey-600 hover:bg-off hover:text-navy-900">
                            <Icon name="external" className="size-4" />
                          </a>
                        )}
                        <Link to={editPath(row)} title="Edit" aria-label={`Edit ${row.name || row.title}`} className="grid size-8 place-items-center rounded-md text-grey-600 hover:bg-off hover:text-navy-900">
                          <Icon name="edit" className="size-4" />
                        </Link>
                        <IconBtn icon="trash" tone="danger" label={`Delete ${row.name || row.title}`} onClick={() => remove(row)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title={query.search ? 'No matches' : `No ${config.title.toLowerCase()} yet`}
            text={query.search ? 'Try a different search.' : config.emptyText}
            action={
              !query.search && (
                <Btn to={`${basePath}/new`} icon="plus" variant="secondary">
                  Add {config.singular}
                </Btn>
              )
            }
          />
        )}
        {!reorderable && <Pagination meta={data?.meta} onPage={(page) => setQuery((q) => ({ ...q, page }))} />}
      </Card>
    </>
  )
}

function ResourceForm({ config, fields, basePath }) {
  const { id } = useParams()
  const isNew = id === 'new'
  const navigate = useNavigate()
  const toast = useToast()
  const [values, setValues] = useState(isNew ? { ...config.defaults } : null)
  const [record, setRecord] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    if (isNew) return
    api
      .get(`/admin/${config.endpoint}/${id}`)
      .then((row) => {
        rememberMedia([row.image, row.logo, row.cover, ...(row.gallery || [])])
        setRecord(row)
        // Field keys never depend on the enum options, so build them without waiting for meta
        setValues(toFormValues(typeof config.fields === 'function' ? config.fields({}) : config.fields, row, config.defaults))
      })
      .catch(setLoadError)
  }, [id, isNew, config])

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      const saved = isNew ? await api.post(`/admin/${config.endpoint}`, values) : await api.put(`/admin/${config.endpoint}/${id}`, values)
      toast.success(`${config.singular[0].toUpperCase()}${config.singular.slice(1)} saved.`)
      if (isNew) navigate(`${basePath}/${saved.id}`, { replace: true })
      else {
        setRecord(saved)
        setValues(toFormValues(fields, saved, config.defaults))
      }
    } catch (error) {
      setErrors(error.errors || {})
      toast.error(error.status === 422 ? 'Please fix the highlighted fields.' : error.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!(await confirmDialog({ title: `Delete ${config.singular}?`, message: `“${record.name || record.title}” will be removed.` }))) return
    try {
      await api.delete(`/admin/${config.endpoint}/${id}`)
      toast.success('Deleted.')
      navigate(basePath)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const title = isNew ? `New ${config.singular}` : record?.name || record?.title || `Edit ${config.singular}`
  const groups = config.groups || [{ title: 'Details', keys: fields.map((f) => f.key) }]

  return (
    <>
      <PageHeader
        title={title}
        crumbs={[{ label: 'Admin', to: '/admin' }, ...(config.crumbs || []), { label: config.title, to: basePath }, { label: isNew ? 'New' : 'Edit' }]}
        actions={
          !isNew &&
          record && (
            <>
              {config.preview && record.slug && (
                <Btn variant="secondary" icon="external" onClick={() => window.open(config.preview(record), '_blank', 'noopener')}>
                  View
                </Btn>
              )}
              <Btn variant="secondary" icon="trash" onClick={remove}>
                Delete
              </Btn>
            </>
          )
        }
      />
      <ErrorNotice error={loadError} />
      {!values ? (
        !loadError && <Spinner />
      ) : (
        <form onSubmit={save} noValidate className="grid gap-6 xl:grid-cols-[1fr_340px] xl:items-start">
          <div className="grid gap-6">
            {groups
              .filter((g) => !g.aside)
              .map((group) => (
                <Card key={group.title} title={group.title}>
                  <SchemaForm fields={fields.filter((f) => group.keys.includes(f.key))} value={values} onChange={setValues} errors={errors} />
                </Card>
              ))}
          </div>
          <div className="grid gap-6 xl:sticky xl:top-20">
            {groups
              .filter((g) => g.aside)
              .map((group) => (
                <Card key={group.title} title={group.title}>
                  <SchemaForm fields={fields.filter((f) => group.keys.includes(f.key))} value={values} onChange={setValues} errors={errors} />
                </Card>
              ))}
            <Card>
              <div className="flex flex-wrap gap-2">
                <Btn type="submit" disabled={saving} icon="check" className="flex-1">
                  {saving ? 'Saving…' : 'Save'}
                </Btn>
                <Btn variant="secondary" to={basePath}>
                  Back
                </Btn>
              </div>
              {record?.updated_at && <p className="mt-3 text-xs text-grey-600">Last saved {formatDate(record.updated_at, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>}
            </Card>
          </div>
        </form>
      )}
    </>
  )
}

/**
 * CRUD screens for one content module. `config.fields` may be a function
 * receiving the admin meta (enum options) so dropdowns come from the backend.
 */
export default function ResourceManager({ config, basePath }) {
  const meta = useMeta()
  const fields = useMemo(() => (typeof config.fields === 'function' ? config.fields(meta || {}) : config.fields), [config, meta])

  return (
    <Routes>
      <Route index element={<ResourceList config={config} basePath={basePath} />} />
      <Route path=":id" element={<ResourceForm config={config} fields={fields} basePath={basePath} />} />
    </Routes>
  )
}
