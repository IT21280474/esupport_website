import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import Lightbox from '../components/common/Lightbox'
import LinkArrow from '../components/common/LinkArrow'
import Media from '../components/common/Media'
import { Section, SectionHead, headingId } from '../components/common/Section'
import { cx } from '../lib/format'

const ALBUM_ART = { 'spare-parts': 'parts', transportation: 'fleet', hotel: 'hotel', csr: 'community' }

function GalleryTile({ item, onOpen, className }) {
  const ratio = item.image?.width && item.image?.height ? `${item.image.width} / ${item.image.height}` : '4 / 3'
  const label = [item.title, item.album?.name].filter(Boolean).join(' — ')

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open image: ${label || 'gallery photo'}`}
      className={cx('group relative mb-4 block w-full cursor-zoom-in break-inside-avoid overflow-hidden rounded-xs text-left max-sm:mb-2.5', className)}
    >
      <Media
        image={item.image}
        art={ALBUM_ART[item.album?.slug] || 'fleet'}
        style={{ aspectRatio: ratio }}
        className="w-full"
        imgClassName="group-hover:scale-105"
        sizes="(max-width: 480px) 50vw, (max-width: 1024px) 50vw, 33vw"
      />
      <span className="absolute inset-0 z-2 flex flex-col justify-end gap-1 bg-[linear-gradient(0deg,rgba(5,11,26,.85),transparent_60%)] p-5 text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 max-sm:p-3 max-sm:text-[.85rem] max-sm:opacity-100">
        {item.album && <small className="font-mono text-[.66rem] uppercase tracking-[.16em] text-silver">{item.album.name}</small>}
        {item.title && <b>{item.title}</b>}
      </span>
    </button>
  )
}

/** Masonry gallery with album filters and a lightbox. */
export function Gallery({ section }) {
  const c = section.content
  const { albums = [], images = [] } = section.data || {}
  const titleId = headingId(section)
  const [params, setParams] = useSearchParams()
  const [open, setOpen] = useState(null)
  const filter = albums.some((a) => a.slug === params.get('album')) ? params.get('album') : 'all'

  const visible = useMemo(() => (filter === 'all' ? images : images.filter((item) => item.album?.slug === filter)), [filter, images])

  const choose = (slug) => {
    const next = new URLSearchParams(params)
    if (slug === 'all') next.delete('album')
    else next.set('album', slug)
    setParams(next, { replace: true, preventScrollReset: true })
  }

  const filterButton =
    'min-h-11 cursor-pointer rounded-full border border-grey-200 bg-white px-4.5 py-2.5 text-[.74rem] font-bold uppercase tracking-[.12em] transition-all duration-250 hover:border-navy-900 aria-pressed:border-navy-900 aria-pressed:bg-navy-900 aria-pressed:text-white'

  return (
    <Section id={section.anchor} labelledBy={titleId}>
      <div className="wrap">
        <h2 id={titleId} className="sr-only">
          {c.title || 'Image gallery'}
        </h2>

        {albums.length > 1 && (
          <div role="group" aria-label="Filter gallery by category" className="mb-10 flex flex-wrap gap-2">
            <button type="button" aria-pressed={filter === 'all'} className={filterButton} onClick={() => choose('all')}>
              All
            </button>
            {albums.map((album) => (
              <button key={album.slug} type="button" aria-pressed={filter === album.slug} className={filterButton} onClick={() => choose(album.slug)}>
                {album.name}
              </button>
            ))}
          </div>
        )}

        <p className="sr-only" aria-live="polite">
          {visible.length} images shown
        </p>

        {visible.length ? (
          <div className="columns-[3_320px] gap-4 max-sm:columns-[2_140px] max-sm:gap-2.5">
            {visible.map((item, index) => (
              <GalleryTile key={item.id} item={item} onOpen={() => setOpen(index)} />
            ))}
          </div>
        ) : (
          <p className="border border-dashed border-grey-200 px-6 py-12 text-center text-grey-600">Photos for this category are coming soon.</p>
        )}
      </div>

      <Lightbox items={visible} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </Section>
  )
}

/** Featured photos with a link to the full gallery. */
export function GalleryPreview({ section }) {
  const c = section.content
  const items = section.data || []
  const titleId = headingId(section)
  const [open, setOpen] = useState(null)
  if (!items.length) return null

  return (
    <Section id={section.anchor} theme="off" labelledBy={titleId}>
      <div className="wrap">
        <SectionHead
          label={c.label}
          labelStyle={c.label_style}
          title={c.title}
          titleId={titleId}
          lead={c.lead}
          aside={
            <LinkArrow to="/gallery" className="reveal justify-self-start lg:justify-self-end">
              {c.link_label || 'View full gallery'}
            </LinkArrow>
          }
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {items.map((item, index) => (
            <button key={item.id} type="button" onClick={() => setOpen(index)} aria-label={`Open image: ${item.title || 'gallery photo'}`} className="reveal group cursor-zoom-in overflow-hidden rounded-xs">
              <Media image={item.image} art={ALBUM_ART[item.album?.slug] || 'fleet'} className="aspect-square" imgClassName="group-hover:scale-105" sizes="(max-width: 768px) 50vw, 33vw" />
            </button>
          ))}
        </div>
      </div>
      <Lightbox items={items} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </Section>
  )
}
