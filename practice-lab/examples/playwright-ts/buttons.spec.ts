import { expect, test } from '../../tests/e2e/test-fixture';

test('button examples: role, scope and replacement', async ({ page }) => {
  await page.goto('/practice/components/buttons/');
  await page.getByRole('button', { name: 'Run smoke test' }).click();
  await expect(page.locator('#basic-button-result')).toContainText(
    'Smoke test queued',
  );

  const dangerZone = page.getByRole('region', { name: 'Danger zone' });
  await dangerZone.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByTestId('duplicate-result')).toHaveText(
    'Saved danger section.',
  );

  const original = page.getByRole('button', { name: 'Replace this button' });
  await original.click();
  await expect(original).not.toBeAttached();
  await page.getByRole('button', { name: 'Replacement button' }).click();
});
