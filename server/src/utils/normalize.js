/**
 * Canonical form for vehicle registration numbers so that "MH 12-AB 1234" and
 * "mh12ab1234" match. Detection ingestion and watchlist matching both rely on this.
 */
export function normalizeVehicleNumber(value) {
  if (typeof value !== 'string') return value;
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}
