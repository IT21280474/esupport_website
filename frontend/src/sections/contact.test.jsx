import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { mockFetch, renderWithSite } from '../test/utils'
import { ContactForm } from './contact'

const section = { id: 1, type: 'contact_form', anchor: 'message', content: { label: 'Corporate Office', title: 'Send us a message.' } }

async function fillValidForm(user) {
  await user.type(screen.getByLabelText(/full name/i), 'Nimal Perera')
  await user.type(screen.getByLabelText(/^email/i), 'nimal@example.com')
  await user.type(screen.getByLabelText(/subject/i), 'Brake liners')
  await user.selectOptions(screen.getByLabelText(/business area/i), 'spare_parts')
  await user.type(screen.getByLabelText(/^message/i), 'Do you stock brake liners for the LPT 1613?')
}

describe('Contact form', () => {
  it('validates required fields before sending anything', async () => {
    const fetch = mockFetch()
    const user = userEvent.setup()
    renderWithSite(<ContactForm section={section} />)

    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(screen.getAllByText('This field is required.').length).toBeGreaterThanOrEqual(3)
    expect(screen.getByText('Please choose a business area.')).toBeInTheDocument()
    expect(fetch.mock.calls.some(([url]) => String(url).includes('/api/contact'))).toBe(false)
  })

  it('pre-selects the business area from ?area=', async () => {
    mockFetch()
    renderWithSite(<ContactForm section={section} />, { route: '/contact?area=transport' })
    await waitFor(() => expect(screen.getByLabelText(/business area/i)).toHaveValue('transportation'))
  })

  it('submits to the API (with the honeypot field) and shows the success message', async () => {
    let sent
    mockFetch({
      'POST /api/contact': (body) => {
        sent = body
        return { __status: 201, body: { message: 'Thank you — your message has been sent.' } }
      },
    })
    const user = userEvent.setup()
    renderWithSite(<ContactForm section={section} />)

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(await screen.findByText(/your message has been sent/i)).toBeInTheDocument()
    expect(sent).toMatchObject({ name: 'Nimal Perera', business_area: 'spare_parts', company_website: '' })
    expect(screen.getByLabelText(/full name/i)).toHaveValue('')
  })

  it('shows server validation errors next to the fields', async () => {
    mockFetch({
      'POST /api/contact': { __status: 422, body: { message: 'Invalid', errors: { email: ['The email field must be a valid email address.'] } } },
    })
    const user = userEvent.setup()
    renderWithSite(<ContactForm section={section} />)

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(await screen.findByText('The email field must be a valid email address.')).toBeInTheDocument()
    expect(screen.getByLabelText(/^email/i)).toHaveAttribute('aria-invalid', 'true')
  })
})
