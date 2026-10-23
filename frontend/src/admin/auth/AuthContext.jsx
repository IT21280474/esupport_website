import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError, api } from '../../lib/api'

const AuthContext = createContext(null)

/**
 * Admin session (Laravel Sanctum cookie). The server is the source of truth
 * for permissions; the UI only uses them to hide what a user cannot access.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading') // loading | authenticated | guest
  const [notice, setNotice] = useState('')

  const refresh = useCallback(async () => {
    try {
      setUser(await api.get('/admin/me'))
      setStatus('authenticated')
    } catch (error) {
      if (!(error instanceof ApiError) || ![401, 403, 419].includes(error.status)) throw error
      setUser(null)
      setStatus('guest')
    }
  }, [])

  useEffect(() => {
    refresh().catch(() => setStatus('guest'))

    const onUnauthorized = () => {
      setUser(null)
      setStatus('guest')
      setNotice('Your session has ended. Please sign in again.')
    }
    window.addEventListener('admin:unauthorized', onUnauthorized)
    return () => window.removeEventListener('admin:unauthorized', onUnauthorized)
  }, [refresh])

  const value = useMemo(
    () => ({
      user,
      status,
      notice,
      setNotice,
      setUser,
      can: (permission) => Boolean(user?.permissions?.includes(permission)),
      login: async (credentials) => {
        const signedIn = await api.post('/admin/login', credentials)
        setUser(signedIn)
        setStatus('authenticated')
        setNotice('')
        return signedIn
      },
      logout: async () => {
        try {
          await api.post('/admin/logout')
        } finally {
          setUser(null)
          setStatus('guest')
        }
      },
    }),
    [user, status, notice],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth() {
  const context = use(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
