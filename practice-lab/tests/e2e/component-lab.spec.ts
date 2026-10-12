import { mkdir } from 'node:fs/promises';
import { expect, test } from './test-fixture';

const chunk4Pages = [
  ['/practice/components/inputs/', 'FX-INPUT-001'],
  ['/practice/components/buttons/', 'FX-BUTTON-001'],
  ['/practice/components/checkboxes-radios/', 'FX-CHOICE-001'],
  ['/practice/components/dropdowns/', 'FX-DROPDOWN-001'],
  ['/practice/components/forms/', 'FX-FORM-001'],
  ['/practice/playwright/locators/', 'FX-LOCATOR-001'],
] as const;

const pages = [
  ...chunk4Pages,
  ['/practice/components/tables/', 'FX-TABLE-001'] as const,
  ['/practice/components/search-and-lists/', 'FX-LIST-001'] as const,
  ['/practice/playwright/waits/', 'FX-WAIT-001'] as const,
  ['/practice/components/dynamic-dom/', 'FX-DOM-001'] as const,
  ['/practice/components/dialogs/', 'FX-DIALOG-001'] as const,
  ['/practice/components/interactions/', 'FX-INTERACT-001'] as const,
  ['/practice/components/date-time-and-ranges/', 'FX-DATETIME-001'] as const,
  ['/practice/components/frames-and-windows/', 'FX-FRAME-001'] as const,
  ['/practice/components/files/', 'FX-FILE-001'] as const,
  ['/practice/components/drag-and-drop/', 'FX-DRAG-001'] as const,
  ['/practice/components/browser-context/', 'FX-CONTEXT-001'] as const,
  ['/practice/apps/auth/', 'FX-AUTH-001'] as const,
  ['/practice/apps/ecommerce/', 'FX-STORE-001'] as const,
  ['/practice/components/accessibility/', 'FX-A11Y-001'] as const,
];

test('component hub links and every registered fixture page render', async ({
  page,
  request,
}, testInfo) => {
  testInfo.setTimeout(90_000);
  const hub = await request.get('/practice/playwright/');
  const source = await hub.text();
  for (const [url, fixtureId] of pages) {
    expect(source, url).toContain(`href="${url}"`);
    const response = await request.get(url);
    expect(response.status(), url).toBe(200);
    expect(await response.text()).toContain(`data-fixture-id="${fixtureId}"`);
  }
  await page.goto('/practice/playwright/');
  await expect(
    page.getByRole('link', { name: 'Input components' }),
  ).toBeVisible();
});

test('normal Lab chrome and fixture regions pass the equivalent accessibility scan', async ({
  page,
}, testInfo) => {
  testInfo.setTimeout(90_000);
  for (const [url] of pages) {
    await page.goto(url);
    const violations = await page.evaluate(() => {
      const issues: string[] = [];
      const activeElements = document.querySelectorAll<HTMLElement>(
        'button,input:not([type="hidden"]),select,textarea,img',
      );
      for (const element of activeElements) {
        if (element.closest('[data-a11y-exclude="true"]')) continue;
        if (element instanceof HTMLImageElement) {
          if (!element.hasAttribute('alt')) issues.push('image missing alt');
          continue;
        }
        const id = element.id;
        const label =
          (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) ||
          element.closest('label') ||
          element.getAttribute('aria-label') ||
          element.getAttribute('aria-labelledby') ||
          element.textContent?.trim();
        if (!label)
          issues.push(
            `${element.tagName.toLowerCase()}#${id} missing accessible name`,
          );
      }
      const ids = [...document.querySelectorAll<HTMLElement>('[id]')].map(
        (element) => element.id,
      );
      for (const id of ids) {
        if (ids.filter((candidate) => candidate === id).length > 1)
          issues.push(`duplicate id ${id}`);
      }
      const headings = [...document.querySelectorAll('h1,h2,h3')].map(
        (heading) => Number(heading.tagName.slice(1)),
      );
      if (headings.filter((level) => level === 1).length !== 1)
        issues.push('page must contain one h1');
      for (let index = 1; index < headings.length; index += 1) {
        if ((headings[index] ?? 1) - (headings[index - 1] ?? 1) > 1)
          issues.push('heading level skipped');
      }
      return issues;
    });
    expect(violations, url).toEqual([]);
  }
});

test('input fixture covers state, validation, debounce, masks and keyboard autocomplete', async ({
  page,
}) => {
  await page.goto('/practice/components/inputs/');
  await page.getByRole('button', { name: 'Show password' }).click();
  await expect(page.getByLabel('Account password')).toHaveAttribute(
    'type',
    'text',
  );
  await page.getByLabel('Fake Indian phone').fill('9876543210');
  await expect(page.getByLabel('Fake Indian phone')).toHaveValue('98765 43210');
  await page.getByLabel('Enable advanced note').check();
  await expect(page.getByLabel('Advanced note', { exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Populate field' }).click();
  await expect(page.getByLabel('Generated value')).toHaveValue(
    'Deterministic value 4803',
  );
  await page.getByLabel('Test reference').fill('bad');
  await expect(page.getByTestId('validation-result')).toContainText('QA-123');
  await page.getByLabel('Debounced project name').fill('Apollo');
  await expect(page.getByTestId('debounce-result')).toHaveText(
    'Debounced value: Apollo',
  );
  const skill = page.getByRole('combobox', { name: 'Automation skill' });
  await skill.fill('Play');
  await skill.press('Enter');
  await expect(skill).toHaveValue('Playwright automation');
});

test('intentional input and icon defects remain isolated and exact', async ({
  page,
}) => {
  await page.goto('/practice/components/inputs/');
  const placeholder = page.locator('#placeholder-only');
  await expect(placeholder).toHaveAttribute(
    'placeholder',
    'Unlabelled account alias',
  );
  await expect(page.locator('label[for="placeholder-only"]')).toHaveCount(0);
  await page.goto('/practice/components/buttons/');
  const icon = page.locator('#unnamed-icon-button');
  await expect(icon).not.toHaveAttribute('aria-label', /.+/);
  await expect(icon.locator('[aria-hidden="true"]')).toHaveCount(1);
});

test('button fixture covers gestures, delay, replacement, scoping and appearance', async ({
  page,
}) => {
  await page.goto('/practice/components/buttons/');
  await page.getByRole('button', { name: 'Run smoke test' }).click();
  await expect(page.locator('#basic-button-result')).toContainText('queued');
  await page.getByLabel('I reviewed the synthetic data').check();
  await page.getByRole('button', { name: 'Start reviewed run' }).click();
  await expect(page.locator('#condition-result')).toContainText('completed');
  await page.getByRole('button', { name: 'Double-click me' }).dblclick();
  await expect(page.locator('#gesture-result')).toContainText('Double-click');
  await page
    .getByRole('button', { name: 'Right-click me' })
    .click({ button: 'right' });
  await expect(page.locator('#gesture-result')).toContainText('Context');
  await page.getByRole('button', { name: 'Request response' }).click();
  await expect(page.locator('#delay-result')).toContainText(
    'completed after 100 ms',
  );
  const original = page.getByRole('button', { name: 'Replace this button' });
  await original.click();
  await expect(original).not.toBeAttached();
  await page
    .getByRole('region', { name: 'Danger zone' })
    .getByRole('button', { name: 'Save' })
    .click();
  await expect(page.getByTestId('duplicate-result')).toContainText('danger');
  await page.getByRole('button', { name: 'Reveal action' }).click();
  await expect(
    page.getByRole('button', { name: 'Complete delayed action' }),
  ).toBeVisible();
});

test('choice fixture covers indeterminate, hierarchy, generated and conditional states', async ({
  page,
}) => {
  await page.goto('/practice/components/checkboxes-radios/');
  await page.getByLabel('Staging').check();
  await expect(page.getByLabel('Select all environments')).toHaveJSProperty(
    'indeterminate',
    true,
  );
  await page.getByLabel('Electronics').check();
  await expect(page.getByLabel('Laptop')).toBeChecked();
  await expect(page.getByLabel('Mobile')).toBeChecked();
  await page.getByRole('button', { name: 'Generate suite options' }).click();
  await page.getByLabel('Regression').check();
  await expect(page.locator('#generated-radio-result')).toContainText(
    'Regression',
  );
  await page.getByLabel('Business', { exact: true }).check();
  await expect(
    page.getByRole('region', { name: 'Business details' }),
  ).toBeVisible();
});

test('dropdown fixture covers native, ARIA, delayed, dependent and paged options', async ({
  page,
}) => {
  await page.route('**/practice/api/v1/customers?limit=100', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: [{ city: 'Mumbai' }, { city: 'Pune' }] }),
    }),
  );
  await page.route('**/practice/api/v1/products?*', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        data: Array.from({ length: 15 }, (_, index) => ({
          id: `prd-${index + 1}`,
          name: `Product ${index + 1}`,
        })),
      }),
    }),
  );
  await page.goto('/practice/components/dropdowns/');
  await page.getByLabel('Test environment').selectOption('staging');
  await expect(page.locator('#native-select-result')).toContainText('staging');
  const combo = page.getByRole('combobox', { name: 'Timezone' });
  await combo.press('ArrowDown');
  await combo.press('Enter');
  await expect(combo).toHaveValue('Asia/Kolkata');
  await page.getByRole('button', { name: 'Load browser engines' }).click();
  await expect(page.getByLabel('Delayed engine')).toBeEnabled();
  await page.getByRole('button', { name: 'Load API locations' }).click();
  await page.getByLabel('Country').selectOption('India');
  await page.getByLabel('State').selectOption('Maharashtra');
  await page.getByLabel('City').selectOption('Mumbai');
  await expect(page.locator('#dependent-result')).toContainText('Mumbai');
  await page.getByRole('button', { name: 'Open product dropdown' }).click();
  await expect(
    page.getByRole('option', { name: 'Product 1', exact: true }),
  ).toBeVisible();
});

test('forms expose client, conditional, API success and conflict states', async ({
  page,
}) => {
  let userPosts = 0;
  await page.route('**/practice/api/v1/lab/session', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: { csrfToken: 'fixture-csrf' } }),
    }),
  );
  await page.route('**/practice/api/v1/users*', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ data: [{ email: 'existing@example.test' }] }),
      });
      return;
    }
    userPosts += 1;
    const body = route.request().postDataJSON() as { email?: string };
    if (body.email === 'existing@example.test') {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: 'DUPLICATE_RECORD',
            message: 'Email exists.',
            details: [{ field: 'email' }],
          },
        }),
      });
      return;
    }
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ data: { id: `usr-form-${userPosts}` } }),
    });
  });
  await page.goto('/practice/components/forms/');
  await page.getByRole('button', { name: 'Create learner account' }).click();
  await expect(page.locator('#registration-form [role="alert"]')).toBeVisible();
  await page.getByLabel('First name').fill('Asha');
  await page.getByLabel('Last name').fill('Tester');
  await page.getByLabel('Registration email').fill('asha.4803@example.test');
  await page.getByLabel('Phone').fill('9876543210');
  await page.getByLabel('Password', { exact: true }).fill('Strong4803');
  await page.getByLabel('Confirm password').fill('Strong4803');
  await page.getByLabel('Date of birth').fill('1995-05-12');
  await page.getByLabel('Woman').check();
  await page.getByLabel('Country').selectOption('India');
  await page.getByLabel('State').selectOption('Maharashtra');
  await page
    .locator('#registration-form')
    .getByLabel('City')
    .selectOption('Mumbai');
  await page.getByLabel('I accept the practice terms').check();
  await page.getByRole('button', { name: 'Create learner account' }).click();
  await expect(page.getByTestId('registration-result')).toContainText(
    'Created users record',
  );
  await page
    .getByRole('button', { name: 'Use an existing synthetic email' })
    .click();
  await page.getByRole('button', { name: 'Create learner account' }).click();
  await expect(page.getByTestId('registration-result')).toContainText(
    'DUPLICATE_RECORD',
  );
  await page.getByLabel('Experience level').selectOption('experienced');
  await expect(page.getByLabel('Years of experience')).toBeVisible();
});

test('locator index covers every topic with 400–800 words of guidance', async ({
  page,
}) => {
  await page.goto('/practice/playwright/locators/');
  const topics = [
    'getByRole',
    'getByText',
    'getByLabel',
    'getByPlaceholder',
    'getByAltText',
    'getByTitle',
    'getByTestId',
    'locator() with CSS',
    'filter({ hasText, has })',
    'nth()',
    'first()',
    'last()',
    'Locator chaining',
    'Frame-free scoping',
  ];
  for (const topic of topics) {
    const section = page
      .getByRole('heading', { name: topic })
      .locator('xpath=ancestor::section[1]');
    await expect(
      section.getByRole('heading', { name: 'Good DOM' }),
    ).toBeVisible();
    await expect(
      section.getByRole('heading', { name: /Awkward DOM/ }),
    ).toBeVisible();
  }
  const wordCount = await page.evaluate(() => {
    const text = [
      document.querySelector('.locator-prose')?.textContent ?? '',
      ...[...document.querySelectorAll('.fixture-section__header p')].map(
        (node) => node.textContent ?? '',
      ),
    ].join(' ');
    return text.trim().split(/\s+/).length;
  });
  expect(wordCount).toBeGreaterThanOrEqual(400);
  expect(wordCount).toBeLessThanOrEqual(800);
  await expect(page.locator('[data-a11y-exclude="true"]')).toHaveCount(14);
});

test('save Component Lab review screenshots', async ({ page }, testInfo) => {
  testInfo.setTimeout(60_000);
  const device = testInfo.project.name.startsWith('mobile')
    ? 'mobile'
    : 'desktop';
  const directory = 'docs/reports/assets/chunk-04';
  await mkdir(directory, { recursive: true });
  for (const [url] of chunk4Pages) {
    await page.goto(url);
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
