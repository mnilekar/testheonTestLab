import { expect, test } from '@playwright/test';

test('diagnose the late dialog handler', async ({ page }) => {
  await page.goto('/practice/components/dialogs/');
  await page.getByRole('button', { name: /show confirm/i }).click();
  // Deliberately wrong: this handler is registered after the trigger.
  page.once('dialog', (dialog) => dialog.accept());
  await expect(page.locator('#confirm-result')).toContainText('accepted');
});
