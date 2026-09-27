const customTileUrl = import.meta.env.VITE_MAP_TILE_URL;

// OpenStreetMap's standard tiles are light, so they are colour-inverted to fit the dark UI.
// A custom provider (e.g. a dark basemap with an API key) is used as-is.
export const TILE_LAYER = Object.freeze({
  url: customTileUrl ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution:
    import.meta.env.VITE_MAP_TILE_ATTRIBUTION ??
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  className: customTileUrl ? undefined : 'okd-tiles-dark',
});

// Used until there are cameras to fit the view to.
export const DEFAULT_VIEW = Object.freeze({ center: [20.5937, 78.9629], zoom: 5 });

export const FIT_OPTIONS = Object.freeze({ padding: [48, 48], maxZoom: 16 });

/**
 * Status is shown by shape as well as colour so it stays readable for colour-blind users.
 * Shared by the map markers and the legend.
 */
export const STATUS_MARKER_CLASSES = Object.freeze({
  ONLINE: 'h-3.5 w-3.5 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30',
  DEGRADED: 'h-3 w-3 rotate-45 bg-amber-400 ring-2 ring-amber-400/30',
  OFFLINE: 'h-3.5 w-3.5 rounded-full border-[3px] border-red-500 bg-slate-950',
});
