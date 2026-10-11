import { test } from '@playwright/test';

test('diagnose the ambiguous locator', async ({ page }) => {
  await page.goto('/practice/playwright/locators/');
  // Deliberately wrong: repeated text resolves to multiple comparison regions.
  await page.getByText('Submit').click();
});
