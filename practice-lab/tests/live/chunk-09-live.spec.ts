import { expect, test } from '@playwright/test';

test('hosted Store preserves a guest cart through login and creates an API-backed order', async ({
  page,
}) => {
  test.setTimeout(45_000);
  await page.goto('/practice/apps/ecommerce/product/?id=prd-002&visual=stable');
  await page.getByLabel('Quantity').fill('2');
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.locator('#product-add-result')).toContainText('Added');
  await page.goto('/practice/apps/ecommerce/checkout/?visual=stable');
  const signedIn = page.waitForResponse(
    (response) =>
      response.url().endsWith('/practice/api/v1/auth/login') &&
      response.status() === 200,
  );
  await page.getByRole('button', { name: 'Sign in and continue' }).click();
  await signedIn;
  await expect(
    page.getByRole('heading', { name: 'Delivery address' }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/× 2/)).toBeVisible();
  await page.getByRole('button', { name: 'Place fake order' }).click();
  await page.waitForURL('**/practice/apps/ecommerce/confirmation/**');
  const id = await page.getByTestId('confirmed-order-id').textContent();
  expect(id).toMatch(/^ord-store-/);
  await page.goto('/practice/apps/ecommerce/orders/?visual=stable');
  await expect(
    page.getByRole('row').filter({ hasText: String(id) }),
  ).toBeVisible();
});

test('hosted one-shot error panel recovers after 500 and renders empty arrays', async ({
  page,
}) => {
  await page.goto('/practice/apps/ecommerce/');
  await expect(
    page.locator('#store-featured .store-product-card').first(),
  ).toBeVisible();
  await page.getByRole('button', { name: '500', exact: true }).click();
  await expect(page.locator('#store-scenario-result')).toContainText(
    '500 armed',
  );
  await page
    .getByRole('button', { name: 'Run next catalogue request' })
    .click();
  await expect(page.locator('#store-scenario-result')).toContainText(
    'STORE_SIMULATED_500',
  );
  await page
    .getByRole('button', { name: 'Run next catalogue request' })
    .click();
  await expect(page.locator('#store-scenario-result')).toContainText('200');
  await page.getByRole('button', { name: 'empty', exact: true }).click();
  await expect(page.locator('#store-scenario-result')).toContainText(
    'empty armed',
  );
  await page
    .getByRole('button', { name: 'Run next catalogue request' })
    .click();
  await expect(page.locator('#store-scenario-result')).toContainText(
    'EMPTY_ARRAY',
  );
});
