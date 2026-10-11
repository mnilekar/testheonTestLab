import { expect, test } from './test-fixture';
import catalogue from '../../content/challenges/challenges.json' with { type: 'json' };
import manifest from '../../fixtures/manifest.json' with { type: 'json' };

const fixtureUrls = new Map(
  manifest.fixtures.map((fixture) => [fixture.id, fixture.url]),
);

test.describe('published solution targets', () => {
  for (const challenge of catalogue.challenges) {
    test(`${challenge.id} solution target is executable`, async ({
      page,
    }, testInfo) => {
      test.skip(
        testInfo.project.name === 'mobile-chrome',
        'Solution contracts run once on desktop.',
      );
      const fixtureId = challenge.relatedFixtures.at(0);
      const target = fixtureId ? fixtureUrls.get(fixtureId) : undefined;
      if (!target) throw new Error(`${challenge.id} has no fixture target.`);
      const response = await page.goto(target);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toBeVisible();
    });
  }
});

test('PW-AUTH-001 logs in as standard_user and reveals Account dashboard', async ({
  page,
}) => {
  await page.route('**/practice/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname.replace(
      '/practice/api/v1/',
      '',
    );
    const fulfill = (body: unknown, status = 200) =>
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    if (path === 'lab/session')
      return fulfill({ data: { csrfToken: 'challenge-csrf' } });
    if (path === 'auth/roles' || path === 'auth/inbox')
      return fulfill({ data: [] });
    if (path === 'auth/login')
      return fulfill({
        data: {
          user: {
            username: 'standard_user',
            displayName: 'Standard User',
            role: 'Customer',
          },
          session: { idleTtlSeconds: 300 },
        },
      });
    if (path === 'auth/me')
      return fulfill(
        { error: { code: 'AUTH_REQUIRED', message: 'Sign in.' } },
        401,
      );
    return fulfill({ data: {} });
  });
  await page.goto('/practice/apps/auth/');
  const login = page.locator('#login-form');
  await login.getByLabel('Username').fill('standard_user');
  await login.getByLabel('Password').fill('Practice@123');
  await login.getByRole('button', { name: 'Sign in to Practice' }).click();
  await expect(
    page.getByRole('heading', { name: 'Account dashboard' }),
  ).toBeVisible();
  await expect(page.getByTestId('signed-in-user')).toContainText(
    'standard_user',
  );
});

test('PW-ECOM-002 searches a laptop below ₹50,000 and verifies cart quantity', async ({
  page,
}) => {
  const laptop = {
    id: 'prd-001',
    name: 'Arka 14 Laptop',
    sku: 'SKU-0001',
    category: 'Electronics',
    price: 49999,
    stock: 12,
    rating: 4.8,
    currency: 'INR',
    summary: 'Synthetic laptop.',
    images: [
      { src: '/practice/images/store/electronics.svg', alt: 'Arka 14 Laptop' },
    ],
    variants: [{ name: 'Colour', values: ['Testheon violet'] }],
    reviews: [],
  };
  type Cart = {
    items: Array<{
      productId: string;
      name: string;
      variant: string;
      quantity: number;
      price: number;
      lineTotal: number;
    }>;
    itemCount: number;
    subtotal: number;
    coupon: string | null;
    discount: number;
    total: number;
  };
  const empty: Cart = {
    items: [],
    itemCount: 0,
    subtotal: 0,
    coupon: null,
    discount: 0,
    total: 0,
  };
  let cart: Cart = empty;
  await page.route('**/practice/api/v1/lab/session', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: { csrfToken: 'csrf' } }),
    }),
  );
  await page.route('**/practice/api/v1/store/catalog?*', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        data: [laptop],
        meta: {
          total: 1,
          page: 1,
          pages: 1,
          limit: 12,
          categories: ['Electronics'],
        },
      }),
    }),
  );
  await page.route('**/practice/api/v1/store/cart', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: cart }),
    }),
  );
  await page.route('**/practice/api/v1/store/cart/items', async (route) => {
    cart = {
      ...empty,
      items: [
        {
          productId: 'prd-001',
          name: laptop.name,
          variant: 'Default',
          quantity: 1,
          price: laptop.price,
          lineTotal: laptop.price,
        },
      ],
      itemCount: 1,
      subtotal: laptop.price,
      total: laptop.price,
    };
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ data: cart }),
    });
  });
  await page.goto('/practice/apps/ecommerce/products/');
  await page.getByLabel('Search').fill('laptop');
  await page.getByLabel(/Maximum price/).fill('50000');
  await page.getByRole('button', { name: 'Apply filters' }).click();
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await page.goto('/practice/apps/ecommerce/cart/');
  await expect(page.getByLabel(`Quantity for ${laptop.name}`)).toHaveValue('1');
});

test('PW-APIUI-001 creates a customer through API and verifies the UI table', async ({
  page,
}) => {
  const created = {
    id: 'cus-local-001',
    name: 'Mira Challenge',
    email: 'mira.challenge@example.test',
    city: 'Pune',
    tier: 'gold',
    active: true,
  };
  const rows = [created];
  await page.route('**/practice/api/v1/lab/session', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: { csrfToken: 'csrf' } }),
    }),
  );
  await page.route('**/practice/api/v1/customers?*', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: rows, meta: { total: rows.length } }),
    }),
  );
  await page.route('**/practice/api/v1/employees?*', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: [], meta: { total: 0 } }),
    }),
  );
  await page.goto('/practice/components/tables/');
  await page.getByRole('button', { name: 'Refresh customer table' }).click();
  const row = page.getByRole('row').filter({ hasText: created.id });
  await expect(row).toContainText('Mira Challenge');
  await expect(row).toContainText('Pune');
});

test('PW-AUTH-004 reuses API auth and renders an intercepted orders 500', async ({
  page,
  context,
}) => {
  await page.route('**/practice/api/v1/lab/session', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: { csrfToken: 'csrf' } }),
    }),
  );
  await page.route('**/practice/api/v1/auth/login', (route) =>
    route.fulfill({
      headers: {
        'set-cookie':
          'practice_session=challenge; Path=/practice; HttpOnly; SameSite=Lax',
      },
      contentType: 'application/json',
      body: JSON.stringify({
        data: { user: { username: 'standard_user', role: 'Customer' } },
      }),
    }),
  );
  await page.route('**/practice/api/v1/store/cart', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        data: { items: [], itemCount: 0, subtotal: 0, total: 0 },
      }),
    }),
  );
  await page.route('**/practice/api/v1/store/orders', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        error: {
          code: 'ORDERS_UNAVAILABLE',
          message: 'Simulated orders failure.',
        },
      }),
    }),
  );
  await page.goto('/practice/apps/auth/');
  await page.evaluate(async () =>
    fetch('/practice/api/v1/auth/login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-Lab-CSRF': 'csrf' },
      body: JSON.stringify({
        username: 'standard_user',
        password: 'Practice@123',
      }),
    }),
  );
  expect(
    (await context.cookies()).some(
      (cookie) => cookie.name === 'practice_session',
    ),
  ).toBe(true);
  await page.goto('/practice/apps/ecommerce/orders/');
  await expect(page.getByRole('alert')).toContainText('ORDERS_UNAVAILABLE');
});
