import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router'
import { useSite } from '../../contexts/SiteContext'
import { cx, pad } from '../../lib/format'
import Button from '../common/Button'

/**
 * Full-screen navy menu that wipes down (clip-path) with staggered,
 * numbered links. Escape closes it; focus moves into it when opened.
 */
export default function MobileMenu({ open, items, onClose }) {
  const { company, website } = useSite()
  const firstLink = useRef(null)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) firstLink.current?.focus({ preventScroll: true })

    const onKey = (event) => event.key === 'Escape' && open && onClose()
    const onResize = () => window.innerWidth > 1024 && open && onClose()
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [open, onClose])

  return (
    <div
      id="mobile-menu"
      inert={!open}
      className={cx(
        'bg-grid fixed inset-0 z-90 flex flex-col justify-between overflow-y-auto bg-navy-950 px-gutter pb-8 pt-[calc(var(--header-h)+2rem)] text-white lg:hidden',
        // Visible at once when opening (so focus can move in); hidden only after the wipe when closing
        open
          ? 'visible [clip-path:inset(0_0_0_0)] [transition:clip-path_.6s_var(--ease-brand)]'
          : 'invisible [clip-path:inset(0_0_100%_0)] [transition:clip-path_.6s_var(--ease-brand),visibility_0s_.6s]',
      )}
    >
      <nav aria-label="Mobile">
        <ul className="grid gap-0.5">
          {items.map((item, index) => (
            <li key={item.url}>
              <NavLink
                ref={index === 0 ? firstLink : undefined}
                to={item.url}
                end={item.url === '/'}
                onClick={onClose}
                style={{ transitionDelay: open ? `${index * 40 + 150}ms` : '0ms' }}
                className={({ isActive }) =>
                  cx(
                    'flex items-baseline gap-4 border-b border-white/8 py-2 text-[clamp(1.6rem,6vw,2.4rem)] font-extrabold tracking-[-.02em]',
                    'transition-[opacity,transform] duration-500 ease-brand',
                    open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
                    isActive && 'text-gold-soft',
                  )
                }
              >
                <span className="font-mono text-xs font-normal text-silver-dim">{pad(index)}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="grid gap-4 pt-6">
        <img src={company.logo?.thumb || '/brand/logo-emblem.png'} alt="" width="56" height="56" className="size-14 rounded-full bg-white shadow-[0_0_0_2px_#fff]" />
        <p className="font-mono text-[.72rem] uppercase tracking-[.18em] text-silver-dim">
          ~ Established {company.established || 1967} ~
        </p>
        <Button to={website.header_cta_url || '/contact'} variant="light" className="w-full" onClick={onClose}>
          {website.header_cta_label || 'Get in touch'}
        </Button>
      </div>
    </div>
  )
}
