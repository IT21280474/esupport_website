import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useSite } from '../contexts/SiteContext'

const SITE_URL = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '')

function upsertMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`)
  if (!content) {
    element?.remove()
    return
  }
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`)
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }
  element.setAttribute('href', href)
}

/**
 * Per-page title, description, canonical, Open Graph and Twitter tags.
 * Falls back to the defaults in Admin → Settings → SEO.
 *
 * @param {{ title?: string, description?: string, image?: object|string, noindex?: boolean, rawTitle?: boolean }} meta
 */
export function useSeo({ title, description, image, noindex = false, rawTitle = false } = {}) {
  const { seo, company } = useSite()
  const { pathname } = useLocation()

  useEffect(() => {
    const siteName = company.name || 'Muthumala Group of Companies'
    const suffix = (seo.title_suffix || '').trim()
    const fullTitle = title ? (rawTitle || !suffix ? title : `${title} ${suffix}`) : seo.default_title || siteName
    const desc = description || seo.default_description || ''
    const imageUrl = (typeof image === 'string' ? image : image?.large || image?.url) || seo.og_image?.large || seo.og_image?.url
    const canonical = `${SITE_URL}${pathname === '/' ? '/' : pathname.replace(/\/$/, '')}`

    document.title = fullTitle
    upsertMeta('name', 'description', desc)
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    upsertLink('canonical', canonical)

    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:site_name', siteName)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', desc)
    upsertMeta('property', 'og:url', canonical)
    upsertMeta('property', 'og:image', imageUrl)

    upsertMeta('name', 'twitter:card', imageUrl ? 'summary_large_image' : 'summary')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', desc)
    upsertMeta('name', 'twitter:image', imageUrl)
  }, [title, description, image, noindex, rawTitle, pathname, seo, company.name])
}
