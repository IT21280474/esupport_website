import { Link } from 'react-router'
import { Chips, StackMedia, Timeline } from '../components/common/Blocks'
import { ButtonRow } from '../components/common/Button'
import Icon from '../components/common/Icon'
import LinkArrow from '../components/common/LinkArrow'
import Media from '../components/common/Media'
import { Section, SectionHead, headingId } from '../components/common/Section'
import { Lead, Lines, Paragraphs, RichText, SectionLabel } from '../components/common/Typography'
import { useSite } from '../contexts/SiteContext'
import { cx, pad } from '../lib/format'

const splitGap = 'gap-[clamp(2.5rem,2rem+4vw,6rem)]'
/** Lead paragraph styling for multi-paragraph intro text (matches <Lead>). */
const leadText = 'max-w-[38em] text-lead text-grey-600 hotel:text-hotel-muted'

/** Statement + big establishment year + emblem, then the milestone timeline. */
export function Heritage({ section }) {
  const c = section.content
  const { company } = useSite()
  const badge = c.badge || company.logo
  const titleId = headingId(section)

  return (
    <Section id={section.anchor} labelledBy={titleId}>
      <div className="wrap">
        <div className="grid items-center gap-[clamp(2.5rem,2rem+4vw,7rem)] lg:grid-cols-[1.1fr_.9fr]">
          <div className="reveal">
            <SectionLabel variant={c.label_style === 'number' ? 'number' : 'eyebrow'}>{c.label}</SectionLabel>
            <h2 id={titleId} className="mt-6 text-h2 tracking-[-.03em]">
              {c.title} {c.title_muted && <span className="font-normal text-grey-450">{c.title_muted}</span>}
            </h2>
            <div className="mt-7 grid gap-4">
              <Paragraphs text={c.text} className={leadText} />
            </div>
            {c.link_url && (
              <LinkArrow to={c.link_url} className="mt-8">
                {c.link_label || 'Read more'}
              </LinkArrow>
            )}
          </div>
          {c.year && (
            <div className="reveal relative text-[clamp(6rem,3rem+14vw,15rem)] font-extrabold leading-[.8] tracking-[-.06em] text-navy-900 [--d:.15s]">
              {badge && (
                <img
                  src={badge.thumb || badge.url}
                  alt={badge.alt || `${company.name || 'Muthumala Group'} logo`}
                  width="120"
                  height="120"
                  loading="lazy"
                  className="mb-5 block h-auto w-[clamp(72px,4rem+3vw,120px)] rounded-full shadow-[0_18px_40px_-16px_rgba(5,11,26,.45)]"
                />
              )}
              {c.year}
              <small className="mt-5 block font-mono text-[.78rem] font-medium uppercase tracking-[.3em] text-gold-text">{c.year_label}</small>
            </div>
          )}
        </div>
        {c.timeline_title && !!c.timeline?.length && (
          <h3 className="mt-[clamp(3rem,2rem+4vw,6rem)]">
            <SectionLabel>{c.timeline_title}</SectionLabel>
          </h3>
        )}
        <Timeline items={c.timeline} label={c.timeline_title || undefined} className={c.timeline_title ? 'mt-8' : 'mt-[clamp(3rem,2rem+4vw,6rem)]'} />
      </div>
    </Section>
  )
}

/** Long-form story beside overlapping photos (About → Our Story). */
export function StorySplit({ section }) {
  const c = section.content
  const titleId = headingId(section)

  return (
    <Section id={section.anchor} labelledBy={titleId}>
      <div className={cx('wrap grid items-center md:grid-cols-[1.25fr_1fr]', splitGap)}>
        <div className="reveal grid content-center gap-6">
          <SectionLabel variant={c.label_style === 'number' ? 'number' : 'eyebrow'}>{c.label}</SectionLabel>
          <h2 id={titleId} className="text-h2">
            <Lines text={c.title} />
          </h2>
          <Lead>{c.lead}</Lead>
          <RichText html={c.body} className="text-grey-600" />
        </div>
        <StackMedia imageA={c.image_a} artA={c.art_a || 'parts'} imageB={c.image_b} artB={c.art_b || 'lorry'} label={c.media_label} className="max-md:order-first" />
      </div>
      {!!c.timeline?.length && (
        <div className="wrap">
          <Timeline items={c.timeline} label="Company milestones" className="mt-[clamp(3rem,2rem+4vw,6rem)]" />
        </div>
      )}
    </Section>
  )
}

/** Chapters of the group's history: a large year beside the story (About → Our Journey). */
export function Journey({ section }) {
  const c = section.content
  const titleId = headingId(section)

  return (
    <Section id={section.anchor} theme={c.theme === 'off' ? 'off' : 'light'} labelledBy={titleId}>
      <div className="wrap">
        <SectionHead label={c.label} labelStyle={c.label_style} title={c.title} titleId={titleId} lead={c.lead} />
        <ol className="border-t border-grey-200">
          {c.items?.map((item, index) => (
            <li
              key={`${item.year}-${index}`}
              className="reveal grid gap-x-16 gap-y-6 border-b border-grey-200 py-[clamp(2.5rem,2rem+2.5vw,5rem)] lg:grid-cols-[minmax(0,.75fr)_minmax(0,1.25fr)]"
            >
              <div>
                <span className="font-mono text-xs text-grey-500">{pad(index)}</span>
                <p className="mt-3 text-[clamp(3.25rem,2rem+5vw,7rem)] font-extrabold leading-[.85] tracking-[-.05em] text-navy-900">{item.year}</p>
              </div>
              <div className="grid content-start gap-6">
                {item.title && <h3 className="text-[clamp(1.5rem,1.2rem+1.2vw,2.3rem)] font-extrabold leading-tight tracking-[-.025em]">{item.title}</h3>}
                <RichText html={item.body} className="text-lead text-grey-600" />
                {item.highlight && (
                  <p className="max-w-[34em] border-l-[3px] border-gold pl-5 text-[clamp(1.15rem,1rem+.5vw,1.4rem)] font-semibold leading-snug tracking-[-.01em] text-navy-900">
                    {item.highlight}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}

/** Three-line stacked headline beside overlapping photos (Home → Transportation). */
export function HeadlineSplit({ section }) {
  const c = section.content
  const titleId = headingId(section)
  const lineColors = ['', 'text-grey-450', 'text-navy-600']

  return (
    <Section id={section.anchor} labelledBy={titleId}>
      <div className={cx('wrap grid items-center md:grid-cols-[1fr_1.25fr]', splitGap)}>
        <div className="reveal grid content-center gap-6">
          <SectionLabel variant={c.label_style === 'number' ? 'number' : 'eyebrow'}>{c.label}</SectionLabel>
          <h2 id={titleId} className="text-h2 tracking-[-.035em]">
            {c.lines?.map((line, index) => (
              <span key={line} className={cx('block', lineColors[index])}>
                {line}
              </span>
            ))}
          </h2>
          <Paragraphs text={c.lead} className={leadText} />
          <Chips items={c.chips} label="Fleet types" />
          <ButtonRow buttons={c.buttons} />
        </div>
        <StackMedia imageA={c.image_a} artA={c.art_a || 'fleet'} imageB={c.image_b} artB={c.art_b || 'bus'} label={c.media_label} className="max-md:order-first" />
      </div>
    </Section>
  )
}

/** Vision / mission: large typographic statements on a dark grid. */
export function Statements({ section }) {
  const c = section.content
  const titleId = headingId(section)

  return (
    <Section id={section.anchor} theme="dark" grid labelledBy={titleId}>
      <div className="wrap">
        <h2 id={titleId} className="sr-only">
          {c.title || 'Vision and Mission'}
        </h2>
        {c.items?.map((item) => (
          <div
            key={item.label}
            id={item.anchor || undefined}
            className="reveal grid scroll-mt-24 gap-x-16 gap-y-5 border-t border-white/14 py-14 last:border-b lg:grid-cols-[220px_1fr]"
          >
            <div>
              <SectionLabel variant="number" tone="light">{item.label}</SectionLabel>
            </div>
            <p
              className={cx(
                'text-[clamp(1.75rem,1.2rem+2.4vw,3.4rem)] font-bold leading-[1.15] tracking-[-.03em]',
                (item.text || '').length > 140 ? 'max-w-[28ch]' : 'max-w-[22ch]',
              )}
            >
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </Section>
  )
}

/** Chairman's message beside a portrait — or the group emblem until one is supplied. */
export function ChairmanMessage({ section }) {
  const c = section.content
  const { company } = useSite()
  const logo = company.logo?.src || company.logo?.url || '/brand/logo-emblem.png'

  return (
    <Section id={section.anchor} labelledBy={headingId(section)}>
      <div className="wrap grid items-center gap-[clamp(2rem,2rem+4vw,6rem)] lg:grid-cols-[.85fr_1.15fr]">
        {c.image ? (
          <Media image={c.image} art="lorry" reveal className="aspect-[4/5] max-lg:max-w-[520px]" sizes="(max-width: 1024px) 90vw, 40vw" />
        ) : (
          <figure className="media grid aspect-[4/5] place-items-center max-lg:max-w-[520px]" data-art="emblem">
            <img
              src={logo}
              alt={`${company.name || 'Muthumala Group'} emblem`}
              width="300"
              height="300"
              loading="lazy"
              className="h-auto w-[58%] rounded-full object-contain shadow-[0_0_0_3px_#fff,0_30px_60px_-20px_rgba(0,0,0,.6)]"
            />
          </figure>
        )}
        <div className="reveal grid content-center gap-6">
          <SectionLabel variant="number">{c.label}</SectionLabel>
          <h2 id={headingId(section)} className="sr-only">
            Chairman’s message
          </h2>
          <blockquote className="text-[clamp(1.4rem,1.1rem+1.2vw,2.1rem)] font-medium leading-[1.4] tracking-[-.015em] before:mb-4 before:block before:text-[5rem] before:font-extrabold before:leading-[.6] before:text-gold before:content-['“'] max-sm:text-[1.3rem]">
            <p>{c.quote}</p>
          </blockquote>
          {(c.name || c.role) && (
            <div className="grid gap-1 border-t border-grey-200 pt-6">
              {c.name && <b className="text-[1.15rem]">{c.name}</b>}
              {c.role && <span className="font-mono text-[.72rem] uppercase tracking-[.14em] text-grey-600">{c.role}</span>}
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}

/** Numbered full-width rows linking to each business area. */
export function LinkRows({ section }) {
  const c = section.content
  const titleId = headingId(section)

  return (
    <Section id={section.anchor} labelledBy={titleId}>
      <div className="wrap">
        <SectionHead label={c.label} labelStyle={c.label_style} title={c.title} titleId={titleId} layout="stack" />
        <div className="border-t border-grey-200">
          {c.items?.map((item, index) => (
            <Link
              key={item.url}
              to={item.url}
              className="reveal group grid grid-cols-[1fr_52px] items-center gap-x-4 gap-y-2 border-b border-grey-200 py-8 transition-[padding,background] duration-500 ease-brand hover:bg-off hover:px-5 md:grid-cols-[80px_1fr_1.2fr_56px] md:gap-6"
            >
              <span className="font-mono text-xs text-grey-500 max-md:col-span-full">{pad(index)}</span>
              <span className="text-[clamp(1.5rem,1.1rem+1.5vw,2.6rem)] font-extrabold tracking-[-.03em]">{item.title}</span>
              <span className="text-grey-600 max-md:col-start-1">{item.text}</span>
              <span
                aria-hidden="true"
                className="grid size-13 place-items-center rounded-full border border-grey-200 transition-all duration-500 ease-brand group-hover:-rotate-45 group-hover:border-navy-900 group-hover:bg-navy-900 group-hover:text-white max-md:col-start-2 max-md:row-[2/4]"
              >
                <Icon name="arrow" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </Section>
  )
}
