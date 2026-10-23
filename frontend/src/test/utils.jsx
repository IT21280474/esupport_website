import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'
import { SiteProvider } from '../contexts/SiteContext'
import { clearApiCache } from '../hooks/useApi'

export const SITE = {
  settings: {
    company: { name: 'Muthumala Group of Companies', short_name: 'MUTHUMALA', established: 1967 },
    contact: { phone_1: '0112384237', phone_2: '0716884650', email: 'gmuthumalamotors@gmail.com', address: 'No 396, George R De Silva Mawatha, Colombo 13, Sri Lanka' },
    whatsapp: {
      general_number: '94716884650',
      general_message: 'Hello Muthumala Group, I would like to make an inquiry.',
      spare_parts_number: null,
      spare_parts_message: 'Hello Muthumala Group, I would like to inquire about spare parts.',
      hotel_number: '94770000000',
      hotel_message: 'Hello Muthumala Group, I would like to inquire about the hotel.',
    },
    seo: {},
    website: {},
    navigation: {},
  },
  social: [],
}

/**
 * Mock fetch: /api/site returns SITE; other URLs resolve via `routes`
 * ({ 'POST /api/contact': response | (body) => response }).
 */
export function mockFetch(routes = {}, site = SITE) {
  clearApiCache()
  document.cookie = 'XSRF-TOKEN=test-token'
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init = {}) => {
    const url = new URL(String(input))
    const method = init.method || 'GET'
    const key = `${method} ${url.pathname}`
    let body = url.pathname === '/api/site' ? site : routes[key]
    let status = 200
    if (typeof body === 'function') body = body(init.body ? JSON.parse(init.body) : undefined)
    if (body?.__status) {
      status = body.__status
      body = body.body
    }
    if (body === undefined && url.pathname !== '/sanctum/csrf-cookie') status = 404
    return new Response(JSON.stringify(body ?? {}), { status, headers: { 'Content-Type': 'application/json' } })
  })
}

export function renderWithSite(ui, { route = '/' } = {}) {
  return render(
    <SiteProvider>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </SiteProvider>,
  )
}
