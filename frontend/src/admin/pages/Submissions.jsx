import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import Icon from '../../components/common/Icon'
import { useApi } from '../../hooks/useApi'
import { api, apiUrl, downloadFile } from '../../lib/api'
import { cx, formatBytes, formatDateTime, formatPhone, telHref } from '../../lib/format'
import { useMeta } from '../useMeta'
import { useToast } from '../components/Toast'
import { Badge, Btn, Card, EmptyState, ErrorNotice, FilterSelect, PageHeader, Pagination, STATUS_TONES, SearchInput, Spinner, adminControl, confirmDialog } from '../components/ui'

const headerCell = 'px-4 py-2.5 font-medium'

function ContactLinks({ email, phone }) {
  const whatsapp = String(phone || '').replace(/\D/g, '')
  return (
    <div className="flex flex-wrap gap-2">
      {email && (
        <Btn variant="secondary" size="sm" icon="mail" onClick={() => (window.location.href = `mailto:${email}`)}>
          Email
        </Btn>
      )}
      {phone && (
        <Btn variant="secondary" size="sm" icon="phone" onClick={() => (window.location.href = telHref(phone))}>
          Call
        </Btn>
      )}
      {whatsapp.length >= 9 && (
        <Btn variant="secondary" size="sm" icon="whatsapp" onClick={() => window.open(`https://wa.me/${whatsapp.startsWith('0') ? `94${whatsapp.slice(1)}` : whatsapp}`, '_blank', 'noopener')}>
          WhatsApp
        </Btn>
      )}
    </div>
  )
}

/** Status + internal notes editor shared by inquiries and applications. */
function StatusPanel({ record, endpoint, statuses, onSaved }) {
  const toast = useToast()
  const [values, setValues] = useState({ status: record.status, notes: record.notes || '' })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      onSaved(await api.put(endpoint, values))
      toast.success('Saved.')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card title="Follow-up">
      <div className="grid gap-4">
        <label className="grid gap-1.5 text-[.72rem] font-bold uppercase tracking-[.1em] text-grey-600">
          Status
          <select value={values.status} onChange={(e) => setValues({ ...values, status: e.target.value })} className={cx(adminControl, 'select-arrow text-sm font-normal normal-case tracking-normal text-ink')}>
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-[.72rem] font-bold uppercase tracking-[.1em] text-grey-600">
          Internal notes
          <textarea rows={5} value={values.notes} onChange={(e) => setValues({ ...values, notes: e.target.value })} className={cx(adminControl, 'h-auto py-2 text-sm font-normal normal-case tracking-normal text-ink')} placeholder="Only visible to admins" />
        </label>
        <Btn icon="check" disabled={saving} onClick={save}>
          {saving ? 'Saving…' : 'Save'}
        </Btn>
      </div>
    </Card>
  )
}

function Detail({ label, children }) {
  if (!children) return null
  return (
    <div className="grid gap-0.5 border-b border-grey-100 py-3 sm:grid-cols-[160px_1fr] sm:gap-4">
      <dt className="font-mono text-[.66rem] uppercase tracking-[.14em] text-grey-600">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  )
}

/* ------------------------------------------------------------- Inquiries */

export function InquiryList() {
  const meta = useMeta()
  const [params] = useSearchParams()
  const [query, setQuery] = useState({ search: '', status: '', business_area: '', type: params.get('type') || '', page: 1 })
  const { data, error, loading, reload } = useApi('/admin/inquiries', query, { cache: false })
  const set = (key) => (value) => setQuery((q) => ({ ...q, [key]: value, page: 1 }))

  return (
    <>
      <PageHeader
        title="Inquiries"
        crumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Inquiries' }]}
        description="Contact messages, transport requests, hotel reservation requests and part requests from the website."
        actions={
          <Btn variant="secondary" icon="download" onClick={() => downloadFile('/admin/inquiries/export', query).catch(() => window.open(apiUrl('/admin/inquiries/export', query)))}>
            Export CSV
          </Btn>
        }
      />
      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-3 border-b border-grey-100 px-5 py-3">
          <SearchInput value={query.search} onChange={set('search')} placeholder="Search name, email, phone, subject" />
          <FilterSelect label="Status" value={query.status} onChange={set('status')} options={meta?.inquiry_statuses || []} />
          <FilterSelect label="Area" value={query.business_area} onChange={set('business_area')} options={meta?.business_areas || []} />
          <FilterSelect label="Form" value={query.type} onChange={set('type')} options={meta?.inquiry_types || []} />
        </div>
        <ErrorNotice error={error} onRetry={reload} />
        {loading && !data ? (
          <Spinner />
        ) : data?.data.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-grey-100 font-mono text-[.64rem] uppercase tracking-[.14em] text-grey-600">
                <tr>
                  <th className={headerCell}>From</th>
                  <th className={headerCell}>Subject</th>
                  <th className={headerCell}>Area</th>
                  <th className={headerCell}>Status</th>
                  <th className={headerCell}>Received</th>
                </tr>
              </thead>
              <tbody className={cx(loading && 'opacity-60')}>
                {data.data.map((row) => (
                  <tr key={row.id} className={cx('border-b border-grey-100 last:border-0 hover:bg-off/60', row.status === 'new' && 'font-semibold')}>
                    <td className="px-4 py-3">
                      <Link to={`/admin/inquiries/${row.id}`} className="text-navy-900 hover:text-navy-600">
                        {row.name}
                      </Link>
                      <p className="text-xs font-normal text-grey-600">{row.email || formatPhone(row.phone)}</p>
                    </td>
                    <td className="max-w-xs px-4 py-3">
                      <p className="truncate">{row.subject || row.type_label}</p>
                      <p className="text-xs font-normal text-grey-600">{row.type_label}</p>
                    </td>
                    <td className="px-4 py-3 font-normal text-grey-600">{row.business_area_label}</td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONES[row.status]}>{row.status_label}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs font-normal text-grey-600">{formatDateTime(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No inquiries" text="Messages sent through the website forms will appear here." />
        )}
        <Pagination meta={data?.meta} onPage={(page) => setQuery((q) => ({ ...q, page }))} />
      </Card>
    </>
  )
}

export function InquiryDetail() {
  const { id } = useParams()
  const meta = useMeta()
  const navigate = useNavigate()
  const toast = useToast()
  const [inquiry, setInquiry] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get(`/admin/inquiries/${id}`).then(setInquiry).catch(setError)
  }, [id])

  const remove = async () => {
    if (!(await confirmDialog({ title: 'Delete inquiry?', message: 'It will be removed from the inquiry list.' }))) return
    await api.delete(`/admin/inquiries/${id}`)
    toast.success('Inquiry deleted.')
    navigate('/admin/inquiries')
  }

  if (error) return <ErrorNotice error={error} />
  if (!inquiry) return <Spinner />

  return (
    <>
      <PageHeader
        title={inquiry.subject || inquiry.type_label}
        crumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Inquiries', to: '/admin/inquiries' }, { label: inquiry.name }]}
        actions={
          <Btn variant="secondary" icon="trash" onClick={remove}>
            Delete
          </Btn>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px] xl:items-start">
        <Card title={inquiry.type_label}>
          <dl>
            <Detail label="Name">{inquiry.name}</Detail>
            <Detail label="Email">{inquiry.email && <a href={`mailto:${inquiry.email}`} className="text-navy-600 underline">{inquiry.email}</a>}</Detail>
            <Detail label="Phone">{inquiry.phone && <a href={telHref(inquiry.phone)} className="text-navy-600 underline">{formatPhone(inquiry.phone)}</a>}</Detail>
            <Detail label="Business area">{inquiry.business_area_label}</Detail>
            {Object.entries(inquiry.meta || {}).map(([key, value]) => (
              <Detail key={key} label={key.replace(/_/g, ' ')}>
                {String(value)}
              </Detail>
            ))}
            <Detail label="Received">{formatDateTime(inquiry.created_at)}</Detail>
          </dl>
          {inquiry.message && <p className="mt-5 whitespace-pre-line rounded-md bg-off p-4 text-sm leading-relaxed">{inquiry.message}</p>}
          <div className="mt-5">
            <ContactLinks email={inquiry.email} phone={inquiry.phone} />
          </div>
        </Card>
        <div className="grid gap-6">
          <StatusPanel record={inquiry} endpoint={`/admin/inquiries/${id}`} statuses={meta?.inquiry_statuses || [{ value: inquiry.status, label: inquiry.status_label }]} onSaved={setInquiry} />
          {inquiry.handled_by && <p className="px-1 text-xs text-grey-600">Last updated by {inquiry.handled_by} · {formatDateTime(inquiry.updated_at)}</p>}
        </div>
      </div>
    </>
  )
}

/* ---------------------------------------------------------- Applications */

export function ApplicationList() {
  const meta = useMeta()
  const [query, setQuery] = useState({ search: '', status: '', career_id: '', page: 1 })
  const { data, error, loading, reload } = useApi('/admin/applications', query, { cache: false })
  const { data: jobs } = useApi('/admin/careers', { per_page: 200 }, { cache: false })
  const set = (key) => (value) => setQuery((q) => ({ ...q, [key]: value, page: 1 }))

  return (
    <>
      <PageHeader title="Job applications" crumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Applications' }]} description="CVs are stored privately and can only be downloaded here." />
      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-3 border-b border-grey-100 px-5 py-3">
          <SearchInput value={query.search} onChange={set('search')} placeholder="Search name, email or position" />
          <FilterSelect label="Status" value={query.status} onChange={set('status')} options={meta?.application_statuses || []} />
          <FilterSelect label="Job" value={query.career_id} onChange={set('career_id')} options={(jobs?.data || []).map((j) => ({ value: j.id, label: j.title }))} />
        </div>
        <ErrorNotice error={error} onRetry={reload} />
        {loading && !data ? (
          <Spinner />
        ) : data?.data.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-grey-100 font-mono text-[.64rem] uppercase tracking-[.14em] text-grey-600">
                <tr>
                  <th className={headerCell}>Applicant</th>
                  <th className={headerCell}>Position</th>
                  <th className={headerCell}>Status</th>
                  <th className={headerCell}>Received</th>
                </tr>
              </thead>
              <tbody className={cx(loading && 'opacity-60')}>
                {data.data.map((row) => (
                  <tr key={row.id} className={cx('border-b border-grey-100 last:border-0 hover:bg-off/60', row.status === 'new' && 'font-semibold')}>
                    <td className="px-4 py-3">
                      <Link to={`/admin/applications/${row.id}`} className="text-navy-900 hover:text-navy-600">
                        {row.name}
                      </Link>
                      <p className="text-xs font-normal text-grey-600">{row.email}</p>
                    </td>
                    <td className="px-4 py-3 font-normal">{row.position}</td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONES[row.status]}>{row.status_label}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs font-normal text-grey-600">{formatDateTime(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No applications" text="Applications sent from the Careers page will appear here." />
        )}
        <Pagination meta={data?.meta} onPage={(page) => setQuery((q) => ({ ...q, page }))} />
      </Card>
    </>
  )
}

export function ApplicationDetail() {
  const { id } = useParams()
  const meta = useMeta()
  const navigate = useNavigate()
  const toast = useToast()
  const [application, setApplication] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get(`/admin/applications/${id}`).then(setApplication).catch(setError)
  }, [id])

  const download = () => downloadFile(`/admin/applications/${id}/cv`).catch((e) => toast.error(e.message))

  const remove = async () => {
    if (!(await confirmDialog({ title: 'Delete application?', message: 'The application and the CV file will be deleted permanently.' }))) return
    await api.delete(`/admin/applications/${id}`)
    toast.success('Application and CV deleted.')
    navigate('/admin/applications')
  }

  if (error) return <ErrorNotice error={error} />
  if (!application) return <Spinner />

  return (
    <>
      <PageHeader
        title={application.name}
        crumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Applications', to: '/admin/applications' }, { label: application.name }]}
        actions={
          <Btn variant="secondary" icon="trash" onClick={remove}>
            Delete
          </Btn>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px] xl:items-start">
        <Card title="Application">
          <dl>
            <Detail label="Position">{application.position}</Detail>
            <Detail label="Email">
              <a href={`mailto:${application.email}`} className="text-navy-600 underline">
                {application.email}
              </a>
            </Detail>
            <Detail label="Phone">
              <a href={telHref(application.phone)} className="text-navy-600 underline">
                {formatPhone(application.phone)}
              </a>
            </Detail>
            <Detail label="Received">{formatDateTime(application.created_at)}</Detail>
          </dl>
          {application.message && <p className="mt-5 whitespace-pre-line rounded-md bg-off p-4 text-sm leading-relaxed">{application.message}</p>}
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-md border border-grey-200 p-4">
            <Icon name="file" className="size-8 text-navy-700" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{application.cv.name}</p>
              <p className="text-xs text-grey-600">{formatBytes(application.cv.size)}</p>
            </div>
            <Btn icon="download" onClick={download}>
              Download CV
            </Btn>
          </div>
          <div className="mt-5">
            <ContactLinks email={application.email} phone={application.phone} />
          </div>
        </Card>
        <StatusPanel record={application} endpoint={`/admin/applications/${id}`} statuses={meta?.application_statuses || [{ value: application.status, label: application.status_label }]} onSaved={setApplication} />
      </div>
    </>
  )
}
