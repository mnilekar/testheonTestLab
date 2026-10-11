import { expect, test } from '@playwright/test';

test('Practice Lab exposes the challenge catalogue', async ({ page }) => {
  await page.goto('/practice/challenges/');
  await expect(
    page.getByRole('heading', { name: 'Playwright challenges' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /Log in as standard_user/ }),
  ).toBeVisible();
});
