import { createContext, use, useCallback, useMemo, useState } from 'react'
import Icon from '../../components/common/Icon'
import { cx } from '../../lib/format'

const ToastContext = createContext(null)
let nextId = 1

/** Small stacked notifications (success / error / info), announced to screen readers. */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), [])

  const push = useCallback(
    (type, message) => {
      const id = nextId++
      setToasts((list) => [...list.slice(-3), { id, type, message }])
      setTimeout(() => dismiss(id), type === 'error' ? 7000 : 4000)
    },
    [dismiss],
  )

  const toast = useMemo(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      info: (message) => push('info', message),
    }),
    [push],
  )

  return (
    <ToastContext value={toast}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[200] grid w-[min(380px,calc(100vw-2rem))] gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.type === 'error' ? 'alert' : 'status'}
            className={cx(
              'pointer-events-auto flex animate-fade-in items-start gap-3 rounded-md border-l-3 bg-navy-950 px-4 py-3 text-sm text-white shadow-lift',
              t.type === 'success' && 'border-wa',
              t.type === 'error' && 'border-danger',
              t.type === 'info' && 'border-gold',
            )}
          >
            <Icon name={t.type === 'error' ? 'info' : 'check'} className={cx('mt-0.5 size-4', t.type === 'error' ? 'text-[#ffb4ab]' : 'text-wa')} />
            <p className="flex-1">{t.message}</p>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-silver-dim hover:text-white">
              <Icon name="x" className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  )
}

export function useToast() {
  return use(ToastContext)
}
