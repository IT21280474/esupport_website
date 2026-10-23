import { Link } from 'react-router'
import { useSite } from '../../contexts/SiteContext'
import { cx } from '../../lib/format'

const FALLBACK_LOGO = '/brand/logo-emblem.png'

/**
 * Official circular logo on a white disc (never recoloured or distorted)
 * with the wordmark and sub-line from Settings → Company.
 */
export default function Brand({ size = 'header', compact = false, className }) {
  const { company } = useSite()
  const logo = company.logo?.thumb || company.logo?.url || FALLBACK_LOGO
  const name = company.name || 'Muthumala Group of Companies'

  return (
    <Link to="/" aria-label={`${name} — home`} className={cx('flex shrink-0 items-center gap-3.5', className)}>
      <img
        src={logo}
        alt=""
        width="64"
        height="64"
        className={cx(
          'rounded-full bg-white object-contain shadow-[0_0_0_2px_#fff,0_4px_14px_rgba(5,11,26,.18)] transition-[width,height] duration-500 ease-brand',
          size === 'footer' ? 'size-16' : compact ? 'size-9 sm:size-[42px]' : 'size-10 sm:size-12',
        )}
      />
      <span aria-hidden="true" className="grid gap-1.5 leading-none">
        <span className="text-[1.05rem] font-extrabold tracking-[.16em]">{company.short_name || 'MUTHUMALA'}</span>
        <span className="font-mono text-[.58rem] uppercase tracking-[.22em] opacity-75 max-xs:hidden lg:max-[1360px]:hidden">
          {company.tagline || 'Group of Companies · Est. 1967'}
        </span>
      </span>
    </Link>
  )
}
