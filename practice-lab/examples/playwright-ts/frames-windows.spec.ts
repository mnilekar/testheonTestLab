import { expect, test } from '@playwright/test';

test('frameLocator scopes form and nested frame content', async ({ page }) => {
  await page.goto('/practice/components/frames-and-windows/');
  const formFrame = page.frameLocator('iframe[title="Frame with form"]');
  await formFrame.getByLabel('Project name').fill('Phoenix');
  await formFrame.getByRole('button', { name: 'Save frame form' }).click();
  await expect(formFrame.getByRole('status')).toHaveText(
    'Frame form saved: Phoenix.',
  );

  const nested = page
    .frameLocator('iframe[title="Nested parent frame"]')
    .frameLocator('iframe[title="Nested child frame"]');
  await expect(nested.getByTestId('nested-frame-value')).toHaveText(
    'NESTED-731',
  );
});

test("context.waitForEvent('page') captures a target blank tab", async ({
  context,
  page,
}) => {
  await page.goto('/practice/components/frames-and-windows/');
  const childPromise = context.waitForEvent('page');
  await page.getByRole('link', { name: 'Open new tab fixture' }).click();
  const child = await childPromise;
  await expect(
    child.getByRole('heading', { name: 'New tab fixture' }),
  ).toBeVisible();
  await child.close();
});
