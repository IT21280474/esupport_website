import { Link } from 'react-router'
import { cx, formatDate, pad } from '../../lib/format'
import Icon from './Icon'
import LinkArrow from './LinkArrow'
import Media from './Media'

/** Horizontal milestone timeline with a line that draws in on scroll. */
export function Timeline({ items, dark = false, className, label = 'Milestones' }) {
  if (!items?.length) return null

  return (
    <ol
      aria-label={label}
      className={cx(
        'timeline relative grid border-t md:grid-cols-4 sm:max-md:grid-cols-2 sm:max-md:gap-y-4',
        'max-sm:ml-[5px] max-sm:border-l max-sm:border-t-0',
        dark ? 'border-white/14 [--timeline-accent:var(--color-silver)]' : 'border-grey-200',
        className,
      )}
    >
      {items.map((item, index) => (
        <li
          key={`${item.year}-${index}`}
          className={cx(
            'relative grid content-start gap-2 pr-6 pt-8 max-sm:pb-7 max-sm:pl-7 max-sm:pt-0',
            'before:absolute before:-top-1.5 before:left-0 before:size-[11px] before:rounded-full before:border-2 before:content-[""] max-sm:before:-left-1.5 max-sm:before:top-2',
            dark
              ? cx('before:border-silver', index === 0 ? 'before:bg-silver' : 'before:bg-navy-950 hotel:before:bg-umber')
              : cx('before:border-navy-700', index === 0 ? 'before:bg-navy-700' : 'before:bg-white'),
          )}
        >
          <span className="text-[1.6rem] font-extrabold tracking-[-.02em]">{item.year}</span>
          {item.title && <b className="font-bold">{item.title}</b>}
          {item.text &&<span className={cx('text-sm', dark ? 'text-silver-dim' : 'text-grey-600')}>{item.text}</span>}
        </li>
      ))}
    </ol>
  )
}

/** Two overlapping photos with a caption (prototype .stack-media). */
export function StackMedia({ imageA, artA = 'fleet', imageB, artB = 'bus', label, borderClass = 'border-white', className }) {
  return (
    <div className={cx('relative grid grid-cols-6 grid-rows-[repeat(6,70px)] max-sm:grid-rows-[repeat(6,52px)]', className)}>
      <Media image={imageA} art={artA} reveal className="col-[1/5] row-[1/6]" sizes="(max-width: 768px) 70vw, 35vw" />
      <Media
        image={imageB}
        art={artB}
        reveal
        className={cx('col-[4/7] row-[3/7] border-8 shadow-lift [--d:.15s]', borderClass)}
        sizes="(max-width: 768px) 50vw, 25vw"
      />
      {label && (
        <span className="col-[1/3] row-[6] self-end font-mono text-[.7rem] uppercase tracking-[.18em] text-grey-500">{label}</span>
      )}
    </div>
  )
}

export function Chips({ items, dark = false, label, className }) {
  if (!items?.length) return null
  return (
    <ul aria-label={label} className={cx('flex flex-wrap gap-2', className)}>
      {items.map((item) => (
        <li
          key={item}
          className={cx('rounded-full border px-3.5 py-1.5 text-[.78rem]', dark ? 'border-silver/25 text-silver' : 'border-grey-200 text-grey-600')}
        >
          {item}
        </li>
      ))}
    </ul>
  )
}

/** CSR pillar card: icon + title, with a dashed-rule footnote. */
export function Pillar({ icon, title, text, index = 0 }) {
  return (
    <div
      className="reveal relative flex min-h-[280px] flex-col justify-between border border-grey-200 bg-white px-7 py-8 transition-[border-color,translate] duration-500 ease-brand hover:-translate-y-1 hover:border-csr"
      style={{ '--d': `${(index % 4) * 0.06}s` }}
    >
      <div>
        <Icon name={icon || 'hand'} className="size-[34px] text-csr" strokeWidth={1.4} />
        <h3 className="mt-5 text-[1.35rem] tracking-[-.02em]">{title}</h3>
      </div>
      {text && <p className="mt-6 border-t border-dashed border-grey-200 pt-4 font-mono text-[.72rem] text-grey-600">{text}</p>}
    </div>
  )
}

/** Icon + small label + value rows (contact details). */
export function InfoList({ items }) {
  return (
    <ul className="grid border-t border-grey-200 hotel:border-cream-deep">
      {items.filter((item) => item.value).map((item) => (
        <li key={item.label} className="grid grid-cols-[44px_1fr] gap-4 border-b border-grey-200 py-6 hotel:border-cream-deep">
          <Icon name={item.icon} className="mt-1 size-[22px] text-navy-600 hotel:text-hotel" />
          <div>
            <small className="mb-1 block font-mono text-[.7rem] uppercase tracking-[.16em] text-grey-600">{item.label}</small>
            {item.value}
          </div>
        </li>
      ))}
    </ul>
  )
}

export function Breadcrumb({ items, className }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap gap-2.5 font-mono text-[.7rem] uppercase tracking-[.16em] text-silver-dim">
        {items.map((item, index) => (
          <li key={item.label} className={cx(index > 0 && 'before:mr-2.5 before:opacity-50 before:content-["/"]')} aria-current={item.to ? undefined : 'page'}>
            {item.to ? (
              <Link to={item.to} className="transition-colors hover:text-white">
                {item.label}
              </Link>
            ) : (
              item.label
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function ProductCard({ product, index = 0 }) {
  return (
    <article className="reveal group relative grid content-start gap-4" style={{ '--d': `${(index % 4) * 0.06}s` }}>
      <Media image={product.image} art="parts" className="aspect-[4/3]" imgClassName="group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" />
      <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[.7rem] uppercase tracking-[.1em] text-grey-600">
        {product.category && <span className="text-navy-600">{product.category.name}</span>}
        {product.sku && <span>#{product.sku}</span>}
      </div>
      <h3 className="text-[1.2rem] leading-[1.25] tracking-[-.02em]">
        <Link to={`/spare-parts/${product.slug}`} className="after:absolute after:inset-0 after:content-['']">
          {product.name}
        </Link>
      </h3>
      {product.short_description && <p className="line-clamp-3 text-[.92rem] text-grey-600">{product.short_description}</p>}
      {!!product.vehicle_types?.length && (
        <p className="text-xs text-grey-600">For {product.vehicle_types.map((v) => v.name.toLowerCase()).join(', ')}</p>
      )}
    </article>
  )
}

export function ProjectCard({ project, index = 0 }) {
  return (
    <article className="reveal group grid content-start gap-4" style={{ '--d': `${(index % 3) * 0.08}s` }}>
      <Media image={project.image} art="community" className="aspect-[4/3]" imgClassName="group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
      <div className="flex flex-wrap gap-4 font-mono text-[.7rem] uppercase tracking-[.1em] text-grey-600">
        {project.category && <span className="text-csr">{project.category.name}</span>}
        <span>{project.date_label || formatDate(project.project_date, { month: 'long', year: 'numeric' })}</span>
      </div>
      <h3 className="text-[1.3rem] leading-[1.25] tracking-[-.02em]">{project.title}</h3>
      {project.excerpt && <p className="text-grey-600">{project.excerpt}</p>}
      <LinkArrow to={`/csr/${project.slug}`} className="justify-self-start">
        View project
      </LinkArrow>
    </article>
  )
}

/** Small numbered index ("01") used on several cards. */
export function Num({ index, className }) {
  return <span className={cx('font-mono text-xs tracking-[.14em] text-grey-500', className)}>{pad(index)}</span>
}
