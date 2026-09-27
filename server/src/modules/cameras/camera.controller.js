import { AUDIT_ACTIONS, AUDIT_RESOURCE_TYPES } from '../../constants/enums.js';
import { recordAudit } from '../audit-logs/auditLog.service.js';
import { serializeCamera } from './camera.serializer.js';
import * as cameraService from './camera.service.js';

const auditCamera = (req, action, camera, details) =>
  recordAudit(req, {
    action,
    resourceType: AUDIT_RESOURCE_TYPES.CAMERA,
    resourceId: camera._id,
    details: { cameraId: camera.cameraId, ...details },
  });

export async function listCameras(req, res) {
  const { items, pagination } = await cameraService.listCameras(req.validated.query);
  res.json({ data: items.map((camera) => serializeCamera(camera, req.user)), pagination });
}

export async function listCameraLocations(req, res) {
  const cameras = await cameraService.listCameraLocations();
  res.json({ data: cameras.map((camera) => camera.toJSON()) });
}

export async function getFilterOptions(req, res) {
  res.json({ data: await cameraService.getFilterOptions() });
}

export async function getCamera(req, res) {
  const camera = await cameraService.getCameraById(req.validated.params.id);
  res.json({ data: serializeCamera(camera, req.user) });
}

export async function createCamera(req, res) {
  const camera = await cameraService.createCamera(req.validated.body);
  await auditCamera(req, AUDIT_ACTIONS.CREATE, camera);
  res
    .status(201)
    .location(`${req.baseUrl}/${camera.id}`)
    .json({ data: serializeCamera(camera, req.user) });
}

export async function updateCamera(req, res) {
  const { camera, changedFields } = await cameraService.updateCamera(
    req.validated.params.id,
    req.validated.body,
  );
  await auditCamera(req, AUDIT_ACTIONS.UPDATE, camera, { changedFields });
  res.json({ data: serializeCamera(camera, req.user) });
}

export async function updateCameraStatus(req, res) {
  const { camera, previousStatus } = await cameraService.updateCameraStatus(
    req.validated.params.id,
    req.validated.body,
  );
  await auditCamera(req, AUDIT_ACTIONS.UPDATE, camera, {
    field: 'status',
    from: previousStatus,
    to: camera.status,
  });
  res.json({ data: serializeCamera(camera, req.user) });
}

export async function disableCamera(req, res) {
  const { camera, wasActive } = await cameraService.disableCamera(req.validated.params.id);
  if (wasActive) {
    await auditCamera(req, AUDIT_ACTIONS.DELETE, camera, { softDelete: true });
  }
  res.json({ data: serializeCamera(camera, req.user) });
}
