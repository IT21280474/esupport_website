import { useEffect } from 'react'
import { useLocation, useOutletContext } from 'react-router'

/** Tell the public layout which theme / floating WhatsApp desk this page uses. */
export function usePageChrome(chrome) {
  const { setChrome } = useOutletContext() || {}
  const theme = chrome?.theme
  const whatsapp = chrome?.whatsapp

  useEffect(() => {
    setChrome?.({ theme, whatsapp })
    return () => setChrome?.(null)
  }, [setChrome, theme, whatsapp])
}

/**
 * Scroll to the URL's #hash once async page content has rendered
 * (links like /spare-parts?vehicle=lorries#finder).
 */
export function useHashScroll(ready) {
  const { hash, search } = useLocation()

  useEffect(() => {
    if (!ready || !hash) return undefined
    const timer = setTimeout(() => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)))
      target?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
    }, 80)
    return () => clearTimeout(timer)
  }, [ready, hash, search])
}
