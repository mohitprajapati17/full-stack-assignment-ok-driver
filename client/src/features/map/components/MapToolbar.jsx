import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { SelectField } from '@/components/ui/SelectField';
import { CAMERA_STATUSES, toOptions } from '@/features/cameras/cameraConstants';

/** `onChange` receives partial filter updates. Change `resetKey` to clear the search box. */
export function MapToolbar({
  filters,
  resetKey,
  onChange,
  onReset,
  onFitBounds,
  canFitBounds,
  visibleCount,
  totalCount,
}) {
  const hasFilters = Boolean(filters.search || filters.status);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-60 flex-1 space-y-1.5">
        <label htmlFor="map-camera-search" className="block text-sm font-medium text-slate-300">
          Search cameras
        </label>
        <SearchInput
          key={resetKey}
          id="map-camera-search"
          placeholder="Name, camera ID, zone or department"
          defaultValue={filters.search}
          delay={200}
          onSearch={(search) => onChange({ search })}
        />
      </div>
      <SelectField
        label="Status"
        className="w-40"
        placeholder="All statuses"
        options={toOptions(CAMERA_STATUSES)}
        value={filters.status}
        onChange={(event) => onChange({ status: event.target.value })}
      />
      <Button variant="secondary" onClick={onFitBounds} disabled={!canFitBounds}>
        Fit to cameras
      </Button>
      {hasFilters && (
        <Button variant="ghost" onClick={onReset}>
          Clear filters
        </Button>
      )}
      {totalCount !== undefined && (
        <p className="ml-auto self-center text-sm text-slate-400" aria-live="polite">
          Showing <span className="text-slate-200">{visibleCount}</span> of{' '}
          <span className="text-slate-200">{totalCount}</span> cameras
        </p>
      )}
    </div>
  );
}
