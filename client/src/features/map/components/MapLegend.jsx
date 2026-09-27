import { CAMERA_STATUSES, labelFor } from '@/features/cameras/cameraConstants';
import { cn } from '@/lib/cn';
import { STATUS_MARKER_CLASSES } from '../mapConfig';

export function MapLegend({ counts }) {
  return (
    <ul
      className="flex flex-col gap-1.5 rounded-md bg-slate-950/85 px-3 py-2 text-xs text-slate-300 ring-1 ring-slate-700"
      aria-label="Map legend"
    >
      {CAMERA_STATUSES.map((status) => (
        <li key={status} className="flex items-center gap-2">
          <span className="flex h-4 w-4 items-center justify-center" aria-hidden="true">
            <span className={cn('block', STATUS_MARKER_CLASSES[status])} />
          </span>
          {labelFor(status)}
          {counts && (
            <span className="ml-auto pl-3 tabular-nums text-slate-500">{counts[status] ?? 0}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
