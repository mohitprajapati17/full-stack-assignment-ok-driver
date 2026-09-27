import { useNavigate } from 'react-router';
import { PageHeader, PageTitle } from '@/components/ui/PageHeader';
import { emptyCameraFormValues } from '@/features/cameras/cameraForm';
import { CameraForm } from '@/features/cameras/components/CameraForm';
import { useCreateCamera } from '@/features/cameras/useCameraQueries';

export function CameraCreatePage() {
  const navigate = useNavigate();
  const createCamera = useCreateCamera();

  const handleSubmit = async (payload) => {
    const camera = await createCamera.mutateAsync(payload);
    navigate(`/cameras/${camera.id}`, { replace: true });
  };

  return (
    <>
      <PageHeader
        backTo="/cameras"
        backLabel="Cameras"
        title={<PageTitle>Add camera</PageTitle>}
        description="Register a new camera in the monitoring platform."
      />
      <CameraForm
        mode="create"
        initialValues={emptyCameraFormValues}
        onSubmit={handleSubmit}
        isSubmitting={createCamera.isPending}
        onCancel={() => navigate('/cameras')}
      />
    </>
  );
}
