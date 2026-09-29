import { expect, test } from '@playwright/test';

test('wait fixture synchronizes with the live delayed Practice API', async ({
  page,
}) => {
  await page.goto('/practice/playwright/waits/?delay=50');
  const response = page.waitForResponse(
    (candidate) =>
      candidate.url().includes('/practice/api/v1/users') &&
      candidate.status() === 200,
  );
  await page.getByRole('button', { name: 'Run background request' }).click();
  await response;
  await expect(page.getByTestId('network-counter')).toHaveText('1');
});

test('dynamic DOM and API modal render live server results', async ({
  page,
}) => {
  await page.goto('/practice/components/dynamic-dom/');
  await page
    .getByRole('button', { name: 'Load API-rendered employees' })
    .click();
  await expect(page.locator('#api-dom-results article')).toHaveCount(3);
  await page.goto('/practice/components/dialogs/');
  await page
    .getByRole('button', { name: 'Open modal after API response' })
    .click();
  await expect(
    page.getByRole('dialog', { name: 'API response modal' }),
  ).toContainText('Practice API health confirmed');
});
