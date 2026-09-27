import { Button } from '@/components/ui/Button';
import { PageHeader, PageTitle } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SelectField } from '@/components/ui/SelectField';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/StatusMessage';
import { ROLES } from '@/features/auth/authContext';
import { RoleGate } from '@/features/auth/RouteGuards';
import { PAGE_SIZE_OPTIONS } from '@/features/cameras/cameraConstants';
import { CameraFilters } from '@/features/cameras/components/CameraFilters';
import { CameraTable } from '@/features/cameras/components/CameraTable';
import { useCameraListParams } from '@/features/cameras/useCameraListParams';
import { useCameraList } from '@/features/cameras/useCameraQueries';

const pageSizeOptions = PAGE_SIZE_OPTIONS.map((size) => ({ value: size, label: `${size} / page` }));

export function CameraListPage() {
  const { params, setParams, toggleSort, resetFilters, hasActiveFilters } = useCameraListParams();
  const { data, error, isPending, isFetching, refetch } = useCameraList(params);

  const addCameraButton = (
    <RoleGate roles={[ROLES.ADMIN]}>
      <Button to="/cameras/new">Add camera</Button>
    </RoleGate>
  );

  let content;
  if (isPending) {
    content = <LoadingState label="Loading cameras…" />;
  } else if (error) {
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
        title="No cameras registered yet"
        description="Registered cameras will appear here."
        action={addCameraButton}
      />
    );
  } else {
    content = (
      <div className="space-y-4">
        <CameraTable
          cameras={data.items}
          sortBy={params.sortBy}
          sortOrder={params.sortOrder}
          onSort={toggleSort}
          isFetching={isFetching}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Pagination
            {...data.pagination}
            isFetching={isFetching}
            onPageChange={(page) => setParams({ page })}
          />
          <SelectField
            aria-label="Rows per page"
            className="w-32"
            options={pageSizeOptions}
            value={params.limit}
            onChange={(event) => setParams({ limit: Number(event.target.value) })}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={<PageTitle>Cameras</PageTitle>}
        description="Registry of all CCTV cameras connected to the platform."
        actions={addCameraButton}
      />
      <div className="space-y-6">
        <CameraFilters
          params={params}
          onChange={setParams}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />
        {content}
      </div>
    </>
  );
}
