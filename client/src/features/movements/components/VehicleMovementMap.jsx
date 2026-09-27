import L from 'leaflet';
import { useEffect, useMemo, useState } from 'react';
import { Marker, Polyline, Popup } from 'react-leaflet';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/StatusMessage';
import { MapOverlay } from '@/features/map/components/MapOverlay';
import { MapView } from '@/features/map/components/MapView';
import { fitMapToPositions } from '@/features/map/mapUtils';
import { useCameraLocations } from '@/features/map/useCameraLocations';
import { cn } from '@/lib/cn';
import { formatDateTime } from '@/lib/format';
import { buildMovementPath } from '../movementPath';

const ROUTE_STYLE = { color: '#38bdf8', weight: 3, opacity: 0.85, dashArray: '8 6' };
const NO_EVENTS = [];

function stopIcon(sequence, isEndpoint) {
  return L.divIcon({
    className: 'flex items-center justify-center',
    html: `<span class="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold shadow-md shadow-black/60 ring-2 ring-slate-950 ${
      isEndpoint ? 'bg-sky-400 text-slate-950' : 'bg-slate-200 text-slate-900'
    }">${sequence}</span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

function StopPopupContent({ stop }) {
  const sightings = stop.events.length;
  return (
    <div className="min-w-48 space-y-1 text-xs">
      <p className="text-sm font-semibold text-slate-100">
        {stop.sequence}. {stop.camera.name}
      </p>
      <p className="font-mono text-slate-400">{stop.camera.cameraId}</p>
      <p className="text-slate-300">
        {sightings > 1
          ? `${formatDateTime(stop.firstSeen)} – ${formatDateTime(stop.lastSeen)}`
          : formatDateTime(stop.firstSeen)}
      </p>
      {sightings > 1 && <p className="text-slate-500">{sightings} sightings</p>}
    </div>
  );
}

/**
 * Draws a vehicle's route between cameras (A → B → C) from movement events.
 *
 * The parent owns where events come from (a REST query today, a realtime stream later) and
 * passes them in; this component resolves cameras, orders the route and renders it.
 *
 * @param {object} props
 * @param {import('../movementPath').MovementEvent[]} props.events
 * @param {string} [props.vehicleNumber]  Shown in the empty state
 * @param {boolean} [props.isLoading]     Whether `events` are still loading
 * @param {Error} [props.error]           Error loading `events`
 * @param {() => void} [props.onRetry]
 * @param {string} [props.className]
 */
export function VehicleMovementMap({
  events = NO_EVENTS,
  vehicleNumber,
  isLoading = false,
  error,
  onRetry,
  className,
}) {
  const cameraQuery = useCameraLocations();
  const [map, setMap] = useState(null);

  const { stops, unresolved } = useMemo(
    () => buildMovementPath(events, cameraQuery.data ?? []),
    [events, cameraQuery.data],
  );
  const positions = useMemo(() => stops.map((stop) => stop.position), [stops]);
  const routeKey = stops.map((stop) => stop.key).join('|');

  // Re-fit only when the route itself changes, not on every camera refresh.
  useEffect(() => {
    fitMapToPositions(map, positions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, routeKey]);

  const loadError = error ?? (cameraQuery.data ? null : cameraQuery.error);
  const retry = error ? onRetry : () => cameraQuery.refetch();

  let overlay = null;
  if (isLoading || cameraQuery.isPending) {
    overlay = (
      <MapOverlay dim>
        <LoadingState label="Loading movements…" />
      </MapOverlay>
    );
  } else if (loadError) {
    overlay = (
      <MapOverlay dim>
        <div className="py-4">
          <ErrorState
            title="Could not load vehicle movements"
            error={loadError}
            action={
              retry && (
                <Button variant="secondary" size="sm" onClick={retry}>
                  Retry
                </Button>
              )
            }
          />
        </div>
      </MapOverlay>
    );
  } else if (stops.length === 0) {
    overlay = (
      <MapOverlay>
        <EmptyState
          title="No movements to display"
          description={
            vehicleNumber
              ? `No camera sightings recorded for ${vehicleNumber}.`
              : 'Camera sightings for the selected vehicle will be drawn here.'
          }
          className="py-6"
        />
      </MapOverlay>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'relative h-96 overflow-hidden rounded-lg border border-slate-800',
          className,
        )}
      >
        <MapView ref={setMap}>
          {positions.length > 1 && <Polyline positions={positions} pathOptions={ROUTE_STYLE} />}
          {stops.map((stop, index) => (
            <Marker
              key={stop.key}
              position={stop.position}
              icon={stopIcon(stop.sequence, index === 0 || index === stops.length - 1)}
              title={`${stop.sequence}. ${stop.camera.name}`}
            >
              <Popup>
                <StopPopupContent stop={stop} />
              </Popup>
            </Marker>
          ))}
        </MapView>
        {overlay}
      </div>
      {stops.length > 0 && (
        <p className="text-sm text-slate-400">
          Route:{' '}
          <span className="text-slate-200">
            {stops.map((stop) => stop.camera.cameraId).join(' → ')}
          </span>
        </p>
      )}
      {unresolved.length > 0 && (
        <p className="text-xs text-amber-300" role="status">
          {unresolved.length} sighting{unresolved.length === 1 ? '' : 's'} from cameras that are no
          longer on the map {unresolved.length === 1 ? 'is' : 'are'} not shown.
        </p>
      )}
    </div>
  );
}
