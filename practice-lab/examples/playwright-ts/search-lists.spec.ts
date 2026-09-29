import { expect, test } from '../../tests/e2e/test-fixture';

test('list example: wait for debounced search state', async ({ page }) => {
  await page.goto('/practice/components/search-and-lists/');
  await page.getByLabel('Debounced list search').fill('Rahul');
  await expect(page.getByTestId('debounced-list-status')).toContainText(
    'debounced query applied',
  );
  await expect(page.locator('#debounced-list li').first()).toContainText(
    'Rahul',
  );
});

test('list example: scroll API pages to the explicit end state', async ({
  page,
}) => {
  await page.goto('/practice/components/search-and-lists/');
  const viewport = page.getByTestId('infinite-list');
  const status = page.locator('#infinite-list-status');
  await expect(page.locator('#infinite-product-items li')).toHaveCount(20);
  for (let pageNumber = 0; pageNumber < 5; pageNumber += 1) {
    if ((await status.textContent())?.includes('End of')) break;
    await viewport.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await expect(status).not.toContainText('Loading next');
  }
  await expect(status).toContainText('End of');
  await expect(page.locator('#infinite-product-items li')).toHaveCount(80);
});
