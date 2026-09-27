import { z } from 'zod';
import {
  CAMERA_STATUS,
  CAMERA_TYPES,
  SOURCE_PROTOCOLS,
  STORAGE_TYPES,
  enumValues,
} from '../../constants/enums.js';
import { idParamsSchema, optionalText } from '../../utils/validation.js';

export { idParamsSchema as cameraIdParamsSchema };

export const CAMERA_SORT_FIELDS = [
  'name',
  'cameraId',
  'status',
  'department',
  'zone',
  'lastHeartbeat',
  'createdAt',
  'updatedAt',
];

const isoDate = z.iso.datetime({ offset: true, message: 'Must be an ISO 8601 date-time' });

const storageMetadataSchema = z.strictObject({
  storageType: z.enum(enumValues(STORAGE_TYPES)).optional(),
  location: optionalText(500),
  retentionDays: z.number().int().min(1).max(3650).optional(),
});

const cameraConfigShape = {
  cameraId: z
    .string()
    .trim()
    .min(1, 'cameraId is required')
    .max(64)
    .regex(/^[A-Za-z0-9_-]+$/, 'cameraId may only contain letters, digits, "_" and "-"')
    .transform((value) => value.toUpperCase()),
  name: z.string().trim().min(1, 'Name is required').max(120),
  department: optionalText(120),
  zone: optionalText(120),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  cameraType: z.enum(enumValues(CAMERA_TYPES)).optional(),
  sourceProtocol: z.enum(enumValues(SOURCE_PROTOCOLS)),
  streamUrl: z
    .string()
    .trim()
    .max(2048)
    .regex(/^[a-z][a-z0-9+.-]*:\/\/\S+$/i, 'Stream URL must be a valid URL, e.g. rtsp://host/path'),
  storageMetadata: storageMetadataSchema.optional(),
};

export const createCameraSchema = z.strictObject({
  ...cameraConfigShape,
  status: z.enum(enumValues(CAMERA_STATUS)).optional(),
  lastHeartbeat: isoDate.optional(),
});

// PUT replaces the camera configuration. Runtime state (status, lastHeartbeat) is managed via
// PATCH /status; isActive is preserved unless explicitly provided.
export const updateCameraSchema = z.strictObject({
  ...cameraConfigShape,
  isActive: z.boolean().optional(),
});

export const updateCameraStatusSchema = z.strictObject({
  status: z.enum(enumValues(CAMERA_STATUS)),
  lastHeartbeat: isoDate.optional(),
});

export const listCamerasQuerySchema = z.object({
  search: optionalText(100),
  status: z.enum(enumValues(CAMERA_STATUS)).optional(),
  department: optionalText(120),
  zone: optionalText(120),
  isActive: z.enum(['true', 'false', 'all']).default('true'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(CAMERA_SORT_FIELDS).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
