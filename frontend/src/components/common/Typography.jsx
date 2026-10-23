import { Fragment } from 'react'
import { useSite } from '../../contexts/SiteContext'
import { cx, formatPhone, paragraphs, telHref } from '../../lib/format'

const EYEBROW_TONES = {
  navy: 'text-navy-600 hotel:text-hotel-text',
  light: 'text-silver',
  gold: 'text-gold',
  csr: 'text-csr',
  'csr-light': 'text-csr-light',
  hotel: 'text-hotel-text',
  cream: 'text-cream-deep',
  'gold-soft': 'text-gold-soft',
}

/**
 * Section label. "eyebrow" = accent line + uppercase mono text;
 * "number" = plain grey mono label such as "01 — OUR STORY".
 */
export function SectionLabel({ children, variant = 'eyebrow', tone = 'navy', className }) {
  if (!children) return null

  if (variant === 'number') {
    return <span className={cx('font-mono text-label tracking-[.18em]', tone === 'light' ? 'text-silver-dim' : 'text-label-grey', className)}>{children}</span>
  }

  return (
    <span
      className={cx(
        'inline-flex items-center gap-3 font-mono text-label font-medium uppercase tracking-[.18em]',
        'before:h-px before:w-7 before:bg-current before:opacity-70 before:content-[""]',
        EYEBROW_TONES[tone] || EYEBROW_TONES.navy,
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Renders text with line breaks preserved ("\n" → <br>). */
export function Lines({ text }) {
  if (!text) return null
  const lines = String(text).split('\n')
  return lines.map((line, index) => (
    <Fragment key={index}>
      {line}
      {index < lines.length - 1 && <br />}
    </Fragment>
  ))
}

export function Lead({ children, tone = 'default', className }) {
  if (!children) return null
  return (
    <p
      className={cx(
        'max-w-[38em] text-lead',
        { light: 'text-silver', csr: 'text-csr-soft' }[tone] || 'text-grey-600 hotel:text-hotel-muted',
        className,
      )}
    >
      {children}
    </p>
  )
}

/**
 * Plain CMS text with contact tokens turned into links:
 * {phone_1} {phone_2} {phone_3} {email} {years}
 */
export function TokenText({ text }) {
  const { contact, yearsSince } = useSite()
  if (!text) return null

  return String(text)
    .split(/(\{(?:phone_[123]|email|years)\})/)
    .map((part, index) => {
      const token = part.match(/^\{(.+)\}$/)?.[1]
      if (!token) return <Fragment key={index}>{part}</Fragment>
      if (token === 'years') return <Fragment key={index}>{yearsSince}</Fragment>
      if (token === 'email') {
        return contact.email ? (
          <a key={index} href={`mailto:${contact.email}`} className="underline underline-offset-2">
            {contact.email}
          </a>
        ) : null
      }
      const phone = contact[token]
      return phone ? (
        <a key={index} href={telHref(phone)} className="whitespace-nowrap underline underline-offset-2">
          {formatPhone(phone)}
        </a>
      ) : null
    })
}

/** Plain-string version of TokenText (for attributes and counters). */
export function useTokens() {
  const { contact, yearsSince } = useSite()
  return (text) =>
    String(text ?? '')
      .replace(/\{years\}/g, String(yearsSince))
      .replace(/\{year\}/g, String(new Date().getFullYear()))
      .replace(/\{email\}/g, contact.email || '')
      .replace(/\{(phone_[123])\}/g, (_, key) => formatPhone(contact[key]))
}

/** Multi-paragraph plain text (blank line = new paragraph). */
export function Paragraphs({ text, className }) {
  return paragraphs(text).map((paragraph, index) => (
    <p key={index} className={className}>
      <TokenText text={paragraph} />
    </p>
  ))
}

/** Sanitised HTML from the CMS rich-text editor (cleaned server-side). */
export function RichText({ html, className }) {
  if (!html) return null
  return <div className={cx('prose-cms', className)} dangerouslySetInnerHTML={{ __html: html }} />
}
