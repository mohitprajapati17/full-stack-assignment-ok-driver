import { CAMERA_TYPES } from '../../constants/enums.js';
import { Camera } from '../../models/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { escapeRegex } from '../../utils/validation.js';

const SEARCH_FIELDS = ['name', 'cameraId', 'department', 'zone'];

// Optional configuration fields reset to these values when omitted from a PUT.
const CONFIG_RESET_VALUES = {
  department: undefined,
  zone: undefined,
  cameraType: CAMERA_TYPES.OTHER,
  storageMetadata: {},
};

async function findCameraOrThrow(id) {
  const camera = await Camera.findById(id);
  if (!camera) throw new ApiError(404, 'Camera not found');
  return camera;
}

function buildListFilter({ search, status, department, zone, isActive }) {
  const filter = {};
  if (isActive !== 'all') filter.isActive = isActive === 'true';
  if (status) filter.status = status;
  if (department) filter.department = department;
  if (zone) filter.zone = zone;
  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = SEARCH_FIELDS.map((field) => ({ [field]: pattern }));
  }
  return filter;
}

export async function listCameras(query) {
  const { page, limit, sortBy, sortOrder } = query;
  const filter = buildListFilter(query);
  const direction = sortOrder === 'asc' ? 1 : -1;

  const [items, total] = await Promise.all([
    Camera.find(filter)
      // _id tiebreaker keeps pagination stable when sort values repeat.
      .sort({ [sortBy]: direction, _id: direction })
      .skip((page - 1) * limit)
      .limit(limit),
    Camera.countDocuments(filter),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

export async function getFilterOptions() {
  const activeOnly = { isActive: true };
  const [departments, zones] = await Promise.all([
    Camera.distinct('department', activeOnly),
    Camera.distinct('zone', activeOnly),
  ]);
  const clean = (values) => values.filter(Boolean).sort((a, b) => a.localeCompare(b));
  return { departments: clean(departments), zones: clean(zones) };
}

export const getCameraById = findCameraOrThrow;

export function createCamera(data) {
  return Camera.create(data);
}

export async function updateCamera(id, data) {
  const camera = await findCameraOrThrow(id);
  const { isActive, ...config } = data;

  camera.set({ ...CONFIG_RESET_VALUES, ...config });
  if (isActive !== undefined) camera.isActive = isActive;

  const changedFields = camera.modifiedPaths({ includeChildren: false });
  await camera.save();
  return { camera, changedFields };
}

export async function updateCameraStatus(id, { status, lastHeartbeat }) {
  const camera = await findCameraOrThrow(id);
  const previousStatus = camera.status;

  camera.status = status;
  if (lastHeartbeat) camera.lastHeartbeat = lastHeartbeat;

  await camera.save();
  return { camera, previousStatus };
}

export async function disableCamera(id) {
  const camera = await findCameraOrThrow(id);
  const wasActive = camera.isActive;

  if (wasActive) {
    camera.isActive = false;
    await camera.save();
  }
  return { camera, wasActive };
}
