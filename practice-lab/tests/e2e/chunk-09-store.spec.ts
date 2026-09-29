import { mkdir } from 'node:fs/promises';
import { expect, test } from './test-fixture';

const product = {
  id: 'prd-001',
  name: 'Practice Headset',
  sku: 'ELE-001',
  category: 'Electronics',
  price: 2400,
  stock: 12,
  rating: 5,
  summary: 'A deterministic headset for ecommerce practice.',
  images: [
    {
      src: '/practice/images/store/electronics.svg',
      alt: 'Practice Headset front view',
    },
    {
      src: '/practice/images/store/product-detail.svg',
      alt: 'Practice Headset detail view',
    },
    {
      src: '/practice/images/store/product-package.svg',
      alt: 'Practice Headset practice packaging',
    },
  ],
  variants: [
    { name: 'Colour', values: ['Testheon violet', 'Midnight', 'Cloud'] },
  ],
  reviews: [
    { author: 'Aarav S.', rating: 5, text: 'Predictable fictional quality.' },
    { author: 'Meera P.', rating: 4, text: 'A stable synthetic review.' },
  ],
};

const emptyCart = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  coupon: null,
  discount: 0,
  total: 0,
};

test.beforeEach(async ({ page }) => {
  await page.route('**/practice/api/v1/lab/session', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: { csrfToken: 'fixture-csrf' } }),
    }),
  );
});

test('store overview is indexable, complete in source, and exposes one-shot scenarios', async ({
  page,
  request,
}) => {
  const source = await (await request.get('/practice/apps/ecommerce/')).text();
  expect(source).toContain('name="robots" content="index,follow"');
  for (const route of [
    'products',
    'product',
    'cart',
    'checkout',
    'confirmation',
    'orders',
    'profile',
  ]) {
    expect(source).toContain(`/practice/apps/ecommerce/${route}/`);
  }
  let armed = '';
  await page.route('**/practice/api/v1/store/cart', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: emptyCart }),
    }),
  );
  await page.route('**/practice/api/v1/store/scenario', async (route) => {
    armed = String(
      (route.request().postDataJSON() as { scenario: string }).scenario,
    );
    await route.fulfill({
      status: 202,
      contentType: 'application/json',
      body: JSON.stringify({ data: { next: armed } }),
    });
  });
  await page.route('**/practice/api/v1/store/catalog?*', (route) => {
    if (armed === 'empty') {
      armed = '';
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ data: [], meta: { scenario: 'empty' } }),
      });
    }
    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        data: [product],
        meta: { total: 1, page: 1, pages: 1, categories: ['Electronics'] },
      }),
    });
  });
  await page.goto('/practice/apps/ecommerce/');
  await expect(
    page.getByRole('heading', { name: 'Practice Headset' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'empty' }).click();
  await page
    .getByRole('button', { name: 'Run next catalogue request' })
    .click();
  await expect(page.locator('#store-scenario-result')).toContainText(
    'EMPTY_ARRAY',
  );
});

test('catalogue sends search, category, price, rating, sort, and page controls', async ({
  page,
}) => {
  const queries: URL[] = [];
  await page.route('**/practice/api/v1/store/cart', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: emptyCart }),
    }),
  );
  await page.route('**/practice/api/v1/store/catalog?*', (route) => {
    queries.push(new URL(route.request().url()));
    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        data: [product],
        meta: {
          total: 13,
          page: queries.length > 2 ? 2 : 1,
          pages: 2,
          limit: 12,
          categories: ['Electronics', 'Home'],
        },
      }),
    });
  });
  await page.goto('/practice/apps/ecommerce/products/');
  await page.getByLabel('Search').fill('Headset');
  await page.getByLabel('Category').selectOption('Electronics');
  await page.getByLabel('Minimum price').fill('1000');
  await page.getByLabel(/Maximum price/).fill('5000');
  await page.getByLabel('Minimum rating').selectOption('4');
  await page.getByLabel('Sort').selectOption('price-asc');
  await page.getByRole('button', { name: 'Apply filters' }).click();
  const applied = queries.at(-1)?.searchParams;
  expect(applied?.get('q')).toBe('Headset');
  expect(applied?.get('category')).toBe('Electronics');
  expect(applied?.get('minPrice')).toBe('1000');
  expect(applied?.get('maxPrice')).toBe('5000');
  expect(applied?.get('rating')).toBe('4');
  expect(applied?.get('sort')).toBe('price-asc');
  await page.getByRole('button', { name: 'Next' }).click();
  expect(queries.at(-1)?.searchParams.get('page')).toBe('2');
});

test('product details expose images, variants, stock, reviews, and exact add payload', async ({
  page,
}) => {
  let addBody: unknown;
  await page.route('**/practice/api/v1/store/cart', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: emptyCart }),
    }),
  );
  await page.route('**/practice/api/v1/store/products/prd-001', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: product }),
    }),
  );
  await page.route('**/practice/api/v1/store/cart/items', async (route) => {
    addBody = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ data: { ...emptyCart, itemCount: 2 } }),
    });
  });
  await page.goto('/practice/apps/ecommerce/product/?id=prd-001');
  await expect(page.getByRole('img')).toHaveCount(3);
  await expect(page.getByText('12 units in stock')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Fictional sample reviews' }),
  ).toBeVisible();
  await page.getByLabel('Variant').selectOption('Midnight / Single');
  await page.getByLabel('Quantity').fill('2');
  await page.getByRole('button', { name: 'Add to cart' }).click();
  expect(addBody).toEqual({
    productId: 'prd-001',
    quantity: 2,
    variant: 'Midnight / Single',
  });
});

test('cart updates quantity, removes items, and renders coupon errors', async ({
  page,
}) => {
  let cart = {
    ...emptyCart,
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
  await page.route('**/practice/api/v1/store/cart', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: cart }),
    }),
  );
  await page.route(
    '**/practice/api/v1/store/cart/items/prd-001',
    async (route) => {
      if (route.request().method() === 'DELETE')
        cart = { ...emptyCart, items: [] };
      else {
        const quantity = Number(
          (route.request().postDataJSON() as { quantity: number }).quantity,
        );
        const currentItem = cart.items[0];
        if (!currentItem) throw new Error('Expected seeded cart item.');
        cart = {
          ...cart,
          itemCount: quantity,
          subtotal: 2400 * quantity,
          total: 2400 * quantity,
          items: [{ ...currentItem, quantity, lineTotal: 2400 * quantity }],
        };
      }
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ data: cart }),
      });
    },
  );
  await page.route('**/practice/api/v1/store/cart/coupon', async (route) => {
    const code = String(
      (route.request().postDataJSON() as { code: string }).code,
    );
    await route.fulfill({
      status: code === 'EXPIRED20' ? 409 : 404,
      contentType: 'application/json',
      body: JSON.stringify({
        error: {
          code: code === 'EXPIRED20' ? 'COUPON_EXPIRED' : 'COUPON_UNKNOWN',
          message: 'Practice coupon rejected.',
        },
      }),
    });
  });
  await page.goto('/practice/apps/ecommerce/cart/');
  await page.getByLabel('Quantity for Practice Headset').fill('3');
  await page.getByLabel('Quantity for Practice Headset').press('Tab');
  await expect(
    page.getByRole('row').filter({ hasText: 'Practice Headset' }),
  ).toContainText('₹7,200');
  await page.getByLabel('Coupon code').fill('EXPIRED20');
  await page.getByRole('button', { name: 'Apply coupon' }).click();
  await expect(page.locator('#store-coupon-result')).toContainText(
    'COUPON_EXPIRED',
  );
  await page.getByRole('button', { name: 'Remove' }).click();
  await expect(page.getByText('Your session cart is empty.')).toBeVisible();
});

test('checkout reuses auth, sends a fake-payment payload, and stable confirmation freezes date', async ({
  page,
}) => {
  const checkoutCart = {
    ...emptyCart,
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
  let checkoutBody: unknown;
  await page.route('**/practice/api/v1/store/cart', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: checkoutCart }),
    }),
  );
  await page.route('**/practice/api/v1/auth/me', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({
        error: { code: 'AUTH_REQUIRED', message: 'Sign in.' },
      }),
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
  await page.route('**/practice/api/v1/store/checkout', async (route) => {
    checkoutBody = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          order: {
            id: 'ord-store-4803',
            status: 'confirmed',
            total: 2499,
            createdAt: '2026-09-29T00:00:00Z',
          },
          shippingCost: 99,
          payment: { charged: false },
        },
      }),
    });
  });
  await page.goto('/practice/apps/ecommerce/checkout/?visual=stable');
  await page.getByRole('button', { name: 'Sign in and continue' }).click();
  await expect(
    page.getByRole('heading', { name: 'Delivery address' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Place fake order' }).click();
  await page.waitForURL('**/confirmation/**');
  expect(checkoutBody).toMatchObject({
    shippingMethod: 'standard',
    payment: { cardNumber: '4242 4242 4242 4242' },
  });
  await expect(page.getByTestId('confirmed-order-id')).toHaveText(
    'ord-store-4803',
  );
  await expect(page.getByText('15 Oct 2026, 9:30 AM IST')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute(
    'data-visual-mode',
    'stable',
  );
});

test('internal store screens remain noindex', async ({ request }) => {
  for (const route of [
    'products',
    'product',
    'cart',
    'checkout',
    'confirmation',
    'orders',
    'profile',
  ]) {
    const response = await request.get(`/practice/apps/ecommerce/${route}/`);
    expect(response.status(), route).toBe(200);
    expect(await response.text(), route).toContain(
      'name="robots" content="noindex,nofollow"',
    );
  }
});

test('save Chunk 9 review screenshots', async ({ page }, testInfo) => {
  testInfo.setTimeout(60_000);
  await page.route('**/practice/api/v1/store/cart', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: emptyCart }),
    }),
  );
  await page.route('**/practice/api/v1/store/catalog?*', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        data: [product],
        meta: {
          total: 1,
          page: 1,
          pages: 1,
          limit: 12,
          categories: ['Electronics', 'Home'],
        },
      }),
    }),
  );
  await page.route('**/practice/api/v1/store/scenario', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: { next: null } }),
    }),
  );
  await page.route('**/practice/api/v1/store/products/prd-001', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: product }),
    }),
  );
  const device = testInfo.project.name.startsWith('mobile')
    ? 'mobile'
    : 'desktop';
  const directory = 'docs/reports/assets/chunk-09';
  await mkdir(directory, { recursive: true });
  for (const [path, name] of [
    ['/practice/apps/ecommerce/?visual=stable', 'store-overview'],
    ['/practice/apps/ecommerce/products/?visual=stable', 'store-catalogue'],
    [
      '/practice/apps/ecommerce/product/?id=prd-001&visual=stable',
      'store-product',
    ],
  ] as const) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: `${directory}/${name}-${device}.png`,
      fullPage: true,
      scale: 'css',
    });
  }
});
