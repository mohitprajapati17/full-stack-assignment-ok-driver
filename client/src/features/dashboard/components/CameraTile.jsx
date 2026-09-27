import { Link } from 'react-router';
import { RelativeTime } from '@/components/ui/RelativeTime';
import { CameraStatusBadge } from '@/features/cameras/components/CameraStatusBadge';
import { VideoPlaceholder } from '@/features/cameras/components/VideoPlaceholder';

export function CameraTile({ camera }) {
  return (
    <Link
      to={`/cameras/${camera.id}`}
      className="group block overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60 transition-colors hover:border-slate-600 focus-visible:outline-2 focus-visible:outline-sky-500"
    >
      <div className="relative">
        <VideoPlaceholder status={camera.status} />
        <div className="absolute left-2 top-2">
          <CameraStatusBadge status={camera.status} />
        </div>
      </div>
      <div className="space-y-1 p-3">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-medium text-slate-100 group-hover:text-white">
            {camera.name}
          </p>
          <span className="shrink-0 font-mono text-xs text-slate-400">{camera.cameraId}</span>
        </div>
        <p className="truncate text-xs text-slate-500">
          {[camera.zone, camera.department].filter(Boolean).join(' · ') || 'No zone assigned'}
        </p>
        <p className="text-xs text-slate-400">
          Heartbeat <RelativeTime value={camera.lastHeartbeat} fallback="never received" />
        </p>
      </div>
    </Link>
  );
}
