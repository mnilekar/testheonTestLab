import { mkdir } from 'node:fs/promises';
import { expect, test } from './test-fixture';

test('table data, multi-column sorting, search and combined filters behave deterministically', async ({
  page,
}) => {
  await page.goto('/practice/components/tables/');
  await expect(
    page.getByRole('table', { name: 'Five deterministic employees' }),
  ).toContainText('Rahul Sharma');

  const sortable = page.getByRole('table', { name: 'Sortable API employees' });
  await sortable.getByRole('button', { name: /^Department/ }).click();
  await sortable.getByRole('button', { name: /^Salary/ }).click();
  await expect(
    sortable.getByRole('columnheader', { name: /^Department/ }),
  ).toHaveAttribute('aria-sort', 'ascending');
  await expect(
    sortable.getByRole('columnheader', { name: /^Salary/ }),
  ).toHaveAttribute('aria-sort', 'ascending');
  await expect(page.locator('#sort-result')).toContainText('1. department');
  await expect(page.locator('#sort-result')).toContainText('2. salary');

  await page.getByLabel('Instant employee search').fill('Rahul Sharma');
  await expect(page.locator('#search-employee-table tbody tr')).toHaveCount(3);
  await page.getByLabel('Debounced employee search').fill('Engineering');
  await expect(page.locator('#table-search-result')).toContainText(
    'debounced: engineering',
  );

  await page
    .getByLabel('Department', { exact: true })
    .selectOption('Engineering');
  await page.getByLabel('Location', { exact: true }).selectOption('Mumbai');
  await page.getByLabel('Status', { exact: true }).selectOption('true');
  await expect(page.locator('#filter-result')).toContainText(
    'No employees match',
  );
  await expect(page.locator('#filter-table .table-empty')).toBeVisible();
});

test('client and server pagination expose exact visible ranges', async ({
  page,
}) => {
  await page.goto('/practice/components/tables/');
  await expect(page.locator('#client-page-status')).toContainText(
    'Showing 1–10 of 120',
  );
  await page.getByRole('button', { name: 'Next client page' }).click();
  await expect(page.locator('#client-page-status')).toContainText(
    'Showing 11–20 of 120',
  );
  await expect(page.locator('#server-page-status')).toContainText(
    /showing 1–10/i,
  );
  await page.getByRole('button', { name: 'Next server page' }).click();
  await expect(page.locator('#server-page-status')).toContainText(
    /showing 11–20/i,
  );
  await page.getByLabel('Rows per API page').selectOption('5');
  await expect(page.locator('#server-page-table tbody tr')).toHaveCount(5);
});

test('inline edit validation and cancel preserve the original role', async ({
  page,
}) => {
  await page.goto('/practice/components/tables/');
  const edit = page.getByRole('button', { name: 'Edit Rahul Sharma' });
  await edit.click();
  const role = page.getByLabel('Role for Rahul Sharma');
  await role.fill('');
  await page.getByRole('button', { name: 'Save Rahul Sharma' }).click();
  await expect(role).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#edit-result')).toContainText('Role is required');
  await role.fill('Principal QA Engineer');
  await page.getByRole('button', { name: 'Cancel Rahul Sharma' }).click();
  await expect(
    page.getByRole('table', { name: 'Editable employees' }).getByRole('row', {
      name: /Rahul Sharma Engineering QA Analyst/,
    }),
  ).toBeVisible();
});

test('dynamic, selectable and expandable row behaviors remain scoped', async ({
  page,
}) => {
  await page.goto('/practice/components/tables/');
  await expect(page.locator('#tables-load-status')).toContainText('loaded');
  await expect(page.locator('#dynamic-row-count')).toContainText(
    '3 dynamic rows',
  );
  await page
    .getByRole('button', { name: 'Add deterministic employee' })
    .click();
  await expect(page.locator('#dynamic-row-count')).toContainText(
    '4 dynamic rows',
  );
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete Added Tester 1' }).click();
  await expect(page.locator('#dynamic-row-count')).toContainText(
    '3 dynamic rows',
  );

  await page.getByLabel('Select all current page').check();
  await expect(page.locator('#selection-result')).toContainText(
    '5 employees selected',
  );
  await page.getByRole('button', { name: 'Select all pages' }).click();
  await expect(page.locator('#selection-result')).toContainText(
    '20 employees selected',
  );
  await page.getByRole('button', { name: 'Mark selected inactive' }).click();
  await expect(page.locator('#selection-result')).toContainText(
    'Marked 20 selected employees inactive',
  );

  await page
    .getByRole('button', { name: 'Show details for Rahul Sharma' })
    .click();
  await expect(page.locator('#details-emp-001')).toContainText('joined');
  await expect(page.locator('#details-emp-001')).toBeVisible();
});

test('sticky, virtual, async and nested tables expose their advanced contracts', async ({
  page,
}) => {
  await page.goto('/practice/components/tables/');
  const sticky = page.locator('#sticky-employee-table thead th').first();
  expect(await sticky.evaluate((node) => getComputedStyle(node).position)).toBe(
    'sticky',
  );

  const viewport = page.getByTestId('virtual-viewport');
  await viewport.evaluate((element) => {
    element.scrollTop = 47 * 9500;
  });
  await expect(page.locator('#virtual-result')).toContainText('of 10,000');
  expect(await page.locator('#virtual-body [role="row"]').count()).toBeLessThan(
    40,
  );

  await page.getByLabel('Update delay').selectOption('150');
  await page.getByRole('button', { name: 'Update employee status' }).click();
  await expect(page.locator('#async-status')).toHaveText('Updating');
  await expect(page.locator('#async-status')).toHaveText('Active');
  await expect(page.locator('#async-result')).toContainText('after 150 ms');

  await page.getByText('View 2 orders').click();
  const itemRow = page.getByRole('row', { name: /Wireless Mouse 2/ });
  await expect(itemRow).toBeVisible();
  await page.getByText('View employees').click();
  await expect(
    page.getByRole('row', { name: /Rahul Sharma.*Checkout reliability/ }),
  ).toBeVisible();
});

test('search timing, autocomplete, combined filters and no-results state work', async ({
  page,
}) => {
  await page.goto('/practice/components/search-and-lists/');
  await page.getByLabel('Instant list search').fill('Rahul Sharma');
  await expect(page.locator('#instant-list-status')).toContainText(
    '3 instant matches',
  );

  await page.getByRole('button', { name: 'Run 400 ms API search' }).click();
  await expect(page.locator('#delayed-list-status')).toContainText('400 ms');
  await expect(page.locator('#delayed-list li').first()).toContainText('Rahul');

  await page.getByLabel('Debounced list search').fill('Security');
  await expect(page.getByTestId('debounced-list-status')).toContainText(
    'debounced query applied',
  );

  const autocomplete = page.getByRole('combobox', {
    name: 'Employee autocomplete',
  });
  await autocomplete.fill('Rahul Sh');
  await autocomplete.press('ArrowDown');
  await autocomplete.press('Enter');
  await expect(page.locator('#autocomplete-result')).toContainText(
    'Selected Rahul Sharma',
  );

  await page
    .getByLabel('Department', { exact: true })
    .selectOption('Engineering');
  await page.getByLabel('Location', { exact: true }).selectOption('Mumbai');
  await page.getByLabel('Status', { exact: true }).selectOption('true');
  await expect(page.locator('#combined-filter-status')).toContainText(
    'No employees match',
  );
  await expect(page.locator('#combined-filter-list .list-empty')).toBeVisible();
});

test('load more and infinite scrolling append unique API-shaped products', async ({
  page,
}) => {
  await page.goto('/practice/components/search-and-lists/');
  await page.getByRole('button', { name: 'Load more products' }).click();
  await expect(page.locator('#load-more-products li')).toHaveCount(8);
  await page.getByRole('button', { name: 'Load more products' }).click();
  await expect(page.locator('#load-more-products li')).toHaveCount(16);

  await expect(page.locator('#infinite-product-items li')).toHaveCount(20);
  await page.getByTestId('infinite-list').evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(page.locator('#infinite-product-items li')).toHaveCount(40);
  const ids = await page
    .locator('#infinite-product-items li')
    .evaluateAll((items) =>
      items.map((item) => (item as HTMLElement).dataset.productId),
    );
  expect(new Set(ids).size).toBe(ids.length);
});

test('save Chunk 5 desktop and mobile review screenshots', async ({
  page,
}, testInfo) => {
  const device = testInfo.project.name.startsWith('mobile')
    ? 'mobile'
    : 'desktop';
  const directory = 'docs/reports/assets/chunk-05';
  await mkdir(directory, { recursive: true });
  for (const [url, slug] of [
    ['/practice/components/tables/', 'tables'],
    ['/practice/components/search-and-lists/', 'search-and-lists'],
  ] as const) {
    await page.goto(url);
    await page.screenshot({
      path: `${directory}/${slug}-${device}.png`,
      fullPage: true,
    });
  }
});
