import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/StatusMessage';
import { useDashboardSummary } from '../useDashboardQueries';
import { KpiCard } from './KpiCard';

/** Warning tones only apply when there is something to warn about. */
const toneIf = (value, tone) => (value > 0 ? tone : 'slate');

const percentOf = (part, total) =>
  total > 0 ? `${Math.round((part / total) * 100)}% of fleet` : '';

/**
 * Camera KPIs double as a status filter for the camera grid: `selectedStatus` is the
 * grid's current status filter and `onSelectStatus('')` clears it.
 */
export function KpiGrid({ selectedStatus, onSelectStatus }) {
  const { data, error, isPending, refetch } = useDashboardSummary();
  const cameras = data?.cameras;
  const alerts = data?.alerts;

  const statusCard = (status) => ({
    isSelected: selectedStatus === status,
    onClick: () => onSelectStatus(selectedStatus === status ? '' : status),
  });

  return (
    <div className="space-y-3">
      {error && (
        <ErrorState
          title="Could not load dashboard metrics"
          error={error}
          action={
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Total cameras"
          value={cameras?.total}
          hint="Active in registry"
          isLoading={isPending}
          {...statusCard('')}
        />
        <KpiCard
          label="Online"
          value={cameras?.online}
          hint={cameras && percentOf(cameras.online, cameras.total)}
          tone={toneIf(cameras?.online, 'green')}
          isLoading={isPending}
          {...statusCard('ONLINE')}
        />
        <KpiCard
          label="Offline"
          value={cameras?.offline}
          hint={cameras && percentOf(cameras.offline, cameras.total)}
          tone={toneIf(cameras?.offline, 'red')}
          isLoading={isPending}
          {...statusCard('OFFLINE')}
        />
        <KpiCard
          label="Degraded"
          value={cameras?.degraded}
          hint={cameras && percentOf(cameras.degraded, cameras.total)}
          tone={toneIf(cameras?.degraded, 'amber')}
          isLoading={isPending}
          {...statusCard('DEGRADED')}
        />
        <KpiCard
          label="Active alerts"
          value={alerts?.active}
          hint={alerts && `${alerts.unacknowledged} new · ${alerts.critical} critical`}
          tone={toneIf(alerts?.active, 'red')}
          isLoading={isPending}
        />
        <KpiCard
          label="Detections today"
          value={data?.detections.today}
          hint="Since local midnight"
          tone="sky"
          isLoading={isPending}
        />
      </div>
    </div>
  );
}
