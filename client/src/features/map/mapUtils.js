import { FIT_OPTIONS } from './mapConfig';

/** `[latitude, longitude]` for anything with those two properties. */
export const toLatLng = ({ latitude, longitude }) => [latitude, longitude];

/** Zooms the map to show every position; a single position is centred at `maxZoom`. */
export function fitMapToPositions(map, positions, options = FIT_OPTIONS) {
  if (!map || positions.length === 0) return;
  if (positions.length === 1) {
    map.setView(positions[0], options.maxZoom);
  } else {
    map.fitBounds(positions, options);
  }
}

export function filterCameras(cameras, { search, status }) {
  const term = search.trim().toLowerCase();
  return cameras.filter(
    (camera) =>
      (!status || camera.status === status) &&
      (!term ||
        [camera.name, camera.cameraId, camera.zone, camera.department].some((value) =>
          value?.toLowerCase().includes(term),
        )),
  );
}
