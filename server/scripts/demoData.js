/**
 * TEMPORARY DEMO DATA — development only.
 *
 * Detection ingestion and watchlist matching don't exist yet, so the dashboard's alert and
 * detection panels would otherwise always be empty. This script inserts clearly tagged
 * sample records so those panels can be exercised, and removes them again with `--clear`.
 * Delete this script once real ingestion is in place.
 *
 *   npm run db:demo         # replace any previous demo records with a fresh set
 *   npm run db:demo:clear   # remove all demo records
 */
import { env } from '../src/config/env.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import {
  ALERT_SEVERITY,
  ALERT_STATUS,
  DETECTION_EVENT_TYPES,
  USER_ROLES,
  VEHICLE_TYPES,
  WATCHLIST_REASONS,
} from '../src/constants/enums.js';
import { Alert, Camera, DetectionEvent, User, Watchlist } from '../src/models/index.js';

const DEMO_TAG = '[demo-data]';
const DEMO_DETECTION_FILTER = { 'metadata.demo': true };
const DEMO_WATCHLIST_FILTER = { description: { $regex: `^\\${DEMO_TAG}` } };

const DEMO_WATCHLIST = [
  { identifier: 'MH12DE0001', reason: WATCHLIST_REASONS.STOLEN },
  { identifier: 'MH01DE0002', reason: WATCHLIST_REASONS.WANTED },
];

const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60_000);

async function clearDemoData() {
  const demoDetectionIds = await DetectionEvent.find(DEMO_DETECTION_FILTER).distinct('_id');
  const alerts = await Alert.deleteMany({ detectionEventId: { $in: demoDetectionIds } });
  const detections = await DetectionEvent.deleteMany(DEMO_DETECTION_FILTER);
  const watchlist = await Watchlist.deleteMany(DEMO_WATCHLIST_FILTER);
  console.info(
    `[demo] Removed ${alerts.deletedCount} alerts, ${detections.deletedCount} detections, ` +
      `${watchlist.deletedCount} watchlist entries`,
  );
}

async function createDemoData() {
  const cameras = await Camera.find({ isActive: true }).select('cameraId').lean();
  if (cameras.length === 0) {
    throw new Error('No active cameras found. Run `npm run db:seed` or register a camera first.');
  }
  const admin = await User.findOne({ role: USER_ROLES.ADMIN, isActive: true }).select('_id');
  const cameraAt = (index) => cameras[index % cameras.length].cameraId;

  const watchlist = await Watchlist.insertMany(
    DEMO_WATCHLIST.map((entry) => ({
      ...entry,
      description: `${DEMO_TAG} Sample watchlist entry for dashboard development`,
    })),
  );

  const plates = ['MH04XY1122', 'MH02AB3344', 'KA05MN7788', 'GJ01PQ4455', 'MH14RS9900'];
  const vehicleTypes = [VEHICLE_TYPES.CAR, VEHICLE_TYPES.MOTORCYCLE, VEHICLE_TYPES.TRUCK];
  const detectionDocs = plates.flatMap((plate, index) => [
    {
      cameraId: cameraAt(index),
      timestamp: minutesAgo(5 + index * 37),
      eventType: DETECTION_EVENT_TYPES.PLATE_RECOGNITION,
      vehicleNumber: plate,
      vehicleType: vehicleTypes[index % vehicleTypes.length],
      confidence: 0.82 + index * 0.03,
    },
    {
      cameraId: cameraAt(index + 1),
      timestamp: minutesAgo(20 + index * 41),
      eventType: DETECTION_EVENT_TYPES.VEHICLE_DETECTION,
      vehicleType: vehicleTypes[(index + 1) % vehicleTypes.length],
      confidence: 0.75 + index * 0.04,
    },
  ]);
  detectionDocs.push({
    cameraId: cameraAt(2),
    timestamp: minutesAgo(90),
    eventType: DETECTION_EVENT_TYPES.MOTION,
    confidence: 0.68,
  });

  const matchDocs = watchlist.map((entry, index) => ({
    cameraId: cameraAt(index),
    timestamp: minutesAgo(2 + index * 12),
    eventType: DETECTION_EVENT_TYPES.PLATE_RECOGNITION,
    vehicleNumber: entry.identifier,
    vehicleType: VEHICLE_TYPES.CAR,
    confidence: 0.94 - index * 0.05,
  }));

  const tagged = (docs) => docs.map((doc) => ({ ...doc, metadata: { demo: true } }));
  const [matches] = await Promise.all([
    DetectionEvent.insertMany(tagged(matchDocs)),
    DetectionEvent.insertMany(tagged(detectionDocs)),
  ]);

  // create() rather than insertMany() so the model's status/acknowledgement validation runs.
  const alertSettings = [
    { severity: ALERT_SEVERITY.CRITICAL, status: ALERT_STATUS.NEW },
    admin
      ? {
          severity: ALERT_SEVERITY.HIGH,
          status: ALERT_STATUS.ACKNOWLEDGED,
          acknowledgedBy: admin._id,
          acknowledgedAt: minutesAgo(5),
        }
      : { severity: ALERT_SEVERITY.HIGH, status: ALERT_STATUS.NEW },
  ];
  for (const [index, detection] of matches.entries()) {
    await Alert.create({
      detectionEventId: detection._id,
      cameraId: detection.cameraId,
      matchedEntity: watchlist[index]._id,
      identifier: detection.vehicleNumber,
      confidence: detection.confidence,
      timestamp: detection.timestamp,
      ...alertSettings[index],
    });
  }

  console.info(
    `[demo] Created ${watchlist.length} watchlist entries, ` +
      `${matches.length + detectionDocs.length} detections, ${matches.length} alerts`,
  );
}

if (env.isProduction) {
  console.error('[demo] Refusing to write demo data in production.');
  process.exit(1);
}

try {
  await connectDB();
  await clearDemoData();
  if (!process.argv.includes('--clear')) await createDemoData();
} catch (err) {
  console.error('[demo] Failed:', err.message);
  process.exitCode = 1;
} finally {
  await disconnectDB();
}
