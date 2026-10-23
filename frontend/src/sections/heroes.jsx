import { Breadcrumb } from '../components/common/Blocks'
import { ButtonRow } from '../components/common/Button'
import Media from '../components/common/Media'
import { headingId } from '../components/common/Section'
import { Lead, SectionLabel } from '../components/common/Typography'
import { cx } from '../lib/format'

/**
 * Home: one-viewport stage — compact centred headline above the full
 * vehicle line-up, followed by a three-fact bar (prototype .hero--fleet).
 */
export function HomeHero({ section }) {
  const c = section.content
  const titleId = headingId(section)

  return (
    <section
      aria-labelledby={titleId}
      className="relative isolate overflow-hidden bg-[linear-gradient(180deg,var(--color-navy-950)_0%,#10264f_40%,#3a5c86_100%)] text-white before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-[55%] before:bg-grid before:opacity-60 before:content-['']"
    >
      <div className="relative flex h-svh max-h-[1200px] min-h-[620px] flex-col max-md:h-auto max-md:min-h-0">
        <div className="wrap relative z-2 grid flex-none justify-items-center gap-[clamp(.6rem,1.6vh,1.25rem)] pt-[calc(var(--header-h)+clamp(1.25rem,3vh,3rem))] text-center max-sm:pt-[calc(var(--header-h)+2rem)]">
          {c.label && (
            <p className="reveal inline-flex items-center gap-3.5 font-mono text-[.78rem] tracking-[.3em] text-gold-soft before:opacity-80 before:content-['~'] after:opacity-80 after:content-['~']">
              {c.label}
            </p>
          )}
          <h1 id={titleId} className="reveal max-w-[20ch] text-[clamp(2.4rem,1rem+3.4vw+2vh,4.6rem)] leading-[.96] tracking-[-.04em] [--d:.1s]">
            {c.title} {c.title_accent && <span className="block font-light text-[#cfdceb]">{c.title_accent}</span>}
          </h1>
          {c.lead && <p className="reveal max-w-[40rem] text-[clamp(1rem,.9rem+.3vw,1.2rem)] text-[#dce6f1] [--d:.2s]">{c.lead}</p>}
          <ButtonRow buttons={c.buttons} className="reveal justify-center [--d:.3s]" />
        </div>

        <figure className="relative z-1 m-0 flex min-h-0 flex-auto items-end justify-center overflow-hidden bg-[linear-gradient(180deg,rgba(58,92,134,0)_0%,#8fadcb_22%,#c3d5e6_48%,#e4ecf4_75%,#f6f8fb_100%)] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-[14%] after:bg-[linear-gradient(180deg,transparent,var(--color-white))] after:content-[''] max-md:flex-none">
          {c.image && (
            <img
              src={c.image.large || c.image.url}
              srcSet={c.image.srcset || undefined}
              sizes="100vw"
              alt={c.image.alt}
              width={c.image.width}
              height={c.image.height}
              fetchPriority="high"
              className="mask-fleet block h-full w-auto max-w-[min(100%,2000px)] animate-fleet-in object-contain object-bottom max-md:-ml-[6%] max-md:h-auto max-md:w-[112%] max-md:max-w-none max-sm:-ml-[12%] max-sm:w-[124%]"
            />
          )}
        </figure>
      </div>

      {!!c.facts?.length && (
        <div className="relative z-2 bg-white px-gutter">
          <div className="reveal mx-auto grid max-w-[calc(var(--container)-2*var(--gutter))] gap-x-8 gap-y-3.5 border-t border-grey-200 pb-8 pt-6 text-navy-900 [--d:.45s] sm:grid-cols-3 sm:gap-y-4 lg:grid-cols-[repeat(3,1fr)_auto]">
            {c.facts.map((fact) => (
              <div key={fact.title} className="grid gap-1 max-sm:grid-cols-[auto_1fr] max-sm:items-baseline max-sm:gap-3">
                <b className="text-base font-bold tracking-[-.01em]">{fact.title}</b>
                <small className="font-mono text-[.68rem] uppercase tracking-[.16em] text-grey-600">{fact.label}</small>
              </div>
            ))}
            <div aria-hidden="true" className="hidden items-center gap-3 font-mono text-[.68rem] uppercase tracking-[.2em] text-grey-600 lg:flex">
              <i className="relative h-9 w-px overflow-hidden bg-grey-200 after:absolute after:-top-[40%] after:left-0 after:h-[40%] after:w-full after:animate-cue after:bg-navy-700 after:content-['']" />
              Scroll
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

const HERO_HEIGHTS = {
  default: 'min-h-[min(86vh,820px)]',
  tall: 'min-h-[min(92vh,880px)]',
  short: 'min-h-[60vh]',
}

/** Inner-page hero: photo, dark gradient, breadcrumb, label, title, buttons. */
export function PageHero({ section, page }) {
  const c = section.content
  const titleId = headingId(section)
  const size = c.size || 'default'

  return (
    <section
      aria-labelledby={titleId}
      className={cx(
        'relative isolate flex items-end overflow-hidden bg-navy-950 text-white hotel:bg-umber max-sm:min-h-[78vh]',
        HERO_HEIGHTS[size] || HERO_HEIGHTS.default,
        "after:absolute after:inset-0 after:-z-1 after:content-['']",
        'after:bg-[linear-gradient(90deg,rgba(5,11,26,.9),rgba(5,11,26,.45)_60%,rgba(5,11,26,.2)),linear-gradient(0deg,rgba(5,11,26,.85),transparent_55%)]',
        'hotel:after:bg-[linear-gradient(0deg,rgba(40,30,20,.75),rgba(40,30,20,.1)_60%)]',
      )}
    >
      <Media
        image={c.image}
        art={c.art || 'lorry'}
        priority
        className={cx(
          'absolute inset-0 -z-2 [--art-pos:80%_60%] [--art-size:min(56%,820px)_auto] max-sm:[--art-pos:30%_11%] max-sm:[--art-size:105%_auto]',
          'hotel:[--art-pos:78%_62%] hotel:[--art-size:min(55%,620px)_auto] hotel:[--base:linear-gradient(170deg,#a08868,#5c4a36)] hotel:[--glow:radial-gradient(100%_80%_at_30%_10%,rgba(255,255,255,.12)_0%,transparent_60%)]',
        )}
        imgClassName="animate-hero-zoom"
      />
      <div className="wrap grid gap-6 pb-[clamp(3rem,2rem+4vw,6rem)] pt-[calc(var(--header-h)+5rem)] max-sm:pb-24">
        <Breadcrumb className="reveal" items={[{ label: 'Home', to: '/' }, { label: page?.title || c.title }]} />
        <SectionLabel tone="light" className="reveal hotel:text-cream-deep">
          {c.label}
        </SectionLabel>
        <h1
          id={titleId}
          className={cx(
            'reveal text-h1 leading-none tracking-[-.035em] max-xs:text-[2.3rem]',
            size === 'tall' ? 'max-w-[18ch]' : 'max-w-[16ch]',
            'hotel:max-w-[14ch] hotel:font-serif hotel:text-[clamp(3rem,2rem+5vw,6.5rem)] hotel:font-medium hotel:tracking-[-.01em]',
          )}
        >
          {c.title} {c.title_accent && <em className="font-light not-italic text-silver hotel:font-medium hotel:italic hotel:text-cream-deep">{c.title_accent}</em>}
        </h1>
        {c.lead && (
          <Lead tone="light" className="reveal">
            {c.lead}
          </Lead>
        )}
        <ButtonRow buttons={c.buttons} className="reveal" />
      </div>
    </section>
  )
}
