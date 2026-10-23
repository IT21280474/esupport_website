import { useSite } from '../../contexts/SiteContext'
import { cx, formatPhone, telHref } from '../../lib/format'
import Icon from '../common/Icon'
import SmartLink from '../common/SmartLink'
import { useTokens } from '../common/Typography'
import Brand from './Brand'

const SOCIAL_LABELS = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
}

const DEFAULT_COLUMNS = [
  { title: 'Company', links: [{ label: 'About', url: '/about' }, { label: 'Careers', url: '/careers' }] },
  { title: 'Business', links: [{ label: 'Spare Parts', url: '/spare-parts' }, { label: 'Transportation', url: '/transportation' }, { label: 'Hotel', url: '/hotel' }, { label: 'CSR Projects', url: '/csr' }] },
  { title: 'Explore', links: [{ label: 'Gallery', url: '/gallery' }, { label: 'Contact', url: '/contact' }] },
]

const linkHover =
  'bg-[linear-gradient(currentColor,currentColor)] bg-[length:0_1px] bg-left-bottom bg-no-repeat transition-[background-size,color] duration-500 ease-brand hover:bg-[length:100%_1px] hover:text-white'

export function SocialLinks({ className }) {
  const { social } = useSite()
  if (!social.length) return null

  return (
    <div className={cx('flex flex-wrap gap-2', className)}>
      {social.map(({ platform, url }) => (
        <a
          key={platform}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${SOCIAL_LABELS[platform] || platform} (opens in a new tab)`}
          className="grid size-11 place-items-center rounded-full border border-white/16 transition-colors duration-250 hover:border-white hover:bg-white hover:text-navy-900"
        >
          <Icon name={platform} className="size-[18px]" />
        </a>
      ))}
    </div>
  )
}

function FooterHeading({ children }) {
  return <h2 className="mb-5 font-mono text-[.7rem] font-medium uppercase tracking-[.2em] text-white">{children}</h2>
}

export default function Footer() {
  const { company, contact, website, navigation } = useSite()
  const tokens = useTokens()
  const columns = navigation.footer_columns?.length ? navigation.footer_columns : DEFAULT_COLUMNS
  const phones = [contact.phone_1, contact.phone_2, contact.phone_3].filter(Boolean)

  return (
    <footer className="relative overflow-hidden bg-navy-950 pt-[clamp(4rem,3rem+4vw,7rem)] text-[.92rem] text-silver max-sm:pb-22 before:absolute before:inset-0 before:opacity-50 before:content-[''] before:bg-grid">
      <div className="wrap relative">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 pb-16 xs:grid-cols-2 xl:grid-cols-[1.4fr_repeat(4,1fr)] md:max-xl:grid-cols-3">
          <div className="grid content-start gap-6 text-white xs:col-span-full xl:col-span-1">
            <Brand size="footer" />
            {company.description && <p className="max-w-[26em] text-silver-dim">{company.description}</p>}
            <SocialLinks />
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <FooterHeading>{column.title}</FooterHeading>
              <ul className="grid gap-3">
                {column.links?.map((link) => (
                  <li key={`${link.label}-${link.url}`}>
                    <SmartLink to={link.url} className={linkHover}>
                      {link.label}
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="max-sm:col-span-full">
            <FooterHeading>Contact</FooterHeading>
            <ul className="grid gap-3">
              {phones.map((phone) => (
                <li key={phone}>
                  <a href={telHref(phone)} className={linkHover}>
                    {formatPhone(phone)}
                  </a>
                </li>
              ))}
              {contact.email && (
                <li>
                  <a href={`mailto:${contact.email}`} className={cx(linkHover, 'break-all')}>
                    {contact.email}
                  </a>
                </li>
              )}
              {contact.address && <li className="whitespace-pre-line">{contact.address.replace(/, (Colombo)/, ',\n$1')}</li>}
            </ul>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="relative select-none whitespace-nowrap pb-6 text-[clamp(3.5rem,1rem+12vw,13rem)] font-extrabold leading-[.8] tracking-[-.05em] text-transparent [-webkit-text-stroke:1px_rgba(195,204,217,.16)]"
      >
        {company.short_name || 'MUTHUMALA'}
      </div>

      <div className="wrap relative flex flex-wrap justify-between gap-4 border-t border-white/10 py-7 text-[.8rem] text-silver-dim">
        <span>{tokens(website.copyright || `© {year} ${company.name || 'Muthumala Group of Companies'}. All Rights Reserved.`)}</span>
        {website.footer_tagline && <span className="font-mono tracking-[.2em] text-gold-soft">{website.footer_tagline}</span>}
      </div>
    </footer>
  )
}
