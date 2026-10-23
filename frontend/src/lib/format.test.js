import { describe, expect, it } from 'vitest'
import { formatPhone, isInternalPath, paragraphs, telHref } from './format'

describe('phone helpers', () => {
  it('formats Sri Lankan numbers for display', () => {
    expect(formatPhone('0112384237')).toBe('011 238 4237')
    expect(formatPhone('0716884650')).toBe('071 688 4650')
    expect(formatPhone('94716884650')).toBe('+94 71 688 4650')
  })

  it('builds international tel: links', () => {
    expect(telHref('0112384237')).toBe('tel:+94112384237')
    expect(telHref('94716884650')).toBe('tel:+94716884650')
    expect(telHref('')).toBeNull()
  })
})

describe('isInternalPath', () => {
  it('routes in-app paths and same-page query links through the router', () => {
    expect(isInternalPath('/contact')).toBe(true)
    expect(isInternalPath('?room=Deluxe#reserve')).toBe(true)
  })

  it('leaves external, protocol-relative, file and hash links to the browser', () => {
    expect(isInternalPath('https://wa.me/94716884650')).toBe(false)
    expect(isInternalPath('//evil.example')).toBe(false)
    expect(isInternalPath('/storage/media/x.webp')).toBe(false)
    expect(isInternalPath('#finder')).toBe(false)
    expect(isInternalPath('tel:+94112384237')).toBe(false)
  })
})

it('splits CMS text into paragraphs on blank lines', () => {
  expect(paragraphs('One.\n\nTwo.\n  \nThree.')).toEqual(['One.', 'Two.', 'Three.'])
})
