import { expect, test } from '@playwright/test';

test('diagnose the hidden race', async ({ page }) => {
  await page.goto('/practice/playwright/waits/');
  await page.getByRole('button', { name: /change delayed text/i }).click();
  // Deliberately wrong: the eager read can happen before the bounded update.
  expect(await page.locator('#delayed-text-result').textContent()).toContain(
    'complete',
  );
});
