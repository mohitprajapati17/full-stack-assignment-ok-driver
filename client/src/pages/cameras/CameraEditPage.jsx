import { useNavigate, useParams } from 'react-router';
import { PageHeader, PageTitle } from '@/components/ui/PageHeader';
import { ErrorState, LoadingState } from '@/components/ui/StatusMessage';
import { cameraToFormValues } from '@/features/cameras/cameraForm';
import { CameraForm } from '@/features/cameras/components/CameraForm';
import { useCamera, useUpdateCamera } from '@/features/cameras/useCameraQueries';

export function CameraEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: camera, error, isPending } = useCamera(id);
  const updateCamera = useUpdateCamera(id);
  const detailsPath = `/cameras/${id}`;

  if (isPending) return <LoadingState label="Loading camera…" />;
  if (error) return <ErrorState title="Could not load camera" error={error} />;

  const handleSubmit = async (payload) => {
    await updateCamera.mutateAsync(payload);
    navigate(detailsPath, { replace: true });
  };

  return (
    <>
      <PageHeader
        backTo={detailsPath}
        backLabel={camera.name}
        title={<PageTitle>Edit camera</PageTitle>}
        description={camera.cameraId}
      />
      <CameraForm
        key={camera.id}
        mode="edit"
        initialValues={cameraToFormValues(camera)}
        onSubmit={handleSubmit}
        isSubmitting={updateCamera.isPending}
        onCancel={() => navigate(detailsPath)}
      />
    </>
  );
}
