import { expect, test } from '@playwright/test';

const hubs = [
  '/practice/',
  '/practice/components/',
  '/practice/playwright/',
  '/practice/challenges/',
  '/practice/playwright/api-testing/',
  '/practice/apps/auth/',
  '/practice/apps/ecommerce/',
] as const;

test('every learner hub renders its primary contract', async ({ page }) => {
  for (const url of hubs) {
    const response = await page.goto(url);
    expect(response?.status(), url).toBe(200);
    await expect(page.getByRole('heading', { level: 1 }), url).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]'), url).toHaveCount(1);
    await expect(page.locator('#main-content'), url).toBeVisible();
  }
});

test('login produces reusable Playwright storage state', async ({
  page,
  context,
  browser,
}) => {
  let signedIn = false;
  await page.route('**/practice/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname.replace(
      '/practice/api/v1/',
      '',
    );
    const fulfill = (
      body: unknown,
      status = 200,
      headers: Record<string, string> = {},
    ) =>
      route.fulfill({
        status,
        headers,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    if (path === 'lab/session')
      return fulfill({ data: { csrfToken: 'smoke-csrf' } });
    if (path === 'auth/roles') return fulfill({ data: [] });
    if (path === 'auth/inbox') return fulfill({ data: [] });
    if (path === 'auth/login') {
      signedIn = true;
      return fulfill(
        {
          data: {
            user: { username: 'standard_user', role: 'Customer', demo: true },
            session: { idleTtlSeconds: 300 },
          },
        },
        200,
        {
          'Set-Cookie':
            'lab_auth=storage-state-smoke; Path=/practice; HttpOnly; SameSite=Lax',
        },
      );
    }
    if (path === 'auth/me' && signedIn)
      return fulfill({
        data: {
          user: { username: 'standard_user', role: 'Customer', demo: true },
          authentication: 'cookie',
        },
      });
    if (path === 'auth/me')
      return fulfill(
        { error: { code: 'AUTH_REQUIRED', message: 'Sign in.' } },
        401,
      );
    return fulfill({ data: {} });
  });

  await page.goto('/practice/apps/auth/?delay=0');
  const signIn = page.getByRole('region', { name: 'Sign in' });
  await signIn.getByLabel('Username').fill('standard_user');
  await signIn.getByLabel('Password', { exact: true }).fill('Practice@123');
  await signIn.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Signed in as standard_user')).toBeVisible();

  const state = await context.storageState();
  expect(state.cookies).toContainEqual(
    expect.objectContaining({ name: 'lab_auth', value: 'storage-state-smoke' }),
  );
  const reused = await browser.newContext({ storageState: state });
  await expect
    .poll(async () =>
      (await reused.cookies()).some(({ name }) => name === 'lab_auth'),
    )
    .toBe(true);
  await reused.close();
});

test('complete fake checkout reaches a stable confirmation', async ({
  page,
}) => {
  const cart = {
    items: [
      {
        productId: 'prd-001',
        name: 'Practice Headset',
        variant: 'Midnight / Single',
        quantity: 1,
        price: 2400,
        lineTotal: 2400,
      },
    ],
    itemCount: 1,
    subtotal: 2400,
    total: 2400,
  };
  await page.route('**/practice/api/v1/lab/session', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: { csrfToken: 'checkout-smoke-csrf' } }),
    }),
  );
  await page.route('**/practice/api/v1/store/cart', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: cart }),
    }),
  );
  await page.route('**/practice/api/v1/auth/me', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'AUTH_REQUIRED' } }),
    }),
  );
  await page.route('**/practice/api/v1/auth/login', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: { user: { username: 'standard_user' } } }),
    }),
  );
  await page.route('**/practice/api/v1/store/locations', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: { India: { Maharashtra: ['Pune'] } } }),
    }),
  );
  await page.route('**/practice/api/v1/store/checkout', (route) =>
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          order: {
            id: 'ord-hardening-4803',
            status: 'confirmed',
            total: 2499,
            createdAt: '2026-10-12T00:00:00Z',
          },
          shippingCost: 99,
          payment: { charged: false },
        },
      }),
    }),
  );
  await page.goto('/practice/apps/ecommerce/checkout/?visual=stable');
  await page.getByRole('button', { name: 'Sign in and continue' }).click();
  await page.getByRole('button', { name: 'Place fake order' }).click();
  await page.waitForURL('**/confirmation/**');
  await expect(page.getByTestId('confirmed-order-id')).toHaveText(
    'ord-hardening-4803',
  );
});
