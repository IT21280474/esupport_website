import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useSite } from '../../contexts/SiteContext'
import { useSeo } from '../../hooks/useSeo'
import { api } from '../../lib/api'
import { FormRow } from '../components/SchemaForm'
import { Btn, adminControl } from '../components/ui'
import { useAuth } from './AuthContext'

/** Two-panel frame: brand on navy, form on white. */
function AuthFrame({ title, intro, children }) {
  const { company } = useSite()
  useSeo({ title: `${title} — Admin`, noindex: true })

  return (
    <div className="grid min-h-svh bg-white lg:grid-cols-[1fr_1.1fr]">
      <div className="relative isolate hidden flex-col justify-between overflow-hidden bg-navy-950 p-12 text-white before:absolute before:inset-0 before:-z-1 before:bg-grid before:content-[''] lg:flex">
        <div className="flex items-center gap-3">
          <img src={company.logo?.thumb || '/brand/logo-emblem.png'} alt="" className="size-12 rounded-full bg-white" />
          <span className="grid leading-tight">
            <b className="tracking-[.16em]">{company.short_name || 'MUTHUMALA'}</b>
            <small className="font-mono text-[.6rem] uppercase tracking-[.22em] text-silver-dim">{company.tagline}</small>
          </span>
        </div>
        <div className="grid gap-4">
          <span className="font-mono text-label uppercase tracking-[.3em] text-gold-soft">~ Content management ~</span>
          <p className="max-w-md text-h2 leading-[1.05] tracking-[-.03em]">
            Built on Trust. <span className="font-light text-silver">Managed with care.</span>
          </p>
        </div>
        <p className="text-xs text-silver-dim">Authorised staff only. Activity is logged.</p>
      </div>
      <div className="grid place-items-center px-5 py-12">
        <div className="grid w-full max-w-sm gap-6">
          <div className="grid gap-2">
            <h1 className="text-[1.75rem] tracking-[-.02em] text-navy-950">{title}</h1>
            {intro && <p className="text-sm text-grey-600">{intro}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

function Alert({ tone = 'error', children }) {
  if (!children) return null
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={tone === 'error' ? 'border-l-3 border-danger bg-danger-soft px-4 py-3 text-sm text-danger' : 'border-l-3 border-csr bg-csr-soft px-4 py-3 text-sm text-ink'}>
      {children}
    </p>
  )
}

export function LoginPage() {
  const { login, notice } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({ email: '', password: '', remember: true })
  const [state, setState] = useState({ busy: false, error: '', errors: {} })

  const submit = async (event) => {
    event.preventDefault()
    setState({ busy: true, error: '', errors: {} })
    try {
      await login(form)
      navigate(params.get('next')?.startsWith('/admin') ? params.get('next') : '/admin', { replace: true })
    } catch (error) {
      setState({ busy: false, error: error.status === 422 ? '' : error.message, errors: error.errors || {} })
    }
  }

  return (
    <AuthFrame title="Sign in" intro="Use your admin email and password.">
      <Alert tone="info">{notice}</Alert>
      <Alert>{state.error}</Alert>
      <form onSubmit={submit} className="grid gap-5" noValidate>
        <FormRow label="Email" error={state.errors.email?.[0]} htmlFor="login-email">
          <input id="login-email" type="email" autoComplete="username" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} aria-invalid={state.errors.email ? 'true' : undefined} className={adminControl} />
        </FormRow>
        <FormRow label="Password" error={state.errors.password?.[0]} htmlFor="login-password">
          <input id="login-password" type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={adminControl} />
        </FormRow>
        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="size-4 accent-navy-700" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} />
            Remember me
          </label>
          <Link to="/admin/forgot-password" className="font-semibold text-navy-600 hover:underline">
            Forgot password?
          </Link>
        </div>
        <Btn type="submit" disabled={state.busy} className="h-11">
          {state.busy ? 'Signing in…' : 'Sign in'}
        </Btn>
      </form>
    </AuthFrame>
  )
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState({ busy: false, message: '', error: '' })

  const submit = async (event) => {
    event.preventDefault()
    setState({ busy: true, message: '', error: '' })
    try {
      const res = await api.post('/admin/forgot-password', { email })
      setState({ busy: false, message: res.message, error: '' })
    } catch (error) {
      setState({ busy: false, message: '', error: error.errors?.email?.[0] || error.message })
    }
  }

  return (
    <AuthFrame title="Reset your password" intro="Enter your admin email and we will send you a reset link.">
      <Alert tone="info">{state.message}</Alert>
      <Alert>{state.error}</Alert>
      <form onSubmit={submit} className="grid gap-5" noValidate>
        <FormRow label="Email" htmlFor="forgot-email">
          <input id="forgot-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={adminControl} />
        </FormRow>
        <Btn type="submit" disabled={state.busy || !email} className="h-11">
          {state.busy ? 'Sending…' : 'Send reset link'}
        </Btn>
        <Link to="/admin/login" className="text-center text-sm font-semibold text-navy-600 hover:underline">
          Back to sign in
        </Link>
      </form>
    </AuthFrame>
  )
}

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: params.get('email') || '', password: '', password_confirmation: '' })
  const [state, setState] = useState({ busy: false, error: '', errors: {}, message: '' })

  const submit = async (event) => {
    event.preventDefault()
    setState({ busy: true, error: '', errors: {}, message: '' })
    try {
      const res = await api.post('/admin/reset-password', { ...form, token: params.get('token') })
      setState({ busy: false, error: '', errors: {}, message: res.message })
      setTimeout(() => navigate('/admin/login'), 2000)
    } catch (error) {
      setState({ busy: false, error: error.status === 422 ? '' : error.message, errors: error.errors || {}, message: '' })
    }
  }

  return (
    <AuthFrame title="Choose a new password" intro="At least 10 characters, including letters and numbers.">
      <Alert tone="info">{state.message}</Alert>
      <Alert>{state.error || (!params.get('token') && 'This reset link is incomplete. Please request a new one.')}</Alert>
      <form onSubmit={submit} className="grid gap-5" noValidate>
        <FormRow label="Email" error={state.errors.email?.[0]} htmlFor="reset-email">
          <input id="reset-email" type="email" autoComplete="username" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={adminControl} />
        </FormRow>
        <FormRow label="New password" error={state.errors.password?.[0]} htmlFor="reset-password">
          <input id="reset-password" type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={adminControl} />
        </FormRow>
        <FormRow label="Confirm new password" htmlFor="reset-confirm">
          <input id="reset-confirm" type="password" autoComplete="new-password" value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} className={adminControl} />
        </FormRow>
        <Btn type="submit" disabled={state.busy || !params.get('token')} className="h-11">
          {state.busy ? 'Saving…' : 'Reset password'}
        </Btn>
      </form>
    </AuthFrame>
  )
}
