import Button, { ButtonRow } from '../components/common/Button'
import Icon from '../components/common/Icon'
import Media from '../components/common/Media'
import { Section, SectionHead, headingId } from '../components/common/Section'
import { Lead, Lines, SectionLabel } from '../components/common/Typography'
import { Field, FormStatus, Honeypot, Input, Select, Textarea, honeypotValue } from '../components/forms/Fields'
import { rules, useForm } from '../hooks/useForm'
import { api } from '../lib/api'
import { cx, pad } from '../lib/format'

/* Five-tile mosaic pattern from the prototype, repeated for longer lists. */
const FLEET_TILES = [
  'col-span-full row-span-4 md:col-[1/8]',
  'col-span-6 row-span-2 md:col-[8/13]',
  'col-span-6 row-span-2 md:col-[8/13]',
  'col-span-full row-span-3 md:col-[1/5]',
  'col-span-full row-span-3 md:col-[5/13]',
]

function fleetTile(index, total) {
  if (total === 1) return 'col-span-full row-span-4'
  if (total === 2) return index === 0 ? 'col-span-full row-span-4 md:col-[1/8]' : 'col-span-full row-span-4 md:col-[8/13]'
  return FLEET_TILES[index % FLEET_TILES.length]
}

/** Photo mosaic of fleet items with a label on each tile. */
export function FleetGrid({ section }) {
  const c = section.content
  const items = section.data || []
  const titleId = headingId(section)

  return (
    <Section id={section.anchor} labelledBy={titleId}>
      <div className="wrap">
        <SectionHead label={c.label} labelStyle={c.label_style} title={c.title} titleId={titleId} lead={c.lead} />
        {items.length > 0 && (
          <div className="grid auto-rows-[90px] grid-cols-12 gap-4 md:auto-rows-[120px]">
            {items.map((item, index) => {
              const caption = [item.capacity, item.description].filter(Boolean).join(' · ')
              return (
                <div key={item.id} className={cx('group relative', fleetTile(index, items.length))}>
                  <Media
                    image={item.image}
                    art={item.vehicle_type?.slug === 'buses' ? 'bus' : item.vehicle_type?.slug === 'tippers' ? 'tipper' : item.vehicle_type ? 'lorry' : 'fleet'}
                    reveal
                    className="absolute inset-0 rounded-xs"
                    style={{ '--d': `${(index % 5) * 0.06}s` }}
                    sizes="(max-width: 768px) 100vw, 60vw"
                  />
                  <span className="absolute left-4 top-4 z-2 bg-white px-2.5 py-1.5 font-mono text-[.66rem] uppercase tracking-[.18em] text-navy-900">{item.name}</span>
                  {caption && (
                    <p className="absolute inset-x-0 bottom-0 z-2 rounded-b-xs bg-[linear-gradient(0deg,rgba(5,11,26,.85),transparent)] px-4 pb-4 pt-10 text-sm text-white">
                      {caption}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Section>
  )
}

/** Dark service cards whose technical grid fades in on hover. */
export function ServiceGrid({ section }) {
  const c = section.content
  const services = section.data || []
  const titleId = headingId(section)

  return (
    <Section id={section.anchor} theme="off" labelledBy={titleId}>
      <div className="wrap">
        <SectionHead label={c.label} labelStyle={c.label_style} title={c.title} titleId={titleId} lead={c.lead} />
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {services.map((service, index) => (
            <article
              key={service.id}
              style={{ '--d': `${(index % 3) * 0.06}s` }}
              className="reveal group relative min-h-[300px] overflow-hidden bg-navy-900 px-8 py-9 text-white transition-[translate] duration-500 ease-brand hover:-translate-y-1.5 before:absolute before:inset-0 before:bg-grid before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] hover:before:opacity-100"
            >
              <span className="absolute right-7 top-7 font-mono text-[.72rem] text-silver-dim">{pad(index)}</span>
              <div className="relative grid content-start gap-4">
                <Icon name={service.icon || 'truck'} className="size-9 text-silver" strokeWidth={1.3} />
                <h3 className="text-[1.4rem] tracking-[-.02em]">{service.title}</h3>
                {service.description && <p className="text-[.95rem] text-silver-dim">{service.description}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  )
}

function TransportForm({ services }) {
  const form = useForm({
    initial: { name: '', phone: '', service: '', date: '', message: '' },
    validate: (v) => ({
      name: rules.required(v.name),
      phone: rules.required(v.phone) || rules.phone(v.phone),
      service: rules.required(v.service, 'Please choose a service.'),
      message: rules.required(v.message) || rules.minLength(v.message, 10),
    }),
    onSubmit: (values, formEl) => api.post('/transport-requests', { ...values, company_website: honeypotValue(formEl) }),
  })
  const submitting = form.status.state === 'submitting'
  const today = new Date().toISOString().slice(0, 10)

  return (
    <form onSubmit={form.handleSubmit} noValidate className="relative grid gap-x-6 gap-y-5 sm:grid-cols-2">
      <Honeypot />
      <Field dark label="Full Name" required error={form.errors.name}>
        {(a) => <Input dark autoComplete="name" {...a} {...form.bind('name')} />}
      </Field>
      <Field dark label="Phone" required error={form.errors.phone}>
        {(a) => <Input dark type="tel" autoComplete="tel" {...a} {...form.bind('phone')} />}
      </Field>
      <Field dark label="Service Type" required error={form.errors.service}>
        {(a) => (
          <Select dark {...a} {...form.bind('service')}>
            <option value="">Select…</option>
            {services.map((s) => (
              <option key={s.id}>{s.title}</option>
            ))}
            <option>Other</option>
          </Select>
        )}
      </Field>
      <Field dark label="Required Date" error={form.errors.date}>
        {(a) => <Input dark type="date" min={today} {...a} {...form.bind('date')} />}
      </Field>
      <Field dark full label="Route & details" required error={form.errors.message}>
        {(a) => <Textarea dark placeholder="From / to, load or passengers, duration…" {...a} {...form.bind('message')} />}
      </Field>
      <div className="col-span-full">
        <Button type="submit" variant="light" disabled={submitting}>
          {submitting ? 'Sending…' : 'Request Transport Service'}
        </Button>
      </div>
      <FormStatus status={form.status} />
    </form>
  )
}

/** Dark enquiry section: intro + WhatsApp beside the request form. */
export function TransportEnquiry({ section }) {
  const c = section.content
  const titleId = headingId(section)

  return (
    <Section id={section.anchor} theme="dark" grid labelledBy={titleId}>
      <div className="wrap grid gap-[clamp(2rem,2rem+4vw,6rem)] lg:grid-cols-[.9fr_1.1fr]">
        <div className="reveal grid content-center gap-6">
          <SectionLabel variant={c.label_style === 'number' ? 'number' : 'eyebrow'} tone="light">
            {c.label}
          </SectionLabel>
          <h2 id={titleId} className="text-h2">
            <Lines text={c.title} />
          </h2>
          <Lead tone="light">{c.lead}</Lead>
          <ButtonRow buttons={c.buttons} />
        </div>
        <TransportForm services={section.data || []} />
      </div>
    </Section>
  )
}
