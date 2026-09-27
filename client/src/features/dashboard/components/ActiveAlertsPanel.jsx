import { Badge } from '@/components/ui/Badge';
import { RelativeTime } from '@/components/ui/RelativeTime';
import { formatEnum } from '@/lib/format';
import { ALERT_STATUS_TONES, SEVERITY_TONES, formatConfidence } from '../dashboardFormat';
import { useActiveAlerts, useDashboardSummary } from '../useDashboardQueries';
import { CameraLink } from './CameraLink';
import { FeedPanel } from './FeedPanel';

function AlertItem({ alert }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Badge tone={SEVERITY_TONES[alert.severity]}>{formatEnum(alert.severity)}</Badge>
          <span className="truncate font-mono text-sm font-semibold text-slate-100">
            {alert.identifier}
          </span>
        </div>
        <Badge tone={ALERT_STATUS_TONES[alert.status]} dot>
          {formatEnum(alert.status)}
        </Badge>
      </div>
      <p className="text-xs text-slate-400">
        {alert.matchedEntity
          ? `Watchlist: ${formatEnum(alert.matchedEntity.reason)}`
          : 'Watchlist match'}
        {' · '}
        {formatConfidence(alert.confidence)} confidence
      </p>
      <p className="flex flex-wrap gap-x-1 text-xs text-slate-500">
        <CameraLink camera={alert.camera} cameraId={alert.cameraId} />
        <span>·</span>
        <RelativeTime value={alert.timestamp} />
      </p>
    </div>
  );
}

export function ActiveAlertsPanel() {
  const query = useActiveAlerts();
  const { data: summary } = useDashboardSummary();

  return (
    <FeedPanel
      title="Active alerts"
      query={query}
      count={summary?.alerts.active}
      emptyTitle="No active alerts"
      emptyDescription="Watchlist matches that need attention will appear here."
      renderItem={(alert) => <AlertItem alert={alert} />}
    />
  );
}
