import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './test-fixture';

const representativePages = [
  '/practice/',
  '/practice/playwright/locators/',
  '/practice/components/tables/',
  '/practice/challenges/',
  '/practice/apps/ecommerce/',
  '/practice/components/accessibility/',
] as const;

test('Lab chrome has no serious or critical axe violations outside marked fixtures', async ({
  page,
}, testInfo) => {
  testInfo.setTimeout(90_000);
  for (const url of representativePages) {
    await page.goto(url);
    const results = await new AxeBuilder({ page })
      .exclude('[data-a11y-exclude="true"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const material = results.violations.filter(({ impact }) =>
      ['serious', 'critical'].includes(impact ?? ''),
    );
    expect(material, url).toEqual([]);
  }
});

test('accessible example works by keyboard and the flawed region stays isolated', async ({
  page,
}) => {
  await page.goto('/practice/components/accessibility/');
  const email = page.getByLabel('Work email');
  await email.focus();
  await page.keyboard.type('qa@example.test');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('button', { name: 'Request access' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toHaveText(
    'Access request recorded for this practice session.',
  );

  const accessible = await new AxeBuilder({ page })
    .include('#accessible-example')
    .analyze();
  expect(accessible.violations).toEqual([]);

  const flawed = await new AxeBuilder({ page })
    .include('#intentional-accessibility-defects')
    .analyze();
  expect(flawed.violations.map(({ id }) => id)).toEqual(
    expect.arrayContaining(['button-name', 'color-contrast', 'label']),
  );
});

test('hub and challenge controls are keyboard operable', async ({ page }) => {
  await page.goto('/practice/');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();

  await page.goto('/practice/challenges/wait-for-delayed-text/');
  const hint = page.getByText('Hint 1', { exact: true });
  await hint.focus();
  await page.keyboard.press('Enter');
  await expect(hint.locator('..')).toHaveAttribute('open', '');
  const solution = page.getByText('I’ve tried it — show solution');
  await solution.focus();
  await page.keyboard.press('Enter');
  await expect(solution.locator('..')).toHaveAttribute('open', '');
});

test('checkout authentication handoff remains keyboard operable', async ({
  page,
}) => {
  const cart = {
    items: [
      {
        productId: 'prd-001',
        name: 'Practice Headset',
        variant: 'Midnight',
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
      body: JSON.stringify({ data: { csrfToken: 'checkout-keyboard-csrf' } }),
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

  await page.goto('/practice/apps/ecommerce/checkout/');
  const signIn = page.getByRole('button', { name: 'Sign in and continue' });
  await expect(signIn).toBeEnabled();
  await page.getByLabel('Username').focus();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Password')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(signIn).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('heading', { name: 'Delivery address' }),
  ).toBeVisible();
  await page.getByLabel('Full name').focus();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Address line')).toBeFocused();
});
