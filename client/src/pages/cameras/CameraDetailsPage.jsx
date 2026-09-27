import { useParams } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Card, DescriptionList } from '@/components/ui/Card';
import { PageHeader, PageTitle } from '@/components/ui/PageHeader';
import { ErrorState, LoadingState } from '@/components/ui/StatusMessage';
import { ROLES, useAuth } from '@/features/auth/authContext';
import { labelFor } from '@/features/cameras/cameraConstants';
import { cameraToUpdatePayload } from '@/features/cameras/cameraForm';
import {
  CameraActiveBadge,
  CameraStatusBadge,
} from '@/features/cameras/components/CameraStatusBadge';
import { CameraStatusControl } from '@/features/cameras/components/CameraStatusControl';
import { useCamera, useDisableCamera, useUpdateCamera } from '@/features/cameras/useCameraQueries';
import { formatCoordinates, formatDateTime, formatRelativeTime } from '@/lib/format';

function CameraAdminActions({ camera }) {
  const disableCamera = useDisableCamera();
  const enableCamera = useUpdateCamera(camera.id);
  const mutationError = disableCamera.error ?? enableCamera.error;

  const handleDisable = () => {
    if (window.confirm(`Disable ${camera.name}? It will be hidden from the active camera list.`)) {
      disableCamera.mutate(camera.id);
    }
  };

  return (
    <>
      {mutationError && (
        <span className="text-sm text-red-400" role="alert">
          {mutationError.message}
        </span>
      )}
      {camera.isActive ? (
        <>
          <Button variant="secondary" to={`/cameras/${camera.id}/edit`}>
            Edit
          </Button>
          <Button variant="danger" onClick={handleDisable} isLoading={disableCamera.isPending}>
            Disable
          </Button>
        </>
      ) : (
        <Button
          onClick={() => enableCamera.mutate(cameraToUpdatePayload(camera, { isActive: true }))}
          isLoading={enableCamera.isPending}
        >
          Re-enable
        </Button>
      )}
    </>
  );
}

export function CameraDetailsPage() {
  const { id } = useParams();
  const { hasRole } = useAuth();
  const { data: camera, error, isPending } = useCamera(id);
  const isAdmin = hasRole(ROLES.ADMIN);

  if (isPending) return <LoadingState label="Loading camera…" />;
  if (error) {
    const title = error.status === 404 ? 'Camera not found' : 'Could not load camera';
    return (
      <ErrorState
        title={title}
        error={error.status === 404 ? null : error}
        action={
          <Button variant="secondary" size="sm" to="/cameras">
            Back to cameras
          </Button>
        }
      />
    );
  }

  const storage = camera.storageMetadata ?? {};

  return (
    <>
      <PageHeader
        backTo="/cameras"
        backLabel="Cameras"
        title={
          <>
            <PageTitle>{camera.name}</PageTitle>
            <CameraStatusBadge status={camera.status} />
            <CameraActiveBadge isActive={camera.isActive} />
          </>
        }
        description={<span className="font-mono">{camera.cameraId}</span>}
        actions={isAdmin && <CameraAdminActions camera={camera} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Overview">
            <DescriptionList
              items={[
                { label: 'Camera ID', value: camera.cameraId },
                { label: 'Type', value: labelFor(camera.cameraType) },
                { label: 'Department', value: camera.department },
                { label: 'Zone', value: camera.zone },
                {
                  label: 'Coordinates',
                  value: formatCoordinates(camera.latitude, camera.longitude),
                },
              ]}
            />
          </Card>
          <Card title="Stream">
            <DescriptionList
              items={[
                { label: 'Protocol', value: labelFor(camera.sourceProtocol) },
                {
                  label: 'Stream URL',
                  value: <code className="text-xs text-slate-300">{camera.streamUrl}</code>,
                },
              ]}
            />
          </Card>
          <Card title="Storage">
            <DescriptionList
              items={[
                { label: 'Storage type', value: labelFor(storage.storageType) },
                { label: 'Location', value: storage.location },
                {
                  label: 'Retention',
                  value: storage.retentionDays ? `${storage.retentionDays} days` : null,
                },
              ]}
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Health">
            <div className="space-y-4">
              <DescriptionList
                items={[
                  { label: 'Status', value: <CameraStatusBadge status={camera.status} /> },
                  {
                    label: 'Last heartbeat',
                    value: (
                      <span title={formatDateTime(camera.lastHeartbeat)}>
                        {formatRelativeTime(camera.lastHeartbeat)}
                      </span>
                    ),
                  },
                ]}
              />
              {isAdmin && camera.isActive && (
                <div className="space-y-1.5 border-t border-slate-800 pt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Override status
                  </p>
                  <CameraStatusControl camera={camera} />
                </div>
              )}
            </div>
          </Card>
          <Card title="Record">
            <DescriptionList
              items={[
                { label: 'Created', value: formatDateTime(camera.createdAt) },
                { label: 'Last updated', value: formatDateTime(camera.updatedAt) },
              ]}
            />
          </Card>
        </div>
      </div>
    </>
  );
}
