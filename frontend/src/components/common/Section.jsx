import { cx } from '../../lib/format'
import { Lead, Lines, SectionLabel } from './Typography'

const THEMES = {
  light: 'bg-white hotel:bg-transparent',
  white: 'bg-white',
  page: '',
  off: 'bg-off',
  dark: 'bg-navy-950 text-white hotel:bg-umber',
  navy: 'bg-navy-900 text-white',
  cream: 'bg-cream text-umber',
}

/** Page section wrapper (prototype .section + theme modifiers). */
export function Section({ theme = 'light', grid = false, tight = false, id, className, children, labelledBy, ...props }) {
  return (
    <section
      id={id || undefined}
      aria-labelledby={labelledBy}
      className={cx('relative', tight ? 'py-[calc(var(--spacing-section)*.6)]' : 'py-section', THEMES[theme], grid && 'grid-overlay', className)}
      {...props}
    >
      {children}
    </section>
  )
}

/**
 * Section header (prototype .sec-head): label + title on the left, lead
 * (or custom content) on the right; stacks below 1025px.
 */
export function SectionHead({
  label,
  labelStyle,
  title,
  titleId,
  lead,
  aside,
  dark = false,
  tone,
  layout = 'split',
  className,
}) {
  if (!label && !title && !lead && !aside) return null
  const labelTone = tone || (dark ? 'light' : 'navy')

  return (
    <div
      className={cx(
        'mb-[clamp(2.5rem,2rem+2vw,4.5rem)] grid gap-x-16 gap-y-8',
        layout === 'split' && 'items-end lg:grid-cols-2',
        layout === 'stack' && 'max-w-[52rem]',
        layout === 'center' && 'mx-auto max-w-[48rem] justify-items-center text-center',
        className,
      )}
    >
      <div className="reveal grid gap-5">
        <SectionLabel variant={labelStyle === 'number' ? 'number' : 'eyebrow'} tone={labelTone}>
          {label}
        </SectionLabel>
        {title && (
          <h2 id={titleId} className="text-h2">
            {typeof title === 'string' ? <Lines text={title} /> : title}
          </h2>
        )}
        {layout === 'center' && lead && (
          <Lead tone={dark ? 'light' : 'default'} className="mx-auto">
            {lead}
          </Lead>
        )}
      </div>
      {layout !== 'center' && (aside || (lead && <Lead tone={dark ? 'light' : 'default'} className="reveal [--d:.1s]">{lead}</Lead>))}
    </div>
  )
}

/** Stable id for aria-labelledby, from the section id. */
export function headingId(section, suffix = 'title') {
  return `s${section?.id ?? 'x'}-${suffix}`
}
