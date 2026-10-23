import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ProductCard } from '../components/common/Blocks'
import Button from '../components/common/Button'
import Icon from '../components/common/Icon'
import LinkArrow from '../components/common/LinkArrow'
import { Section, SectionHead, headingId } from '../components/common/Section'
import { Lead, Lines, SectionLabel } from '../components/common/Typography'
import { Field, FormStatus, Honeypot, Input, Select, honeypotValue } from '../components/forms/Fields'
import { useSite } from '../contexts/SiteContext'
import { useApi } from '../hooks/useApi'
import { rules, useForm } from '../hooks/useForm'
import { api } from '../lib/api'
import { cx, pad } from '../lib/format'

const EMPTY = []

/** Icon grid of part categories; each opens the part finder pre-filtered. */
export function ProductCategories({ section }) {
  const c = section.content
  const categories = section.data || []
  const titleId = headingId(section)
  const tile =
    'group relative flex min-h-[210px] flex-col justify-between gap-8 border-b border-r border-grey-200 px-6 pb-7 pt-8 transition-colors duration-500 ease-brand ' +
    'max-sm:min-h-[170px] max-sm:px-4 max-sm:py-5 max-xs:min-h-0 max-xs:flex-row max-xs:items-center max-xs:justify-start max-xs:gap-4'

  return (
    <Section id={section.anchor} theme="off" labelledBy={titleId}>
      <div className="wrap">
        <SectionHead label={c.label} labelStyle={c.label_style} title={c.title} titleId={titleId} lead={c.lead} />
        <div className="grid grid-cols-1 border-l border-t border-grey-200 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category, index) => (
            <Link key={category.id} to={`?category=${category.slug}#finder`} preventScrollReset className={cx(tile, 'bg-white hover:bg-navy-900 hover:text-white')}>
              <span className="absolute right-6 top-6 font-mono text-[.7rem] text-grey-500 group-hover:text-silver-dim max-xs:top-1/2 max-xs:-translate-y-1/2">{pad(index)}</span>
              <Icon name={category.icon || 'stock'} className="size-11 text-navy-700 transition-colors duration-500 group-hover:text-silver" strokeWidth={1.4} />
              <span className="text-[1.1rem] font-bold leading-[1.3] tracking-[-.01em] max-sm:text-[.98rem]">{category.name}</span>
              <span className="inline-flex items-center gap-1.5 text-[.72rem] font-bold uppercase tracking-[.12em] text-grey-600 group-hover:text-silver max-sm:hidden">
                Enquire <Icon name="arrow" className="size-4" />
              </span>
            </Link>
          ))}
          {c.cta_title && (
            <Link to={c.cta_url || '/contact'} className={cx(tile, 'bg-navy-900 text-white')}>
              <span className="absolute right-6 top-6 font-mono text-[.7rem] text-silver-dim max-xs:top-1/2 max-xs:-translate-y-1/2">+</span>
              <Icon name="headset" className="size-11 text-silver" strokeWidth={1.4} />
              <span className="text-[1.1rem] font-bold leading-[1.3] tracking-[-.01em] max-sm:text-[.98rem]">{c.cta_title}</span>
              <span className="inline-flex items-center gap-1.5 text-[.72rem] font-bold uppercase tracking-[.12em] text-silver max-sm:hidden">
                {c.cta_label || 'Ask our team'} <Icon name="arrow" className="size-4" />
              </span>
            </Link>
          )}
        </div>
        {c.note && (
          <p className="mt-6 flex items-start gap-3 text-sm text-grey-600">
            <Icon name="info" className="mt-0.5 size-5 text-gold" />
            <span>{c.note}</span>
          </p>
        )}
      </div>
    </Section>
  )
}

/** Matching catalogue products for the part-finder query. */
function FinderMatches({ query }) {
  const { data, loading } = useApi('/products', {
    vehicle_type: query.vehicle_type,
    category: query.category,
    search: query.part_number,
    per_page: 6,
  })
  const products = data?.data || []
  const total = data?.meta?.total || 0

  if (loading) return <p className="text-sm text-silver">Searching the catalogue…</p>
  if (!products.length) return <p className="text-sm text-silver">No catalogue match yet — our spare parts desk will check stock for you.</p>

  const more = new URLSearchParams(Object.entries({ vehicle: query.vehicle_type, category: query.category }).filter(([, v]) => v))

  return (
    <div className="grid gap-3">
      <p className="text-sm text-silver">
        {total} matching part{total === 1 ? '' : 's'} in our catalogue:
      </p>
      <ul className="grid gap-px overflow-hidden rounded-xs bg-white/10">
        {products.map((product) => (
          <li key={product.id}>
            <Link to={`/spare-parts/${product.slug}`} className="flex items-center justify-between gap-4 bg-navy-900 px-4 py-3 transition-colors hover:bg-navy-800">
              <span>
                <b className="block text-[.95rem]">{product.name}</b>
                <small className="font-mono text-[.68rem] uppercase tracking-[.12em] text-silver-dim">{[product.category?.name, product.sku && `#${product.sku}`].filter(Boolean).join(' · ')}</small>
              </span>
              <Icon name="arrow" className="size-4 text-silver" />
            </Link>
          </li>
        ))}
      </ul>
      {total > products.length && (
        <LinkArrow to={`?${more.toString()}#products`} className="justify-self-start text-silver">
          See all {total}
        </LinkArrow>
      )}
    </div>
  )
}

/** Short callback form that sends the finder query to the spare parts desk. */
function CallbackForm({ details }) {
  const form = useForm({
    initial: { name: '', phone: '' },
    validate: (v) => ({ name: rules.required(v.name), phone: rules.required(v.phone) || rules.phone(v.phone) }),
    onSubmit: (values, formEl) =>
      api.post('/part-requests', { ...values, ...details, company_website: honeypotValue(formEl) }),
  })

  if (form.status.state === 'success') return <FormStatus status={form.status} />

  return (
    <form onSubmit={form.handleSubmit} noValidate className="relative grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <Honeypot />
      <Field dark label="Your name" required error={form.errors.name}>
        {(a) => <Input dark autoComplete="name" {...a} {...form.bind('name')} />}
      </Field>
      <Field dark label="Phone" required error={form.errors.phone}>
        {(a) => <Input dark type="tel" autoComplete="tel" {...a} {...form.bind('phone')} />}
      </Field>
      <Button type="submit" variant="ghost-light" icon="phone" disabled={form.status.state === 'submitting'}>
        {form.status.state === 'submitting' ? 'Sending…' : 'Call me back'}
      </Button>
      {form.status.state === 'error' && <FormStatus status={form.status} />}
    </form>
  )
}

/**
 * Vehicle / model / category / part-number finder. Lists matching catalogue
 * products and routes the request to the spare parts desk (WhatsApp or callback).
 */
export function PartFinder({ section }) {
  const c = section.content
  const data = section.data || {}
  const titleId = headingId(section)
  const { whatsappUrl } = useSite()
  const [params] = useSearchParams()
  const vehicleTypes = data.vehicle_types || EMPTY
  const categories = data.categories || EMPTY

  const [query, setQuery] = useState({ vehicle_type: '', model: '', category: '', part_number: '' })
  const [submitted, setSubmitted] = useState(null)

  // Pre-fill from links such as /spare-parts?vehicle=lorries#finder
  useEffect(() => {
    const vehicle = params.get('vehicle')
    const category = params.get('category')
    setQuery((current) => ({
      ...current,
      vehicle_type: vehicleTypes.some((v) => v.slug === vehicle) ? vehicle : current.vehicle_type,
      category: categories.some((cat) => cat.slug === category) ? category : current.category,
    }))
  }, [params, vehicleTypes, categories])

  const details = useMemo(() => {
    if (!submitted) return null
    return {
      vehicle_type: vehicleTypes.find((v) => v.slug === submitted.vehicle_type)?.name || '',
      model: submitted.model,
      category: categories.find((cat) => cat.slug === submitted.category)?.name || '',
      part_number: submitted.part_number.trim(),
    }
  }, [submitted, vehicleTypes, categories])

  const summary = details ? [details.vehicle_type, details.model, details.category, details.part_number && `Part no. ${details.part_number}`].filter(Boolean).join(' · ') || 'any part' : ''
  const waHref = details ? whatsappUrl('spare_parts', `Details: ${summary}`) : null
  const set = (name) => (event) => setQuery((q) => ({ ...q, [name]: event.target.value }))

  return (
    <Section id={section.anchor} labelledBy={titleId}>
      <div className="wrap">
        <div className="relative grid overflow-hidden rounded-xs bg-navy-900 text-white lg:grid-cols-[.9fr_1.4fr]">
          <div className="grid-overlay grid content-center gap-5 p-[clamp(2rem,1.5rem+3vw,4rem)] before:opacity-90">
            <SectionLabel tone="light">{c.label}</SectionLabel>
            <h2 id={titleId} className="text-h2">
              <Lines text={c.title} />
            </h2>
            <Lead tone="light">{c.lead}</Lead>
            {!!c.checklist?.length && (
              <ul className="grid gap-3.5 text-silver">
                {c.checklist.map((item) => (
                  <li key={item} className="flex items-start gap-3.5">
                    <Icon name="check" className="mt-1 size-5 text-silver" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid content-center gap-5 border-white/8 bg-white/3 p-[clamp(2rem,1.5rem+3vw,4rem)] max-lg:border-t lg:border-l">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                setSubmitted({ ...query })
              }}
              className="grid gap-5 sm:grid-cols-2"
              aria-describedby="finder-result"
            >
              <Field dark label="Vehicle Type">
                {(a) => (
                  <Select dark {...a} value={query.vehicle_type} onChange={set('vehicle_type')}>
                    <option value="">Any vehicle</option>
                    {vehicleTypes.map((v) => (
                      <option key={v.slug} value={v.slug}>
                        {v.name}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field dark label="Vehicle Model">
                {(a) => (
                  <Select dark {...a} value={query.model} onChange={set('model')}>
                    <option value="">Any model</option>
                    {c.model_groups?.map((group) => (
                      <optgroup key={group.group} label={group.group}>
                        {group.models?.map((model) => (
                          <option key={model}>{model}</option>
                        ))}
                      </optgroup>
                    ))}
                    <option>Other / not sure</option>
                  </Select>
                )}
              </Field>
              <Field dark label="Part Category">
                {(a) => (
                  <Select dark {...a} value={query.category} onChange={set('category')}>
                    <option value="">Any category</option>
                    {categories.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field dark label="Part Number">
                {(a) => <Input dark {...a} autoComplete="off" placeholder="e.g. OEM / part number" value={query.part_number} onChange={set('part_number')} />}
              </Field>
              <Button type="submit" variant="light" icon="search" className="col-span-full">
                Find Part
              </Button>
            </form>

            <div id="finder-result" role="status" aria-live="polite" className="grid gap-5">
              {details && (
                <>
                  {data.has_products && <FinderMatches query={submitted} />}
                  <p className="text-sm text-silver">
                    Send your request to our spare parts desk — <b className="text-white">{summary}</b>
                  </p>
                  {waHref && (
                    <Button to={waHref} variant="whatsapp" icon="none" aria-label="Send request on WhatsApp (opens in a new tab)">
                      Send request on WhatsApp
                    </Button>
                  )}
                  <CallbackForm details={details} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

/** Searchable, filterable product listing (hidden until products exist). */
export function ProductCatalogue({ section }) {
  const c = section.content
  const data = section.data || {}
  const titleId = headingId(section)
  const [params] = useSearchParams()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ search: '', category: '', vehicle_type: '', brand: '' })
  const [page, setPage] = useState(1)
  const featured = Boolean(c.featured_only)

  useEffect(() => {
    setFilters((f) => ({ ...f, category: params.get('category') || f.category, vehicle_type: params.get('vehicle') || f.vehicle_type }))
  }, [params])

  // Debounce typing in the search box
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) => ({ ...f, search }))
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data: result, loading } = useApi(data.total ? '/products' : null, {
    ...filters,
    featured: featured ? 1 : '',
    page,
    per_page: c.limit || 12,
  })

  if (!data.total) return null

  const products = result?.data || []
  const meta = result?.meta
  const setFilter = (name) => (event) => {
    setFilters((f) => ({ ...f, [name]: event.target.value }))
    setPage(1)
  }

  return (
    <Section id={section.anchor} labelledBy={titleId}>
      <div className="wrap">
        <SectionHead label={c.label} labelStyle={c.label_style} title={c.title} titleId={titleId} lead={c.lead} />

        {!featured && data.filters && (
          <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <Field label="Search">
              {(a) => <Input {...a} type="search" placeholder="Part name or number" value={search} onChange={(e) => setSearch(e.target.value)} />}
            </Field>
            {[
              ['category', 'Category', data.filters.categories],
              ['vehicle_type', 'Vehicle', data.filters.vehicle_types],
              ['brand', 'Brand', data.filters.brands],
            ].map(([name, label, options]) => (
              <Field key={name} label={label}>
                {(a) => (
                  <Select {...a} value={filters[name]} onChange={setFilter(name)}>
                    <option value="">All</option>
                    {options?.map((option) => (
                      <option key={option.slug} value={option.slug}>
                        {option.name}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            ))}
          </div>
        )}

        <p className="sr-only" aria-live="polite">
          {meta ? `${meta.total} products found` : ''}
        </p>

        {loading && !products.length ? (
          <p className="py-12 text-center text-grey-600">Loading parts…</p>
        ) : products.length ? (
          <div className={cx('grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', loading && 'opacity-60')}>
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="grid justify-items-center gap-4 border border-dashed border-grey-200 px-6 py-14 text-center">
            <p className="text-grey-600">No parts match these filters. Our team can still help you find the right part.</p>
            <Button to="#finder" variant="ghost" icon="search">
              Ask the parts desk
            </Button>
          </div>
        )}

        {meta && meta.last_page > 1 && (
          <nav aria-label="Product pages" className="mt-12 flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                aria-current={n === meta.current_page ? 'page' : undefined}
                onClick={() => setPage(n)}
                className="grid size-11 place-items-center rounded-full border border-grey-200 text-sm font-bold transition-colors hover:border-navy-900 aria-[current=page]:border-navy-900 aria-[current=page]:bg-navy-900 aria-[current=page]:text-white"
              >
                {n}
              </button>
            ))}
          </nav>
        )}
      </div>
    </Section>
  )
}

/** Featured parts on the home page (hidden when none are featured). */
export function FeaturedProducts({ section }) {
  const c = section.content
  const products = section.data || []
  const titleId = headingId(section)
  if (!products.length) return null

  return (
    <Section id={section.anchor} labelledBy={titleId}>
      <div className="wrap">
        <SectionHead
          label={c.label}
          labelStyle={c.label_style}
          title={c.title}
          titleId={titleId}
          lead={c.lead}
          aside={
            <LinkArrow to="/spare-parts#products" className="reveal justify-self-start lg:justify-self-end">
              View all parts
            </LinkArrow>
          }
        />
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </Section>
  )
}

/** Text tiles for distributed brands (logos only with the owner's permission). */
/**
 * Logos get the same visual area rather than the same height, so a square mark
 * is not dwarfed by a long wordmark (~180×64px area, 48–96px tall).
 */
function logoHeight({ width, height }) {
  if (!width || !height) return 64
  return Math.round(Math.min(96, Math.max(48, Math.sqrt((180 * 64 * height) / width))))
}

export function BrandGrid({ section }) {
  const c = section.content
  const brands = section.data || []
  const titleId = headingId(section)
  if (!brands.length) return null

  return (
    <Section id={section.anchor} theme="off" labelledBy={titleId}>
      <div className="wrap">
        <SectionHead label={c.label} labelStyle={c.label_style} title={c.title} titleId={titleId} lead={c.lead} />
        {/* Wrapping rows rather than a fixed grid, so a short last row stays centred */}
        <ul className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {brands.map((brand, index) => (
            <li
              key={brand.id}
              style={{ '--d': `${(index % 5) * 0.05}s` }}
              className={cx(
                'reveal grid min-h-[160px] basis-[calc(50%-.375rem)] content-center justify-items-center gap-3 border border-grey-200 bg-white px-5 py-8 text-center transition-colors duration-500 hover:border-navy-700 sm:basis-[calc(33.333%-.667rem)]',
                brands.length > 8 ? 'lg:basis-[calc(20%-.8rem)]' : 'lg:basis-[calc(25%-.75rem)]',
              )}
            >
              {brand.logo ? (
                <img
                  src={brand.logo.thumb || brand.logo.url}
                  alt={brand.name}
                  width={brand.logo.width || undefined}
                  height={brand.logo.height || undefined}
                  loading="lazy"
                  style={{ height: logoHeight(brand.logo) }}
                  className="w-auto max-w-full object-contain"
                />
              ) : (
                <b className="text-[clamp(1.4rem,1.1rem+1vw,2rem)] font-extrabold tracking-[-.03em] text-navy-900">{brand.name}</b>
              )}
              {brand.description && <span className="font-mono text-[.7rem] uppercase tracking-[.14em] text-grey-600">{brand.description}</span>}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
