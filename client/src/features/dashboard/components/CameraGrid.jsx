import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/StatusMessage';
import { CameraFilters } from '@/features/cameras/components/CameraFilters';
import { useCameraList } from '@/features/cameras/useCameraQueries';
import { cn } from '@/lib/cn';
import { POLL_INTERVALS } from '../useDashboardQueries';
import { CameraTile } from './CameraTile';

/** Filter state is owned by the page so the KPI cards can drive the status filter too. */
export function CameraGrid({ params, setParams, resetFilters, hasActiveFilters }) {
  const { data, error, isPending, isFetching, refetch } = useCameraList(params, {
    refetchInterval: POLL_INTERVALS.cameras,
  });

  let content;
  if (isPending) {
    content = <LoadingState label="Loading cameras…" />;
  } else if (error && !data) {
    content = (
      <ErrorState
        title="Could not load cameras"
        error={error}
        action={
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        }
      />
    );
  } else if (data.items.length === 0) {
    content = hasActiveFilters ? (
      <EmptyState
        title="No cameras match your filters"
        action={
          <Button variant="secondary" onClick={resetFilters}>
            Clear filters
          </Button>
        }
      />
    ) : (
      <EmptyState
        title="No active cameras"
        description="Cameras registered in the camera registry will appear here."
        action={
          <Button variant="secondary" to="/cameras">
            Open camera registry
          </Button>
        }
      />
    );
  } else {
    content = (
      <div className="space-y-4">
        <ul
          className={cn('grid gap-4 sm:grid-cols-2 2xl:grid-cols-3', isFetching && 'opacity-80')}
          aria-busy={isFetching}
        >
          {data.items.map((camera) => (
            <li key={camera.id}>
              <CameraTile camera={camera} />
            </li>
          ))}
        </ul>
        <Pagination
          {...data.pagination}
          isFetching={isFetching}
          onPageChange={(page) => setParams({ page })}
        />
      </div>
    );
  }

  return (
    <Card title="Cameras">
      <div className="space-y-4">
        <CameraFilters
          params={params}
          onChange={setParams}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
          showVisibilityFilter={false}
        />
        {content}
      </div>
    </Card>
  );
}
