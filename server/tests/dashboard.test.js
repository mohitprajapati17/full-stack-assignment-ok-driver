import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { createUser, loginAs, startTestServer } from './helpers.js';

let api;
let models;
let adminToken;
let operatorToken;
let admin;

const hoursAgo = (hours) => new Date(Date.now() - hours * 3_600_000);

const camera = (cameraId, overrides = {}) => ({
  cameraId,
  name: `Camera ${cameraId}`,
  zone: 'North',
  latitude: 19.07,
  longitude: 72.87,
  sourceProtocol: 'RTSP',
  streamUrl: 'rtsp://10.0.0.1/stream',
  ...overrides,
});

const detection = (cameraId, timestamp, overrides = {}) => ({
  cameraId,
  timestamp,
  confidence: 0.9,
  eventType: 'PLATE_RECOGNITION',
  vehicleNumber: 'MH12AB1234',
  metadata: { snapshotUrl: 'https://example.test/s.jpg' },
  ...overrides,
});

before(async () => {
  api = await startTestServer('dashboard');
  models = await import('../src/models/index.js');
  admin = await createUser({ role: 'ADMIN', email: 'admin@test.io' });
  await createUser({ role: 'OPERATOR', email: 'operator@test.io' });
  adminToken = await loginAs(api.request, 'admin@test.io');
  operatorToken = await loginAs(api.request, 'operator@test.io');

  const { Alert, Camera, DetectionEvent, Watchlist } = models;
  await Camera.insertMany([
    camera('CAM-A', { name: 'Gate A', status: 'ONLINE' }),
    camera('CAM-B', { status: 'ONLINE' }),
    camera('CAM-C', { status: 'OFFLINE' }),
    camera('CAM-D', { status: 'DEGRADED' }),
    camera('CAM-X', { status: 'ONLINE', isActive: false }),
  ]);

  const [recent, older, yesterday] = await DetectionEvent.insertMany([
    detection('CAM-A', hoursAgo(0.1)),
    detection('CAM-B', hoursAgo(0.5), { vehicleNumber: 'KA01CD5678' }),
    detection('CAM-GONE', hoursAgo(30), { eventType: 'MOTION', vehicleNumber: undefined }),
  ]);

  const [stolen, wanted, other] = await Watchlist.insertMany([
    { identifier: 'MH12AB1234', reason: 'STOLEN' },
    { identifier: 'KA01CD5678', reason: 'WANTED' },
    { identifier: 'GJ01ZZ0000', reason: 'OTHER' },
  ]);
  const alert = (detectionEvent, matchedEntity, fields) =>
    Alert.create({
      detectionEventId: detectionEvent._id,
      cameraId: detectionEvent.cameraId,
      matchedEntity: matchedEntity._id,
      identifier: matchedEntity.identifier,
      confidence: detectionEvent.confidence,
      timestamp: detectionEvent.timestamp,
      ...fields,
    });
  await alert(recent, stolen, { severity: 'CRITICAL' });
  await alert(older, wanted, {
    severity: 'HIGH',
    status: 'ACKNOWLEDGED',
    acknowledgedBy: admin._id,
    acknowledgedAt: new Date(),
  });
  await alert(yesterday, other, {
    status: 'RESOLVED',
    resolvedBy: admin._id,
    resolvedAt: new Date(),
  });
});

after(() => api.stop());

test('every dashboard endpoint requires a token', async () => {
  for (const path of ['summary', 'active-alerts', 'recent-detections', 'recent-activity']) {
    const res = await api.request('GET', `/dashboard/${path}`);
    assert.equal(res.status, 401, path);
  }
});

describe('GET /dashboard/summary', () => {
  test('counts active cameras by status, active alerts and detections since a timestamp', async () => {
    const since = hoursAgo(24).toISOString();
    const res = await api.request('GET', `/dashboard/summary?detectionsSince=${since}`, {
      token: operatorToken,
    });
    assert.equal(res.status, 200);
    const { cameras, alerts, detections } = res.body.data;
    assert.deepEqual(cameras, { total: 4, online: 2, offline: 1, degraded: 1 });
    assert.deepEqual(alerts, { active: 2, unacknowledged: 1, critical: 1 });
    assert.equal(detections.today, 2);
    assert.equal(detections.since, since);
  });

  test('defaults detectionsSince to the start of the server day', async () => {
    const res = await api.request('GET', '/dashboard/summary', { token: operatorToken });
    assert.equal(res.status, 200);
    const since = new Date(res.body.data.detections.since);
    assert.equal(since.getHours() + since.getMinutes() + since.getSeconds(), 0);
  });

  test('rejects an invalid detectionsSince', async () => {
    const res = await api.request('GET', '/dashboard/summary?detectionsSince=yesterday', {
      token: operatorToken,
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.details[0].path, 'detectionsSince');
  });
});

describe('feeds', () => {
  test('active alerts exclude resolved ones, newest first, with camera and watchlist details', async () => {
    const res = await api.request('GET', '/dashboard/active-alerts', { token: operatorToken });
    assert.equal(res.status, 200);
    const alerts = res.body.data;
    assert.deepEqual(
      alerts.map((a) => a.status),
      ['NEW', 'ACKNOWLEDGED'],
    );
    assert.deepEqual(alerts[0].camera, {
      id: alerts[0].camera.id,
      cameraId: 'CAM-A',
      name: 'Gate A',
      zone: 'North',
    });
    assert.equal(alerts[0].matchedEntity.reason, 'STOLEN');
    assert.equal(alerts[0].matchedEntity.identifier, 'MH12AB1234');
  });

  test('recent detections are newest first, omit metadata and tolerate unknown cameras', async () => {
    const res = await api.request('GET', '/dashboard/recent-detections?limit=10', {
      token: operatorToken,
    });
    assert.equal(res.status, 200);
    const detections = res.body.data;
    assert.deepEqual(
      detections.map((d) => d.cameraId),
      ['CAM-A', 'CAM-B', 'CAM-GONE'],
    );
    assert.equal(detections[0].metadata, undefined);
    assert.equal(detections[0].camera.name, 'Gate A');
    assert.equal(detections[2].camera, null);
  });

  test('limit is applied and validated', async () => {
    const limited = await api.request('GET', '/dashboard/recent-detections?limit=1', {
      token: operatorToken,
    });
    assert.equal(limited.body.data.length, 1);

    for (const limit of ['0', '51', 'abc']) {
      const res = await api.request('GET', `/dashboard/active-alerts?limit=${limit}`, {
        token: operatorToken,
      });
      assert.equal(res.status, 400, `limit=${limit}`);
    }
  });

  test('recent activity shows actors, hides IPs, and hides sign-in events from operators', async () => {
    const created = await api.request('POST', '/cameras', {
      token: adminToken,
      body: camera('CAM-NEW'),
    });
    assert.equal(created.status, 201);
    await api.request('POST', '/auth/login', {
      body: { email: 'admin@test.io', password: 'wrong-password' },
    });

    const asAdmin = await api.request('GET', '/dashboard/recent-activity', { token: adminToken });
    assert.equal(asAdmin.status, 200);
    const [failedLogin, cameraCreated] = asAdmin.body.data;
    assert.equal(failedLogin.action, 'LOGIN_FAILED');
    assert.equal(failedLogin.actor, null);
    assert.equal(cameraCreated.action, 'CREATE');
    assert.equal(cameraCreated.details.cameraId, 'CAM-NEW');
    assert.deepEqual(cameraCreated.actor, {
      id: admin._id.toString(),
      name: 'ADMIN tester',
      role: 'ADMIN',
    });
    assert.ok(asAdmin.body.data.every((entry) => !('ipAddress' in entry)));

    const asOperator = await api.request('GET', '/dashboard/recent-activity', {
      token: operatorToken,
    });
    assert.equal(asOperator.status, 200);
    assert.ok(asOperator.body.data.length > 0);
    assert.ok(asOperator.body.data.every((entry) => entry.resourceType !== 'AUTH'));
  });
});
