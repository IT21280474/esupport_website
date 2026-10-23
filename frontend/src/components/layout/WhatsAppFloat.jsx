import { useSite } from '../../contexts/SiteContext'
import { cx } from '../../lib/format'
import Icon from '../common/Icon'

const DESKS = {
  general: { label: 'WhatsApp', text: 'Chat with us' },
  spare_parts: { label: 'Spare Parts Desk', text: 'Chat about Spare Parts' },
  transport: { label: 'Transport Desk', text: 'WhatsApp Transportation' },
  hotel: { label: 'Reservations', text: 'WhatsApp Hotel' },
}

/** Floating WhatsApp button; a full-width bottom dock on phones. */
export default function WhatsAppFloat({ desk }) {
  const { whatsappUrl } = useSite()
  const href = desk ? whatsappUrl(desk) : null
  if (!href) return null
  const copy = DESKS[desk] || DESKS.general

  return (
    <aside aria-label="WhatsApp chat">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${copy.text} (opens WhatsApp in a new tab)`}
        className={cx(
          'fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-80 inline-flex min-h-14 items-center gap-3 rounded-full py-2 pl-2 pr-5',
          'text-[.85rem] font-bold tracking-[.01em] text-white shadow-wa transition-[transform,box-shadow] duration-500 ease-brand hover:-translate-y-0.5',
          'max-sm:inset-x-3 max-sm:bottom-[max(.75rem,env(safe-area-inset-bottom))] max-sm:min-h-[58px] max-sm:justify-center',
          desk === 'hotel' ? 'bg-wa-hotel' : 'bg-wa',
        )}
      >
        <span className="relative grid size-11 place-items-center rounded-full bg-white/16 before:absolute before:inset-0 before:animate-pulse-ring before:rounded-full before:border-2 before:border-white/60 before:content-['']">
          <Icon name="whatsapp" className="size-6" />
        </span>
        <span>
          <small className="block font-mono text-[.58rem] font-medium uppercase tracking-[.16em]">{copy.label}</small>
          {copy.text}
        </span>
      </a>
    </aside>
  )
}
