import mongoose from 'mongoose';

const TEST_MONGODB_BASE_URI = process.env.MONGODB_TEST_BASE_URI ?? 'mongodb://127.0.0.1:27017';

/**
 * Starts the API on a random port against an isolated database, e.g. `okdriver_test_cameras`.
 * Env vars must be set before any app module is imported, hence the dynamic imports.
 */
export async function startTestServer(name) {
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = `${TEST_MONGODB_BASE_URI}/okdriver_test_${name}`;
  process.env.JWT_SECRET = 'test-jwt-secret-that-is-at-least-32-characters-long';

  const { connectDB, disconnectDB, syncIndexes } = await import('../src/config/db.js');
  const { createApp } = await import('../src/app.js');

  await connectDB();
  await mongoose.connection.dropDatabase();
  await syncIndexes();

  const server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}/api`;

  async function request(method, path, { token, body } = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
    });
    const text = await response.text();
    return {
      status: response.status,
      headers: response.headers,
      body: text ? JSON.parse(text) : null,
    };
  }

  async function stop() {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.dropDatabase();
    await disconnectDB();
  }

  return { request, stop };
}

export async function createUser({ role, email, password = 'Password@123', isActive = true }) {
  const { User } = await import('../src/models/index.js');
  const { hashPassword } = await import('../src/utils/password.js');
  return User.create({
    name: `${role} tester`,
    email,
    role,
    isActive,
    passwordHash: await hashPassword(password),
  });
}

export async function loginAs(request, email, password = 'Password@123') {
  const res = await request('POST', '/auth/login', { body: { email, password } });
  if (res.status !== 200) throw new Error(`Login failed for ${email}: ${JSON.stringify(res.body)}`);
  return res.body.data.token;
}
