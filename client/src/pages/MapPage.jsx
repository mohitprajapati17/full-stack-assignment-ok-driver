import { PageHeader, PageTitle } from '@/components/ui/PageHeader';
import { CameraMap } from '@/features/map/components/CameraMap';

export function MapPage() {
  return (
    <>
      <PageHeader
        title={<PageTitle>Camera map</PageTitle>}
        description="Location and live status of every active camera. Select a marker for details."
      />
      <CameraMap />
    </>
  );
}
