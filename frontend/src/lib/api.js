/**
 * Thin fetch wrapper for the Laravel API.
 * - Sends cookies (Sanctum SPA session) and the XSRF token on writes.
 * - Normalises failures into ApiError with `status`, `message` and field `errors`.
 */
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(status, data) {
    super(data?.message || defaultMessage(status))
    this.name = 'ApiError'
    this.status = status
    this.errors = data?.errors || {}
  }
}

function defaultMessage(status) {
  if (status === 0) return 'Network error — please check your connection and try again.'
  if (status === 401) return 'Please sign in to continue.'
  if (status === 403) return 'You do not have permission to do that.'
  if (status === 404) return 'Not found.'
  if (status === 419) return 'Your session has expired. Please refresh the page.'
  if (status === 422) return 'Please check the highlighted fields.'
  if (status === 429) return 'Too many attempts. Please wait a minute and try again.'
  return 'Something went wrong. Please try again.'
}

function readCookie(name) {
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null
}

let csrfPromise = null
function ensureCsrfCookie(force = false) {
  if (force || !readCookie('XSRF-TOKEN')) {
    csrfPromise = fetch(`${BASE}/sanctum/csrf-cookie`, { credentials: 'include' })
  }
  return csrfPromise
}

export function apiUrl(path, params) {
  const url = new URL(`${BASE}/api${path}`, window.location.origin)
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value)) value.forEach((v) => url.searchParams.append(`${key}[]`, v))
    else url.searchParams.set(key, value)
  })
  return url.toString()
}

export async function request(path, { method = 'GET', body, params, signal } = {}, retried = false) {
  const headers = { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
  const options = { method, credentials: 'include', signal, headers }

  if (body instanceof FormData) {
    options.body = body
  } else if (body !== undefined) {
    options.body = JSON.stringify(body)
    headers['Content-Type'] = 'application/json'
  }

  if (method !== 'GET') {
    await ensureCsrfCookie()
    const token = readCookie('XSRF-TOKEN')
    if (token) headers['X-XSRF-TOKEN'] = token
  }

  let response
  try {
    response = await fetch(apiUrl(path, params), options)
  } catch (error) {
    if (error.name === 'AbortError') throw error
    if (method === 'GET' && !retried) return retryGet(path, params, signal, 1)
    throw new ApiError(0)
  }

  // CSRF token rotated or expired: fetch a fresh one and retry once
  if (response.status === 419 && !retried && method !== 'GET') {
    await ensureCsrfCookie(true)
    return request(path, { method, body, params, signal }, true)
  }

  // Reads are safe to repeat: ride out a brief rate limit or gateway hiccup
  if (method === 'GET' && !retried && [429, 502, 503, 504].includes(response.status)) {
    const after = Number(response.headers.get('Retry-After'))
    return retryGet(path, params, signal, after > 0 && after <= 5 ? after : 1)
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null)

  // Admin session ended (expired, revoked or signed out elsewhere): let the admin app react
  if ((response.status === 401 || response.status === 419) && path.startsWith('/admin') && path !== '/admin/me') {
    window.dispatchEvent(new CustomEvent('admin:unauthorized', { detail: response.status }))
  }

  if (!response.ok) throw new ApiError(response.status, data)
  return data
}

async function retryGet(path, params, signal, seconds) {
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000))
  return request(path, { params, signal }, true)
}

export const api = {
  get: (path, params, options) => request(path, { ...options, params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
}

/** Download a protected file (e.g. a CV) using the admin session. */
export async function downloadFile(path, params) {
  const response = await fetch(apiUrl(path, params), { credentials: 'include', headers: { Accept: '*/*' } })
  if (!response.ok) throw new ApiError(response.status, await response.json().catch(() => null))

  const disposition = response.headers.get('Content-Disposition') || ''
  const filename = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition)?.[1] || 'download'
  const url = URL.createObjectURL(await response.blob())
  const link = Object.assign(document.createElement('a'), { href: url, download: decodeURIComponent(filename) })
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
