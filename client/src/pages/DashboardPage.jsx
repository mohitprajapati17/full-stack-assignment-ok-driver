import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PageHeader, PageTitle } from '@/components/ui/PageHeader';
import { RelativeTime } from '@/components/ui/RelativeTime';
import { DEFAULT_LIST_PARAMS, useCameraListParams } from '@/features/cameras/useCameraListParams';
import { ActiveAlertsPanel } from '@/features/dashboard/components/ActiveAlertsPanel';
import { CameraGrid } from '@/features/dashboard/components/CameraGrid';
import { KpiGrid } from '@/features/dashboard/components/KpiGrid';
import { RecentActivityPanel } from '@/features/dashboard/components/RecentActivityPanel';
import { RecentDetectionsPanel } from '@/features/dashboard/components/RecentDetectionsPanel';
import { useDashboardSummary, useRefreshDashboard } from '@/features/dashboard/useDashboardQueries';
import { SystemStatus } from '@/features/health/SystemStatus';

// Problem cameras first: status sorts as DEGRADED, OFFLINE, ONLINE.
const DASHBOARD_CAMERA_PARAMS = Object.freeze({
  ...DEFAULT_LIST_PARAMS,
  isActive: 'true',
  limit: 9,
  sortBy: 'status',
  sortOrder: 'asc',
});

export function DashboardPage() {
  const cameraParams = useCameraListParams(DASHBOARD_CAMERA_PARAMS);
  const { dataUpdatedAt } = useDashboardSummary();
  const refresh = useRefreshDashboard();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <>
      <PageHeader
        title={
          <>
            <PageTitle>Operations dashboard</PageTitle>
            <SystemStatus />
          </>
        }
        description={
          dataUpdatedAt ? (
            <>
              Updated <RelativeTime value={dataUpdatedAt} refreshMs={10_000} />. Refreshes
              automatically.
            </>
          ) : (
            'Camera health, alerts and detections across the network.'
          )
        }
        actions={
          <Button variant="secondary" onClick={handleRefresh} isLoading={isRefreshing}>
            Refresh
          </Button>
        }
      />
      <div className="space-y-6">
        <KpiGrid
          selectedStatus={cameraParams.params.status}
          onSelectStatus={(status) => cameraParams.setParams({ status })}
        />
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <CameraGrid {...cameraParams} />
          </div>
          <div className="grid content-start gap-6 md:grid-cols-2 xl:grid-cols-1">
            <ActiveAlertsPanel />
            <RecentDetectionsPanel />
            <div className="md:col-span-2 xl:col-span-1">
              <RecentActivityPanel />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
