import { Breadcrumb } from '../components/common/Blocks'
import Media from '../components/common/Media'
import { SectionLabel } from '../components/common/Typography'

/** Compact page hero for detail pages (product, job, CSR project). */
export default function DetailHero({ crumbs, label, title, image, art = 'lorry', children }) {
  return (
    <section className="relative isolate flex min-h-[60vh] items-end overflow-hidden bg-navy-950 text-white after:absolute after:inset-0 after:-z-1 after:bg-[linear-gradient(90deg,rgba(5,11,26,.92),rgba(5,11,26,.55)_60%,rgba(5,11,26,.3)),linear-gradient(0deg,rgba(5,11,26,.85),transparent_55%)] after:content-[''] max-sm:min-h-[56vh]">
      <Media image={image} art={art} priority className="absolute inset-0 -z-2 [--art-pos:80%_60%] [--art-size:min(56%,820px)_auto]" imgClassName="animate-hero-zoom" />
      <div className="wrap grid gap-5 pb-[clamp(2.5rem,2rem+3vw,4.5rem)] pt-[calc(var(--header-h)+4rem)]">
        <Breadcrumb items={crumbs} />
        <SectionLabel tone="light">{label}</SectionLabel>
        <h1 className="max-w-[20ch] text-h1 leading-none tracking-[-.035em] max-xs:text-[2.3rem]">{title}</h1>
        {children}
      </div>
    </section>
  )
}
