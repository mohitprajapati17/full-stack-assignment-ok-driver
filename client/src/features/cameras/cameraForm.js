import { z } from 'zod';
import { CAMERA_STATUSES, CAMERA_TYPES, SOURCE_PROTOCOLS, STORAGE_TYPES } from './cameraConstants';

// Form values are kept as strings (what inputs produce); the schema converts them to the
// API payload shape. Rules mirror the server's validation so most errors are caught early.

const requiredNumber = (label, min, max) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .transform(Number)
    .pipe(
      z
        .number({ error: `${label} must be a number` })
        .min(min, `${label} must be between ${min} and ${max}`)
        .max(max, `${label} must be between ${min} and ${max}`),
    );

const optionalText = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || undefined);

const baseShape = {
  cameraId: z
    .string()
    .trim()
    .min(1, 'Camera ID is required')
    .max(64)
    .regex(/^[A-Za-z0-9_-]+$/, 'Use letters, digits, "_" or "-" only'),
  name: z.string().trim().min(1, 'Name is required').max(120),
  department: optionalText(120),
  zone: optionalText(120),
  latitude: requiredNumber('Latitude', -90, 90),
  longitude: requiredNumber('Longitude', -180, 180),
  cameraType: z.enum(CAMERA_TYPES),
  sourceProtocol: z.enum(SOURCE_PROTOCOLS, { error: 'Select a source protocol' }),
  streamUrl: z
    .string()
    .trim()
    .min(1, 'Stream URL is required')
    .max(2048)
    .regex(/^[a-z][a-z0-9+.-]*:\/\/\S+$/i, 'Enter a full URL, e.g. rtsp://10.0.0.5/stream1'),
  storageType: z.enum(STORAGE_TYPES),
  storageLocation: optionalText(500),
  retentionDays: z
    .string()
    .trim()
    .transform((value) => (value === '' ? undefined : Number(value)))
    .pipe(
      z
        .number({ error: 'Retention must be a whole number of days' })
        .int('Retention must be a whole number of days')
        .min(1, 'Retention must be between 1 and 3650 days')
        .max(3650, 'Retention must be between 1 and 3650 days')
        .optional(),
    ),
};

export const createCameraFormSchema = z.object({
  ...baseShape,
  status: z.enum(CAMERA_STATUSES),
});

export const editCameraFormSchema = z.object(baseShape);

export const emptyCameraFormValues = {
  cameraId: '',
  name: '',
  department: '',
  zone: '',
  latitude: '',
  longitude: '',
  cameraType: 'OTHER',
  sourceProtocol: '',
  streamUrl: '',
  storageType: 'LOCAL',
  storageLocation: '',
  retentionDays: '',
  status: 'OFFLINE',
};

export function cameraToFormValues(camera) {
  return {
    ...emptyCameraFormValues,
    cameraId: camera.cameraId,
    name: camera.name,
    department: camera.department ?? '',
    zone: camera.zone ?? '',
    latitude: String(camera.latitude),
    longitude: String(camera.longitude),
    cameraType: camera.cameraType ?? 'OTHER',
    sourceProtocol: camera.sourceProtocol,
    streamUrl: camera.streamUrl,
    storageType: camera.storageMetadata?.storageType ?? 'LOCAL',
    storageLocation: camera.storageMetadata?.location ?? '',
    retentionDays:
      camera.storageMetadata?.retentionDays != null
        ? String(camera.storageMetadata.retentionDays)
        : '',
    status: camera.status,
  };
}

/** Converts parsed form data into the API request body. */
export function formDataToPayload({ storageType, storageLocation, retentionDays, ...rest }) {
  return {
    ...rest,
    storageMetadata: { storageType, location: storageLocation, retentionDays },
  };
}

/** Converts a camera from the API into a full PUT body, e.g. for re-enabling it. */
export function cameraToUpdatePayload(camera, overrides = {}) {
  const data = editCameraFormSchema.parse(cameraToFormValues(camera));
  return { ...formDataToPayload(data), ...overrides };
}

const SERVER_PATH_TO_FIELD = {
  'storageMetadata.storageType': 'storageType',
  'storageMetadata.location': 'storageLocation',
  'storageMetadata.retentionDays': 'retentionDays',
};

export const toFormFieldErrors = (fieldErrors) =>
  Object.fromEntries(
    Object.entries(fieldErrors).map(([path, message]) => [
      SERVER_PATH_TO_FIELD[path] ?? path,
      message,
    ]),
  );
