/**
 * A sighting of a vehicle at a camera. Shaped like a detection event so plate-recognition
 * detections, fetched or received in realtime, can be passed straight in.
 *
 * @typedef {object} MovementEvent
 * @property {string} id
 * @property {string} cameraId   Registry camera ID, e.g. "CAM-GATE-01"
 * @property {string | Date} timestamp
 * @property {string} [vehicleNumber]
 * @property {number} [confidence]
 */

/**
 * A point on the route: one camera, covering one or more consecutive sightings there.
 *
 * @typedef {object} MovementStop
 * @property {string} key
 * @property {number} sequence   1-based position along the route
 * @property {object} camera     Camera location record (see `useCameraLocations`)
 * @property {[number, number]} position
 * @property {MovementEvent[]} events
 * @property {Date} firstSeen
 * @property {Date} lastSeen
 */

/**
 * Orders sightings by time and resolves them to camera positions. Consecutive sightings at
 * the same camera collapse into one stop, so A → A → B → C becomes A → B → C.
 * Events for cameras that aren't in `cameras` are returned in `unresolved`.
 *
 * @param {MovementEvent[]} events
 * @param {object[]} cameras
 * @returns {{ stops: MovementStop[], unresolved: MovementEvent[] }}
 */
export function buildMovementPath(events, cameras) {
  const camerasById = new Map(cameras.map((camera) => [camera.cameraId, camera]));
  const sorted = [...events].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const stops = [];
  const unresolved = [];
  for (const event of sorted) {
    const camera = camerasById.get(event.cameraId);
    if (!camera) {
      unresolved.push(event);
      continue;
    }

    const seenAt = new Date(event.timestamp);
    const previous = stops.at(-1);
    if (previous?.camera.cameraId === camera.cameraId) {
      previous.events.push(event);
      previous.lastSeen = seenAt;
      continue;
    }

    stops.push({
      key: event.id,
      sequence: stops.length + 1,
      camera,
      position: [camera.latitude, camera.longitude],
      events: [event],
      firstSeen: seenAt,
      lastSeen: seenAt,
    });
  }

  return { stops, unresolved };
}
