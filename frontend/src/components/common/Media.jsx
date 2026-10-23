import { useState } from 'react'
import { cx } from '../../lib/format'

/**
 * Responsive CMS image inside a <figure> that shows the prototype's
 * art-directed placeholder (navy grid + line drawing) until the photo
 * loads — or permanently when no photo has been uploaded yet.
 *
 * @param {object} image   media payload from the API ({ src, srcset, alt, width, height })
 * @param {string} art     placeholder art: lorry | bus | tipper | parts | fleet | hotel | community
 * @param {boolean} reveal clip-reveal animation on scroll
 * @param {boolean} priority  above-the-fold image: eager + high fetch priority
 */
export default function Media({
  image,
  art = 'lorry',
  alt,
  className,
  imgClassName,
  sizes = '100vw',
  reveal = false,
  priority = false,
  style,
  children,
  as: Tag = 'figure',
  ...rest
}) {
  const [failed, setFailed] = useState(false)
  const showImage = image?.src && !failed

  return (
    <Tag className={cx('media', reveal && 'reveal-img', className)} data-art={art} style={style} {...rest}>
      {showImage && (
        <img
          src={image.src}
          srcSet={image.srcset || undefined}
          sizes={image.srcset ? sizes : undefined}
          alt={alt ?? image.alt ?? ''}
          width={image.width || undefined}
          height={image.height || undefined}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
          onError={() => setFailed(true)}
          className={imgClassName}
        />
      )}
      {children}
    </Tag>
  )
}
