import { expect, test as base, type Page } from '@playwright/test';

type SeedProduct = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
};

type StoreFixtures = {
  loginFixture: undefined;
  apiSeedFixture: (product: SeedProduct) => Promise<void>;
};

export class CartPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/practice/apps/ecommerce/cart/?visual=stable');
  }

  row(productName: string) {
    return this.page.getByRole('row').filter({ hasText: productName });
  }

  async updateQuantity(productName: string, quantity: number): Promise<void> {
    await this.row(productName).getByRole('spinbutton').fill(String(quantity));
    await this.row(productName).getByRole('spinbutton').press('Tab');
  }

  async applyCoupon(code: string): Promise<void> {
    await this.page.getByLabel('Coupon code').fill(code);
    await this.page.getByRole('button', { name: 'Apply coupon' }).click();
  }
}

const sessionEnvelope = {
  data: { csrfToken: 'fixture-csrf', sessionId: 'fixture-session' },
};

export const test = base.extend<StoreFixtures>({
  loginFixture: async ({ context, baseURL, page }, use) => {
    const origin = new URL(baseURL ?? 'http://127.0.0.1:4321').origin;
    await context.addCookies([
      {
        name: 'practice_auth',
        value: 'fixture-auth-session',
        url: `${origin}/practice/`,
        httpOnly: true,
        sameSite: 'Lax',
      },
    ]);
    await page.route('**/practice/api/v1/auth/me', (route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            authentication: 'cookie',
            user: {
              username: 'standard_user',
              displayName: 'Standard Customer',
              email: 'standard.user@practice.test',
              role: 'Customer',
            },
          },
        }),
      }),
    );
    await use(undefined);
  },

  apiSeedFixture: async ({ page }, use) => {
    let seeded: SeedProduct | undefined;
    await page.route('**/practice/api/v1/store/catalog?*', (route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          data: seeded
            ? [
                {
                  ...seeded,
                  summary: 'Seeded by a Playwright API fixture.',
                  images: [
                    {
                      src: '/practice/images/store/electronics.svg',
                      alt: `${seeded.name} front view`,
                    },
                  ],
                },
              ]
            : [],
          meta: {
            total: seeded ? 1 : 0,
            page: 1,
            pages: 1,
            limit: 12,
            categories: ['Electronics'],
          },
        }),
      }),
    );
    await use(async (product) => {
      seeded = product;
    });
  },
});

test.beforeEach(async ({ page }) => {
  await page.route('**/practice/api/v1/lab/session', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(sessionEnvelope),
    }),
  );
});

test('API-seeding fixture feeds the catalogue UI', async ({
  page,
  apiSeedFixture,
}) => {
  await apiSeedFixture({
    id: 'prd-seeded-4803',
    name: 'Seeded Trace Recorder',
    sku: 'SEED-4803',
    category: 'Electronics',
    price: 4803,
    stock: 9,
    rating: 5,
  });
  await page.route('**/practice/api/v1/store/cart', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: { items: [], itemCount: 0 } }),
    }),
  );
  await page.goto('/practice/apps/ecommerce/products/');
  await expect(
    page.getByRole('heading', { name: 'Seeded Trace Recorder' }),
  ).toBeVisible();
});

test('login fixture and CartPage update a guest cart', async ({
  page,
  loginFixture: _loginFixture,
}) => {
  let quantity = 1;
  const cart = () => ({
    items: [
      {
        productId: 'prd-001',
        name: 'Practice Headset',
        variant: 'Midnight / Single',
        quantity,
        price: 1200,
        lineTotal: 1200 * quantity,
      },
    ],
    itemCount: quantity,
    subtotal: 1200 * quantity,
    coupon: null,
    discount: 0,
    total: 1200 * quantity,
  });
  await page.route('**/practice/api/v1/store/cart', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: cart() }),
    }),
  );
  await page.route(
    '**/practice/api/v1/store/cart/items/prd-001',
    async (route) => {
      quantity = Number(
        (route.request().postDataJSON() as { quantity: number }).quantity,
      );
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ data: cart() }),
      });
    },
  );
  const cartPage = new CartPage(page);
  await cartPage.open();
  await cartPage.updateQuantity('Practice Headset', 3);
  await expect(cartPage.row('Practice Headset')).toContainText('₹3,600');
});
