import { expect, test } from '@playwright/test';

test('critical API CRUD and reset restore the frozen seed', async ({
  request,
}) => {
  const health = await request.get('health');
  expect(await health.json()).toMatchObject({
    metrics: {
      requestCount: expect.any(Number),
      p95LatencyMs: expect.any(Number),
      realErrorRate: expect.any(Number),
      simulatedErrorsExcluded: true,
    },
  });
  const sessionResponse = await request.post('lab/session?expiresIn=120', {
    headers: { 'X-Lab-Mode': 'header' },
  });
  expect(sessionResponse.status()).toBe(201);
  const session = (await sessionResponse.json()).data.sessionId as string;
  const headers = { 'X-Lab-Session': session };
  const id = 'cus-hardening-4803';

  expect(
    (
      await request.post('customers', {
        headers,
        data: {
          id,
          name: 'Hardening Customer',
          email: 'hardening@example.test',
          city: 'Pune',
          tier: 'gold',
          active: true,
        },
      })
    ).status(),
  ).toBe(201);
  expect((await request.get(`customers/${id}`, { headers })).status()).toBe(
    200,
  );
  expect(
    (
      await request.patch(`customers/${id}`, {
        headers,
        data: { city: 'Mumbai' },
      })
    ).status(),
  ).toBe(200);
  expect((await request.delete(`customers/${id}`, { headers })).status()).toBe(
    204,
  );
  expect(
    (await request.post('lab/reset', { headers, data: {} })).status(),
  ).toBe(200);
  expect((await request.get(`customers/${id}`, { headers })).status()).toBe(
    404,
  );
});
