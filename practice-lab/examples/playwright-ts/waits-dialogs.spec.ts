import { expect, test } from '../../tests/e2e/test-fixture';

test('wait for a visible element with a web-first assertion', async ({
  page,
}) => {
  await page.goto('/practice/playwright/waits/?delay=0');
  await page.getByRole('button', { name: 'Start appearance wait' }).click();
  await expect(page.getByTestId('appeared-element')).toBeVisible({
    timeout: 11_000,
  });
});

test('wait for the response that drives a visible counter', async ({
  page,
}) => {
  await page.route('**/practice/api/v1/users?*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    }),
  );
  await page.goto('/practice/playwright/waits/?delay=0');
  const response = page.waitForResponse(
    (candidate) =>
      candidate.url().includes('/practice/api/v1/users') &&
      candidate.status() === 200,
  );
  await page.getByRole('button', { name: 'Run background request' }).click();
  await response;
  await expect(page.getByTestId('network-counter')).toHaveText('1');
});

test('handle a browser prompt before triggering it', async ({ page }) => {
  await page.goto('/practice/components/dialogs/');
  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('prompt');
    expect(dialog.message()).toBe('Name this synthetic run');
    await dialog.accept('Nightly 4803');
  });
  await page.getByRole('button', { name: 'Open prompt' }).click();
  await expect(page.getByTestId('browser-dialog-result')).toContainText(
    'Nightly 4803',
  );
});

test('assert a semantic toast', async ({ page }) => {
  await page.goto('/practice/components/dialogs/');
  await page.getByRole('button', { name: 'Show success toast' }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Saved successfully' }),
  ).toBeVisible();
});
