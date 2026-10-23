import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { useSite } from '../../contexts/SiteContext'
import { useScrolled } from '../../hooks/useScrolled'
import { cx } from '../../lib/format'
import Button from '../common/Button'
import Brand from './Brand'
import MobileMenu from './MobileMenu'

export const DEFAULT_NAV = [
  { label: 'Home', url: '/' },
  { label: 'About', url: '/about' },
  { label: 'Spare Parts', url: '/spare-parts' },
  { label: 'Transportation', url: '/transportation' },
  { label: 'Hotel', url: '/hotel' },
  { label: 'CSR', url: '/csr' },
  { label: 'Gallery', url: '/gallery' },
  { label: 'Careers', url: '/careers' },
  { label: 'Contact', url: '/contact' },
]

/**
 * Fixed header: transparent with white text over page heroes, turning
 * solid (white, or cream on the hotel page) once the page scrolls.
 */
export default function Header({ theme }) {
  const { navigation, website } = useSite()
  const scrolled = useScrolled(40)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const items = navigation.primary?.length ? navigation.primary : DEFAULT_NAV
  const solid = scrolled && !menuOpen
  const hotel = theme === 'hotel'

  useEffect(() => setMenuOpen(false), [pathname])

  return (
    <>
      <header
        className={cx(
          'fixed inset-x-0 top-0 z-100 border-b transition-[background,color,height,box-shadow,border-color] duration-500 ease-brand',
          solid
            ? cx(
                'h-[min(var(--header-h),72px)] shadow-[0_8px_30px_-12px_rgba(5,11,26,.18)] backdrop-blur-md backdrop-saturate-150',
                hotel ? 'border-cream-deep bg-cream/96 text-umber' : 'border-grey-100 bg-white/96 text-navy-900',
              )
            : 'h-(--header-h) border-transparent bg-transparent text-white',
        )}
      >
        <div className="wrap flex h-full items-center justify-between gap-8 lg:max-[1360px]:gap-4">
          <Brand compact={solid} />

          <nav aria-label="Primary" className="hidden items-center gap-[clamp(.9rem,.4rem+1vw,1.75rem)] lg:flex lg:max-[1360px]:gap-[.85rem]">
            {items.map((item) => (
              <NavLink
                key={item.url}
                to={item.url}
                end={item.url === '/'}
                className={({ isActive }) =>
                  cx(
                    'relative whitespace-nowrap py-2 text-[.74rem] font-bold uppercase tracking-[.13em] lg:max-[1360px]:text-[.66rem] lg:max-[1360px]:tracking-[.08em]',
                    'after:absolute after:inset-x-0 after:bottom-0.5 after:h-[1.5px] after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-500 after:ease-brand after:content-[""]',
                    'hover:after:origin-left hover:after:scale-x-100',
                    isActive && 'after:origin-left after:scale-x-100',
                    isActive && solid && (hotel ? 'text-hotel-text' : 'text-navy-600'),
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {website.header_cta_label && (
            <div className="hidden lg:block">
              <Button
                to={website.header_cta_url || '/contact'}
                variant={solid ? (hotel ? 'hotel' : 'primary') : 'light'}
                size="sm"
                className="whitespace-nowrap lg:max-[1360px]:px-3.5 lg:max-[1360px]:text-[.66rem]"
              >
                {website.header_cta_label}
              </Button>
            </div>
          )}

          <button
            type="button"
            aria-controls="mobile-menu"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid size-12 place-items-center rounded-xs border border-[rgba(127,140,160,.45)] lg:hidden"
          >
            <span
              className={cx(
                'relative block h-[1.5px] w-5 transition-colors duration-250',
                menuOpen ? 'bg-transparent' : 'bg-current',
                'before:absolute before:left-0 before:-top-1.5 before:h-[1.5px] before:w-5 before:bg-current before:transition-transform before:duration-250 before:content-[""]',
                'after:absolute after:left-0 after:top-1.5 after:h-[1.5px] after:w-5 after:bg-current after:transition-transform after:duration-250 after:content-[""]',
                menuOpen && 'before:translate-y-1.5 before:rotate-45 after:-translate-y-1.5 after:-rotate-45',
              )}
            />
          </button>
        </div>
      </header>

      <MobileMenu open={menuOpen} items={items} onClose={() => setMenuOpen(false)} />
    </>
  )
}
