import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/StatusMessage';
import { cn } from '@/lib/cn';
import { filterCameras, fitMapToPositions, toLatLng } from '../mapUtils';
import { useCameraLocations } from '../useCameraLocations';
import { CameraMarker } from './CameraMarker';
import { MapLegend } from './MapLegend';
import { MapOverlay } from './MapOverlay';
import { MapToolbar } from './MapToolbar';
import { MapView } from './MapView';

const INITIAL_FILTERS = { search: '', status: '' };

const countByStatus = (cameras) =>
  cameras.reduce((counts, { status }) => ({ ...counts, [status]: (counts[status] ?? 0) + 1 }), {});

/** All active cameras on a map with search, status filter and fit-to-bounds. */
export function CameraMap({ className }) {
  const { data: cameras, error, isPending, refetch } = useCameraLocations();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [map, setMap] = useState(null);
  const hasFittedInitially = useRef(false);

  const visibleCameras = useMemo(() => filterCameras(cameras ?? [], filters), [cameras, filters]);
  const statusCounts = useMemo(() => countByStatus(visibleCameras), [visibleCameras]);

  const fitToVisible = useCallback(
    () => fitMapToPositions(map, visibleCameras.map(toLatLng)),
    [map, visibleCameras],
  );

  useEffect(() => {
    if (!map || !cameras?.length || hasFittedInitially.current) return;
    hasFittedInitially.current = true;
    fitMapToPositions(map, cameras.map(toLatLng));
  }, [map, cameras]);

  const updateFilters = useCallback(
    (updates) => setFilters((prev) => ({ ...prev, ...updates })),
    [],
  );

  // Bumped on reset so the uncontrolled search box remounts empty.
  const [resetKey, setResetKey] = useState(0);
  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setResetKey((key) => key + 1);
  }, []);

  const retry = (
    <Button variant="secondary" size="sm" onClick={() => refetch()}>
      Retry
    </Button>
  );

  let overlay = null;
  if (isPending) {
    overlay = (
      <MapOverlay dim>
        <LoadingState label="Loading cameras…" />
      </MapOverlay>
    );
  } else if (error && !cameras) {
    overlay = (
      <MapOverlay dim>
        <div className="py-4">
          <ErrorState title="Could not load camera locations" error={error} action={retry} />
        </div>
      </MapOverlay>
    );
  } else if (cameras.length === 0) {
    overlay = (
      <MapOverlay>
        <EmptyState
          title="No active cameras"
          description="Cameras registered in the camera registry will appear on the map."
          className="py-6"
        />
      </MapOverlay>
    );
  } else if (visibleCameras.length === 0) {
    overlay = (
      <MapOverlay>
        <EmptyState
          title="No cameras match your filters"
          className="py-6"
          action={
            <Button variant="secondary" size="sm" onClick={resetFilters}>
              Show all cameras
            </Button>
          }
        />
      </MapOverlay>
    );
  }

  return (
    <div className="space-y-4">
      <MapToolbar
        filters={filters}
        resetKey={resetKey}
        onChange={updateFilters}
        onReset={resetFilters}
        onFitBounds={fitToVisible}
        canFitBounds={Boolean(map) && visibleCameras.length > 0}
        visibleCount={visibleCameras.length}
        totalCount={cameras?.length}
      />
      {error && cameras && (
        <div
          className="flex items-center justify-between gap-3 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-200"
          role="alert"
        >
          Refresh failed, showing last known camera locations.
          {retry}
        </div>
      )}
      <div
        className={cn(
          'relative h-[70vh] min-h-96 overflow-hidden rounded-lg border border-slate-800',
          className,
        )}
      >
        <MapView ref={setMap}>
          {visibleCameras.map((camera) => (
            <CameraMarker key={camera.id} camera={camera} />
          ))}
        </MapView>
        {!isPending && cameras?.length > 0 && (
          <div className="absolute bottom-6 left-3 z-[1000]">
            <MapLegend counts={statusCounts} />
          </div>
        )}
        {overlay}
      </div>
    </div>
  );
}
