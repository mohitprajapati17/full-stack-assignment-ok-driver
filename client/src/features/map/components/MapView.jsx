import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import { cn } from '@/lib/cn';
import { DEFAULT_VIEW, TILE_LAYER } from '../mapConfig';

/**
 * Base map shared by every map in the app: tiles, default view and styling only.
 * Pass `ref` to get the Leaflet map instance (e.g. for fitting bounds).
 */
export function MapView({
  ref,
  center = DEFAULT_VIEW.center,
  zoom = DEFAULT_VIEW.zoom,
  className,
  children,
}) {
  return (
    <MapContainer
      ref={ref}
      center={center}
      zoom={zoom}
      worldCopyJump
      className={cn('okd-map h-full w-full bg-slate-900', className)}
    >
      <TileLayer
        url={TILE_LAYER.url}
        attribution={TILE_LAYER.attribution}
        className={TILE_LAYER.className}
      />
      {children}
    </MapContainer>
  );
}
