import { expect, test, type APIRequestContext } from '@playwright/test';

async function createSession(request: APIRequestContext): Promise<string> {
  const response = await request.post('lab/session?expiresIn=120', {
    headers: { 'X-Lab-Mode': 'header' },
  });
  expect(response.status()).toBe(201);
  return (await response.json()).data.sessionId as string;
}

const credentials = {
  username: 'manager_user',
  password: 'Practice@123',
};

test('bearer tokens enforce 401, 403, expiry, and refresh rotation', async ({
  request,
}) => {
  const session = await createSession(request);
  const headers = { 'X-Lab-Session': session };
  const unauthenticated = await request.get(
    'auth/protected?permission=reports.read',
    { headers },
  );
  expect(unauthenticated.status()).toBe(401);
  expect((await unauthenticated.json()).error.code).toBe('AUTH_REQUIRED');

  const issued = await request.post('auth/token', {
    headers,
    data: credentials,
  });
  expect(issued.status()).toBe(200);
  const tokens = (await issued.json()).data;
  expect(tokens).toMatchObject({ tokenType: 'Bearer', expiresIn: 120 });

  const bearerHeaders = {
    ...headers,
    Authorization: `Bearer ${tokens.accessToken}`,
  };
  const identity = await request.get('auth/me', { headers: bearerHeaders });
  expect(identity.status()).toBe(200);
  expect((await identity.json()).data.user).toMatchObject({
    username: 'manager_user',
    role: 'Manager',
  });
  expect(
    (
      await request.get('auth/protected?permission=reports.read', {
        headers: bearerHeaders,
      })
    ).status(),
  ).toBe(200);
  const forbidden = await request.get(
    'auth/protected?permission=users.manage',
    { headers: bearerHeaders },
  );
  expect(forbidden.status()).toBe(403);
  expect((await forbidden.json()).error.code).toBe('PERMISSION_DENIED');

  const refreshed = await request.post('auth/refresh', {
    headers,
    data: { refreshToken: tokens.refreshToken },
  });
  expect(refreshed.status()).toBe(200);
  const reused = await request.post('auth/refresh', {
    headers,
    data: { refreshToken: tokens.refreshToken },
  });
  expect(reused.status()).toBe(401);
  expect((await reused.json()).error.code).toBe('REFRESH_TOKEN_INVALID');

  const expired = await request.post('auth/token', {
    headers,
    data: { ...credentials, scenario: 'expired' },
  });
  const expiredToken = (await expired.json()).data.accessToken as string;
  const rejected = await request.get('auth/me', {
    headers: { ...headers, Authorization: `Bearer ${expiredToken}` },
  });
  expect(rejected.status()).toBe(401);
  expect((await rejected.json()).error.code).toBe('TOKEN_EXPIRED');
});

test('API key and UI session-cookie authentication are isolated and revocable', async ({
  request,
}) => {
  const session = await createSession(request);
  const headers = { 'X-Lab-Session': session };
  const validKey = await request.get('auth/api-key/profile', {
    headers: {
      ...headers,
      'X-Practice-Api-Key': 'testheon-demo-key-4803',
    },
  });
  expect(validKey.status()).toBe(200);
  expect((await validKey.json()).data.principal).toBe('public_demo_api_key');
  const invalidKey = await request.get('auth/api-key/profile', {
    headers: { ...headers, 'X-Practice-Api-Key': 'wrong-key' },
  });
  expect(invalidKey.status()).toBe(401);

  const login = await request.post('auth/login', {
    headers,
    data: {
      username: 'standard_user',
      password: 'Practice@123',
      idleSeconds: 60,
      rememberMe: false,
    },
  });
  expect(login.status()).toBe(200);
  const setCookie = (login.headers()['set-cookie'] ?? '').toLowerCase();
  expect(setCookie).toContain('practice_auth=');
  expect(setCookie).toContain('httponly');
  expect(setCookie).toContain('secure');
  const me = await request.get('auth/me', { headers });
  expect(me.status()).toBe(200);
  expect((await me.json()).data.authentication).toBe('cookie');
  expect((await request.post('auth/logout', { headers })).status()).toBe(200);
  expect((await request.get('auth/me', { headers })).status()).toBe(401);
});

test('registration, generic reset request, Practice Inbox, and password reset work', async ({
  request,
}) => {
  const session = await createSession(request);
  const headers = { 'X-Lab-Session': session };
  const registered = await request.post('auth/register', {
    headers,
    data: {
      username: 'api_learner',
      displayName: 'API Learner',
      email: 'api.learner@practice.test',
      password: 'Sandbox@4803',
    },
  });
  expect(registered.status()).toBe(201);
  expect((await registered.json()).data.user.role).toBe('Customer');

  const existing = await request.post('auth/forgot-password', {
    headers,
    data: { username: 'api_learner' },
  });
  const missing = await request.post('auth/forgot-password', {
    headers,
    data: { username: 'does_not_exist' },
  });
  expect(existing.status()).toBe(202);
  expect(missing.status()).toBe(202);
  expect((await existing.json()).data.message).toBe(
    (await missing.json()).data.message,
  );
  const inbox = await request.get('auth/inbox', { headers });
  const message = (await inbox.json()).data.find(
    (entry: { to: string }) => entry.to === 'api_learner',
  );
  expect(message.resetUrl).toContain('?reset=rst_');
  const token = new URL(
    message.resetUrl,
    'https://practice.test',
  ).searchParams.get('reset');
  const reset = await request.post('auth/reset-password', {
    headers,
    data: { token, newPassword: 'Changed@4803' },
  });
  expect(reset.status()).toBe(200);
  const login = await request.post('auth/token', {
    headers,
    data: { username: 'api_learner', password: 'Changed@4803' },
  });
  expect(login.status()).toBe(200);
});

test('temporary lockout resets while locked and expired demo scenarios stay explicit', async ({
  request,
}) => {
  const session = await createSession(request);
  const headers = { 'X-Lab-Session': session };
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const failed = await request.post('auth/login', {
      headers,
      data: {
        username: 'standard_user',
        password: 'wrong-password',
        idleSeconds: 60,
      },
    });
    expect(failed.status()).toBe(401);
    expect((await failed.json()).error.code).toBe('AUTHENTICATION_FAILED');
  }
  const locked = await request.post('auth/login', {
    headers,
    data: {
      username: 'standard_user',
      password: 'Practice@123',
      idleSeconds: 60,
    },
  });
  expect(locked.status()).toBe(401);
  await request.post('auth/lockout/reset', {
    headers,
    data: { username: 'standard_user' },
  });
  expect(
    (
      await request.post('auth/login', {
        headers,
        data: {
          username: 'standard_user',
          password: 'Practice@123',
          idleSeconds: 60,
        },
      })
    ).status(),
  ).toBe(200);

  const permanent = await request.post('auth/token', {
    headers,
    data: { username: 'locked_user', password: 'Practice@123' },
  });
  expect(permanent.status()).toBe(401);
  const expired = await request.post('auth/token', {
    headers,
    data: { username: 'expired_user', password: 'Practice@123' },
  });
  expect(expired.status()).toBe(409);
  expect((await expired.json()).error.code).toBe('PASSWORD_CHANGE_REQUIRED');
});

test('slow_user defaults to a deterministic three-second sign-in', async ({
  request,
}) => {
  const session = await createSession(request);
  const started = Date.now();
  const response = await request.post('auth/token', {
    headers: { 'X-Lab-Session': session },
    data: { username: 'slow_user', password: 'Practice@123' },
  });
  const elapsed = Date.now() - started;
  expect(response.status()).toBe(200);
  expect(elapsed).toBeGreaterThanOrEqual(2800);
  expect(elapsed).toBeLessThan(5000);
});
