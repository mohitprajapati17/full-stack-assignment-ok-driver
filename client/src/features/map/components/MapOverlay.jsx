import { cn } from '@/lib/cn';

/** Centred message over a map (loading, error, empty). Sits above Leaflet's panes. */
export function MapOverlay({ children, dim = false }) {
  return (
    <div
      className={cn(
        'absolute inset-0 z-[1000] flex items-center justify-center p-6',
        dim ? 'bg-slate-950/70' : 'pointer-events-none',
      )}
    >
      <div className="pointer-events-auto max-w-sm rounded-lg bg-slate-900/95 px-4 shadow-xl ring-1 ring-slate-700">
        {children}
      </div>
    </div>
  );
}
