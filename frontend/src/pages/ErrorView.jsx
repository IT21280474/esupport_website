import { isRouteErrorResponse, useRouteError } from 'react-router'
import Button from '../components/common/Button'
import { useSeo } from '../hooks/useSeo'

const COPY = {
  403: { title: 'Access denied.', text: 'You do not have permission to view this page.' },
  404: { title: 'Page not found.', text: 'The page you are looking for has moved or no longer exists.' },
  419: { title: 'Session expired.', text: 'Your session timed out for security. Please refresh the page and try again.' },
  500: { title: 'Something went wrong.', text: 'We could not load this page. Please try again in a moment.' },
  0: { title: 'You appear to be offline.', text: 'Please check your internet connection and try again.' },
}

/** Full-height branded error screen used for 403 / 404 / 419 / 500 and network errors. */
export default function ErrorView({ status = 500, title, message }) {
  const copy = COPY[status] || COPY[500]
  useSeo({ title: copy.title.replace('.', ''), noindex: true })

  return (
    <section className="relative isolate grid min-h-svh items-center overflow-hidden bg-navy-950 pb-16 pt-[calc(var(--header-h)+4rem)] text-white before:absolute before:inset-0 before:-z-1 before:bg-grid before:content-['']">
      <div className="wrap grid gap-6">
        <span className="font-mono text-label uppercase tracking-[.3em] text-gold-soft">{status > 0 ? `Error ${status}` : 'Connection'}</span>
        <h1 className="max-w-[14ch] text-display tracking-[-.045em]">{title || copy.title}</h1>
        <p className="max-w-[34rem] text-lead text-silver">{message || copy.text}</p>
        <div className="flex flex-wrap gap-3">
          {status === 419 || status === 0 || status >= 500 ? (
            <Button variant="light" icon="none" onClick={() => window.location.reload()}>
              Try again
            </Button>
          ) : (
            <Button to="/" variant="light">
              Back to home
            </Button>
          )}
          <Button to="/contact" variant="ghost-light" icon="none">
            Contact us
          </Button>
        </div>
      </div>
    </section>
  )
}

export function NotFound() {
  return <ErrorView status={404} />
}

/** Router-level error boundary. */
export function RouteError() {
  const error = useRouteError()
  const status = isRouteErrorResponse(error) ? error.status : 500
  if (import.meta.env.DEV) console.error(error)
  return <ErrorView status={status} />
}

/** Placeholder while a page loads: navy hero-height block, no layout jump. */
export function PageLoading() {
  return (
    <div className="grid min-h-[70vh] place-items-center bg-navy-950" role="status" aria-live="polite">
      <span className="flex items-center gap-3 font-mono text-label uppercase tracking-[.2em] text-silver-dim">
        <span className="size-5 animate-spin rounded-full border-2 border-silver-dim/40 border-t-silver" />
        Loading
      </span>
    </div>
  )
}
