import { mkdir } from 'node:fs/promises';
import { expect, test } from './test-fixture';

const chunk6Pages = [
  '/practice/playwright/waits/',
  '/practice/components/dynamic-dom/',
  '/practice/components/dialogs/',
  '/practice/components/interactions/',
  '/practice/components/date-time-and-ranges/',
] as const;

test('wait fixtures expose every fast deterministic final state', async ({
  page,
}) => {
  await page.route('**/practice/api/v1/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    }),
  );
  await page.goto('/practice/playwright/waits/?delay=0&seed=4803');
  await page.getByRole('button', { name: 'Start appearance wait' }).click();
  await expect(page.getByTestId('appeared-element')).toBeVisible();
  await page.getByRole('button', { name: 'Start enable wait' }).click();
  await expect(
    page.getByRole('button', { name: 'Complete enabled action' }),
  ).toBeEnabled();
  await page.getByRole('button', { name: 'Start text update' }).click();
  await expect(page.locator('#text-change-result')).toContainText(
    '48 checks passed',
  );
  await page.getByRole('button', { name: 'Load spinner content' }).click();
  await expect(page.getByRole('heading', { name: 'Run report' })).toBeVisible();
  await page.getByRole('button', { name: 'Load skeleton card' }).click();
  await expect(page.getByRole('heading', { name: 'Priya Shah' })).toBeVisible();
  await page.getByRole('button', { name: 'Start progress job' }).click();
  await expect(page.locator('#wait-progress-bar')).toHaveJSProperty(
    'value',
    100,
  );
  await page.getByRole('button', { name: 'Run background request' }).click();
  await expect(page.getByTestId('network-counter')).toHaveText('1');
  await page.getByRole('button', { name: 'Run three requests' }).click();
  await expect(page.locator('#concurrent-result')).toContainText('3 of 3');
  await page.getByRole('button', { name: 'Load environments' }).click();
  await expect(page.getByLabel('Environment')).toBeEnabled();
  await expect(page.getByLabel('Environment').locator('option')).toHaveCount(4);
  await page.locator('#lazy-target').scrollIntoViewIfNeeded();
  await expect(page.locator('#lazy-target')).toHaveAttribute(
    'data-lazy-pending',
    'false',
  );
  for (let attempt = 0; attempt < 6; attempt += 1) {
    await page.locator('#wait-infinite-list').evaluate((node) => {
      node.scrollTop = node.scrollHeight;
      node.dispatchEvent(new Event('scroll'));
    });
  }
  await expect(page.locator('#wait-infinite-result')).toContainText(
    'End of deterministic activity list',
  );
  await expect(page.locator('#wait-infinite-items li')).toHaveCount(25);
});

test('each wait fixture completes with a real one-second delay', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name.startsWith('mobile'),
    'One desktop run proves real timers; mobile covers the zero-delay contract.',
  );
  await page.route('**/practice/api/v1/**', (route) => route.abort());
  await page.goto('/practice/playwright/waits/?delay=1000&seed=4803');
  await page.getByRole('button', { name: 'Start appearance wait' }).click();
  await page.getByRole('button', { name: 'Start enable wait' }).click();
  await page.getByRole('button', { name: 'Start text update' }).click();
  await page.getByRole('button', { name: 'Load spinner content' }).click();
  await page.getByRole('button', { name: 'Load skeleton card' }).click();
  await page.getByRole('button', { name: 'Start progress job' }).click();
  await page.getByRole('button', { name: 'Run background request' }).click();
  await page.getByRole('button', { name: 'Run three requests' }).click();
  await page.getByRole('button', { name: 'Load environments' }).click();
  await expect(page.getByTestId('appeared-element')).toBeVisible({
    timeout: 2500,
  });
  await expect(
    page.getByRole('button', { name: 'Complete enabled action' }),
  ).toBeEnabled();
  await expect(page.locator('#text-change-result')).toContainText(
    '48 checks passed',
  );
  await expect(page.getByRole('heading', { name: 'Run report' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Priya Shah' })).toBeVisible();
  await expect(page.locator('#wait-progress-bar')).toHaveJSProperty(
    'value',
    100,
  );
  await expect(page.getByTestId('network-counter')).toHaveText('1');
  await expect(page.locator('#concurrent-result')).toContainText('3 of 3');
  await expect(page.getByLabel('Environment')).toBeEnabled();
});

test('dynamic DOM keeps semantic contracts while selectors and nodes change', async ({
  page,
}) => {
  await page.route('**/practice/api/v1/employees?*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          { name: 'Aarav Mehta' },
          { name: 'Ananya Rao' },
          { name: 'Fatima Khan' },
        ],
      }),
    }),
  );
  await page.goto('/practice/components/dynamic-dom/?seed=4803');
  const action = page
    .getByRole('region', { name: 'Billing workflow' })
    .getByRole('button', { name: 'Approve request' });
  const firstId = await action.getAttribute('id');
  await page
    .getByRole('button', { name: 'Render next deterministic DOM' })
    .click();
  await expect(action).not.toHaveAttribute('id', firstId ?? '');
  await action.click();
  await expect(page.getByTestId('dynamic-log')).toContainText(
    'Billing request approved',
  );
  await page
    .getByRole('region', { name: 'Security workflow' })
    .getByRole('button', { name: 'Continue' })
    .click();
  await expect(page.getByTestId('dynamic-log')).toContainText(
    'Security workflow',
  );
  await expect(
    page.locator('p:visible', { hasText: 'Release candidate approved' }),
  ).toHaveCount(1);
  const original = page.getByRole('button', { name: 'Replace card' });
  await original.click();
  await expect(original).not.toBeAttached();
  await expect(
    page.getByRole('article', { name: 'Replacement card' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Load API-rendered employees' })
    .click();
  await expect(page.getByRole('article', { name: 'Ananya Rao' })).toBeVisible();
  await expect(
    page.getByText('Why fragile selectors fail here:', { exact: false }),
  ).toHaveCount(7);
});

test('browser dialogs capture alert, confirm, prompt, delayed, and chained results', async ({
  page,
}) => {
  await page.goto('/practice/components/dialogs/');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Open alert' }).click();
  await expect(page.getByTestId('browser-dialog-result')).toContainText(
    'Alert accepted',
  );
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Open confirm', exact: true }).click();
  await expect(page.getByTestId('browser-dialog-result')).toContainText(
    'Confirm dismissed',
  );
  page.once('dialog', (dialog) => dialog.accept('Nightly 4803'));
  await page.getByRole('button', { name: 'Open prompt' }).click();
  await expect(page.getByTestId('browser-dialog-result')).toContainText(
    'Nightly 4803',
  );
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Open delayed alert' }).click();
  await expect(page.getByTestId('browser-dialog-result')).toContainText(
    'after 0 ms',
  );
  let chained = 0;
  const acceptChained = async (dialog: import('@playwright/test').Dialog) => {
    chained += 1;
    await dialog.accept();
  };
  page.on('dialog', acceptChained);
  await page.getByRole('button', { name: 'Open chained alerts' }).click();
  await expect(page.getByTestId('browser-dialog-result')).toContainText(
    '2 of 2',
  );
  expect(chained).toBe(2);
  page.off('dialog', acceptChained);
});

test('application modals and toasts expose accessible outcomes', async ({
  page,
}) => {
  await page.route('**/practice/api/v1/health', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{"status":"ok"}',
    }),
  );
  await page.goto('/practice/components/dialogs/');
  await page.getByRole('button', { name: 'Open simple modal' }).click();
  const simple = page.getByRole('dialog', { name: 'Simple status modal' });
  await expect(simple).toBeVisible();
  expect(
    await simple.evaluate((node) => node.contains(document.activeElement)),
  ).toBe(true);
  await page.keyboard.press('Escape');
  await expect(simple).not.toBeVisible();
  await page.getByRole('button', { name: 'Open confirmation modal' }).click();
  await page.getByRole('button', { name: 'Confirm archive' }).click();
  await expect(page.locator('#modal-result')).toContainText('archived');
  await page.getByRole('button', { name: 'Open form modal' }).click();
  await page
    .getByRole('textbox', { name: 'Note', exact: true })
    .fill('Regression note');
  await page.getByRole('button', { name: 'Save practice note' }).click();
  await expect(page.locator('#modal-result')).toContainText('Regression note');
  await page.getByRole('button', { name: 'Open nested modal' }).click();
  await page.getByRole('button', { name: 'Open child modal' }).click();
  await expect(page.getByRole('dialog', { name: 'Child modal' })).toBeVisible();
  await page
    .getByRole('dialog', { name: 'Child modal' })
    .getByRole('button', { name: 'Close child modal' })
    .click();
  await page
    .getByRole('dialog', { name: 'Parent modal' })
    .getByRole('button', { name: 'Close parent modal' })
    .click();
  await page
    .getByRole('button', { name: 'Open modal after API response' })
    .click();
  await expect(
    page.getByRole('dialog', { name: 'API response modal' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Close API modal' }).click();
  await page
    .getByRole('button', { name: 'Open delayed-content modal' })
    .click();
  await page.getByRole('button', { name: 'Load delayed content' }).click();
  await expect(page.locator('#delayed-modal-content')).toContainText(
    'after 0 ms',
  );
  await page.getByRole('button', { name: 'Close delayed modal' }).click();
  await page.getByRole('button', { name: 'Show success toast' }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Saved successfully' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Show error toast' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Synthetic save failed' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Show stacked toasts' }).click();
  await expect(page.locator('#toast-stack .toast')).toHaveCount(5);
});

test('interaction lab logs pointer, scroll, focus, shortcuts, and selections', async ({
  page,
}) => {
  await page.goto('/practice/components/interactions/');
  await page.getByRole('button', { name: 'Hover for test actions' }).hover();
  await page.getByRole('menuitem', { name: 'Run smoke' }).click();
  await page.getByRole('button', { name: 'Inspect flaky check' }).hover();
  await expect(page.getByRole('tooltip')).toBeVisible();
  await page.getByRole('button', { name: 'Double-click release' }).dblclick();
  await page
    .getByRole('button', { name: 'Right-click test row' })
    .click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Retry' }).click();
  await page
    .getByRole('button', { name: 'Scroll to completion target' })
    .click();
  await page.getByRole('button', { name: 'Complete scrolled action' }).click();
  await page.getByRole('button', { name: 'Press Enter to run' }).focus();
  await page.keyboard.press('Enter');
  await page.getByLabel('First focus target').focus();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Second focus target')).toBeFocused();
  await page.getByRole('button', { name: 'Open Escape panel' }).click();
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('region', { name: 'Escape panel' }),
  ).not.toBeVisible();
  await page.keyboard.press('ControlOrMeta+K');
  await expect(
    page.getByRole('dialog', { name: 'Command palette' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  const option = page.getByRole('option', { name: 'Chromium' });
  await option.focus();
  await option.press('ArrowDown');
  await page.keyboard.press('Enter');
  const autocomplete = page.getByRole('combobox', { name: 'QA tool' });
  await autocomplete.fill('Play');
  await autocomplete.press('ArrowDown');
  await autocomplete.press('Enter');
  await expect(autocomplete).toHaveValue('Playwright');
  await expect(page.getByTestId('interaction-log')).toContainText(
    'Autocomplete selected: Playwright',
  );
});

test('date, time, range, linked values, stepper, and async job stay deterministic', async ({
  page,
}) => {
  const now = encodeURIComponent('2026-12-01T12:00:00Z');
  await page.goto(`/practice/components/date-time-and-ranges/?now=${now}`);
  await page.getByLabel('Release date').fill('2026-11-20');
  await expect(page.locator('#native-date-result')).toContainText('2026-11-20');
  await page.getByRole('button', { name: 'Choose custom date' }).click();
  await page.getByRole('gridcell', { name: 'October 18, 2026' }).click();
  await expect(page.getByTestId('custom-date-result')).toHaveText(
    'Selected date: 2026-10-18.',
  );
  await page.getByLabel('End date').fill('2026-10-10');
  await expect(page.locator('#date-range-result')).toContainText(
    'must be on or after',
  );
  await page.getByLabel('Release month').fill('2027-03');
  await page.getByLabel('Release year').selectOption('2027');
  await page.getByLabel('Run time').fill('18:45');
  await expect(page.locator('#selector-result')).toContainText(
    '2027-03 · year 2027 · time 18:45',
  );
  await expect(page.locator('#reference-instant')).toHaveText(
    '2026-12-01T12:00:00Z',
  );
  await page.getByLabel(/Confidence:/).fill('85');
  await expect(page.locator('#confidence-output')).toHaveText('85');
  await page.getByLabel('Minimum salary ₹').fill('160000');
  await expect(page.locator('#dual-range-result')).toContainText(
    '₹1,60,000–₹1,60,000',
  );
  await page.getByLabel('Estimated hours').fill('20');
  await expect(page.locator('#linked-result')).toContainText('₹24,000');
  await page.getByRole('button', { name: 'Increase retry count' }).click();
  await expect(page.locator('#stepper-result')).toContainText('3');
  await page.getByRole('button', { name: 'Start async job' }).click();
  await expect(page.locator('#async-job-progress')).toHaveJSProperty(
    'value',
    100,
  );
  await expect(page.locator('#async-job-result')).toContainText('100%');
});

test('real delayed alert and async job complete after one second', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name.startsWith('mobile'),
    'Desktop proves real timers; mobile covers zero-delay behavior.',
  );
  await page.goto('/practice/components/dialogs/');
  await page.getByLabel('Delayed alert timer').selectOption('1000');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Open delayed alert' }).click();
  await expect(page.getByTestId('browser-dialog-result')).toContainText(
    'after 1000 ms',
  );
  await page.goto('/practice/components/date-time-and-ranges/');
  await page.getByLabel('Job duration').selectOption('1000');
  await page.getByRole('button', { name: 'Start async job' }).click();
  await expect(page.locator('#async-job-result')).toContainText('100%', {
    timeout: 2500,
  });
});

test('save Chunk 6 review screenshots', async ({ page }, testInfo) => {
  const device = testInfo.project.name.startsWith('mobile')
    ? 'mobile'
    : 'desktop';
  const directory = 'docs/reports/assets/chunk-06';
  await mkdir(directory, { recursive: true });
  for (const url of chunk6Pages) {
    await page.goto(`${url}?delay=0`);
    const slug = url
      .replace(/^\/practice\//, '')
      .replace(/\/$/, '')
      .replaceAll('/', '-');
    await page.screenshot({
      path: `${directory}/${slug}-${device}.png`,
      fullPage: true,
    });
  }
});
