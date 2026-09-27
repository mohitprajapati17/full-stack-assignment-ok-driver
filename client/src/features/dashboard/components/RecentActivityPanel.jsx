import { RelativeTime } from '@/components/ui/RelativeTime';
import { cn } from '@/lib/cn';
import { formatEnum } from '@/lib/format';
import { activityTone, describeActivity } from '../dashboardFormat';
import { useRecentActivity } from '../useDashboardQueries';
import { FeedPanel } from './FeedPanel';

const DOT_TONES = {
  red: 'bg-red-400',
  amber: 'bg-amber-400',
  green: 'bg-emerald-400',
  slate: 'bg-slate-500',
};

function ActivityItem({ entry }) {
  return (
    <div className="flex gap-3">
      <span
        className={cn(
          'mt-1.5 h-2 w-2 shrink-0 rounded-full',
          DOT_TONES[activityTone(entry.action)],
        )}
        aria-hidden="true"
      />
      <div className="min-w-0 space-y-0.5">
        <p className="break-words text-sm text-slate-200">{describeActivity(entry)}</p>
        <p className="text-xs text-slate-500">
          {entry.actor ? `${entry.actor.name} (${formatEnum(entry.actor.role)})` : 'Unknown user'}
          {' · '}
          <RelativeTime value={entry.timestamp} />
        </p>
      </div>
    </div>
  );
}

export function RecentActivityPanel() {
  return (
    <FeedPanel
      title="Recent activity"
      query={useRecentActivity()}
      emptyTitle="No recent activity"
      emptyDescription="Camera changes and other operator actions will appear here."
      renderItem={(entry) => <ActivityItem entry={entry} />}
    />
  );
}
