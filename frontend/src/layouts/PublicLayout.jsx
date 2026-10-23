import { useCallback, useState } from 'react'
import { Outlet, ScrollRestoration } from 'react-router'
import RevealObserver from '../components/common/RevealObserver'
import Footer from '../components/layout/Footer'
import Header from '../components/layout/Header'
import OrganizationSchema from '../components/layout/OrganizationSchema'
import WhatsAppFloat from '../components/layout/WhatsAppFloat'
import { useSite } from '../contexts/SiteContext'
import Maintenance from '../pages/Maintenance'

const DEFAULT_CHROME = { theme: 'default', whatsapp: null }

/**
 * Public website shell. Pages report their theme (hotel) and floating
 * WhatsApp desk through the outlet context.
 */
export default function PublicLayout() {
  const { website } = useSite()
  const [chrome, setChromeState] = useState(DEFAULT_CHROME)
  const setChrome = useCallback((next) => setChromeState(next ? { ...DEFAULT_CHROME, ...next } : DEFAULT_CHROME), [])

  if (website.maintenance_mode) return <Maintenance />

  const hotel = chrome.theme === 'hotel'

  return (
    <>
      <a
        href="#main"
        className="absolute -top-24 left-4 z-999 bg-white px-5 py-3 font-bold text-navy-900 transition-[top] focus:top-4"
      >
        Skip to content
      </a>
      <Header theme={chrome.theme} />
      <main id="main" tabIndex={-1} data-theme={hotel ? 'hotel' : undefined} className="outline-none">
        <Outlet context={{ setChrome }} />
      </main>
      <Footer />
      <WhatsAppFloat desk={chrome.whatsapp} />
      <RevealObserver />
      <OrganizationSchema />
      <ScrollRestoration getKey={(location) => location.pathname} />
    </>
  )
}
