/** Join class names, skipping falsy values. */
export function cx(...classes) {
  return classes.flat().filter(Boolean).join(' ')
}

/** Sri Lankan number for display: 0112384237 → 011 238 4237 */
export function formatPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (digits.length === 10 && digits.startsWith('0')) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  }
  if (digits.length === 11 && digits.startsWith('94')) {
    return `+94 ${digits.slice(2, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
  }
  return phone || ''
}

/** tel: link in international format: 0112384237 → tel:+94112384237 */
export function telHref(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (!digits) return null
  if (digits.length === 10 && digits.startsWith('0')) return `tel:+94${digits.slice(1)}`
  return `tel:+${digits}`
}

export function formatDate(value, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-GB', options)
}

export function formatDateTime(value) {
  return formatDate(value, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** "01", "02"… */
export function pad(index) {
  return String(index + 1).padStart(2, '0')
}

/** Split CMS text into paragraphs on blank lines. */
export function paragraphs(text) {
  return String(text || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

/** True for in-app paths (or same-page query links) that React Router should handle. */
export function isInternalPath(url) {
  if (typeof url !== 'string') return false
  if (url.startsWith('?')) return true
  return url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/storage/') && !url.startsWith('/api/')
}
