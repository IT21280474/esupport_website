import { useEffect, useRef } from 'react'
import Icon from './Icon'
import Media from './Media'

const iconButton =
  'grid size-12 place-items-center rounded-full border border-white/30 text-white transition-colors duration-250 hover:bg-white hover:text-navy-900'

/**
 * Accessible image viewer on the native <dialog> element: focus is trapped,
 * Escape closes, arrow keys navigate, clicking the backdrop closes.
 */
export default function Lightbox({ items, index, onIndex, onClose }) {
  const dialog = useRef(null)
  const open = index !== null && index >= 0
  const item = open ? items[index] : null

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal?.()
    if (!open && element.open) element.close()
  }, [open])

  const step = (direction) => onIndex((index + direction + items.length) % items.length)

  return (
    <dialog
      ref={dialog}
      aria-label="Image viewer"
      onClose={onClose}
      onClick={(event) => event.target === dialog.current && onClose()}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') step(-1)
        if (event.key === 'ArrowRight') step(1)
      }}
      className="m-auto max-h-[92vh] w-[min(1100px,94vw)] overflow-visible bg-transparent p-0 text-white backdrop:bg-navy-950/92 backdrop:backdrop-blur-sm"
    >
      {item && (
        <>
          <div key={item.id} className="animate-fade-in">
            <Media
              image={item.image ? { ...item.image, src: item.image.large || item.image.src, srcset: null } : null}
              art={item.art || 'fleet'}
              priority
              className="flex max-h-[78vh] w-full items-center justify-center bg-navy-950"
              imgClassName="h-auto! max-h-[78vh] w-auto! max-w-full object-contain!"
            />
          </div>
          <div className="flex items-center justify-between gap-4 pt-4">
            <small className="font-mono text-[.7rem] uppercase tracking-[.14em] text-silver">
              {[item.title, item.album?.name].filter(Boolean).join(' — ')}
              <span className="sr-only">
                {' '}
                (image {index + 1} of {items.length})
              </span>
            </small>
            <div className="flex gap-2">
              {items.length > 1 && (
                <>
                  <button type="button" aria-label="Previous image" className={iconButton} onClick={() => step(-1)}>
                    <Icon name="left" />
                  </button>
                  <button type="button" aria-label="Next image" className={iconButton} onClick={() => step(1)}>
                    <Icon name="right" />
                  </button>
                </>
              )}
              <button type="button" aria-label="Close viewer" className={iconButton} onClick={onClose}>
                <Icon name="x" />
              </button>
            </div>
          </div>
        </>
      )}
    </dialog>
  )
}
