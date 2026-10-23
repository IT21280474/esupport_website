import { ButtonRow } from '../components/common/Button'
import { headingId } from '../components/common/Section'
import { SectionLabel, TokenText } from '../components/common/Typography'
import { cx } from '../lib/format'

/** Large centred call to action on a dark grid with a blue glow. */
export function CtaBand({ section }) {
  const c = section.content
  const titleId = headingId(section)

  return (
    <section
      id={section.anchor || undefined}
      aria-labelledby={titleId}
      className="relative isolate overflow-hidden bg-navy-950 py-[clamp(5rem,3rem+8vw,11rem)] text-center text-white before:absolute before:inset-0 before:-z-1 before:bg-grid before:content-[''] after:absolute after:left-1/2 after:top-full after:-z-1 after:aspect-square after:w-[140%] after:-translate-x-1/2 after:-translate-y-[30%] after:bg-[radial-gradient(closest-side,rgba(31,66,144,.55),transparent)] after:content-['']"
    >
      <div className="wrap grid justify-items-center gap-8">
        <SectionLabel tone="light" className="reveal">
          {c.label}
        </SectionLabel>
        <h2 id={titleId} className="reveal max-w-[14ch] text-display leading-[.95] tracking-[-.045em]">
          {c.title} {c.title_muted && <span className="font-light text-silver-dim">{c.title_muted}</span>}
        </h2>
        <ButtonRow buttons={c.buttons} className="reveal justify-center" />
      </div>
    </section>
  )
}

/** Contained navy (or CSR-green) panel with text and buttons. */
export function CtaInline({ section }) {
  const c = section.content
  const titleId = headingId(section)
  const csr = c.theme === 'csr'

  return (
    <section id={section.anchor || undefined} aria-labelledby={titleId} className="py-section">
      <div className="wrap">
        <div
          className={cx(
            'reveal grid-overlay grid items-center gap-8 overflow-hidden rounded-xs p-[clamp(2rem,1.5rem+3vw,4rem)] text-white md:grid-cols-[1fr_auto]',
            csr ? 'bg-csr' : 'bg-navy-900',
          )}
        >
          <div>
            <SectionLabel tone="light">{c.label}</SectionLabel>
            <h2 id={titleId} className={cx('text-h2', c.label && 'mt-4')}>
              {c.title}
            </h2>
            {c.text && (
              <p className={cx('mt-4 max-w-[38em] text-lead', csr ? 'text-[#d6eadf]' : 'text-silver')}>
                <TokenText text={c.text} />
              </p>
            )}
          </div>
          <ButtonRow buttons={c.buttons} />
        </div>
      </div>
    </section>
  )
}
