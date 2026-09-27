import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/StatusMessage';

/**
 * Card that renders a list query with loading, error and empty states. If a background
 * refresh fails, the last loaded items stay visible with a warning.
 */
export function FeedPanel({ title, query, emptyTitle, emptyDescription, count, renderItem }) {
  const { data, error, isPending, refetch } = query;
  const retry = (
    <Button variant="secondary" size="sm" onClick={() => refetch()}>
      Retry
    </Button>
  );

  let content;
  if (isPending) {
    content = <LoadingState label={`Loading ${title.toLowerCase()}…`} />;
  } else if (error && !data) {
    content = (
      <ErrorState title={`Could not load ${title.toLowerCase()}`} error={error} action={retry} />
    );
  } else if (data.length === 0) {
    content = <EmptyState title={emptyTitle} description={emptyDescription} className="py-8" />;
  } else {
    content = (
      <>
        {error && (
          <div
            className="mb-3 flex items-center justify-between gap-3 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-200"
            role="alert"
          >
            Refresh failed, showing last known data.
            {retry}
          </div>
        )}
        <ul className="-my-2 max-h-96 divide-y divide-slate-800 overflow-y-auto">
          {data.map((item) => (
            <li key={item.id} className="py-2.5">
              {renderItem(item)}
            </li>
          ))}
        </ul>
      </>
    );
  }

  const badgeCount = count ?? data?.length;
  return (
    <Card title={title} actions={badgeCount > 0 && <Badge>{badgeCount}</Badge>}>
      {content}
    </Card>
  );
}
