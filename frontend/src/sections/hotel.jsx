import { useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { InfoList } from '../components/common/Blocks'
import Button, { CmsButton } from '../components/common/Button'
import Icon from '../components/common/Icon'
import LinkArrow from '../components/common/LinkArrow'
import Media from '../components/common/Media'
import { Section, SectionHead, headingId } from '../components/common/Section'
import { SectionLabel } from '../components/common/Typography'
import { Field, FormStatus, Honeypot, Input, Select, Textarea, honeypotValue } from '../components/forms/Fields'
import { useSite } from '../contexts/SiteContext'
import { rules, useForm } from '../hooks/useForm'
import { api } from '../lib/api'
import { formatPhone, telHref } from '../lib/format'

/** Room cards (managed under Admin → Hotel → Rooms). */
export function RoomGrid({ section }) {
  const c = section.content
  const rooms = section.data || []
  const titleId = headingId(section)

  return (
    <Section id={section.anchor} theme="white" labelledBy={titleId}>
      <div className="wrap">
        <SectionHead label={c.label} labelStyle={c.label_style} title={c.title} titleId={titleId} lead={c.lead} />
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {rooms.map((room, index) => (
            <article key={room.id} style={{ '--d': `${(index % 3) * 0.08}s` }} className="reveal grid content-start gap-5">
              <Media image={room.image} art="hotel" className="aspect-[4/5]" sizes="(max-width: 768px) 100vw, 33vw" />
              <h3 className="font-serif text-[1.9rem] font-medium tracking-normal">{room.name}</h3>
              {room.description && <p className="text-grey-600">{room.description}</p>}
              <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-cream-deep pt-3.5 text-sm text-hotel-soft">
                {room.capacity && (
                  <span className="inline-flex items-center gap-2">
                    <Icon name="users" className="size-5" /> {room.capacity} Guests
                  </span>
                )}
                {room.bed_type && (
                  <span className="inline-flex items-center gap-2">
                    <Icon name="bed" className="size-5" /> {room.bed_type}
                  </span>
                )}
                {room.price && (
                  <span className="font-semibold text-umber">
                    LKR {Number(room.price).toLocaleString('en-LK')} {room.price_label}
                  </span>
                )}
              </div>
              {room.status === 'available' && (
                <LinkArrow to={`?room=${encodeURIComponent(room.name)}#reserve`} preventScrollReset className="justify-self-start text-umber">
                  Book this room
                </LinkArrow>
              )}
            </article>
          ))}
        </div>
      </div>
    </Section>
  )
}

/** Amenity cells with hairline borders. */
export function AmenityGrid({ section }) {
  const c = section.content
  const amenities = section.data || []
  const titleId = headingId(section)

  return (
    <Section id={section.anchor} theme="light" labelledBy={titleId}>
      <div className="wrap">
        <SectionHead label={c.label} labelStyle={c.label_style} title={c.title} titleId={titleId} lead={c.lead} layout="center" />
        <div className="grid border-l border-t border-cream-deep sm:grid-cols-2 lg:grid-cols-4">
          {amenities.map((amenity) => (
            <div key={amenity.id} className="grid content-start gap-3 border-b border-r border-cream-deep px-6 py-8">
              <Icon name={amenity.icon || 'star'} className="size-7 text-hotel" strokeWidth={1.4} />
              <b className="font-serif text-[1.35rem] font-medium">{amenity.name}</b>
              {amenity.description && <p className="text-sm text-hotel-soft">{amenity.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

function ReservationForm({ buttons }) {
  const [params] = useSearchParams()
  const today = new Date().toISOString().slice(0, 10)
  const form = useForm({
    initial: { name: '', email: '', check_in: '', check_out: '', guests: '2', phone: '', room: '', message: '' },
    validate: (v) => ({
      name: rules.required(v.name),
      email: rules.required(v.email) || rules.email(v.email),
      check_in: rules.required(v.check_in),
      check_out: rules.required(v.check_out) || (v.check_in && v.check_out <= v.check_in ? 'Check-out must be after check-in.' : undefined),
      phone: rules.phone(v.phone),
    }),
    onSubmit: (values, formEl) => api.post('/hotel-reservations', { ...values, company_website: honeypotValue(formEl) }),
  })
  const submitting = form.status.state === 'submitting'
  const roomParam = params.get('room')
  const { setValue } = form

  // "Book this room" links pre-select the room
  useEffect(() => {
    if (roomParam) setValue('room', roomParam)
  }, [roomParam, setValue])

  return (
    <form onSubmit={form.handleSubmit} noValidate className="relative grid gap-x-6 gap-y-5 sm:grid-cols-2">
      <Honeypot />
      <Field label="Full Name" required error={form.errors.name}>
        {(a) => <Input autoComplete="name" {...a} {...form.bind('name')} />}
      </Field>
      <Field label="Email" required error={form.errors.email}>
        {(a) => <Input type="email" autoComplete="email" {...a} {...form.bind('email')} />}
      </Field>
      <Field label="Check-in" required error={form.errors.check_in}>
        {(a) => <Input type="date" min={today} {...a} {...form.bind('check_in')} />}
      </Field>
      <Field label="Check-out" required error={form.errors.check_out}>
        {(a) => <Input type="date" min={form.values.check_in || today} {...a} {...form.bind('check_out')} />}
      </Field>
      <Field label="Guests" error={form.errors.guests}>
        {(a) => (
          <Select {...a} {...form.bind('guests')}>
            {['1', '2', '3', '4', '5+'].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </Select>
        )}
      </Field>
      <Field label="Phone" error={form.errors.phone}>
        {(a) => <Input type="tel" autoComplete="tel" {...a} {...form.bind('phone')} />}
      </Field>
      {form.values.room && (
        <Field full label="Room" error={form.errors.room}>
          {(a) => <Input {...a} {...form.bind('room')} />}
        </Field>
      )}
      <Field full label="Special requests" error={form.errors.message}>
        {(a) => <Textarea {...a} {...form.bind('message')} />}
      </Field>
      <div className="col-span-full flex flex-wrap gap-3 max-sm:[&>*]:flex-[1_1_100%]">
        <Button type="submit" variant="hotel" disabled={submitting}>
          {submitting ? 'Sending…' : 'Book Your Stay'}
        </Button>
        {buttons?.map((button) => (
          <CmsButton key={button.label} button={button} />
        ))}
      </div>
      <FormStatus status={form.status} />
    </form>
  )
}

/** Reservation contact details beside the booking enquiry form. */
export function HotelReservation({ section }) {
  const c = section.content
  const titleId = headingId(section)
  const { contact } = useSite()

  return (
    <Section id={section.anchor} theme="white" labelledBy={titleId}>
      <div className="wrap grid gap-[clamp(2rem,2rem+4vw,6rem)] lg:grid-cols-[.9fr_1.1fr]">
        <div className="reveal grid content-start gap-6">
          <SectionLabel tone="hotel">{c.label}</SectionLabel>
          <h2 id={titleId} className="text-h2">
            {c.title}
          </h2>
          <InfoList
            items={[
              { icon: 'pin', label: 'Enquiries', value: c.note },
              { icon: 'phone', label: 'Reservations', value: contact.phone_1 && <a href={telHref(contact.phone_1)}>{formatPhone(contact.phone_1)}</a> },
              { icon: 'mail', label: 'Email', value: contact.email && <a href={`mailto:${contact.email}`} className="break-all">{contact.email}</a> },
            ]}
          />
          {c.image && <Media image={c.image} art="hotel" className="aspect-[4/3]" sizes="(max-width: 1024px) 100vw, 40vw" />}
        </div>
        <ReservationForm buttons={c.buttons} />
      </div>
    </Section>
  )
}
