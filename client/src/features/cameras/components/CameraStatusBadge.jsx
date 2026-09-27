import { Badge } from '@/components/ui/Badge';
import { labelFor } from '../cameraConstants';

const STATUS_TONES = {
  ONLINE: 'green',
  DEGRADED: 'amber',
  OFFLINE: 'red',
};

export function CameraStatusBadge({ status }) {
  return (
    <Badge tone={STATUS_TONES[status] ?? 'slate'} dot>
      {labelFor(status)}
    </Badge>
  );
}

export function CameraActiveBadge({ isActive }) {
  if (isActive) return null;
  return <Badge tone="slate">Disabled</Badge>;
}
