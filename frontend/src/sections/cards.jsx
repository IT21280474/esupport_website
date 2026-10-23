import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { Chips, Num, Timeline } from '../components/common/Blocks'
import { ButtonRow } from '../components/common/Button'
import Icon from '../components/common/Icon'
import LinkArrow from '../components/common/LinkArrow'
import Media from '../components/common/Media'
import { Section, SectionHead, headingId } from '../components/common/Section'
import { Lead, Lines, SectionLabel, TokenText } from '../components/common/Typography'
import { useSite } from '../contexts/SiteContext'
import { cx, pad } from '../lib/format'

const bodyPad = 'p-[clamp(1.5rem,1rem+1.5vw,2.5rem)]'
const cornerX = 'left-[clamp(1.5rem,1rem+1.5vw,2.5rem)]'

/**
 * Card spans in the 3-column grid: the first card is tall; the rest fill the
 * two columns beside it, with a wide card closing an odd row.
 */
function cardLayout(index, total) {
  if (index === 0) return 'primary'
  const rest = total - 1
  if (rest <= 2) return 'wide'
  return rest % 2 === 1 && index === total - 1 ? 'wide' : 'normal'
}

/** Large photo cards (Home → Our Businesses, Spare Parts → Shop by vehicle). */
export function BusinessCards({ section }) {
  const c = section.content
  const titleId = headingId(section)
  const cards = c.cards || []

  return (
    <Section id={section.anchor} theme={c.theme === 'off' ? 'off' : 'light'} labelledBy={titleId}>
      <div className="wrap">
        <SectionHead label={c.label} labelStyle={c.label_style} title={c.title} titleId={titleId} lead={c.lead} />
        <div className="grid gap-4 sm:max-lg:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr] lg:grid-rows-[auto_auto]">
          {cards.map((card, index) => {
            const layout = cardLayout(index, cards.length)
            const primary = layout === 'primary'
            return (
              <Link
                key={`${card.title}-${index}`}
                to={card.url || '#'}
                style={{ '--d': `${index * 0.08}s` }}
                className={cx(
                  'reveal group relative isolate flex min-h-[380px] flex-col justify-end overflow-hidden rounded-xs text-white max-sm:min-h-[420px]',
                  "after:absolute after:inset-0 after:-z-1 after:bg-[linear-gradient(0deg,rgba(5,11,26,.92)_0%,rgba(5,11,26,.35)_55%,rgba(5,11,26,.05)_100%)] after:content-['']",
                  primary && 'sm:max-lg:col-span-full sm:max-lg:min-h-[520px] lg:row-span-2 lg:min-h-[640px]',
                  layout === 'wide' && 'lg:col-span-2',
                )}
              >
                <Media
                  image={card.image}
                  art={card.art || 'lorry'}
                  className="absolute inset-0 -z-2 transition-transform duration-1200 ease-brand group-hover:scale-[1.04]"
                  sizes={primary ? '(max-width: 1024px) 100vw, 45vw' : '(max-width: 1024px) 50vw, 33vw'}
                />
                <span className={cx('absolute top-6 font-mono text-xs tracking-[.2em] text-silver', cornerX)}>{pad(index)}</span>
                {card.badge && (
                  <span className={cx('absolute top-5 border border-gold-soft/60 px-2.5 py-1.5 font-mono text-[.62rem] uppercase tracking-[.18em] text-gold-soft', primary ? 'right-5' : 'right-20')}>
                    {card.badge}
                  </span>
                )}
                <div className={cx('grid gap-3', bodyPad)}>
                  <h3 className={primary ? 'text-[clamp(2rem,1.3rem+2.4vw,3.5rem)] tracking-[-.02em]' : 'text-[clamp(1.5rem,1.1rem+1.2vw,2.4rem)] tracking-[-.02em]'}>
                    <Lines text={card.title} />
                  </h3>
                  {card.text && <p className="max-w-[30em] text-[.95rem] text-silver">{card.text}</p>}
                  {card.link_label && <LinkArrow as="span">{card.link_label}</LinkArrow>}
                </div>
                <span
                  aria-hidden="true"
                  className={cx(
                    'absolute grid size-12 place-items-center rounded-full border border-white/30 transition-[background,color,rotate] duration-500 ease-brand group-hover:-rotate-45 group-hover:bg-white group-hover:text-navy-900',
                    primary ? 'bottom-[clamp(1.5rem,1rem+1.5vw,2.5rem)] right-[clamp(1.5rem,1rem+1.5vw,2.5rem)]' : 'right-5 top-5',
                  )}
                >
                  <Icon name="arrow-ur" />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </Section>
  )
}

/** Edge-to-edge dark band: photo + label, title, chips and buttons. */
export function PartsFeature({ section }) {
  const c = section.content
  const titleId = headingId(section)

  return (
    <section id={section.anchor || undefined} aria-labelledby={titleId}>
      <div className="grid bg-navy-950 text-white lg:grid-cols-[1.2fr_1fr]">
        <Media image={c.image} art={c.art || 'parts'} reveal className="min-h-[640px] max-lg:min-h-[420px]" sizes="(max-width: 1024px) 100vw, 55vw" />
        <div className="grid-overlay flex flex-col justify-center gap-7 p-[clamp(2.5rem,2rem+4vw,6rem)]">
          <SectionLabel tone="light" className="reveal">
            {c.label}
          </SectionLabel>
          <h2 id={titleId} className="reveal text-h2">
            <Lines text={c.title} />
          </h2>
          <Lead tone="light" className="reveal">
            {c.lead}
          </Lead>
          <Chips items={c.chips} dark label="Example part categories" className="reveal" />
          <ButtonRow buttons={c.buttons} className="reveal" />
        </div>
      </div>
    </section>
  )
}

/** Three bordered vehicle cards with a stretched link. */
export function VehicleCards({ section }) {
  const cards = section.content.cards || []

  return (
    <Section id={section.anchor} tight aria-label="Vehicle types">
      <div className="wrap">
        <div className="grid gap-px border border-grey-200 bg-grey-200 md:grid-cols-3">
          {cards.map((card, index) => (
            <article
              key={card.title}
              style={{ '--d': `${index * 0.08}s` }}
              className="reveal group relative grid grid-rows-[auto_1fr] overflow-hidden bg-white transition-colors duration-500 hover:bg-off sm:max-md:grid-cols-[1fr_1.1fr] sm:max-md:grid-rows-none"
            >
              <Media
                image={card.image}
                art={card.art || 'lorry'}
                className="aspect-[16/10] sm:max-md:aspect-auto sm:max-md:min-h-[200px]"
                imgClassName="group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="grid content-start gap-3 p-7">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-[clamp(1.6rem,1.2rem+1.2vw,2.4rem)] tracking-[-.03em]">{card.title}</h3>
                  <Num index={index} />
                </div>
                {card.text && <p className="text-grey-600">{card.text}</p>}
                {card.url && (
                  <LinkArrow to={card.url} className="justify-self-start after:absolute after:inset-0 after:content-['']">
                    {card.link_label || 'Learn more'}
                  </LinkArrow>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  )
}

/** Gentle parallax on desktop pointers only (prototype data-parallax). */
function useParallax(containerRef) {
  useEffect(() => {
    const container = containerRef.current
    const allowed = window.matchMedia('(hover: hover) and (min-width: 769px)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!container || !allowed) return undefined

    const targets = [...container.querySelectorAll('[data-parallax]')]
    let ticking = false
    const update = () => {
      const vh = window.innerHeight
      targets.forEach((el) => {
        const rect = el.parentElement.getBoundingClientRect() // the panel
        if (rect.bottom < 0 || rect.top > vh) return
        el.style.setProperty('--py', `${(((rect.top + rect.height / 2 - vh / 2) / vh) * -40).toFixed(1)}px`)
      })
      ticking = false
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [containerRef])
}

/** Dark section with tall vehicle panels and a word marquee. */
export function Mobility({ section }) {
  const c = section.content
  const titleId = headingId(section)
  const track = useRef(null)
  useParallax(track)

  return (
    <Section id={section.anchor} theme="dark" className="overflow-hidden" labelledBy={titleId}>
      <div className="wrap">
        <SectionHead dark label={c.label} labelStyle={c.label_style} title={c.title} titleId={titleId} lead={c.lead} />
        <div ref={track} className="grid gap-4 sm:max-lg:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          {c.panels?.map((panel, index) => (
            <div
              key={panel.title}
              style={{ '--d': `${index * 0.08}s` }}
              className="reveal relative isolate flex min-h-[520px] items-end overflow-hidden rounded-xs first:sm:max-lg:col-span-full max-lg:min-h-[420px] max-sm:min-h-[340px] after:absolute after:inset-0 after:-z-1 after:bg-[linear-gradient(0deg,rgba(5,11,26,.9),transparent_55%)] after:content-['']"
            >
              <Media
                image={panel.image}
                art={panel.art || 'lorry'}
                data-parallax=""
                className="absolute inset-x-0 -inset-y-[8%] -z-2 translate-y-[var(--py,0px)] max-md:inset-0 max-md:translate-y-0"
                imgClassName={index === 0 ? 'object-[60%_55%]' : 'object-[74%_55%]'}
                sizes="(max-width: 1024px) 50vw, 33vw"
              />
              <div className="grid gap-1.5 p-8">
                <span className="font-mono text-[.7rem] uppercase tracking-[.18em] text-silver">{panel.caption}</span>
                <b className="text-[clamp(2rem,1.4rem+2vw,3.4rem)] font-extrabold leading-none tracking-[-.035em]">{panel.title}</b>
              </div>
            </div>
          ))}
        </div>
      </div>
      {!!c.marquee?.length && (
        <div
          aria-hidden="true"
          className="mask-fade-x mt-[clamp(2.5rem,2rem+3vw,5rem)] flex gap-12 overflow-hidden whitespace-nowrap text-[clamp(3rem,2rem+6vw,8rem)] font-extrabold leading-none tracking-[-.04em]"
        >
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 animate-marquee gap-12">
              {c.marquee.map((word, index) => (
                <span key={`${word}-${index}`} className={index % 2 ? 'text-transparent [-webkit-text-stroke:1px_rgba(195,204,217,.45)]' : ''}>
                  {word}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

const FEATURE_COLUMNS = {
  2: 'sm:grid-cols-2 sm:[&>:last-child:nth-child(odd)]:col-span-full',
  3: 'sm:grid-cols-2 md:grid-cols-3',
  5: 'sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5',
}

/** Icon + title + text cells separated by hairlines. */
export function FeatureGrid({ section }) {
  const c = section.content
  const titleId = headingId(section)
  const dark = c.theme === 'dark'
  const split = c.layout === 'split'

  const grid = (
    <div className={cx('grid gap-px border', dark ? 'border-white/10 bg-white/10' : 'border-grey-200 bg-grey-200', FEATURE_COLUMNS[c.columns] || FEATURE_COLUMNS[3])}>
      {c.items?.map((item, index) => (
        <div
          key={item.title}
          style={{ '--d': `${(index % 5) * 0.05}s` }}
          className={cx(
            'reveal grid content-start gap-4 px-7 py-9 transition-colors duration-500',
            dark ? 'bg-navy-950 hover:bg-navy-900 hotel:bg-umber' : 'bg-white hover:bg-off',
          )}
        >
          <Icon name={item.icon || 'check'} className={cx('size-8', dark ? 'text-silver' : 'text-navy-600')} strokeWidth={1.4} />
          <h3 className="text-[1.15rem] tracking-[-.01em]">{item.title}</h3>
          {item.text && <p className={cx('text-[.92rem]', dark ? 'text-silver-dim' : 'text-grey-600')}>{item.text}</p>}
        </div>
      ))}
    </div>
  )

  return (
    <Section id={section.anchor} theme={c.theme || 'light'} labelledBy={titleId}>
      {split ? (
        <div className="wrap grid items-center gap-[clamp(2.5rem,2rem+4vw,6rem)] md:grid-cols-[1fr_1.25fr]">
          <div className="reveal grid content-center gap-6">
            <SectionLabel variant={c.label_style === 'number' ? 'number' : 'eyebrow'} tone={dark ? 'light' : 'navy'}>
              {c.label}
            </SectionLabel>
            <h2 id={titleId} className="text-h2">
              <Lines text={c.title} />
            </h2>
            <Lead tone={dark ? 'light' : 'default'}>{c.lead}</Lead>
          </div>
          {grid}
        </div>
      ) : (
        <div className="wrap">
          <SectionHead dark={dark} label={c.label} labelStyle={c.label_style} title={c.title} titleId={titleId} lead={c.lead} />
          {grid}
        </div>
      )}
    </Section>
  )
}

/** Objectives: bordered cards with a large faded number. */
export function NumberedCards({ section }) {
  const c = section.content
  const titleId = headingId(section)

  return (
    <Section id={section.anchor} theme="off" labelledBy={titleId}>
      <div className="wrap">
        <SectionHead label={c.label} labelStyle={c.label_style} title={c.title} titleId={titleId} lead={c.lead} />
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {c.items?.map((item, index) => (
            <article key={item.title} style={{ '--d': `${(index % 3) * 0.06}s` }} className="reveal grid min-h-[220px] content-start gap-4 border border-grey-200 bg-white p-8">
              {/* Decorative faded numeral, drawn by CSS so it stays out of the text and accessibility tree */}
              <span aria-hidden="true" data-num={pad(index)} className="text-[2.5rem] font-extrabold leading-none tracking-[-.04em] text-grey-200 before:content-[attr(data-num)]" />
              <h3 className="text-h3 tracking-[-.015em]">{item.title}</h3>
              {item.text && <p className="text-grey-600">{item.text}</p>}
            </article>
          ))}
        </div>
      </div>
    </Section>
  )
}

/** Values: numbered three-column list. */
export function Values({ section }) {
  const c = section.content
  const titleId = headingId(section)

  return (
    <Section id={section.anchor} theme="off" labelledBy={titleId}>
      <div className="wrap">
        <SectionHead label={c.label} labelStyle={c.label_style} title={c.title} titleId={titleId} lead={c.lead} />
        <div className="grid border-t border-grey-200 sm:grid-cols-2 md:grid-cols-3">
          {c.items?.map((item, index) => (
            <div key={item.title} className="reveal grid content-start gap-2.5 border-b border-grey-200 py-9 pr-8">
              <span className="font-mono text-[.72rem] tracking-[.14em] text-gold-text">{pad(index)}</span>
              <h3 className="text-[1.6rem] tracking-[-.025em]">{item.title}</h3>
              {item.text && <p className="max-w-[26em] text-[.95rem] text-grey-600">{item.text}</p>}
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/** Dark statistics band. `{years}` counts up to the years since establishment. */
export function Stats({ section }) {
  const c = section.content
  const titleId = headingId(section)
  const { yearsSince } = useSite()

  return (
    <Section id={section.anchor} theme="dark" grid labelledBy={titleId}>
      <div className="wrap">
        <SectionHead
          dark
          tone="gold"
          label={c.label}
          title={
            <>
              {c.title}
              {c.title_muted && (
                <>
                  <br />
                  <span className="font-light text-silver-dim">{c.title_muted}</span>
                </>
              )}
            </>
          }
          titleId={titleId}
          lead={c.lead}
        />
        <div className="grid grid-cols-2 gap-y-6 border-t border-white/14 lg:grid-cols-4 lg:gap-y-0">
          {c.stats?.map((stat, index) => {
            const counts = String(stat.value).trim() === '{years}'
            return (
              <div key={stat.label} style={{ '--d': `${index * 0.06}s` }} className="reveal grid content-start gap-2 pr-6 pt-8">
                <span className="text-[clamp(2.75rem,2rem+3vw,5rem)] font-extrabold leading-none tracking-[-.045em]">
                  {counts ? (
                    <span data-count={yearsSince}>{yearsSince}</span>
                  ) : (
                    <TokenText text={stat.value} />
                  )}
                  {stat.suffix}
                </span>
                <span className="font-mono text-[.7rem] uppercase tracking-[.16em] text-silver-dim">{stat.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}

export function TimelineSection({ section }) {
  const c = section.content
  const titleId = headingId(section)
  const dark = c.theme !== 'light'

  return (
    <Section id={section.anchor} theme={dark ? 'dark' : 'light'} grid={dark} labelledBy={titleId}>
      <div className="wrap">
        <SectionHead dark={dark} label={c.label} labelStyle={c.label_style} title={c.title} titleId={titleId} />
        <Timeline items={c.items} dark={dark} />
      </div>
    </Section>
  )
}

export function Testimonials({ section }) {
  const c = section.content
  const titleId = headingId(section)
  if (!c.items?.length) return null

  return (
    <Section id={section.anchor} theme="off" labelledBy={titleId}>
      <div className="wrap">
        <SectionHead label={c.label} labelStyle={c.label_style} title={c.title} titleId={titleId} layout="stack" />
        <div className="grid gap-16">
          {c.items.map((item) => (
            <figure key={item.cite} className="reveal grid max-w-[52rem] gap-6">
              <blockquote className="text-[clamp(1.4rem,1.1rem+1.2vw,2.2rem)] font-medium leading-[1.35] tracking-[-.02em]">“{item.quote}”</blockquote>
              <figcaption className="font-mono text-xs uppercase tracking-[.14em] text-grey-600">{item.cite}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </Section>
  )
}

export function Faq({ section }) {
  const c = section.content
  const titleId = headingId(section)
  if (!c.items?.length) return null

  return (
    <Section id={section.anchor} labelledBy={titleId}>
      <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div className="reveal grid content-start gap-5">
          <SectionLabel variant={c.label_style === 'number' ? 'number' : 'eyebrow'}>{c.label}</SectionLabel>
          <h2 id={titleId} className="text-h2">
            <Lines text={c.title} />
          </h2>
          <Lead>{c.lead}</Lead>
        </div>
        <div className="border-t border-grey-200">
          {c.items.map((item) => (
            <details key={item.question} className="group border-b border-grey-200">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-[1.1rem] font-bold [&::-webkit-details-marker]:hidden">
                {item.question}
                <Icon name="plus" className="size-5 shrink-0 transition-transform duration-250 group-open:rotate-45" />
              </summary>
              <p className="pb-6 text-grey-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  )
}
