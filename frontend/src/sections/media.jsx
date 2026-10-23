import { Pillar } from '../components/common/Blocks'
import { ButtonRow } from '../components/common/Button'
import LinkArrow from '../components/common/LinkArrow'
import Media from '../components/common/Media'
import { Section, SectionHead, headingId } from '../components/common/Section'
import { Lead, Lines, Paragraphs, RichText, SectionLabel } from '../components/common/Typography'
import { cx } from '../lib/format'

const splitGap = 'gap-[clamp(2.5rem,2rem+4vw,6rem)]'

/** Title on the left, intro paragraph on the right (CSR → Our commitment). */
export function IntroSplit({ section }) {
  const c = section.content
  const titleId = headingId(section)
  const tone = { csr: 'csr', hotel: 'hotel' }[c.accent] || 'navy'

  return (
    <Section id={section.anchor} labelledBy={titleId}>
      <div className={cx('wrap grid items-center md:grid-cols-[1.25fr_1fr]', splitGap)}>
        <div className="reveal grid content-center gap-6">
          <SectionLabel tone={tone}>{c.label}</SectionLabel>
          <h2 id={titleId} className="text-h2">
            <Lines text={c.title} />
          </h2>
        </div>
        <Lead className="reveal">{c.lead}</Lead>
      </div>
    </Section>
  )
}

const TEXT_IMAGE_THEMES = { dark: 'dark', light: 'light', off: 'off', cream: 'cream' }

/** Photo beside a text block (Hotel → Dining). */
export function TextImage({ section }) {
  const c = section.content
  const titleId = headingId(section)
  const dark = (c.theme || 'dark') === 'dark'
  const imageRight = c.image_position === 'right'

  return (
    <Section id={section.anchor} theme={TEXT_IMAGE_THEMES[c.theme] || 'dark'} labelledBy={titleId} className={dark ? 'hotel:text-cream' : undefined}>
      <div className={cx('wrap grid items-center md:grid-cols-2', splitGap)}>
        <Media
          image={c.image}
          art={c.art || 'hotel'}
          reveal
          className={cx('min-h-[420px]', imageRight && 'md:order-last')}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="reveal grid content-center gap-6">
          <SectionLabel tone={dark ? 'gold-soft' : 'navy'}>{c.label}</SectionLabel>
          <h2 id={titleId} className="text-h2">
            {c.title} {c.title_accent && <em className={dark ? 'text-gold-soft' : 'text-hotel'}>{c.title_accent}</em>}
          </h2>
          {c.lead && <p className={cx('max-w-[38em] text-lead', dark ? 'text-silver hotel:text-cream-deep' : 'text-grey-600')}>{c.lead}</p>}
          <ButtonRow buttons={c.buttons} />
        </div>
      </div>
    </Section>
  )
}

/** Serif hospitality feature with two portrait photos. */
export function HotelFeature({ section }) {
  const c = section.content
  const titleId = headingId(section)
  const cream = (c.theme || 'cream') === 'cream'

  return (
    <Section id={section.anchor} theme={cream ? 'cream' : 'page'} labelledBy={titleId}>
      <div className="wrap grid items-center gap-[clamp(2rem,2rem+4vw,6rem)] lg:grid-cols-[1fr_1.2fr]">
        <div className="reveal grid content-center gap-6">
          <SectionLabel tone="hotel">{c.label}</SectionLabel>
          <h2 id={titleId} className="font-serif text-[clamp(2.5rem,1.6rem+3.4vw,4.75rem)] font-medium leading-none tracking-[-.015em] text-umber">
            {c.title} {c.title_accent && <em className="italic text-hotel">{c.title_accent}</em>} {c.title_end}
          </h2>
          <Paragraphs text={c.lead} className="max-w-[38em] text-lead text-hotel-muted" />
          <ButtonRow buttons={c.buttons} />
        </div>
        <div className="grid grid-cols-[1.4fr_1fr] gap-4">
          <Media image={c.image_a} art="hotel" reveal className="aspect-[3/4]" imgClassName="object-[50%_55%]" sizes="(max-width: 1024px) 55vw, 30vw" />
          <Media image={c.image_b} art="hotel" reveal className="mt-16 aspect-[3/4] [--d:.15s] max-md:mt-8" imgClassName="object-[72%_60%]" sizes="(max-width: 1024px) 40vw, 22vw" />
        </div>
      </div>
    </Section>
  )
}

/** Green CSR panel beside a photo, then four pillar cards (Home → CSR). */
export function CsrFeature({ section }) {
  const c = section.content
  const titleId = headingId(section)

  return (
    <Section id={section.anchor} theme="off" labelledBy={titleId}>
      <div className="wrap">
        <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <Media image={c.image} art="community" reveal className="min-h-[420px]" imgClassName="object-[40%_60%]" sizes="(max-width: 1024px) 100vw, 45vw" />
          <div className="reveal grid content-center gap-6 bg-csr p-[clamp(2rem,1.5rem+3vw,4.5rem)] text-white">
            <SectionLabel tone="csr-light">{c.label}</SectionLabel>
            <h2 id={titleId} className="text-h2">
              {c.title}
            </h2>
            <Lead tone="csr">{c.lead}</Lead>
            <ButtonRow buttons={c.buttons} />
          </div>
        </div>
        {!!c.pillars?.length && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {c.pillars.map((pillar, index) => (
              <Pillar key={pillar.title} icon={pillar.icon} title={pillar.title} text={pillar.text} index={index} />
            ))}
          </div>
        )}
      </div>
    </Section>
  )
}

const MOSAIC_TILES = [
  'col-span-full row-span-3 md:col-[1/6] md:row-span-4',
  'col-span-full row-span-2 md:col-[6/13]',
  'col-[1/7] row-span-2 md:col-[6/9]',
  'col-[7/13] row-span-2 md:col-[9/13]',
]

/** Four-photo editorial mosaic (Hotel gallery, Careers culture). */
export function ImageMosaic({ section }) {
  const c = section.content
  const titleId = headingId(section)
  const aside = c.link_url ? (
    <LinkArrow to={c.link_url} className="reveal justify-self-start lg:justify-self-end">
      {c.link_label || 'View more'}
    </LinkArrow>
  ) : null

  return (
    <Section id={section.anchor} theme={c.theme === 'off' ? 'off' : 'light'} labelledBy={titleId}>
      <div className="wrap">
        <SectionHead label={c.label} labelStyle={c.label_style} title={c.title} titleId={titleId} lead={aside ? null : c.lead} aside={aside} />
        <div className="grid auto-rows-[90px] grid-cols-12 gap-4 md:auto-rows-[110px]">
          {c.images?.slice(0, 4).map((tile, index) => (
            <Media
              key={index}
              image={tile.image}
              art={tile.art || 'fleet'}
              alt={tile.alt || tile.image?.alt}
              reveal
              className={MOSAIC_TILES[index]}
              style={{ '--d': `${index * 0.08}s` }}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ))}
        </div>
      </div>
    </Section>
  )
}

export function RichTextSection({ section }) {
  const c = section.content
  const titleId = headingId(section)

  return (
    <Section id={section.anchor} labelledBy={titleId}>
      <div className="wrap max-w-[60rem]">
        <SectionHead label={c.label} labelStyle={c.label_style} title={c.title} titleId={titleId} layout="stack" />
        <RichText html={c.body} className="reveal text-lead text-grey-600" />
      </div>
    </Section>
  )
}
