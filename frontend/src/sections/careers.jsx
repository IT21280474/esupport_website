import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import Button from '../components/common/Button'
import { Section, SectionHead, headingId } from '../components/common/Section'
import { Lead, Lines, SectionLabel } from '../components/common/Typography'
import { Field, FileDrop, FormStatus, Honeypot, Input, Select, Textarea, honeypotValue } from '../components/forms/Fields'
import { rules, useForm } from '../hooks/useForm'
import { api } from '../lib/api'

const MAX_CV_BYTES = 5 * 1024 * 1024
const CV_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

/** Open positions (managed under Admin → Careers). */
export function JobList({ section }) {
  const c = section.content
  const jobs = section.data || []
  const titleId = headingId(section)
  const meta = (label, value, className = '') =>
    value && (
      <div className={className}>
        <small className="mb-0.5 block font-mono text-[.64rem] uppercase tracking-[.16em] text-grey-500">{label}</small>
        <span className="text-[.92rem] font-semibold">{value}</span>
      </div>
    )

  return (
    <Section id={section.anchor} labelledBy={titleId}>
      <div className="wrap">
        <SectionHead label={c.label} labelStyle={c.label_style} title={c.title} titleId={titleId} lead={c.lead} />
        {jobs.length ? (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <article
                key={job.id}
                className="reveal grid items-center gap-6 border border-grey-200 bg-white px-8 py-7 transition-[border-color,box-shadow] duration-250 hover:border-navy-700 hover:shadow-soft max-sm:p-6 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto] xl:grid-cols-[1.4fr_1fr_1fr_1fr_auto]"
              >
                <div className="sm:max-lg:col-span-full">
                  <h3 className="text-[1.2rem] tracking-[-.01em]">
                    <Link to={`/careers/${job.slug}`} className="hover:text-navy-600">
                      {job.title}
                    </Link>
                  </h3>
                  {job.summary && <p className="mt-1.5 text-[.9rem] text-grey-600">{job.summary}</p>}
                </div>
                {meta('Department', job.department)}
                {meta('Location', job.location)}
                {meta('Type', job.employment_type_label, 'lg:max-xl:hidden')}
                <Button to={`?position=${job.id}#apply`} preventScrollReset className="sm:max-lg:col-span-full">
                  Apply Now
                </Button>
              </article>
            ))}
          </div>
        ) : (
          <p className="border border-dashed border-grey-200 px-6 py-12 text-center text-grey-600">{c.empty_text || 'There are no open positions right now.'}</p>
        )}
      </div>
    </Section>
  )
}

function validateCv(file) {
  if (!file) return 'Please attach your CV.'
  if (file.size > MAX_CV_BYTES) return 'Your CV must be under 5 MB.'
  if (file.type && !CV_TYPES.includes(file.type)) return 'Your CV must be a PDF or Word document.'
  return undefined
}

/** Application form with CV upload (stored privately on the server). */
export function ApplicationForm({ section }) {
  const c = section.content
  const jobs = section.data || []
  const titleId = headingId(section)
  const [params] = useSearchParams()
  const [cv, setCv] = useState(null)
  const [cvError, setCvError] = useState()

  const form = useForm({
    initial: { name: '', email: '', phone: '', position: '', message: '' },
    validate: (v) => ({
      name: rules.required(v.name),
      email: rules.required(v.email) || rules.email(v.email),
      phone: rules.required(v.phone) || rules.phone(v.phone),
      position: rules.required(v.position, 'Please choose a position.'),
    }),
    onSubmit: async (values, formEl) => {
      const error = validateCv(cv)
      if (error) {
        setCvError(error)
        throw Object.assign(new Error(error), { status: 0 })
      }
      const job = jobs.find((j) => String(j.id) === values.position)
      const body = new FormData()
      body.append('name', values.name)
      body.append('email', values.email)
      body.append('phone', values.phone)
      body.append('position', job ? job.title : 'General application')
      if (job) body.append('career_id', job.id)
      body.append('message', values.message)
      body.append('cv', cv)
      body.append('company_website', honeypotValue(formEl))
      const result = await api.post('/careers/apply', body)
      setCv(null)
      return result
    },
  })
  const { setValue } = form
  const positionParam = params.get('position')

  // "Apply Now" buttons pre-select the job
  useEffect(() => {
    if (positionParam) setValue('position', positionParam)
  }, [positionParam, setValue])

  const submitting = form.status.state === 'submitting'

  return (
    <Section id={section.anchor} theme="off" labelledBy={titleId}>
      <div className="wrap grid gap-[clamp(2rem,2rem+4vw,6rem)] lg:grid-cols-[.9fr_1.1fr]">
        <div className="reveal grid content-start gap-6">
          <SectionLabel variant={c.label_style === 'number' ? 'number' : 'eyebrow'}>{c.label}</SectionLabel>
          <h2 id={titleId} className="text-h2">
            <Lines text={c.title} />
          </h2>
          <Lead>{c.lead}</Lead>
        </div>

        <form onSubmit={form.handleSubmit} noValidate className="relative grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <Honeypot />
          <Field label="Full Name" required error={form.errors.name}>
            {(a) => <Input autoComplete="name" {...a} {...form.bind('name')} />}
          </Field>
          <Field label="Email" required error={form.errors.email}>
            {(a) => <Input type="email" autoComplete="email" {...a} {...form.bind('email')} />}
          </Field>
          <Field label="Phone" required error={form.errors.phone}>
            {(a) => <Input type="tel" autoComplete="tel" {...a} {...form.bind('phone')} />}
          </Field>
          <Field label="Position" required error={form.errors.position || form.errors.career_id}>
            {(a) => (
              <Select {...a} {...form.bind('position')}>
                <option value="">Select a position…</option>
                {jobs.map((job) => (
                  <option key={job.id} value={String(job.id)}>
                    {job.title}
                  </option>
                ))}
                <option value="general">General application</option>
              </Select>
            )}
          </Field>
          <Field full label="CV Upload" required error={cvError || form.errors.cv}>
            {(a) => (
              <FileDrop
                {...a}
                accept=".pdf,.doc,.docx"
                hint="PDF or Word, max 5 MB"
                file={cv}
                onFile={(file) => {
                  setCv(file)
                  setCvError(file ? validateCv(file) : undefined)
                }}
              />
            )}
          </Field>
          <Field full label="Message" error={form.errors.message}>
            {(a) => <Textarea {...a} {...form.bind('message')} />}
          </Field>
          <div className="col-span-full">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Uploading…' : 'Submit Application'}
            </Button>
          </div>
          <FormStatus status={form.status} />
        </form>
      </div>
    </Section>
  )
}
