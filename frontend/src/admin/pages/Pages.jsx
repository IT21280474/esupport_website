import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import Icon from '../../components/common/Icon'
import { useApi } from '../../hooks/useApi'
import { api } from '../../lib/api'
import { cx, formatDateTime } from '../../lib/format'
import { rememberMedia } from '../components/media'
import SchemaForm from '../components/SchemaForm'
import { useToast } from '../components/Toast'
import { Badge, Btn, Card, ErrorNotice, IconBtn, Modal, PageHeader, Spinner, Toggle, confirmDialog } from '../components/ui'

export const pagePath = (slug) => (slug === 'home' ? '/' : `/${slug}`)

export function PagesList() {
  const { data, error, reload } = useApi('/admin/pages', null, { cache: false })

  return (
    <>
      <PageHeader title="Pages" crumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Pages' }]} description="Edit the sections, text, images and SEO of each website page." />
      <ErrorNotice error={error} onRetry={reload} />
      {!data ? (
        <Spinner />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.data.map((page) => (
            <Link key={page.id} to={`/admin/pages/${page.id}`} className="group grid gap-3 rounded-md border border-grey-200 bg-white p-5 transition-colors hover:border-navy-600">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg tracking-[-.01em] group-hover:text-navy-600">{page.title}</h2>
                  <p className="font-mono text-xs text-grey-600">{pagePath(page.slug)}</p>
                </div>
                {page.is_published ? <Badge tone="green">Published</Badge> : <Badge>Hidden</Badge>}
              </div>
              <p className="text-sm text-grey-600">
                {page.enabled_sections_count} of {page.sections_count} sections shown
                {page.theme === 'hotel' && ' · Hotel theme'}
              </p>
              <p className="text-xs text-grey-400">Updated {formatDateTime(page.updated_at)}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

/* ------------------------------------------------------------------------ */

function AddSectionModal({ open, onClose, types, onAdd }) {
  const groups = useMemo(() => {
    const map = new Map()
    types.forEach((type) => map.set(type.group, [...(map.get(type.group) || []), type]))
    return [...map.entries()]
  }, [types])

  return (
    <Modal open={open} onClose={onClose} title="Add a section" size="lg">
      <div className="grid gap-6">
        {groups.map(([group, list]) => (
          <div key={group}>
            <h3 className="mb-2 font-mono text-[.66rem] uppercase tracking-[.16em] text-grey-600">{group}</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {list.map((type) => (
                <button key={type.type} type="button" onClick={() => onAdd(type)} className="grid gap-1 rounded-md border border-grey-200 p-3 text-left hover:border-navy-600 hover:bg-off">
                  <b className="text-sm">{type.label}</b>
                  <span className="text-xs text-grey-600">{type.description}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}

function SectionEditor({ section, type, onSaved, onCancel }) {
  const toast = useToast()
  const [draft, setDraft] = useState({ name: section.name || '', anchor: section.anchor || '', content: section.content || {} })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    setErrors({})
    try {
      const res = await api.put(`/admin/sections/${section.id}`, { ...draft, is_enabled: section.is_enabled })
      toast.success('Section saved.')
      onSaved(res.data)
    } catch (error) {
      setErrors(error.errors || {})
      toast.error(error.status === 422 ? 'Please fix the highlighted fields.' : error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-5 border-t border-grey-100 bg-off/40 p-5">
      {type?.description && <p className="text-sm text-grey-600">{type.description}</p>}
      {type ? (
        <SchemaForm fields={type.fields} value={draft.content} onChange={(content) => setDraft((d) => ({ ...d, content }))} errors={errors} errorPrefix="content." />
      ) : (
        <p className="text-sm text-danger">Unknown section type “{section.type}”.</p>
      )}
      <details className="rounded-md border border-grey-200 bg-white px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold">Advanced</summary>
        <div className="mt-4">
          <SchemaForm
            fields={[
              { key: 'name', type: 'text', label: 'Admin label', half: true, help: 'Only shown here, to tell similar sections apart.' },
              { key: 'anchor', type: 'text', label: 'Anchor id', half: true, help: 'Letters, numbers and dashes. Allows links such as /about#story.' },
            ]}
            value={draft}
            onChange={setDraft}
            errors={errors}
          />
        </div>
      </details>
      <div className="flex gap-2">
        <Btn icon="check" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save section'}
        </Btn>
        <Btn variant="secondary" onClick={onCancel}>
          Close
        </Btn>
      </div>
    </div>
  )
}

function PageSettings({ page, onSaved }) {
  const toast = useToast()
  const [values, setValues] = useState(page)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    setErrors({})
    try {
      const res = await api.put(`/admin/pages/${page.id}`, values)
      toast.success('Page settings saved.')
      onSaved(res.data)
    } catch (error) {
      setErrors(error.errors || {})
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card title="Page settings">
      <div className="grid gap-5">
        <SchemaForm
          fields={[
            { key: 'title', type: 'text', label: 'Page name', required: true, help: 'Used in breadcrumbs and the admin.' },
            { key: 'meta_title', type: 'text', label: 'SEO title', help: 'Full browser-tab title. Leave empty to use the page name.' },
            { key: 'meta_description', type: 'textarea', label: 'SEO description', rows: 3, help: '150–160 characters works best.' },
            { key: 'og_image_id', type: 'media', label: 'Social sharing image' },
            { key: 'theme', type: 'select', label: 'Theme', required: true, options: { default: 'Corporate (navy)', hotel: 'Hospitality (cream & serif)' } },
            { key: 'floating_whatsapp', type: 'select', label: 'Floating WhatsApp button', placeholder: 'None', options: { general: 'General', spare_parts: 'Spare Parts desk', transport: 'Transport desk', hotel: 'Hotel reservations' } },
            { key: 'is_published', type: 'toggle', label: 'Published', on_label: 'Visible on the website', off_label: 'Hidden (shows “not found”)' },
          ]}
          value={values}
          onChange={setValues}
          errors={errors}
        />
        <Btn icon="check" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save settings'}
        </Btn>
      </div>
    </Card>
  )
}

export function PageEditor() {
  const { id } = useParams()
  const toast = useToast()
  const [page, setPage] = useState(null)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(false)
  const { data: catalogue } = useApi('/admin/section-types')
  const types = catalogue?.types || []
  const typeOf = (key) => types.find((t) => t.type === key)

  useEffect(() => {
    api
      .get(`/admin/pages/${id}`)
      .then((res) => {
        rememberMedia(Object.values(res.media || {}))
        setPage(res.data)
      })
      .catch(setError)
  }, [id])

  const sections = page?.sections || []
  const setSections = (next) => setPage((p) => ({ ...p, sections: next }))
  const replaceSection = (updated) => setSections(sections.map((s) => (s.id === updated.id ? updated : s)))

  const move = async (index, delta) => {
    const next = [...sections]
    const [moved] = next.splice(index, 1)
    next.splice(index + delta, 0, moved)
    setSections(next)
    try {
      await api.post(`/admin/pages/${id}/sections/reorder`, { ids: next.map((s) => s.id) })
    } catch (e) {
      toast.error(e.message)
    }
  }

  const toggle = async (section) => {
    replaceSection({ ...section, is_enabled: !section.is_enabled })
    try {
      const res = await api.patch(`/admin/sections/${section.id}/toggle`)
      replaceSection(res.data)
      toast.success(res.data.is_enabled ? 'Section shown on the website.' : 'Section hidden.')
    } catch (e) {
      toast.error(e.message)
      replaceSection(section)
    }
  }

  const duplicate = async (section, index) => {
    try {
      const res = await api.post(`/admin/sections/${section.id}/duplicate`)
      const next = [...sections]
      next.splice(index + 1, 0, res.data)
      setSections(next)
      toast.success('Section duplicated (hidden until you enable it).')
    } catch (e) {
      toast.error(e.message)
    }
  }

  const remove = async (section) => {
    const label = section.name || typeOf(section.type)?.label || section.type
    if (!(await confirmDialog({ title: 'Remove section?', message: `“${label}” and its content will be removed from this page.`, confirmLabel: 'Remove' }))) return
    try {
      await api.delete(`/admin/sections/${section.id}`)
      setSections(sections.filter((s) => s.id !== section.id))
      toast.success('Section removed.')
    } catch (e) {
      toast.error(e.message)
    }
  }

  const add = async (type) => {
    setAdding(false)
    try {
      const res = await api.post(`/admin/pages/${id}/sections`, { type: type.type, content: {}, is_enabled: false })
      setSections([...sections, res.data])
      setEditing(res.data.id)
      toast.info('Section added at the end of the page (hidden). Fill it in, then switch it on.')
    } catch (e) {
      toast.error(e.message)
    }
  }

  if (error) return <ErrorNotice error={error} />
  if (!page || !catalogue) return <Spinner />

  return (
    <>
      <PageHeader
        title={page.title}
        crumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Pages', to: '/admin/pages' }, { label: page.title }]}
        description="Sections appear on the website in this order. Hidden sections keep their content."
        actions={
          <>
            <Btn variant="secondary" icon="external" onClick={() => window.open(pagePath(page.slug), '_blank', 'noopener')}>
              View page
            </Btn>
            <Btn icon="plus" onClick={() => setAdding(true)}>
              Add section
            </Btn>
          </>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px] xl:items-start">
        <ol className="grid gap-3">
          {sections.map((section, index) => {
            const type = typeOf(section.type)
            const open = editing === section.id
            return (
              <li key={section.id} className={cx('overflow-hidden rounded-md border bg-white', open ? 'border-navy-600 shadow-soft' : 'border-grey-200')}>
                <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <span className="font-mono text-xs text-grey-400">{String(index + 1).padStart(2, '0')}</span>
                  <button type="button" onClick={() => setEditing(open ? null : section.id)} aria-expanded={open} className="min-w-[12rem] flex-1 text-left">
                    <b className={cx('block truncate text-sm', !section.is_enabled && 'text-grey-400')}>{section.name || section.content?.title?.split('\n')[0] || section.content?.label || type?.label}</b>
                    <span className="text-xs text-grey-600">
                      {type?.label || section.type}
                      {section.anchor && <span className="font-mono"> · #{section.anchor}</span>}
                    </span>
                  </button>
                  {!section.is_enabled && <Badge>Hidden</Badge>}
                  <div className="ml-auto flex items-center gap-0.5">
                    <Toggle checked={section.is_enabled} onChange={() => toggle(section)} label={`Show section ${index + 1} on the website`} />
                    <IconBtn icon="up" label="Move up" disabled={index === 0} onClick={() => move(index, -1)} />
                    <IconBtn icon="down" label="Move down" disabled={index === sections.length - 1} onClick={() => move(index, 1)} />
                    <IconBtn icon="edit" label="Edit section" onClick={() => setEditing(open ? null : section.id)} />
                    <IconBtn icon="copy" label="Duplicate section" onClick={() => duplicate(section, index)} />
                    <IconBtn icon="trash" tone="danger" label="Remove section" onClick={() => remove(section)} />
                  </div>
                </div>
                {open && (
                  <SectionEditor
                    key={section.updated_at}
                    section={section}
                    type={type}
                    onSaved={(updated) => {
                      replaceSection(updated)
                      setEditing(null)
                    }}
                    onCancel={() => setEditing(null)}
                  />
                )}
              </li>
            )
          })}
          {!sections.length && (
            <li className="rounded-md border border-dashed border-grey-200 bg-white p-10 text-center text-sm text-grey-600">
              This page has no sections yet. <button type="button" className="font-semibold text-navy-600 underline" onClick={() => setAdding(true)}>Add the first one</button>.
            </li>
          )}
        </ol>
        <div className="grid gap-6 xl:sticky xl:top-20">
          <PageSettings key={page.updated_at} page={page} onSaved={(saved) => setPage((p) => ({ ...p, ...saved }))} />
          <Card title="Tips">
            <ul className="grid gap-2 text-sm text-grey-600">
              <li className="flex gap-2"><Icon name="info" className="mt-0.5 size-4 shrink-0 text-gold" />In text fields you can use {'{phone_1}'}, {'{email}'} or {'{years}'} to insert live contact details.</li>
              <li className="flex gap-2"><Icon name="info" className="mt-0.5 size-4 shrink-0 text-gold" />Lists such as products, rooms and jobs are edited in their own sections of the menu.</li>
            </ul>
          </Card>
        </div>
      </div>
      <AddSectionModal open={adding} onClose={() => setAdding(false)} types={types} onAdd={add} />
    </>
  )
}
