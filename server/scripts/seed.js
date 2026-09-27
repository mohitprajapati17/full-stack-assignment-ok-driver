import { env } from '../src/config/env.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { USER_ROLES } from '../src/constants/enums.js';
import { Camera, User } from '../src/models/index.js';
import { hashPassword } from '../src/utils/password.js';

const DEV_USERS = [
  {
    name: 'Admin User',
    email: process.env.SEED_ADMIN_EMAIL ?? 'admin@okdriver.local',
    password: process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345',
    role: USER_ROLES.ADMIN,
  },
  {
    name: 'Operator User',
    email: process.env.SEED_OPERATOR_EMAIL ?? 'operator@okdriver.local',
    password: process.env.SEED_OPERATOR_PASSWORD ?? 'Operator@12345',
    role: USER_ROLES.OPERATOR,
  },
];

const SAMPLE_CAMERAS = [
  {
    cameraId: 'CAM-GATE-01',
    name: 'Main Gate Entry',
    department: 'Security',
    zone: 'North',
    latitude: 19.076,
    longitude: 72.8777,
    cameraType: 'ANPR',
    sourceProtocol: 'RTSP',
    streamUrl: 'rtsp://admin:changeme@10.0.1.11:554/stream1',
    status: 'ONLINE',
    lastHeartbeat: new Date(),
    storageMetadata: { storageType: 'NVR', location: 'nvr-01', retentionDays: 30 },
  },
  {
    cameraId: 'CAM-GATE-02',
    name: 'Main Gate Exit',
    department: 'Security',
    zone: 'North',
    latitude: 19.0762,
    longitude: 72.8781,
    cameraType: 'ANPR',
    sourceProtocol: 'RTSP',
    streamUrl: 'rtsp://10.0.1.12:554/stream1',
    status: 'DEGRADED',
    lastHeartbeat: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    cameraId: 'CAM-PARK-01',
    name: 'Parking Level 1',
    department: 'Facilities',
    zone: 'East',
    latitude: 19.0755,
    longitude: 72.879,
    cameraType: 'DOME',
    sourceProtocol: 'HLS',
    streamUrl: 'https://streams.okdriver.local/park-01/index.m3u8',
    status: 'OFFLINE',
  },
];

if (env.isProduction && !process.env.SEED_ADMIN_PASSWORD) {
  console.error('Refusing to seed default credentials in production. Set SEED_* variables.');
  process.exit(1);
}

try {
  await connectDB();

  for (const { password, ...user } of DEV_USERS) {
    if (await User.exists({ email: user.email })) {
      console.info(`[seed] User exists: ${user.email}`);
      continue;
    }
    await User.create({ ...user, passwordHash: await hashPassword(password) });
    console.info(`[seed] Created ${user.role}: ${user.email} / ${password}`);
  }

  if ((await Camera.estimatedDocumentCount()) === 0) {
    await Camera.insertMany(SAMPLE_CAMERAS);
    console.info(`[seed] Created ${SAMPLE_CAMERAS.length} sample cameras`);
  } else {
    console.info('[seed] Cameras already present, skipping sample cameras');
  }
} catch (err) {
  console.error('[seed] Failed:', err.message);
  process.exitCode = 1;
} finally {
  await disconnectDB();
}
