import { useSite } from '../contexts/SiteContext'
import { formatPhone, telHref } from '../lib/format'
import { TokenText } from '../components/common/Typography'
import { useSeo } from '../hooks/useSeo'

/** Shown on the public site while Settings → Website → Maintenance mode is on. */
export default function Maintenance() {
  const { company, contact, website } = useSite()
  useSeo({ title: 'Back shortly', noindex: true })

  return (
    <main className="relative isolate grid min-h-svh place-items-center overflow-hidden bg-navy-950 px-gutter text-center text-white before:absolute before:inset-0 before:-z-1 before:bg-grid before:content-['']">
      <div className="grid max-w-xl justify-items-center gap-6">
        <img src={company.logo?.thumb || '/brand/logo-emblem.png'} alt={company.name || 'Muthumala Group'} width="88" height="88" className="size-22 rounded-full bg-white" />
        <span className="font-mono text-label uppercase tracking-[.3em] text-gold-soft">~ {company.name || 'Muthumala Group of Companies'} ~</span>
        <h1 className="text-h1 tracking-[-.035em]">We’ll be back shortly.</h1>
        <p className="text-lead text-silver">
          <TokenText text={website.maintenance_message || 'Our website is being updated.'} />
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-mono text-sm text-silver-dim">
          {contact.phone_1 && <a href={telHref(contact.phone_1)}>{formatPhone(contact.phone_1)}</a>}
          {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
        </div>
      </div>
    </main>
  )
}
