import { useSite } from '../../contexts/SiteContext'
import { cx } from '../../lib/format'
import Icon from './Icon'
import SmartLink from './SmartLink'

/* The prototype's .btn: a hover fill sweeps in from the left (::after scaleX). */
const BASE =
  'group/btn relative isolate inline-flex min-h-13 items-center justify-center gap-3 overflow-hidden rounded-xs border px-6.5 py-3.5 ' +
  'text-[.8rem] font-bold uppercase leading-tight tracking-[.14em] transition-colors duration-250 ease-brand ' +
  'after:absolute after:inset-0 after:-z-10 after:origin-right after:scale-x-0 after:bg-(--btn-hover) after:transition-transform after:duration-500 after:ease-brand ' +
  'hover:after:origin-left hover:after:scale-x-100 disabled:pointer-events-none disabled:opacity-60'

export const BUTTON_VARIANTS = {
  primary: 'border-navy-900 bg-navy-900 text-white [--btn-hover:var(--color-navy-700)]',
  light: 'border-white bg-white text-navy-900 [--btn-hover:var(--color-silver)]',
  ghost: 'border-grey-200 bg-transparent text-navy-900 [--btn-hover:var(--color-off)]',
  'ghost-light': 'border-white/35 bg-transparent text-white [--btn-hover:rgb(255_255_255/.1)]',
  gold: 'border-gold bg-gold text-navy-950 [--btn-hover:var(--color-gold-soft)]',
  whatsapp: 'border-wa bg-wa text-white [--btn-hover:var(--color-wa-dark)]',
  hotel: 'border-umber bg-umber text-cream [--btn-hover:var(--color-umber-light)]',
}

export default function Button({ to, variant = 'primary', icon = 'arrow', className, children, size, ...props }) {
  const classes = cx(BASE, BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary, size === 'sm' && 'min-h-11 px-5 py-2.5 text-[.72rem]', className)
  const content = (
    <>
      {children}
      {icon && icon !== 'none' && (
        <Icon name={icon} className="size-5 transition-transform duration-250 ease-brand group-hover/btn:translate-x-1" />
      )}
    </>
  )

  if (to) {
    return (
      <SmartLink to={to} className={classes} {...props}>
        {content}
      </SmartLink>
    )
  }

  return (
    <button type="button" className={classes} {...props}>
      {content}
    </button>
  )
}

/**
 * Renders a CMS button definition ({ label, url, variant, whatsapp, icon }).
 * WhatsApp buttons resolve their link from Settings → WhatsApp and are
 * hidden if no number is configured.
 */
export function CmsButton({ button, className }) {
  const { whatsappUrl } = useSite()
  if (!button?.label) return null

  if (button.whatsapp) {
    const href = whatsappUrl(button.whatsapp)
    if (!href) return null
    return (
      <Button
        to={href}
        variant={button.variant || 'whatsapp'}
        icon="none"
        className={className}
        aria-label={`${button.label} (opens WhatsApp in a new tab)`}
      >
        {button.label}
      </Button>
    )
  }

  return (
    <Button to={button.url || '#'} variant={button.variant || 'primary'} icon={button.icon || 'arrow'} className={className}>
      {button.label}
    </Button>
  )
}

export function ButtonRow({ buttons, className }) {
  if (!buttons?.length) return null
  return (
    <div className={cx('flex flex-wrap gap-3 max-sm:[&>*]:flex-[1_1_100%]', className)}>
      {buttons.map((button, index) => (
        <CmsButton key={`${button.label}-${index}`} button={button} />
      ))}
    </div>
  )
}
