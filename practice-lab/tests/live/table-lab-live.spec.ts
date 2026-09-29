import { expect, test } from '@playwright/test';

test('employee edit persists in the live sandbox and reset restores seed data', async ({
  page,
}) => {
  await page.goto('/practice/components/tables/');
  await expect(page.locator('#tables-load-status')).toContainText(
    'Practice API',
  );
  await page.getByRole('button', { name: 'Edit Rahul Sharma' }).click();
  await page.getByLabel('Role for Rahul Sharma').fill('Chunk Five QA Lead');
  await page.getByRole('button', { name: 'Save Rahul Sharma' }).click();
  await expect(page.locator('#edit-result')).toContainText(
    'Saved emp-001 as Chunk Five QA Lead',
  );

  await page.reload();
  await expect(page.locator('#tables-load-status')).toContainText(
    'Practice API',
  );
  await expect(
    page.getByRole('table', { name: 'Editable employees' }).getByRole('row', {
      name: /Rahul Sharma Engineering Chunk Five QA Lead/,
    }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Reset employee sandbox' }).click();
  await expect(page.locator('#tables-load-status')).toContainText(
    'seed employees restored',
  );
  await page.reload();
  await expect(
    page.getByRole('table', { name: 'Editable employees' }).getByRole('row', {
      name: /Rahul Sharma Engineering QA Analyst/,
    }),
  ).toBeVisible();
});

test('live API pagination and cursor-backed infinite scroll reach their end states', async ({
  page,
}) => {
  await page.goto('/practice/components/tables/');
  await expect(page.locator('#server-page-status')).toContainText('API page 1');
  await page.getByLabel('Rows per API page').selectOption('5');
  await expect(page.locator('#server-page-status')).toContainText(
    'Showing 1–5 of 120',
  );
  await page.getByRole('button', { name: 'Next server page' }).click();
  await expect(page.locator('#server-page-status')).toContainText(
    'Showing 6–10 of 120',
  );

  await page.goto('/practice/components/search-and-lists/');
  await expect(page.locator('#list-load-status')).toContainText('Practice API');
  const viewport = page.getByTestId('infinite-list');
  const status = page.locator('#infinite-list-status');
  for (let pageNumber = 0; pageNumber < 5; pageNumber += 1) {
    if ((await status.textContent())?.includes('End of API')) break;
    await viewport.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await expect(status).not.toContainText('Loading next');
  }
  await expect(status).toHaveText('End of API product list.');
  await expect(page.locator('#infinite-product-items li')).toHaveCount(80);
});
