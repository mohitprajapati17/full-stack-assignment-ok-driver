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

/**
 * Keeps the camera list's search, filters, sorting and pagination in the URL so the view
 * survives reloads and can be shared. Changing anything other than `page` resets to page 1.
 */
export function useCameraListParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(() => {
    const result = { ...DEFAULT_LIST_PARAMS };
    for (const key of Object.keys(DEFAULT_LIST_PARAMS)) {
      const raw = searchParams.get(key);
      if (raw === null) continue;
      result[key] = NUMERIC_KEYS.has(key) ? Number(raw) || DEFAULT_LIST_PARAMS[key] : raw;
    }
    return result;
  }, [searchParams]);

  const setParams = useCallback(
    (updates) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const [key, value] of Object.entries(updates)) {
            if (value === '' || value == null || value === DEFAULT_LIST_PARAMS[key])
              next.delete(key);
            else next.set(key, String(value));
          }
          if (!('page' in updates)) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
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

  const hasActiveFilters = ['search', 'status', 'department', 'zone', 'isActive'].some(
    (key) => params[key] !== DEFAULT_LIST_PARAMS[key],
  );

  return { params, setParams, toggleSort, resetFilters, hasActiveFilters };
}
