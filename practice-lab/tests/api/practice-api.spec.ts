import { expect, test, type APIRequestContext } from '@playwright/test';

const configuredOrigin = process.env.PRACTICE_LAB_API_BASE_URL;
if (!configuredOrigin) {
  throw new Error('PRACTICE_LAB_API_BASE_URL is required for live API tests.');
}
const origin = configuredOrigin.replace(/\/$/, '');

async function createHeaderSession(
  request: APIRequestContext,
  expiresIn = 120,
) {
  const suffix = `?expiresIn=${expiresIn}`;
  const response = await request.post(`lab/session${suffix}`, {
    headers: { 'X-Lab-Mode': 'header' },
  });
  expect(response.status()).toBe(201);
  const body = await response.json();
  expect(body.data.mode).toBe('header');
  return body.data.sessionId as string;
}

function headers(session: string) {
  return { 'X-Lab-Session': session };
}

const payloads: Record<string, Record<string, unknown>> = {
  users: {
    name: 'Automation User',
    email: 'automation.user@example.test',
    role: 'learner',
    active: true,
  },
  products: {
    name: 'Practice keyboard',
    sku: 'SKU-LIVE-001',
    category: 'Electronics',
    price: 2499,
    stock: 12,
    rating: 4.4,
  },
  orders: {
    customerId: 'cus-001',
    status: 'pending',
    total: 2499,
    items: [{ productId: 'prd-001', quantity: 1, price: 2499 }],
  },
  customers: {
    name: 'Practice Customer',
    email: 'practice.customer@example.test',
    city: 'Pune',
    tier: 'gold',
    active: true,
  },
  employees: {
    name: 'Practice Engineer',
    department: 'Quality Assurance',
    location: 'Pune',
    title: 'QA Engineer',
    active: true,
  },
  tasks: {
    title: 'Validate API',
    status: 'todo',
    priority: 'high',
    assigneeId: 'emp-001',
    dueDate: '2026-10-31',
  },
  tickets: {
    subject: 'Synthetic issue',
    status: 'open',
    priority: 'medium',
    customerId: 'cus-001',
    assigneeId: 'emp-001',
  },
  bookings: {
    guestName: 'Practice Guest',
    city: 'Mumbai',
    checkIn: '2026-11-01',
    checkOut: '2026-11-03',
    status: 'confirmed',
    total: 5400,
  },
};

test('health, OpenAPI, docs and cache/indexing headers are safe', async ({
  request,
}) => {
  const health = await request.get('health');
  expect(health.status()).toBe(200);
  expect(health.headers()['x-robots-tag']).toContain('noindex');
  expect(health.headers()['cache-control']).toContain('no-store');
  expect(await health.json()).toMatchObject({
    status: 'ok',
    version: '1.0.0',
    fixtureVersion: '1.0.0',
    storage: { status: 'ok', driver: 'sqlite' },
  });

  const openapi = await request.get('openapi.json');
  expect(openapi.status()).toBe(200);
  expect(await openapi.json()).toMatchObject({
    openapi: '3.1.0',
    info: { title: 'Testheon Practice API', version: '1.0.0' },
  });

  const docs = await request.get(`${origin}/practice/api/`);
  expect(docs.status()).toBe(200);
  expect(await docs.text()).toContain('Testheon Practice API');
  expect(docs.headers()['x-robots-tag']).toContain('noindex');
});

for (const [resource, payload] of Object.entries(payloads)) {
  test(`${resource} supports every REST verb`, async ({ request }) => {
    const session = await createHeaderSession(request);
    const list = await request.get(`${resource}?limit=2`, {
      headers: headers(session),
    });
    expect(list.status()).toBe(200);
    expect(Number(list.headers()['x-total-count'])).toBeGreaterThan(0);

    const id = `${resource.slice(0, 3)}-live-${resource.length}`;
    const created = await request.post(`${resource}`, {
      headers: headers(session),
      data: { id, ...payload },
    });
    expect(created.status()).toBe(201);
    expect(created.headers().location).toContain(`/${resource}/${id}`);

    const duplicate = await request.post(`${resource}`, {
      headers: headers(session),
      data: { id, ...payload },
    });
    expect(duplicate.status()).toBe(409);

    const fetched = await request.get(`${resource}/${id}`, {
      headers: headers(session),
    });
    expect(fetched.status()).toBe(200);
    expect((await fetched.json()).data.id).toBe(id);

    const replacedPayload = { ...payload };
    const replaced = await request.put(`${resource}/${id}`, {
      headers: headers(session),
      data: replacedPayload,
    });
    expect(replaced.status()).toBe(200);

    const patchField = Object.keys(payload)[0] ?? 'name';
    const patched = await request.patch(`${resource}/${id}`, {
      headers: headers(session),
      data: { [patchField]: payload[patchField] },
    });
    expect(patched.status()).toBe(200);

    const removed = await request.delete(`${resource}/${id}`, {
      headers: headers(session),
    });
    expect(removed.status()).toBe(204);
    const missing = await request.get(`${resource}/${id}`, {
      headers: headers(session),
    });
    expect(missing.status()).toBe(404);
  });
}

test('page, cursor, sorting, filters, search, seed and size are deterministic', async ({
  request,
}) => {
  const session = await createHeaderSession(request);
  const paged = await request.get(
    'users?page=2&limit=5&sort=name,-id&role=learner&q=example.test',
    { headers: headers(session) },
  );
  expect(paged.status()).toBe(200);
  expect(paged.headers().link).toBeTruthy();
  const pageBody = await paged.json();
  expect(pageBody.meta).toMatchObject({ page: 2, limit: 5 });

  const first = await request.get('products?limit=7&seed=42&size=small', {
    headers: headers(session),
  });
  const firstBody = await first.json();
  expect(firstBody.meta.total).toBe(10);
  expect(firstBody.meta.nextCursor).toBeTruthy();
  const replay = await request.get('products?limit=7&seed=42&size=small', {
    headers: headers(session),
  });
  const replayBody = await replay.json();
  expect(replayBody.data).toEqual(firstBody.data);
  expect(replayBody.meta).toEqual(firstBody.meta);
  const second = await request.get(
    `products?limit=7&seed=42&size=small&cursor=${encodeURIComponent(firstBody.meta.nextCursor)}`,
    { headers: headers(session) },
  );
  expect(second.status()).toBe(200);
  expect((await second.json()).data.length).toBe(3);

  const employees = await request.get('employees?limit=4', {
    headers: headers(session),
  });
  expect((await employees.json()).meta.nextCursor).toBeTruthy();
});

test('delay, status simulation and validation statuses are controlled', async ({
  request,
}) => {
  const session = await createHeaderSession(request);
  const started = Date.now();
  const delayed = await request.get('users?delay=30&limit=1', {
    headers: headers(session),
  });
  expect(delayed.status()).toBe(200);
  expect(Date.now() - started).toBeGreaterThanOrEqual(20);

  for (const status of [400, 401, 403, 404, 409, 422, 429, 500, 503]) {
    const response = await request.get(`sim/status/${status}`);
    expect(response.status()).toBe(status);
    expect((await response.json()).error.code).toBe(`SIMULATED_${status}`);
    if (status === 429) expect(response.headers()['retry-after']).toBe('60');
  }

  const badQuery = await request.get('users?limit=101', {
    headers: headers(session),
  });
  expect(badQuery.status()).toBe(400);
  const invalid = await request.post('users', {
    headers: headers(session),
    data: { name: '' },
  });
  expect(invalid.status()).toBe(422);
  const stale = await request.get('users', {
    headers: headers('0'.repeat(48)),
  });
  expect(stale.status()).toBe(401);
});

test('two sandboxes are isolated and reset restores seed data', async ({
  request,
}) => {
  const a = await createHeaderSession(request);
  const b = await createHeaderSession(request);
  const id = 'usr-isolation-proof';
  const created = await request.post('users', {
    headers: headers(a),
    data: {
      id,
      name: 'Session A',
      email: 'session.a@example.test',
      role: 'learner',
      active: true,
    },
  });
  expect(created.status()).toBe(201);
  expect(
    (await request.get(`users/${id}`, { headers: headers(a) })).status(),
  ).toBe(200);
  expect(
    (await request.get(`users/${id}`, { headers: headers(b) })).status(),
  ).toBe(404);

  const reset = await request.post('lab/reset', { headers: headers(a) });
  expect(reset.status()).toBe(200);
  expect(
    (await request.get(`users/${id}`, { headers: headers(a) })).status(),
  ).toBe(404);
  const stats = await request.get('lab/session', { headers: headers(a) });
  expect((await stats.json()).data.overlayRecords).toBe(0);
});

test('expiry and simulated rate limiting are deterministic', async ({
  request,
}) => {
  const expiring = await createHeaderSession(request, 1);
  await new Promise((resolve) => setTimeout(resolve, 2100));
  const expired = await request.get('users?limit=1', {
    headers: headers(expiring),
  });
  expect(expired.status()).toBe(401);
  expect((await expired.json()).error.code).toBe('SESSION_EXPIRED');

  const session = await createHeaderSession(request);
  const statuses: number[] = [];
  let retryAfter: string | undefined;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await request.get('sim/rate-limit?limit=2', {
      headers: headers(session),
    });
    statuses.push(response.status());
    if (response.status() === 429) {
      retryAfter = response.headers()['retry-after'];
      break;
    }
  }
  expect(statuses.at(-1)).toBe(429);
  expect(
    statuses.filter((status) => status === 200).length,
  ).toBeGreaterThanOrEqual(2);
  expect(retryAfter).toBe('60');
});

test('injection strings remain data and traversal and oversized bodies fail', async ({
  request,
}) => {
  const session = await createHeaderSession(request);
  const injection = "Robert'); DROP TABLE lab_sessions;--";
  const created = await request.post('users', {
    headers: headers(session),
    data: {
      id: 'usr-sql-string',
      name: injection,
      email: 'sql.string@example.test',
      role: 'learner',
      active: true,
    },
  });
  expect(created.status()).toBe(201);
  expect((await created.json()).data.name).toBe(injection);
  expect((await request.get('health')).status()).toBe(200);

  const traversal = await request.get('users/%252e%252e%252fhealth', {
    headers: headers(session),
  });
  expect([400, 404]).toContain(traversal.status());
  const oversized = await request.post('users', {
    headers: { ...headers(session), 'Content-Type': 'application/json' },
    data: {
      name: 'x'.repeat(70_000),
      email: 'large@example.test',
      role: 'learner',
      active: true,
    },
  });
  expect(oversized.status()).toBe(413);
});

test('cookie mutations require origin and CSRF, and localhost CORS is explicit', async ({
  request,
}) => {
  const sessionResponse = await request.get('lab/session');
  const session = (await sessionResponse.json()).data;
  const rejected = await request.post('users', {
    data: { id: 'usr-cookie-rejected', ...payloads.users },
  });
  expect(rejected.status()).toBe(403);
  const accepted = await request.post('users', {
    headers: { Origin: origin, 'X-Lab-CSRF': session.csrfToken },
    data: {
      id: 'usr-cookie-accepted',
      ...payloads.users,
      email: 'cookie.accepted@example.test',
    },
  });
  expect(accepted.status()).toBe(201);

  const preflight = await request.fetch('users', {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://localhost:5173',
      'Access-Control-Request-Method': 'GET',
    },
  });
  expect(preflight.status()).toBe(204);
  expect(preflight.headers()['access-control-allow-origin']).toBe(
    'http://localhost:5173',
  );
  expect(
    preflight.headers()['access-control-allow-credentials'],
  ).toBeUndefined();
});
