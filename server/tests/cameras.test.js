import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { createUser, loginAs, startTestServer } from './helpers.js';

let api;
let adminToken;
let operatorToken;

const validCamera = (overrides = {}) => ({
  cameraId: 'cam-test-01',
  name: 'Test Gate',
  department: 'Security',
  zone: 'North',
  latitude: 19.07,
  longitude: 72.87,
  cameraType: 'ANPR',
  sourceProtocol: 'RTSP',
  streamUrl: 'rtsp://user:secret@10.0.0.1:554/stream',
  storageMetadata: { storageType: 'NVR', location: 'nvr-01', retentionDays: 30 },
  ...overrides,
});

const createCamera = async (overrides) => {
  const res = await api.request('POST', '/cameras', {
    token: adminToken,
    body: validCamera(overrides),
  });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  return res.body.data;
};

before(async () => {
  api = await startTestServer('cameras');
  await createUser({ role: 'ADMIN', email: 'admin@test.io' });
  await createUser({ role: 'OPERATOR', email: 'operator@test.io' });
  adminToken = await loginAs(api.request, 'admin@test.io');
  operatorToken = await loginAs(api.request, 'operator@test.io');
});

after(() => api.stop());

describe('authentication and authorization', () => {
  test('every camera endpoint requires a token', async () => {
    const id = '0123456789abcdef01234567';
    const calls = [
      ['GET', '/cameras'],
      ['GET', `/cameras/${id}`],
      ['POST', '/cameras'],
      ['PUT', `/cameras/${id}`],
      ['PATCH', `/cameras/${id}/status`],
      ['DELETE', `/cameras/${id}`],
    ];
    for (const [method, path] of calls) {
      const res = await api.request(method, path);
      assert.equal(res.status, 401, `${method} ${path}`);
    }
  });

  test('operators cannot create, edit, change status or disable cameras', async () => {
    const camera = await createCamera({ cameraId: 'cam-authz' });
    const calls = [
      ['POST', '/cameras', validCamera({ cameraId: 'cam-op' })],
      ['PUT', `/cameras/${camera.id}`, validCamera({ cameraId: 'cam-authz' })],
      ['PATCH', `/cameras/${camera.id}/status`, { status: 'ONLINE' }],
      ['DELETE', `/cameras/${camera.id}`],
    ];
    for (const [method, path, body] of calls) {
      const res = await api.request(method, path, { token: operatorToken, body });
      assert.equal(res.status, 403, `${method} ${path}`);
    }
  });

  test('operators can view cameras but stream credentials are redacted', async () => {
    const camera = await createCamera({ cameraId: 'cam-redact' });

    const asOperator = await api.request('GET', `/cameras/${camera.id}`, { token: operatorToken });
    assert.equal(asOperator.status, 200);
    assert.equal(asOperator.body.data.streamUrl, 'rtsp://***@10.0.0.1:554/stream');

    const asAdmin = await api.request('GET', `/cameras/${camera.id}`, { token: adminToken });
    assert.equal(asAdmin.body.data.streamUrl, 'rtsp://user:secret@10.0.0.1:554/stream');
  });
});

describe('POST /api/cameras', () => {
  test('creates a camera with defaults and normalized cameraId', async () => {
    const res = await api.request('POST', '/cameras', {
      token: adminToken,
      body: validCamera({ cameraId: 'cam-create-01', cameraType: undefined }),
    });
    assert.equal(res.status, 201);
    assert.match(res.headers.get('location'), /\/api\/cameras\/[a-f\d]{24}$/);
    const camera = res.body.data;
    assert.equal(camera.cameraId, 'CAM-CREATE-01');
    assert.equal(camera.status, 'OFFLINE');
    assert.equal(camera.cameraType, 'OTHER');
    assert.equal(camera.isActive, true);
    assert.ok(camera.id && !camera._id && camera.__v === undefined);
  });

  test('rejects a duplicate cameraId with 409', async () => {
    await createCamera({ cameraId: 'cam-dup' });
    const res = await api.request('POST', '/cameras', {
      token: adminToken,
      body: validCamera({ cameraId: 'CAM-DUP' }),
    });
    assert.equal(res.status, 409);
    assert.deepEqual(res.body.error.details.fields, ['cameraId']);
  });

  test('validates fields and reports each invalid path', async () => {
    const res = await api.request('POST', '/cameras', {
      token: adminToken,
      body: {
        cameraId: 'bad id!',
        name: '',
        latitude: 95,
        longitude: '72',
        sourceProtocol: 'FTP',
        streamUrl: 'not a url',
      },
    });
    assert.equal(res.status, 400);
    const paths = res.body.error.details.map((d) => d.path).sort();
    assert.deepEqual(paths, [
      'cameraId',
      'latitude',
      'longitude',
      'name',
      'sourceProtocol',
      'streamUrl',
    ]);
  });

  test('rejects unknown fields such as isActive or _id', async () => {
    const res = await api.request('POST', '/cameras', {
      token: adminToken,
      body: validCamera({ cameraId: 'cam-extra', _id: 'x', isActive: false }),
    });
    assert.equal(res.status, 400);
  });
});

describe('GET /api/cameras', () => {
  before(async () => {
    const { Camera } = await import('../src/models/index.js');
    await Camera.deleteMany({});
    const fixtures = [
      ['LIST-01', 'Alpha Gate', 'Security', 'North', 'ONLINE'],
      ['LIST-02', 'Bravo Lobby', 'Security', 'South', 'OFFLINE'],
      ['LIST-03', 'Charlie Parking', 'Facilities', 'North', 'DEGRADED'],
      ['LIST-04', 'Delta Loading Bay', 'Logistics', 'East', 'ONLINE'],
      ['LIST-05', 'Echo Gate', 'Security', 'North', 'ONLINE'],
    ];
    for (const [cameraId, name, department, zone, status] of fixtures) {
      await createCamera({ cameraId, name, department, zone, status });
    }
    const disabled = await createCamera({ cameraId: 'LIST-06', name: 'Foxtrot Gate' });
    await api.request('DELETE', `/cameras/${disabled.id}`, { token: adminToken });
  });

  const list = (query = '') => api.request('GET', `/cameras${query}`, { token: operatorToken });

  test('returns active cameras with pagination metadata by default', async () => {
    const res = await list();
    assert.equal(res.status, 200);
    assert.equal(res.body.data.length, 5);
    assert.deepEqual(res.body.pagination, { page: 1, limit: 20, total: 5, totalPages: 1 });
  });

  test('searches name, cameraId, department and zone case-insensitively', async () => {
    assert.equal((await list('?search=gate')).body.pagination.total, 2);
    assert.equal((await list('?search=list-04')).body.data[0].name, 'Delta Loading Bay');
    assert.equal((await list('?search=logist')).body.pagination.total, 1);
  });

  test('treats search input as literal text, not a regex', async () => {
    const res = await list(`?search=${encodeURIComponent('.*')}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.pagination.total, 0);
  });

  test('filters by status, department and zone, combined with search', async () => {
    assert.equal((await list('?status=ONLINE')).body.pagination.total, 3);
    assert.equal((await list('?department=Security')).body.pagination.total, 3);
    assert.equal((await list('?zone=North')).body.pagination.total, 3);
    const combined = await list('?department=Security&zone=North&status=ONLINE&search=echo');
    assert.deepEqual(
      combined.body.data.map((c) => c.cameraId),
      ['LIST-05'],
    );
  });

  test('includes disabled cameras with isActive=false or all', async () => {
    assert.deepEqual(
      (await list('?isActive=false')).body.data.map((c) => c.cameraId),
      ['LIST-06'],
    );
    assert.equal((await list('?isActive=all')).body.pagination.total, 6);
  });

  test('paginates results', async () => {
    const page1 = await list('?limit=2&page=1&sortBy=cameraId&sortOrder=asc');
    const page3 = await list('?limit=2&page=3&sortBy=cameraId&sortOrder=asc');
    assert.deepEqual(
      page1.body.data.map((c) => c.cameraId),
      ['LIST-01', 'LIST-02'],
    );
    assert.deepEqual(
      page3.body.data.map((c) => c.cameraId),
      ['LIST-05'],
    );
    assert.deepEqual(page3.body.pagination, { page: 3, limit: 2, total: 5, totalPages: 3 });
  });

  test('sorts by the requested field and direction', async () => {
    const desc = await list('?sortBy=name&sortOrder=desc');
    assert.deepEqual(
      desc.body.data.map((c) => c.name),
      ['Echo Gate', 'Delta Loading Bay', 'Charlie Parking', 'Bravo Lobby', 'Alpha Gate'],
    );
  });

  test('rejects invalid query parameters', async () => {
    for (const query of ['?status=BROKEN', '?limit=500', '?page=0', '?sortBy=streamUrl']) {
      assert.equal((await list(query)).status, 400, query);
    }
  });

  test('GET /api/cameras/filter-options returns distinct departments and zones', async () => {
    const res = await list('/filter-options');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data, {
      departments: ['Facilities', 'Logistics', 'Security'],
      zones: ['East', 'North', 'South'],
    });
  });

  test('GET /api/cameras/locations returns every active camera with map fields only', async () => {
    const res = await list('/locations');
    assert.equal(res.status, 200);
    assert.deepEqual(
      res.body.data.map((c) => c.cameraId),
      ['LIST-01', 'LIST-02', 'LIST-03', 'LIST-04', 'LIST-05'],
    );
    assert.deepEqual(Object.keys(res.body.data[0]).sort(), [
      'cameraId',
      'department',
      'id',
      'latitude',
      'longitude',
      'name',
      'status',
      'zone',
    ]);
    assert.equal((await api.request('GET', '/cameras/locations')).status, 401);
  });
});

describe('GET /api/cameras/:id', () => {
  test('returns the camera', async () => {
    const camera = await createCamera({ cameraId: 'cam-get' });
    const res = await api.request('GET', `/cameras/${camera.id}`, { token: adminToken });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.cameraId, 'CAM-GET');
  });

  test('returns 404 for an unknown id and 400 for a malformed id', async () => {
    const missing = await api.request('GET', '/cameras/0123456789abcdef01234567', {
      token: adminToken,
    });
    assert.equal(missing.status, 404);
    const malformed = await api.request('GET', '/cameras/not-an-id', { token: adminToken });
    assert.equal(malformed.status, 400);
  });
});

describe('PUT /api/cameras/:id', () => {
  test('replaces the configuration and clears omitted optional fields', async () => {
    const camera = await createCamera({ cameraId: 'cam-put', status: 'ONLINE' });
    const {
      department: _department,
      zone: _zone,
      ...withoutOptional
    } = validCamera({
      cameraId: 'cam-put-renamed',
      name: 'Renamed Gate',
      latitude: 20,
      cameraType: undefined,
      storageMetadata: undefined,
    });

    const res = await api.request('PUT', `/cameras/${camera.id}`, {
      token: adminToken,
      body: withoutOptional,
    });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    const updated = res.body.data;
    assert.equal(updated.cameraId, 'CAM-PUT-RENAMED');
    assert.equal(updated.name, 'Renamed Gate');
    assert.equal(updated.latitude, 20);
    assert.equal(updated.department, undefined);
    assert.equal(updated.zone, undefined);
    assert.equal(updated.cameraType, 'OTHER');
    assert.equal(updated.storageMetadata.storageType, 'LOCAL');
    assert.equal(updated.status, 'ONLINE', 'status is not managed by PUT');
  });

  test('rejects status in the body; status changes go through PATCH /status', async () => {
    const camera = await createCamera({ cameraId: 'cam-put-status' });
    const res = await api.request('PUT', `/cameras/${camera.id}`, {
      token: adminToken,
      body: validCamera({ cameraId: 'cam-put-status', status: 'ONLINE' }),
    });
    assert.equal(res.status, 400);
  });

  test('requires the full configuration', async () => {
    const camera = await createCamera({ cameraId: 'cam-put-partial' });
    const res = await api.request('PUT', `/cameras/${camera.id}`, {
      token: adminToken,
      body: { name: 'Only name' },
    });
    assert.equal(res.status, 400);
  });

  test('returns 409 when renaming to an existing cameraId and 404 for an unknown camera', async () => {
    await createCamera({ cameraId: 'cam-taken' });
    const camera = await createCamera({ cameraId: 'cam-rename' });
    const conflict = await api.request('PUT', `/cameras/${camera.id}`, {
      token: adminToken,
      body: validCamera({ cameraId: 'cam-taken' }),
    });
    assert.equal(conflict.status, 409);

    const missing = await api.request('PUT', '/cameras/0123456789abcdef01234567', {
      token: adminToken,
      body: validCamera({ cameraId: 'cam-ghost' }),
    });
    assert.equal(missing.status, 404);
  });

  test('re-enables a disabled camera when isActive is true', async () => {
    const camera = await createCamera({ cameraId: 'cam-reenable' });
    await api.request('DELETE', `/cameras/${camera.id}`, { token: adminToken });
    const res = await api.request('PUT', `/cameras/${camera.id}`, {
      token: adminToken,
      body: validCamera({ cameraId: 'cam-reenable', isActive: true }),
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.isActive, true);
  });
});

describe('PATCH /api/cameras/:id/status', () => {
  test('updates status and lastHeartbeat', async () => {
    const camera = await createCamera({ cameraId: 'cam-status' });
    const heartbeat = '2026-09-27T10:00:00.000Z';
    const res = await api.request('PATCH', `/cameras/${camera.id}/status`, {
      token: adminToken,
      body: { status: 'DEGRADED', lastHeartbeat: heartbeat },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'DEGRADED');
    assert.equal(res.body.data.lastHeartbeat, heartbeat);
  });

  test('rejects invalid status values and extra fields', async () => {
    const camera = await createCamera({ cameraId: 'cam-status-bad' });
    for (const body of [{ status: 'BROKEN' }, {}, { status: 'ONLINE', name: 'x' }]) {
      const res = await api.request('PATCH', `/cameras/${camera.id}/status`, {
        token: adminToken,
        body,
      });
      assert.equal(res.status, 400, JSON.stringify(body));
    }
  });
});

describe('DELETE /api/cameras/:id', () => {
  test('soft-disables the camera and is idempotent', async () => {
    const camera = await createCamera({ cameraId: 'cam-delete' });

    const first = await api.request('DELETE', `/cameras/${camera.id}`, { token: adminToken });
    assert.equal(first.status, 200);
    assert.equal(first.body.data.isActive, false);

    const second = await api.request('DELETE', `/cameras/${camera.id}`, { token: adminToken });
    assert.equal(second.status, 200);

    const stillReadable = await api.request('GET', `/cameras/${camera.id}`, { token: adminToken });
    assert.equal(stillReadable.status, 200);
    assert.equal(stillReadable.body.data.isActive, false);
  });
});

describe('audit logging', () => {
  test('records create, update, status change and disable actions', async () => {
    const { AuditLog } = await import('../src/models/index.js');
    const camera = await createCamera({ cameraId: 'cam-audit' });
    await api.request('PUT', `/cameras/${camera.id}`, {
      token: adminToken,
      body: validCamera({ cameraId: 'cam-audit', name: 'Audited' }),
    });
    await api.request('PATCH', `/cameras/${camera.id}/status`, {
      token: adminToken,
      body: { status: 'ONLINE' },
    });
    await api.request('DELETE', `/cameras/${camera.id}`, { token: adminToken });
    await api.request('DELETE', `/cameras/${camera.id}`, { token: adminToken });

    const logs = await AuditLog.find({ resourceType: 'CAMERA', resourceId: camera.id }).sort({
      timestamp: 1,
    });
    assert.deepEqual(
      logs.map((log) => log.action),
      ['CREATE', 'UPDATE', 'UPDATE', 'DELETE'],
    );
    assert.deepEqual(logs[1].details.changedFields, ['name']);
    assert.deepEqual(logs[2].details, {
      cameraId: 'CAM-AUDIT',
      field: 'status',
      from: 'OFFLINE',
      to: 'ONLINE',
    });
    assert.ok(logs.every((log) => log.userId && log.ipAddress));
  });
});
