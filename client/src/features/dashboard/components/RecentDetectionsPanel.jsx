import { RelativeTime } from '@/components/ui/RelativeTime';
import { formatEnum } from '@/lib/format';
import { formatConfidence } from '../dashboardFormat';
import { useRecentDetections } from '../useDashboardQueries';
import { CameraLink } from './CameraLink';
import { FeedPanel } from './FeedPanel';

function DetectionItem({ detection }) {
  const vehicle = detection.vehicleType && detection.vehicleType !== 'UNKNOWN';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-sm text-slate-100">
          {detection.vehicleNumber ? (
            <span className="font-mono font-semibold">{detection.vehicleNumber}</span>
          ) : (
            formatEnum(detection.eventType)
          )}
          {vehicle && (
            <span className="text-slate-400"> · {formatEnum(detection.vehicleType)}</span>
          )}
        </span>
        <span className="shrink-0 text-xs tabular-nums text-slate-400">
          {formatConfidence(detection.confidence)}
        </span>
      </div>
      <p className="flex flex-wrap gap-x-1 text-xs text-slate-500">
        {detection.vehicleNumber && (
          <>
            <span>{formatEnum(detection.eventType)}</span>
            <span>·</span>
          </>
        )}
        <CameraLink camera={detection.camera} cameraId={detection.cameraId} />
        <span>·</span>
        <RelativeTime value={detection.timestamp} />
      </p>
    </div>
  );
}

export function RecentDetectionsPanel() {
  return (
    <FeedPanel
      title="Recent detections"
      query={useRecentDetections()}
      emptyTitle="No detections yet"
      emptyDescription="Vehicle and plate detections from cameras will appear here."
      renderItem={(detection) => <DetectionItem detection={detection} />}
    />
  );
}
