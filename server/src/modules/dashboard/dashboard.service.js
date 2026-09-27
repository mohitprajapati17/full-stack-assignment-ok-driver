import { ALERT_SEVERITY, ALERT_STATUS, AUDIT_RESOURCE_TYPES } from '../../constants/enums.js';
import { Alert, AuditLog, Camera, DetectionEvent } from '../../models/index.js';

const ACTIVE_ALERT_STATUSES = [ALERT_STATUS.NEW, ALERT_STATUS.ACKNOWLEDGED];

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

async function countCamerasByStatus() {
  const groups = await Camera.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const counts = Object.fromEntries(groups.map(({ _id, count }) => [_id, count]));
  const online = counts.ONLINE ?? 0;
  const offline = counts.OFFLINE ?? 0;
  const degraded = counts.DEGRADED ?? 0;
  return { total: online + offline + degraded, online, offline, degraded };
}

export async function getSummary({ detectionsSince }) {
  const since = detectionsSince ? new Date(detectionsSince) : startOfToday();
  const activeAlerts = { status: { $in: ACTIVE_ALERT_STATUSES } };

  const [cameras, active, unacknowledged, critical, detectionsToday] = await Promise.all([
    countCamerasByStatus(),
    Alert.countDocuments(activeAlerts),
    Alert.countDocuments({ status: ALERT_STATUS.NEW }),
    Alert.countDocuments({ ...activeAlerts, severity: ALERT_SEVERITY.CRITICAL }),
    DetectionEvent.countDocuments({ timestamp: { $gte: since } }),
  ]);

  return {
    cameras,
    alerts: { active, unacknowledged, critical },
    detections: { today: detectionsToday, since: since.toISOString() },
    generatedAt: new Date().toISOString(),
  };
}

/** Alerts and detections reference cameras by `cameraId`; this resolves display details. */
async function withCameraSummaries(records) {
  const cameraIds = [...new Set(records.map((record) => record.cameraId))];
  const cameras = await Camera.find({ cameraId: { $in: cameraIds } })
    .select('cameraId name zone')
    .lean();
  const byCameraId = new Map(
    cameras.map((camera) => [
      camera.cameraId,
      { id: camera._id.toString(), cameraId: camera.cameraId, name: camera.name, zone: camera.zone },
    ]),
  );
  return records.map((record) => ({
    ...record.toJSON(),
    camera: byCameraId.get(record.cameraId) ?? null,
  }));
}

export async function listActiveAlerts({ limit }) {
  const alerts = await Alert.find({ status: { $in: ACTIVE_ALERT_STATUSES } })
    .sort({ timestamp: -1, _id: -1 })
    .limit(limit)
    .populate('matchedEntity', 'entityType identifier reason');
  return withCameraSummaries(alerts);
}

export async function listRecentDetections({ limit }) {
  const detections = await DetectionEvent.find()
    .select('-metadata -boundingBox')
    .sort({ timestamp: -1, _id: -1 })
    .limit(limit);
  return withCameraSummaries(detections);
}

export async function listRecentActivity({ limit, includeAuthEvents }) {
  const filter = includeAuthEvents ? {} : { resourceType: { $ne: AUDIT_RESOURCE_TYPES.AUTH } };
  const entries = await AuditLog.find(filter)
    .sort({ timestamp: -1, _id: -1 })
    .limit(limit)
    .populate('userId', 'name role')
    .lean();

  return entries.map(({ _id, userId: user, action, resourceType, resourceId, details, timestamp }) => ({
    id: _id.toString(),
    action,
    resourceType,
    resourceId,
    details,
    timestamp,
    actor: user ? { id: user._id.toString(), name: user.name, role: user.role } : null,
  }));
}
