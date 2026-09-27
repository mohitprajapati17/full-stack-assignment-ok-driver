import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { createUser, startTestServer } from './helpers.js';

let api;

before(async () => {
  api = await startTestServer('auth');
  await createUser({ role: 'ADMIN', email: 'admin@test.io' });
  await createUser({ role: 'OPERATOR', email: 'inactive@test.io', isActive: false });
});

after(() => api.stop());

describe('POST /api/auth/login', () => {
  test('returns a token and the user without passwordHash', async () => {
    const res = await api.request('POST', '/auth/login', {
      body: { email: '  ADMIN@test.io ', password: 'Password@123' },
    });
    assert.equal(res.status, 200);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.user.email, 'admin@test.io');
    assert.equal(res.body.data.user.role, 'ADMIN');
    assert.equal(res.body.data.user.passwordHash, undefined);
  });

  test('rejects a wrong password, an unknown email and an inactive user with the same 401', async () => {
    const attempts = [
      { email: 'admin@test.io', password: 'wrong' },
      { email: 'nobody@test.io', password: 'Password@123' },
      { email: 'inactive@test.io', password: 'Password@123' },
    ];
    for (const body of attempts) {
      const res = await api.request('POST', '/auth/login', { body });
      assert.equal(res.status, 401);
      assert.equal(res.body.error.message, 'Invalid email or password');
    }
  });

  test('validates the request body', async () => {
    const res = await api.request('POST', '/auth/login', { body: { email: 'not-an-email' } });
    assert.equal(res.status, 400);
    const paths = res.body.error.details.map((d) => d.path);
    assert.deepEqual(paths.sort(), ['email', 'password']);
  });

  test('rejects malformed JSON with 400', async () => {
    const res = await api.request('POST', '/auth/login', { body: '{"email":' });
    assert.equal(res.status, 400);
  });
});

describe('GET /api/auth/me', () => {
  test('returns the current user for a valid token', async () => {
    const login = await api.request('POST', '/auth/login', {
      body: { email: 'admin@test.io', password: 'Password@123' },
    });
    const res = await api.request('GET', '/auth/me', { token: login.body.data.token });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.email, 'admin@test.io');
  });

  test('rejects missing and invalid tokens', async () => {
    assert.equal((await api.request('GET', '/auth/me')).status, 401);
    assert.equal((await api.request('GET', '/auth/me', { token: 'garbage' })).status, 401);
  });
});
