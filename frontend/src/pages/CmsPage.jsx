import { useApi } from '../hooks/useApi'
import { useHashScroll, usePageChrome } from '../hooks/usePageChrome'
import { useSeo } from '../hooks/useSeo'
import { SectionRenderer } from '../sections'
import ErrorView, { PageLoading } from './ErrorView'

/**
 * Any CMS-managed page (Home, About, Spare Parts…): loads the page with all
 * its enabled sections from /api/pages/{slug} and renders them in order.
 */
export default function CmsPage({ slug }) {
  const { data: page, error } = useApi(`/pages/${slug}`)

  usePageChrome(page ? { theme: page.theme, whatsapp: page.floating_whatsapp } : null)
  useSeo({
    title: page?.seo?.title || (slug === 'home' ? undefined : page?.title),
    rawTitle: Boolean(page?.seo?.title),
    description: page?.seo?.description,
    image: page?.seo?.image,
  })
  useHashScroll(Boolean(page))

  if (!page && error) return <ErrorView status={error.status === 404 ? 404 : error.status || 500} />
  if (!page) return <PageLoading />

  return <SectionRenderer sections={page.sections} page={page} />
}
