import { formatEnum } from '@/lib/format';

export const SEVERITY_TONES = {
  CRITICAL: 'red',
  HIGH: 'orange',
  MEDIUM: 'amber',
  LOW: 'slate',
};

export const ALERT_STATUS_TONES = {
  NEW: 'red',
  ACKNOWLEDGED: 'sky',
};

export const formatConfidence = (value) => (value == null ? '—' : `${Math.round(value * 100)}%`);

const cameraLabel = (details) => details?.cameraId ?? 'a camera';

function describeCameraActivity({ action, details }) {
  const camera = cameraLabel(details);
  switch (action) {
    case 'CREATE':
      return `Registered camera ${camera}`;
    case 'DELETE':
      return `Disabled camera ${camera}`;
    case 'UPDATE':
      if (details?.field === 'status') {
        return `Changed ${camera} status from ${formatEnum(details.from)} to ${formatEnum(details.to)}`;
      }
      if (details?.changedFields?.length) {
        return `Updated camera ${camera} (${details.changedFields.join(', ')})`;
      }
      return `Saved camera ${camera} with no changes`;
    default:
      return `${formatEnum(action)} camera ${camera}`;
  }
}

function describeAuthActivity({ action, details }) {
  switch (action) {
    case 'LOGIN':
      return 'Signed in';
    case 'LOGOUT':
      return 'Signed out';
    case 'LOGIN_FAILED':
      return `Failed sign-in attempt${details?.email ? ` for ${details.email}` : ''}`;
    default:
      return formatEnum(action);
  }
}

/** Turns an audit log entry into a one-line, human-readable description. */
export function describeActivity(entry) {
  if (entry.resourceType === 'CAMERA') return describeCameraActivity(entry);
  if (entry.resourceType === 'AUTH') return describeAuthActivity(entry);
  return `${formatEnum(entry.action)} ${formatEnum(entry.resourceType).toLowerCase()}`;
}

export function activityTone(action) {
  if (action === 'LOGIN_FAILED') return 'red';
  if (action === 'DELETE') return 'amber';
  if (action === 'CREATE') return 'green';
  return 'slate';
}
