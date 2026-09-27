import { cn } from '@/lib/cn';
import { CAMERA_STATUSES, labelFor } from '../cameraConstants';
import { useUpdateCameraStatus } from '../useCameraQueries';

/** Segmented control for admins to override a camera's status manually. */
export function CameraStatusControl({ camera }) {
  const updateStatus = useUpdateCameraStatus(camera.id);

  return (
    <div className="space-y-2">
      <div
        role="radiogroup"
        aria-label="Camera status"
        className="inline-flex rounded-md border border-slate-700 p-0.5"
      >
        {CAMERA_STATUSES.map((status) => {
          const isCurrent = camera.status === status;
          return (
            <button
              key={status}
              type="button"
              role="radio"
              aria-checked={isCurrent}
              disabled={updateStatus.isPending}
              onClick={() => !isCurrent && updateStatus.mutate({ status })}
              className={cn(
                'rounded px-3 py-1 text-xs font-medium transition-colors disabled:cursor-wait',
                isCurrent ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200',
              )}
            >
              {labelFor(status)}
            </button>
          );
        })}
      </div>
      {updateStatus.isError && (
        <p className="text-xs text-red-400" role="alert">
          {updateStatus.error.message}
        </p>
      )}
    </div>
  );
}
