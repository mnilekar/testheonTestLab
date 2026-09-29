import { expect, test } from '../../tests/e2e/test-fixture';

test('locator examples: role, filter, position and scope', async ({ page }) => {
  await page.goto('/practice/playwright/locators/');
  await expect(
    page.getByRole('button', { name: 'Create report' }),
  ).toBeVisible();

  const project = page
    .getByRole('listitem')
    .filter({ has: page.getByRole('heading', { name: 'Apollo' }) });
  await expect(project.getByRole('button', { name: 'Open' })).toBeVisible();

  const runs = page
    .getByRole('list', { name: 'Ranked runs' })
    .getByRole('listitem');
  await expect(runs.first()).toContainText('Run A');
  await expect(runs.nth(1)).toContainText('Run B');
  await expect(runs.last()).toContainText('Run C');

  const billing = page.getByRole('region', { name: 'Billing address' });
  await expect(billing.getByRole('button', { name: 'Edit' })).toBeVisible();
});
