import { formatEnum } from '@/lib/format';

export const CAMERA_STATUSES = ['ONLINE', 'DEGRADED', 'OFFLINE'];
export const CAMERA_TYPES = ['ANPR', 'PTZ', 'DOME', 'BULLET', 'FISHEYE', 'OTHER'];
export const SOURCE_PROTOCOLS = ['RTSP', 'RTMP', 'HLS', 'WEBRTC', 'HTTP', 'ONVIF'];
export const STORAGE_TYPES = ['LOCAL', 'NVR', 'S3', 'GCS', 'AZURE_BLOB'];

const ACRONYMS = new Set([...SOURCE_PROTOCOLS, 'ANPR', 'PTZ', 'NVR', 'S3', 'GCS']);

export const labelFor = (value) => (ACRONYMS.has(value) ? value : formatEnum(value));

export const toOptions = (values) => values.map((value) => ({ value, label: labelFor(value) }));

export const SORTABLE_COLUMNS = [
  'cameraId',
  'name',
  'department',
  'zone',
  'status',
  'lastHeartbeat',
];

export const ACTIVE_FILTER_OPTIONS = [
  { value: 'true', label: 'Active cameras' },
  { value: 'false', label: 'Disabled cameras' },
  { value: 'all', label: 'All cameras' },
];

export const PAGE_SIZE_OPTIONS = [10, 20, 50];
