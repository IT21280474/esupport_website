import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SITE, mockFetch, renderWithSite } from '../../test/utils'
import { CmsButton } from './Button'

describe('CmsButton', () => {
  it('links WhatsApp buttons to the desk number with its message', async () => {
    mockFetch()
    renderWithSite(<CmsButton button={{ label: 'WhatsApp Hotel', whatsapp: 'hotel' }} />)
    const link = await screen.findByRole('link', { name: /whatsapp hotel/i })
    expect(link.getAttribute('href')).toBe(`https://wa.me/94770000000?text=${encodeURIComponent(SITE.settings.whatsapp.hotel_message)}`)
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('falls back to the general number when a desk has none', async () => {
    mockFetch()
    renderWithSite(<CmsButton button={{ label: 'Chat about Spare Parts', whatsapp: 'spare_parts' }} />)
    const link = await screen.findByRole('link', { name: /chat about spare parts/i })
    expect(link.getAttribute('href')).toContain('https://wa.me/94716884650')
    expect(decodeURIComponent(link.getAttribute('href'))).toContain('inquire about spare parts')
  })

  it('hides WhatsApp buttons when no number is configured', async () => {
    const site = structuredClone(SITE)
    site.settings.whatsapp.general_number = null
    mockFetch({}, site)
    renderWithSite(
      <>
        <CmsButton button={{ label: 'WhatsApp Us', whatsapp: 'spare_parts' }} />
        <CmsButton button={{ label: 'Contact Us', url: '/contact' }} />
      </>,
    )
    expect(await screen.findByRole('link', { name: /contact us/i })).toHaveAttribute('href', '/contact')
    expect(screen.queryByRole('link', { name: /whatsapp us/i })).not.toBeInTheDocument()
  })
})
