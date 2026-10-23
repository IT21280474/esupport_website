import { Link } from 'react-router'
import Icon from '../../components/common/Icon'
import { useApi } from '../../hooks/useApi'
import { cx, formatDateTime } from '../../lib/format'
import { useAuth } from '../auth/AuthContext'
import { Badge, Card, EmptyState, ErrorNotice, PageHeader, STATUS_TONES, Spinner } from '../components/ui'

const AREA_LABELS = { general: 'General', spare_parts: 'Spare Parts', transportation: 'Transportation', hotel: 'Hotel', csr: 'CSR', careers: 'Careers' }

function Stat({ to, icon, label, value, sub, highlight }) {
  return (
    <Link to={to} className="group grid gap-3 rounded-md border border-grey-200 bg-white p-5 transition-colors hover:border-navy-600">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[.66rem] uppercase tracking-[.14em] text-grey-600">{label}</span>
        <Icon name={icon} className="size-5 text-navy-600" strokeWidth={1.5} />
      </div>
      <b className="text-[2rem] font-extrabold leading-none tracking-[-.03em] text-navy-950">{value ?? '—'}</b>
      {sub && <span className={cx('text-xs', highlight ? 'font-semibold text-navy-600' : 'text-grey-600')}>{sub}</span>}
    </Link>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { data, error, loading, reload } = useApi('/admin/dashboard', null, { cache: false })
  const s = data?.stats || {}
  const hour = new Date().getHours()

  return (
    <>
      <PageHeader title={`Good ${hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'}, ${user?.name?.split(' ')[0] || ''}`} description="Here is what is happening across the website." />
      <ErrorNotice error={error} onRetry={reload} />
      {loading && !data ? (
        <Spinner />
      ) : (
        data && (
          <div className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {s.inquiries && <Stat to="/admin/inquiries" icon="inbox" label="Inquiries" value={s.inquiries.total} sub={`${s.inquiries.new} new · ${s.inquiries.last_30_days} in 30 days`} highlight={s.inquiries.new > 0} />}
              {s.inquiries && <Stat to="/admin/inquiries?type=contact" icon="mail" label="Contact messages" value={s.inquiries.contact} sub="From the contact form" />}
              {s.applications && <Stat to="/admin/applications" icon="users" label="Job applications" value={s.applications.total} sub={`${s.applications.new} new`} highlight={s.applications.new > 0} />}
              {s.careers && <Stat to="/admin/careers" icon="briefcase" label="Open jobs" value={s.careers.open} />}
              {s.products && <Stat to="/admin/products" icon="stock" label="Products" value={s.products.total} sub={`${s.products.active} visible`} />}
              {s.gallery && <Stat to="/admin/gallery" icon="image" label="Gallery photos" value={s.gallery.total} />}
              {s.csr && <Stat to="/admin/csr-projects" icon="heart" label="CSR projects" value={s.csr.total} />}
              {s.transport && <Stat to="/admin/fleet-items" icon="fleet" label="Fleet & services" value={s.transport.fleet + s.transport.services} sub={`${s.transport.fleet} fleet · ${s.transport.services} services`} />}
              {s.rooms && <Stat to="/admin/hotel-rooms" icon="bed" label="Hotel rooms" value={s.rooms.total} />}
              {s.media && <Stat to="/admin/media" icon="layers" label="Media files" value={s.media.total} />}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
              {data.recent_inquiries && (
                <Card title="Latest inquiries" padded={false} actions={<Link to="/admin/inquiries" className="text-xs font-semibold text-navy-600">View all</Link>}>
                  {data.recent_inquiries.length ? (
                    <ul className="divide-y divide-grey-100">
                      {data.recent_inquiries.map((inquiry) => (
                        <li key={inquiry.id}>
                          <Link to={`/admin/inquiries/${inquiry.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-off">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold">{inquiry.name} <span className="font-normal text-grey-600">— {inquiry.subject || inquiry.type_label}</span></p>
                              <p className="text-xs text-grey-600">{inquiry.business_area_label} · {formatDateTime(inquiry.created_at)}</p>
                            </div>
                            <Badge tone={STATUS_TONES[inquiry.status]}>{inquiry.status_label}</Badge>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyState title="No inquiries yet" text="Form submissions from the website appear here." />
                  )}
                </Card>
              )}

              <div className="grid content-start gap-6">
                {data.inquiries_by_area && Object.keys(data.inquiries_by_area).length > 0 && (
                  <Card title="Inquiries by business area">
                    <ul className="grid gap-3">
                      {Object.entries(data.inquiries_by_area).map(([area, total]) => {
                        const max = Math.max(...Object.values(data.inquiries_by_area))
                        return (
                          <li key={area} className="grid gap-1">
                            <div className="flex justify-between text-sm">
                              <span>{AREA_LABELS[area] || area}</span>
                              <b>{total}</b>
                            </div>
                            <span className="h-1.5 overflow-hidden rounded-full bg-grey-100">
                              <span className="block h-full rounded-full bg-navy-600" style={{ width: `${(total / max) * 100}%` }} />
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  </Card>
                )}

                {data.checklist && (
                  <Card title="Launch checklist">
                    <ul className="grid gap-2.5">
                      {data.checklist.map((item) => (
                        <li key={item.label}>
                          <Link to={item.link} className="flex items-start gap-2.5 text-sm hover:text-navy-600">
                            <span className={cx('mt-0.5 grid size-5 shrink-0 place-items-center rounded-full', item.done ? 'bg-csr text-white' : 'border border-grey-200')}>
                              {item.done && <Icon name="check" className="size-3.5" />}
                            </span>
                            <span className={item.done ? 'text-grey-600 line-through' : ''}>{item.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              {data.recent_applications && (
                <Card title="Latest applications" padded={false} actions={<Link to="/admin/applications" className="text-xs font-semibold text-navy-600">View all</Link>}>
                  {data.recent_applications.length ? (
                    <ul className="divide-y divide-grey-100">
                      {data.recent_applications.map((application) => (
                        <li key={application.id}>
                          <Link to={`/admin/applications/${application.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-off">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold">{application.name}</p>
                              <p className="truncate text-xs text-grey-600">{application.position} · {formatDateTime(application.created_at)}</p>
                            </div>
                            <Badge tone={STATUS_TONES[application.status]}>{application.status_label}</Badge>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyState title="No applications yet" />
                  )}
                </Card>
              )}
              {data.recent_activity && (
                <Card title="Recent activity" padded={false} actions={<Link to="/admin/activity" className="text-xs font-semibold text-navy-600">View log</Link>}>
                  <ul className="divide-y divide-grey-100">
                    {data.recent_activity.map((log) => (
                      <li key={log.id} className="px-5 py-3 text-sm">
                        <p>
                          <b>{log.user || 'System'}</b> <span className="text-grey-600">{log.description.charAt(0).toLowerCase() + log.description.slice(1)}</span>
                        </p>
                        <p className="text-xs text-grey-400">{formatDateTime(log.created_at)}</p>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          </div>
        )
      )}
    </>
  )
}
