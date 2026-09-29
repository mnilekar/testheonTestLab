import { expect, test } from '../../tests/e2e/test-fixture';

test('open the command palette with keyboard.press', async ({ page }) => {
  await page.goto('/practice/components/interactions/');
  await page.keyboard.press('ControlOrMeta+K');
  await expect(
    page.getByRole('dialog', { name: 'Command palette' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('dialog', { name: 'Command palette' }),
  ).not.toBeVisible();
});

test('select a date from the custom picker', async ({ page }) => {
  await page.goto('/practice/components/date-time-and-ranges/');
  await page.getByRole('button', { name: 'Choose custom date' }).click();
  await page.getByRole('gridcell', { name: 'October 18, 2026' }).click();
  await expect(page.getByTestId('custom-date-result')).toHaveText(
    'Selected date: 2026-10-18.',
  );
});
