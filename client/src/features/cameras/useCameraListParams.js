import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

export const DEFAULT_LIST_PARAMS = Object.freeze({
  search: '',
  status: '',
  department: '',
  zone: '',
  isActive: 'true',
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
});

const NUMERIC_KEYS = new Set(['page', 'limit']);
const FILTER_KEYS = ['search', 'status', 'department', 'zone', 'isActive'];

/**
 * Keeps a camera list's search, filters, sorting and pagination in the URL so the view
 * survives reloads and can be shared. Changing anything other than `page` resets to page 1.
 * `defaults` must be a stable (module-level) object.
 */
export function useCameraListParams(defaults = DEFAULT_LIST_PARAMS) {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(() => {
    const result = { ...defaults };
    for (const key of Object.keys(defaults)) {
      const raw = searchParams.get(key);
      if (raw === null) continue;
      result[key] = NUMERIC_KEYS.has(key) ? Number(raw) || defaults[key] : raw;
    }
    return result;
  }, [searchParams, defaults]);

  const setParams = useCallback(
    (updates) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const [key, value] of Object.entries(updates)) {
            if (value === '' || value == null || value === defaults[key]) next.delete(key);
            else next.set(key, String(value));
          }
          if (!('page' in updates)) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams, defaults],
  );

  const toggleSort = useCallback(
    (column) => {
      const sameColumn = params.sortBy === column;
      setParams({
        sortBy: column,
        sortOrder: sameColumn && params.sortOrder === 'asc' ? 'desc' : 'asc',
      });
    },
    [params.sortBy, params.sortOrder, setParams],
  );

  const resetFilters = useCallback(() => setSearchParams({}, { replace: true }), [setSearchParams]);

  const hasActiveFilters = FILTER_KEYS.some((key) => params[key] !== defaults[key]);

  return { params, setParams, toggleSort, resetFilters, hasActiveFilters };
}
