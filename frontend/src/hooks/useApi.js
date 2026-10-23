import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'

// Session cache so returning to a page renders instantly, then revalidates.
const cache = new Map()

/**
 * GET an API path. Returns { data, error, loading, reload }.
 * Pass `null` as the path to skip fetching.
 */
export function useApi(path, params, { cache: useCache = true } = {}) {
  const key = path ? `${path}?${new URLSearchParams(params || {}).toString()}` : null
  const [state, setState] = useState(() => ({
    data: key && useCache ? cache.get(key) : undefined,
    error: null,
    loading: Boolean(key) && !(useCache && cache.has(key)),
  }))
  const [version, setVersion] = useState(0)
  // Serialised so callers can pass a fresh object literal each render
  const paramsJson = JSON.stringify(params || {})

  useEffect(() => {
    if (!key) return undefined
    const controller = new AbortController()
    const cached = useCache ? cache.get(key) : undefined

    setState({ data: cached, error: null, loading: cached === undefined })

    api
      .get(path, JSON.parse(paramsJson), { signal: controller.signal })
      .then((data) => {
        if (useCache) cache.set(key, data)
        setState({ data, error: null, loading: false })
      })
      .catch((error) => {
        if (error.name === 'AbortError') return
        setState((previous) => ({ data: previous.data, error, loading: false }))
      })

    return () => controller.abort()
  }, [key, path, paramsJson, useCache, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])

  return { ...state, reload }
}

export function clearApiCache() {
  cache.clear()
}
