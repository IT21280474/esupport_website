import { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { api } from '../../lib/api'
import { cx, formatDateTime } from '../../lib/format'
import { useAuth } from '../auth/AuthContext'
import SchemaForm from '../components/SchemaForm'
import { useToast } from '../components/Toast'
import { Badge, Btn, Card, EmptyState, ErrorNotice, FilterSelect, IconBtn, Modal, PageHeader, Pagination, SearchInput, Spinner, confirmDialog } from '../components/ui'

const passwordHelp = 'At least 10 characters with letters and numbers.'

/* ------------------------------------------------------------------ Users */

function UserForm({ user, roles, onClose, onSaved }) {
  const toast = useToast()
  const [values, setValues] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role_id: user?.role_id ? String(user.role_id) : '',
    is_active: user?.is_active ?? true,
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    setErrors({})
    const payload = { ...values, role_id: Number(values.role_id) || null }
    try {
      const saved = user ? await api.put(`/admin/users/${user.id}`, payload) : await api.post('/admin/users', payload)
      toast.success(user ? 'User updated.' : 'User created.')
      onSaved(saved)
      onClose()
    } catch (e) {
      setErrors(e.errors || {})
      toast.error(e.status === 422 ? 'Please fix the highlighted fields.' : e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={user ? `Edit ${user.name}` : 'New admin user'}
      footer={
        <Btn icon="check" disabled={saving} onClick={save}>
          {saving ? 'Saving…' : 'Save user'}
        </Btn>
      }
    >
      <SchemaForm
        fields={[
          { key: 'name', type: 'text', label: 'Name', required: true, half: true },
          { key: 'email', type: 'email', label: 'Email', required: true, half: true },
          {
            key: 'role_id',
            type: 'select',
            label: 'Role',
            required: true,
            options: roles.map((r) => ({ value: String(r.id), label: `${r.name} — ${r.description}` })),
          },
          { key: 'password', type: 'password', label: user ? 'New password' : 'Password', required: !user, half: true, help: user ? 'Leave empty to keep the current password.' : passwordHelp },
          { key: 'password_confirmation', type: 'password', label: 'Confirm password', half: true },
          { key: 'is_active', type: 'toggle', label: 'Account active', on_label: 'Can sign in', off_label: 'Disabled' },
        ]}
        value={values}
        onChange={setValues}
        errors={errors}
      />
    </Modal>
  )
}

export function Users() {
  const toast = useToast()
  const { user: me } = useAuth()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { data, error, loading, reload } = useApi('/admin/users', { search, page }, { cache: false })
  const { data: roles } = useApi('/admin/roles')
  const [editing, setEditing] = useState(undefined)

  const remove = async (user) => {
    if (!(await confirmDialog({ title: 'Delete admin user?', message: `${user.name} will no longer be able to sign in.` }))) return
    try {
      await api.delete(`/admin/users/${user.id}`)
      toast.success('User deleted.')
      reload()
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <>
      <PageHeader
        title="Admin users"
        crumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Admin users' }]}
        description="Super Admins manage everything; Content Managers edit website content; Inquiry Managers handle inquiries and applications."
        actions={
          <Btn icon="plus" disabled={!roles} onClick={() => setEditing(null)}>
            Add user
          </Btn>
        }
      />
      <Card padded={false}>
        <div className="border-b border-grey-100 px-5 py-3">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Search name or email" />
        </div>
        <ErrorNotice error={error} onRetry={reload} />
        {loading && !data ? (
          <Spinner />
        ) : (
          <ul className="divide-y divide-grey-100">
            {data?.data.map((user) => (
              <li key={user.id} className="flex flex-wrap items-center gap-4 px-5 py-3">
                <span className="grid size-9 place-items-center rounded-full bg-navy-900 text-sm font-bold text-white">{user.name[0]?.toUpperCase()}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {user.name} {user.id === me?.id && <span className="text-xs font-normal text-grey-600">(you)</span>}
                  </p>
                  <p className="truncate text-xs text-grey-600">{user.email}</p>
                </div>
                <Badge tone={user.is_super_admin ? 'gold' : 'navy'}>{user.role?.name || 'No role'}</Badge>
                {!user.is_active && <Badge tone="red">Disabled</Badge>}
                <span className="hidden w-40 text-xs text-grey-600 md:block">{user.last_login_at ? `Last sign-in ${formatDateTime(user.last_login_at)}` : 'Never signed in'}</span>
                <div className="flex">
                  <IconBtn icon="edit" label={`Edit ${user.name}`} onClick={() => setEditing(user)} />
                  <IconBtn icon="trash" tone="danger" label={`Delete ${user.name}`} disabled={user.id === me?.id} onClick={() => remove(user)} />
                </div>
              </li>
            ))}
          </ul>
        )}
        <Pagination meta={data?.meta} onPage={setPage} />
      </Card>
      {editing !== undefined && roles && <UserForm user={editing} roles={roles} onClose={() => setEditing(undefined)} onSaved={reload} />}
    </>
  )
}

/* -------------------------------------------------------------- Activity */

const ACTION_TONES = { created: 'green', updated: 'navy', deleted: 'red', login: 'grey', logout: 'grey', settings_updated: 'gold', downloaded: 'amber', exported: 'amber' }

export function ActivityLog() {
  const [query, setQuery] = useState({ search: '', action: '', page: 1 })
  const { data, error, loading, reload } = useApi('/admin/activity', query, { cache: false })

  return (
    <>
      <PageHeader title="Activity log" crumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Activity log' }]} description="Sign-ins, content changes, settings updates and file downloads by admin users." />
      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-3 border-b border-grey-100 px-5 py-3">
          <SearchInput value={query.search} onChange={(search) => setQuery((q) => ({ ...q, search, page: 1 }))} placeholder="Search descriptions" />
          <FilterSelect label="Action" value={query.action} onChange={(action) => setQuery((q) => ({ ...q, action, page: 1 }))} options={(data?.actions || []).map((a) => ({ value: a, label: a.replace('_', ' ') }))} />
        </div>
        <ErrorNotice error={error} onRetry={reload} />
        {loading && !data ? (
          <Spinner />
        ) : data?.data.length ? (
          <ul className={cx('divide-y divide-grey-100', loading && 'opacity-60')}>
            {data.data.map((log) => (
              <li key={log.id} className="flex flex-wrap items-start gap-3 px-5 py-3 text-sm">
                <Badge tone={ACTION_TONES[log.action] || 'grey'}>{log.action.replace('_', ' ')}</Badge>
                <div className="min-w-0 flex-1">
                  <p>
                    <b>{log.user?.name || 'Unknown user'}</b> — {log.description}
                  </p>
                  {log.properties?.fields && <p className="text-xs text-grey-600">Changed: {log.properties.fields.join(', ')}</p>}
                </div>
                <span className="whitespace-nowrap text-xs text-grey-600">
                  {formatDateTime(log.created_at)}
                  {log.ip_address && <span className="ml-2 font-mono text-grey-400">{log.ip_address}</span>}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No activity" />
        )}
        <Pagination meta={data?.meta} onPage={(page) => setQuery((q) => ({ ...q, page }))} />
      </Card>
    </>
  )
}

/* --------------------------------------------------------------- Profile */

export function Profile() {
  const { user, setUser } = useAuth()
  const toast = useToast()
  const [values, setValues] = useState({ name: user.name, email: user.email, current_password: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    setErrors({})
    try {
      setUser(await api.put('/admin/me', values))
      setValues((v) => ({ ...v, current_password: '', password: '', password_confirmation: '' }))
      toast.success('Profile saved.')
    } catch (e) {
      setErrors(e.errors || {})
      toast.error(e.status === 422 ? 'Please fix the highlighted fields.' : e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="Your profile" crumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Profile' }]} description={`Signed in as ${user.role?.name}.`} />
      <Card className="max-w-3xl">
        <div className="grid gap-6">
          <SchemaForm
            fields={[
              { key: 'name', type: 'text', label: 'Name', required: true, half: true },
              { key: 'email', type: 'email', label: 'Email', required: true, half: true },
              { key: 'current_password', type: 'password', label: 'Current password', help: 'Required only when changing your password.' },
              { key: 'password', type: 'password', label: 'New password', half: true, help: passwordHelp },
              { key: 'password_confirmation', type: 'password', label: 'Confirm new password', half: true },
            ]}
            value={values}
            onChange={setValues}
            errors={errors}
          />
          <div>
            <Btn icon="check" disabled={saving} onClick={save}>
              {saving ? 'Saving…' : 'Save profile'}
            </Btn>
          </div>
        </div>
      </Card>
    </>
  )
}
