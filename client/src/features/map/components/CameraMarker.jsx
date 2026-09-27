import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import { STATUS_MARKER_CLASSES } from '../mapConfig';
import { toLatLng } from '../mapUtils';
import { CameraPopupContent } from './CameraPopupContent';

const iconCache = new Map();

function statusIcon(status) {
  if (!iconCache.has(status)) {
    const shape = STATUS_MARKER_CLASSES[status] ?? STATUS_MARKER_CLASSES.OFFLINE;
    iconCache.set(
      status,
      L.divIcon({
        className: 'flex items-center justify-center',
        html: `<span class="block ${shape} shadow-md shadow-black/60"></span>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10],
      }),
    );
  }
  return iconCache.get(status);
}

export function CameraMarker({ camera }) {
  return (
    <Marker
      position={toLatLng(camera)}
      icon={statusIcon(camera.status)}
      title={`${camera.name} (${camera.status.toLowerCase()})`}
      alt={camera.name}
    >
      <Popup>
        <CameraPopupContent camera={camera} />
      </Popup>
    </Marker>
  );
}
