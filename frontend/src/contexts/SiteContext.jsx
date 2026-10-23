import { createContext, use, useMemo } from 'react'
import { useApi } from '../hooks/useApi'

const SiteContext = createContext(null)

const DESK_SETTINGS = {
  general: 'general',
  spare_parts: 'spare_parts',
  transport: 'transport',
  hotel: 'hotel',
}

/**
 * Global website data from /api/site: company details, contact numbers,
 * WhatsApp desks, navigation, SEO defaults and social links.
 */
export function SiteProvider({ children }) {
  const { data, error, loading } = useApi('/site')

  const value = useMemo(() => {
    const settings = data?.settings || {}
    const established = Number(settings.company?.established) || 1967

    /**
     * WhatsApp link for a desk. Desks without their own number use the
     * general number; returns null when no number is configured at all.
     */
    const whatsappUrl = (desk = 'general', extraMessage = '') => {
      const wa = settings.whatsapp || {}
      const key = DESK_SETTINGS[desk] || 'general'
      const number = String(wa[`${key}_number`] || wa.general_number || '').replace(/\D/g, '')
      if (!number) return null
      const message = [wa[`${key}_message`] || wa.general_message, extraMessage].filter(Boolean).join(' ')
      return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`
    }

    return {
      loading,
      error,
      settings,
      social: data?.social || [],
      company: settings.company || {},
      contact: settings.contact || {},
      seo: settings.seo || {},
      website: settings.website || {},
      navigation: settings.navigation || {},
      yearsSince: new Date().getFullYear() - established,
      whatsappUrl,
    }
  }, [data, error, loading])

  return <SiteContext value={value}>{children}</SiteContext>
}

export function useSite() {
  const context = use(SiteContext)
  if (!context) throw new Error('useSite must be used inside <SiteProvider>')
  return context
}
