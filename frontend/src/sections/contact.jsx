import { useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { InfoList } from '../components/common/Blocks'
import Button, { CmsButton } from '../components/common/Button'
import { Section, SectionHead, headingId } from '../components/common/Section'
import { Lines, SectionLabel } from '../components/common/Typography'
import { Field, FormStatus, Honeypot, Input, Select, Textarea, honeypotValue } from '../components/forms/Fields'
import { useSite } from '../contexts/SiteContext'
import { rules, useForm } from '../hooks/useForm'
import { api } from '../lib/api'
import { cx, formatPhone, pad, telHref } from '../lib/format'

export const BUSINESS_AREAS = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'spare_parts', label: 'Spare Parts' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'csr', label: 'CSR' },
  { value: 'careers', label: 'Careers' },
]

// Accept friendly ?area= values in links (e.g. ?area=parts, ?area=transport)
const AREA_ALIASES = { parts: 'spare_parts', transport: 'transportation' }

const ACCENTS = {
  navy: 'border-t-navy-900',
  blue: 'border-t-navy-600',
  hotel: 'border-t-hotel',
  silver: 'border-t-silver-dim',
}

const card =
  'reveal relative grid content-start gap-4 border border-t-3 border-grey-200 bg-white px-7 py-8 transition-[translate,box-shadow] duration-500 ease-brand hover:-translate-y-1 hover:shadow-soft'

function PhoneLink({ phone }) {
  return phone ? (
    <a href={telHref(phone)} className="whitespace-nowrap hover:text-navy-600">
      {formatPhone(phone)}
    </a>
  ) : null
}

function Definition({ term, children }) {
  if (!children) return null
  return (
    <>
      <dt className="font-mono text-[.66rem] uppercase tracking-[.16em] text-grey-600">{term}</dt>
      <dd>{children}</dd>
    </>
  )
}

/** One card per business desk with phone, email and WhatsApp. */
export function ContactDesks({ section }) {
  const c = section.content
  const titleId = headingId(section)
  const { contact } = useSite()

  return (
    <Section id={section.anchor} labelledBy={titleId}>
      <div className="wrap">
        <SectionHead label={c.label} labelStyle={c.label_style} title={c.title} titleId={titleId} lead={c.lead} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {c.desks?.map((desk, index) => {
            const email = desk.email || contact.email
            return (
              <article key={desk.title} style={{ '--d': `${index * 0.06}s` }} className={cx(card, ACCENTS[desk.accent] || ACCENTS.navy)}>
                <SectionLabel variant="number">{pad(index)}</SectionLabel>
                <h3 className="text-[1.2rem] tracking-[-.01em]">{desk.title}</h3>
                <dl className="grid gap-2.5 text-[.92rem]">
                  <Definition term="Phone">
                    <PhoneLink phone={desk.phone || contact.phone_1} />
                  </Definition>
                  <Definition term="Email">
                    {email && (
                      <a href={`mailto:${email}`} className="break-all hover:text-navy-600">
                        {email}
                      </a>
                    )}
                  </Definition>
                </dl>
                {desk.whatsapp ? (
                  <CmsButton button={{ label: 'WhatsApp', whatsapp: desk.whatsapp, variant: 'whatsapp' }} />
                ) : (
                  desk.button_url && (
                    <Button to={desk.button_url} variant="ghost" icon="none">
                      {desk.button_label || 'Contact us'}
                    </Button>
                  )
                )}
              </article>
            )
          })}
        </div>
      </div>
    </Section>
  )
}

/** Branch / office cards. */
export function Locations({ section }) {
  const c = section.content
  const titleId = headingId(section)
  const { contact } = useSite()
  const accents = ['navy', 'blue', 'silver']

  return (
    <Section id={section.anchor} tight labelledBy={titleId}>
      <div className="wrap">
        <SectionHead label={c.label} labelStyle={c.label_style} title={c.title} titleId={titleId} lead={c.lead} />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          {c.items?.map((location, index) => (
            <article key={location.name} style={{ '--d': `${index * 0.06}s` }} className={cx(card, ACCENTS[accents[index % 3]])}>
              <SectionLabel variant="number">{location.label}</SectionLabel>
              <h3 className="text-[1.2rem] tracking-[-.01em]">{location.name}</h3>
              <dl className="grid gap-2.5 text-[.92rem]">
                <Definition term="Address">
                  <Lines text={location.address} />
                </Definition>
                <Definition term="Phone">
                  {location.phone_note} <PhoneLink phone={location.phone || contact.phone_1} />
                </Definition>
              </dl>
            </article>
          ))}
        </div>
      </div>
    </Section>
  )
}

/** Office details from Settings beside the main contact form. */
export function ContactForm({ section }) {
  const c = section.content
  const titleId = headingId(section)
  const { contact } = useSite()
  const [params] = useSearchParams()
  const phones = [contact.phone_1, contact.phone_2, contact.phone_3].filter(Boolean)

  const form = useForm({
    initial: { name: '', email: '', phone: '', subject: '', business_area: '', message: '' },
    validate: (v) => ({
      name: rules.required(v.name),
      email: rules.required(v.email) || rules.email(v.email),
      phone: rules.phone(v.phone),
      subject: rules.required(v.subject),
      business_area: rules.required(v.business_area, 'Please choose a business area.'),
      message: rules.required(v.message) || rules.minLength(v.message, 10),
    }),
    onSubmit: (values, formEl) => api.post('/contact', { ...values, company_website: honeypotValue(formEl) }),
  })
  const { setValue } = form
  const areaParam = params.get('area')

  // Links such as /contact?area=csr pre-select the business area
  useEffect(() => {
    const area = AREA_ALIASES[areaParam] || areaParam
    if (BUSINESS_AREAS.some((a) => a.value === area)) setValue('business_area', area)
  }, [areaParam, setValue])

  const submitting = form.status.state === 'submitting'

  return (
    <Section id={section.anchor} theme="off" labelledBy={titleId}>
      <div className="wrap grid gap-[clamp(2rem,2rem+4vw,6rem)] lg:grid-cols-[.9fr_1.1fr]">
        <div className="reveal grid content-start gap-6">
          <SectionLabel>{c.label}</SectionLabel>
          <h2 id={titleId} className="text-h2">
            {c.title}
          </h2>
          <InfoList
            items={[
              { icon: 'pin', label: 'Location', value: contact.address },
              {
                icon: 'phone',
                label: 'Phone',
                value: phones.length > 0 && (
                  <span className="flex flex-wrap gap-x-4 gap-y-1">
                    {phones.map((phone) => (
                      <PhoneLink key={phone} phone={phone} />
                    ))}
                  </span>
                ),
              },
              { icon: 'mail', label: 'Email', value: contact.email && <a href={`mailto:${contact.email}`} className="break-all hover:text-navy-600">{contact.email}</a> },
              { icon: 'clock', label: 'Opening Hours', value: c.hours || contact.opening_hours },
            ]}
          />
        </div>

        <form onSubmit={form.handleSubmit} noValidate className="relative grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <Honeypot />
          <Field label="Full Name" required error={form.errors.name}>
            {(a) => <Input autoComplete="name" {...a} {...form.bind('name')} />}
          </Field>
          <Field label="Email" required error={form.errors.email}>
            {(a) => <Input type="email" autoComplete="email" {...a} {...form.bind('email')} />}
          </Field>
          <Field label="Phone" error={form.errors.phone}>
            {(a) => <Input type="tel" autoComplete="tel" {...a} {...form.bind('phone')} />}
          </Field>
          <Field label="Subject" required error={form.errors.subject}>
            {(a) => <Input {...a} {...form.bind('subject')} />}
          </Field>
          <Field full label="Business Area" required error={form.errors.business_area}>
            {(a) => (
              <Select {...a} {...form.bind('business_area')}>
                <option value="">Select a business area…</option>
                {BUSINESS_AREAS.map((area) => (
                  <option key={area.value} value={area.value}>
                    {area.label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field full label="Message" required error={form.errors.message}>
            {(a) => <Textarea {...a} {...form.bind('message')} />}
          </Field>
          <div className="col-span-full">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send Message'}
            </Button>
          </div>
          <FormStatus status={form.status} />
        </form>
      </div>
    </Section>
  )
}

const ALLOWED_MAP_HOSTS = ['www.google.com', 'maps.google.com', 'google.com']

/** Full-width Google map from Settings → Website (Google URLs only). */
export function MapSection({ section }) {
  const { website } = useSite()
  const url = website.google_maps_embed_url
  let safe = false
  try {
    const parsed = new URL(url)
    safe = parsed.protocol === 'https:' && ALLOWED_MAP_HOSTS.includes(parsed.hostname)
  } catch {
    safe = false
  }
  if (!safe) return null

  return (
    <section id={section.anchor || undefined} aria-label="Map">
      <iframe
        src={url}
        title={section.content.title || 'Location map'}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block h-[480px] w-full border-0 grayscale-[.25] max-sm:h-[360px]"
      />
    </section>
  )
}
