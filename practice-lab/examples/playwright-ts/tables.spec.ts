import { expect, test } from '../../tests/e2e/test-fixture';

test('table example: find a row with filter({ has }) and edit it', async ({
  page,
}) => {
  await page.goto('/practice/components/tables/');
  const table = page.getByRole('table', { name: 'Editable employees' });
  const engineeringRahul = table.getByRole('row').filter({
    has: page.getByRole('cell', { name: 'Rahul Sharma', exact: true }),
  });
  await expect(engineeringRahul).toContainText('Engineering');
  await engineeringRahul
    .getByRole('button', { name: 'Edit Rahul Sharma' })
    .click();
  await expect(page.getByLabel('Role for Rahul Sharma')).toBeVisible();
});

test('table example: read a salary column into an array', async ({ page }) => {
  await page.goto('/practice/components/tables/');
  await expect(page.locator('#tables-load-status')).toContainText('loaded');
  const salaryValues = await page
    .locator('#filter-table tbody td[data-column="salary"]')
    .allTextContents();
  expect(salaryValues.length).toBeGreaterThan(20);
  expect(salaryValues.every((value) => value.includes('₹'))).toBe(true);
});

test('table example: paginate until an employee is found', async ({ page }) => {
  await page.goto('/practice/components/tables/');
  await expect(page.locator('#tables-load-status')).toContainText('loaded');
  const table = page.getByRole('table', { name: 'Server page' });
  const next = page.getByRole('button', { name: 'Next server page' });
  const status = page.locator('#server-page-status');
  for (let pageNumber = 1; pageNumber <= 20; pageNumber += 1) {
    if (await table.getByRole('row', { name: /emp-081/ }).count()) break;
    expect(await next.isDisabled()).toBe(false);
    await next.click();
    await expect(status).toContainText(
      new RegExp(`(?:API )?page ${pageNumber + 1}\\b`, 'i'),
    );
  }
  await expect(table.getByRole('row', { name: /emp-081/ })).toContainText(
    'Engineering',
  );
});

test('table example: handle a virtualized row window', async ({ page }) => {
  await page.goto('/practice/components/tables/');
  const viewport = page.getByTestId('virtual-viewport');
  await viewport.evaluate((element) => {
    element.scrollTop = 47 * 9000;
  });
  await expect(
    page.getByRole('row', { name: /Virtual Tester 08998/ }),
  ).toBeVisible();
  expect(await page.locator('#virtual-body [role="row"]').count()).toBeLessThan(
    40,
  );
});
