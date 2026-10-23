import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import Icon from '../../components/common/Icon'
import { clearApiCache } from '../../hooks/useApi'
import { api } from '../../lib/api'
import { cx } from '../../lib/format'
import { rememberMedia } from '../components/media'
import SchemaForm from '../components/SchemaForm'
import { useToast } from '../components/Toast'
import { Btn, Card, ErrorNotice, PageHeader, Spinner, Toggle, adminControl } from '../components/ui'

const SOCIAL_LABELS = { facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube', linkedin: 'LinkedIn', tiktok: 'TikTok', whatsapp: 'WhatsApp channel' }

function SocialLinks({ initial }) {
  const toast = useToast()
  const [links, setLinks] = useState(initial)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const update = (index, patch) => setLinks((list) => list.map((l, i) => (i === index ? { ...l, ...patch } : l)))

  const save = async () => {
    setSaving(true)
    setErrors({})
    try {
      const res = await api.put('/admin/settings/social', { links })
      setLinks(res.social)
      clearApiCache()
      toast.success(res.message)
    } catch (e) {
      setErrors(e.errors || {})
      toast.error(e.status === 422 ? 'Please use full https:// links.' : e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-grey-600">Only platforms with a link are shown in the website footer. Use the full address, e.g. https://www.facebook.com/yourpage.</p>
      {links.map((link, index) => (
        <div key={link.platform} className="grid items-center gap-3 sm:grid-cols-[170px_1fr_auto]">
          <label htmlFor={`social-${link.platform}`} className="flex items-center gap-2.5 text-sm font-semibold">
            <span className="grid size-8 place-items-center rounded-full bg-navy-900 text-white">
              <Icon name={link.platform} className="size-4" />
            </span>
            {SOCIAL_LABELS[link.platform]}
          </label>
          <div>
            <input id={`social-${link.platform}`} type="url" placeholder="https://…" value={link.url || ''} onChange={(e) => update(index, { url: e.target.value })} aria-invalid={errors[`links.${index}.url`] ? 'true' : undefined} className={adminControl} />
            {errors[`links.${index}.url`] && <p className="mt-1 text-xs text-danger">{errors[`links.${index}.url`][0]}</p>}
          </div>
          <div className="flex items-center gap-2 text-xs text-grey-600">
            <Toggle checked={link.is_active} onChange={(v) => update(index, { is_active: v })} label={`Show ${SOCIAL_LABELS[link.platform]}`} />
            Show
          </div>
        </div>
      ))}
      <div>
        <Btn icon="check" disabled={saving} onClick={save}>
          {saving ? 'Saving…' : 'Save social links'}
        </Btn>
      </div>
    </div>
  )
}

function GroupForm({ group, initial }) {
  const toast = useToast()
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    setErrors({})
    try {
      const res = await api.put(`/admin/settings/${group.key}`, { values })
      setValues(res.values)
      clearApiCache()
      toast.success(res.message)
    } catch (e) {
      // errors come back as values.field → strip the prefix for the form
      setErrors(Object.fromEntries(Object.entries(e.errors || {}).map(([k, v]) => [k.replace(/^values\./, ''), v])))
      toast.error(e.status === 422 ? 'Please fix the highlighted fields.' : e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6">
      {group.key === 'whatsapp' && (
        <p className="rounded-md border-l-3 border-gold bg-cream px-4 py-3 text-sm">
          Desks without their own number use the general number. Enter numbers in international format without “+”, e.g. <b>94771234567</b>.
        </p>
      )}
      {group.key === 'notifications' && <p className="text-sm text-grey-600">Email alerts need the mail server to be configured on the hosting (MAIL_* settings in the backend .env).</p>}
      <SchemaForm fields={group.fields} value={values} onChange={setValues} errors={errors} />
      <div>
        <Btn icon="check" disabled={saving} onClick={save}>
          {saving ? 'Saving…' : `Save ${group.label.toLowerCase()} settings`}
        </Btn>
      </div>
    </div>
  )
}

export default function Settings() {
  const [params, setParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api
      .get('/admin/settings')
      .then((res) => {
        rememberMedia(Object.values(res.media || {}))
        setData(res)
      })
      .catch(setError)
  }, [])

  if (error) return <ErrorNotice error={error} />
  if (!data) return <Spinner />

  const tabs = [...data.groups.map((g) => ({ key: g.key, label: g.label })), { key: 'social', label: 'Social media' }]
  const active = tabs.some((t) => t.key === params.get('tab')) ? params.get('tab') : tabs[0].key
  const group = data.groups.find((g) => g.key === active)

  return (
    <>
      <PageHeader title="Settings" crumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Settings' }]} description="Company details, contact numbers, WhatsApp desks, navigation and SEO defaults used across the whole website." />
      <div className="grid gap-6 lg:grid-cols-[220px_1fr] lg:items-start">
        <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto rounded-md border border-grey-200 bg-white p-1.5 lg:sticky lg:top-20 lg:grid">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              aria-current={tab.key === active ? 'page' : undefined}
              onClick={() => setParams({ tab: tab.key }, { replace: true })}
              className={cx('whitespace-nowrap rounded px-3 py-2 text-left text-sm', tab.key === active ? 'bg-navy-900 font-semibold text-white' : 'text-grey-600 hover:bg-off hover:text-navy-900')}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <Card title={tabs.find((t) => t.key === active)?.label}>
          {group ? <GroupForm key={group.key} group={group} initial={data.values[group.key] || {}} /> : <SocialLinks initial={data.social} />}
        </Card>
      </div>
    </>
  )
}
