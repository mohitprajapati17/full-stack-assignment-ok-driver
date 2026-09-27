import { Link } from 'react-router';
import { RelativeTime } from '@/components/ui/RelativeTime';
import { CameraStatusBadge } from '@/features/cameras/components/CameraStatusBadge';
import { formatDateTime } from '@/lib/format';

export function CameraPopupContent({ camera }) {
  return (
    <div className="min-w-56 space-y-3">
      <div className="space-y-1 pr-4">
        <p className="font-semibold text-slate-100">{camera.name}</p>
        <p className="font-mono text-xs text-slate-400">{camera.cameraId}</p>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
        <dt className="text-slate-500">Status</dt>
        <dd>
          <CameraStatusBadge status={camera.status} />
        </dd>
        <dt className="text-slate-500">Zone</dt>
        <dd className="text-slate-200">{camera.zone ?? '—'}</dd>
        <dt className="text-slate-500">Last heartbeat</dt>
        <dd className="text-slate-200">
          <RelativeTime value={camera.lastHeartbeat} fallback="Never received" />
          {camera.lastHeartbeat && (
            <span className="block text-slate-500">{formatDateTime(camera.lastHeartbeat)}</span>
          )}
        </dd>
      </dl>
      <Link
        to={`/cameras/${camera.id}`}
        className="inline-block text-xs font-medium text-sky-400! hover:text-sky-300!"
      >
        View camera details →
      </Link>
    </div>
  );
}
