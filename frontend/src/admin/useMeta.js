import { useApi } from '../hooks/useApi'

/** Option lists (statuses, types, icons) from the backend enums — /api/admin/meta. */
export function useMeta() {
  return useApi('/admin/meta').data
}
