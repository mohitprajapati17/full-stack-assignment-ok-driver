const defineEnum = (...keys) => Object.freeze(Object.fromEntries(keys.map((key) => [key, key])));

export const enumValues = (enumObject) => Object.values(enumObject);

export const USER_ROLES = defineEnum('ADMIN', 'OPERATOR');

export const CAMERA_STATUS = defineEnum('ONLINE', 'OFFLINE', 'DEGRADED');
export const CAMERA_TYPES = defineEnum('ANPR', 'PTZ', 'DOME', 'BULLET', 'FISHEYE', 'OTHER');
export const SOURCE_PROTOCOLS = defineEnum('RTSP', 'RTMP', 'HLS', 'WEBRTC', 'HTTP', 'ONVIF');
export const STORAGE_TYPES = defineEnum('LOCAL', 'NVR', 'S3', 'GCS', 'AZURE_BLOB');

export const DETECTION_EVENT_TYPES = defineEnum(
  'VEHICLE_DETECTION',
  'PLATE_RECOGNITION',
  'MOTION',
  'INTRUSION',
  'OTHER',
);
export const VEHICLE_TYPES = defineEnum(
  'CAR',
  'MOTORCYCLE',
  'AUTO_RICKSHAW',
  'BUS',
  'TRUCK',
  'VAN',
  'BICYCLE',
  'UNKNOWN',
);

export const WATCHLIST_ENTITY_TYPES = defineEnum('VEHICLE', 'PERSON');
export const WATCHLIST_REASONS = defineEnum(
  'STOLEN',
  'WANTED',
  'SUSPICIOUS',
  'BLACKLISTED',
  'OTHER',
);

export const ALERT_SEVERITY = defineEnum('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
export const ALERT_STATUS = defineEnum('NEW', 'ACKNOWLEDGED', 'RESOLVED');

export const AUDIT_ACTIONS = defineEnum(
  'LOGIN',
  'LOGIN_FAILED',
  'LOGOUT',
  'CREATE',
  'UPDATE',
  'DELETE',
  'ACKNOWLEDGE',
  'RESOLVE',
);
export const AUDIT_RESOURCE_TYPES = defineEnum(
  'AUTH',
  'USER',
  'CAMERA',
  'DETECTION_EVENT',
  'WATCHLIST',
  'ALERT',
);
