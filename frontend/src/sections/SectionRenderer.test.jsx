import { screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { mockFetch, renderWithSite } from '../test/utils'
import { SectionRenderer } from '.'

it('renders CMS sections in order and skips unknown types', async () => {
  mockFetch()
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  const sections = [
    { id: 1, type: 'cta_band', content: { label: 'Get in touch', title: 'Let’s move', title_muted: 'forward together.', buttons: [{ label: 'Contact Us', url: '/contact', variant: 'light' }] } },
    { id: 2, type: 'not_a_real_section', content: {} },
    { id: 3, type: 'values', content: { label: '06 — OUR VALUES', title: 'What we stand for.', items: [{ title: 'Integrity', text: 'Doing business honestly.' }] } },
  ]

  renderWithSite(<SectionRenderer sections={sections} page={{ title: 'Test' }} />)

  const headings = await screen.findAllByRole('heading', { level: 2 })
  expect(headings.map((h) => h.textContent)).toEqual(['Let’s move forward together.', 'What we stand for.'])
  expect(screen.getByRole('link', { name: /contact us/i })).toHaveAttribute('href', '/contact')
  expect(screen.getByText('Integrity')).toBeInTheDocument()
})

it('renders journey chapters and titled timeline milestones', async () => {
  mockFetch()
  const sections = [
    {
      id: 1,
      type: 'journey',
      content: {
        label: '02 — OUR JOURNEY',
        title: 'Our journey since 1967.',
        items: [
          { year: '1967', title: 'The Beginning of a Legacy', body: '<p>Beginning in Tangalle.</p>', highlight: 'From humble beginnings.' },
          { year: 'Today', title: 'A Legacy That Continues', body: '<ul><li>Goods Transportation</li></ul>' },
        ],
      },
    },
    { id: 2, type: 'timeline', content: { title: 'Milestones', items: [{ year: '1980s', title: 'The Expansion', text: 'Motor spare parts.' }] } },
  ]

  renderWithSite(<SectionRenderer sections={sections} page={{ title: 'Test' }} />)

  const chapters = await screen.findAllByRole('heading', { level: 3 })
  expect(chapters.map((h) => h.textContent)).toEqual(['The Beginning of a Legacy', 'A Legacy That Continues'])
  expect(screen.getByText('1967')).toBeInTheDocument()
  expect(screen.getByText('From humble beginnings.')).toBeInTheDocument()
  expect(screen.getByText('Goods Transportation').tagName).toBe('LI')
  expect(screen.getByText('The Expansion')).toBeInTheDocument()
})
