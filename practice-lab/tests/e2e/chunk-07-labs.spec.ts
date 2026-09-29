import { mkdir } from 'node:fs/promises';
import { expect, test } from './test-fixture';

const tasks = [
  {
    id: 'tsk-001',
    title: 'Practice task 1',
    status: 'todo',
    priority: 'high',
  },
  {
    id: 'tsk-002',
    title: 'Practice task 2',
    status: 'in-progress',
    priority: 'medium',
  },
  {
    id: 'tsk-003',
    title: 'Practice task 3',
    status: 'done',
    priority: 'low',
  },
];

test('frames, nested frames, dynamic frames, tabs, and postMessage flows work', async ({
  context,
  page,
}) => {
  await page.goto('/practice/components/frames-and-windows/');
  await expect(
    page
      .frameLocator('iframe[title="Single practice frame"]')
      .getByText('FRAME-4803'),
  ).toBeVisible();
  const form = page.frameLocator('iframe[title="Frame with form"]');
  await form.getByLabel('Project name').fill('Atlas');
  await form.getByRole('button', { name: 'Save frame form' }).click();
  await expect(form.getByRole('status')).toHaveText('Frame form saved: Atlas.');
  await expect(
    page
      .frameLocator('iframe[title="Nested parent frame"]')
      .frameLocator('iframe[title="Nested child frame"]')
      .getByTestId('nested-frame-value'),
  ).toHaveText('NESTED-731');
  await expect(
    page.locator('[aria-label="Multiple frame fixture"] iframe'),
  ).toHaveCount(2);
  await page.getByRole('button', { name: 'Load dynamic frame' }).click();
  await expect(
    page
      .frameLocator('iframe[title="Dynamically loaded practice frame"]')
      .getByTestId('dynamic-frame-ready'),
  ).toHaveText('Dynamic frame ready.');

  const tabPromise = context.waitForEvent('page');
  await page.getByRole('link', { name: 'Open new tab fixture' }).click();
  const tab = await tabPromise;
  await expect(
    tab.getByRole('heading', { name: 'New tab fixture' }),
  ).toBeVisible();
  await tab.close();

  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Open popup sign-in' }).click();
  const popup = await popupPromise;
  await popup.getByRole('button', { name: 'Send result to parent' }).click();
  await expect(page.getByTestId('window-result')).toContainText(
    'Signed in as Demo Learner',
  );
  await popup.close();
});

test('file inputs, previews, dropzone, progress, and client rejection stay observable', async ({
  page,
}) => {
  await page.route('**/practice/api/v1/lab/session', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: { csrfToken: 'chunk-seven-csrf' } }),
    }),
  );
  await page.route('**/practice/api/v1/files/upload', async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            id: 'upl-local',
            name: 'people.csv',
            mime: 'text/csv',
            size: 24,
            expiresInSeconds: 600,
          },
        ],
      }),
    });
  });
  await page.goto('/practice/components/files/');
  await page.getByLabel('Single safe file').setInputFiles({
    name: 'people.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('name,team\nAsha,QA\nKabir,Platform'),
  });
  await expect(page.getByTestId('upload-result')).toContainText('people.csv');
  await expect(page.locator('#upload-progress')).toHaveAttribute(
    'value',
    '100',
  );
  await expect(
    page.getByRole('table', { name: 'Sanitized CSV preview' }),
  ).toContainText('Kabir');
  await page.getByLabel('Single safe file').setInputFiles({
    name: 'shell.php',
    mimeType: 'application/x-httpd-php',
    buffer: Buffer.from('<?php echo 1;'),
  });
  await expect(page.locator('#rejection-result')).toContainText(
    'EXTENSION_REJECTED',
  );
  await page.getByLabel('Dropzone file picker').setInputFiles({
    name: 'notes.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('Safe synthetic notes'),
  });
  await expect(page.getByTestId('upload-result')).toContainText('Uploaded');
});

test('all download fixtures expose deterministic suggested filenames', async ({
  page,
}) => {
  const filenames: Record<string, string> = {
    'static-pdf': 'testheon-practice-checklist.pdf',
    'static-csv': 'testheon-practice-data.csv',
    'static-txt': 'testheon-practice-notes.txt',
    'dynamic-csv': 'testheon-session-tasks.csv',
    'dynamic-pdf': 'testheon-session-report.pdf',
  };
  await page.route('**/practice/api/v1/files/download/**', (route) => {
    const kind = new URL(route.request().url()).pathname.split('/').pop() ?? '';
    const filename = filenames[kind] ?? 'unknown.txt';
    return route.fulfill({
      status: 200,
      contentType: filename.endsWith('.pdf') ? 'application/pdf' : 'text/plain',
      headers: { 'Content-Disposition': `attachment; filename="${filename}"` },
      body: filename.endsWith('.pdf') ? '%PDF-1.4\n%%EOF' : 'fixture',
    });
  });
  await page.route('**/practice/api/v1/tasks?*', (route) =>
    route.fulfill({ contentType: 'application/json', body: '{"data":[]}' }),
  );
  await page.goto('/practice/components/files/');
  for (const [label, expected] of [
    ['Download static PDF', filenames['static-pdf']],
    ['Download static CSV', filenames['static-csv']],
    ['Download static TXT', filenames['static-txt']],
    ['Download session CSV report', filenames['dynamic-csv']],
    ['Download session PDF report', filenames['dynamic-pdf']],
  ] as const) {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: label }).click();
    expect((await downloadPromise).suggestedFilename()).toBe(expected);
  }
  const apiDownload = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Request API then download report' })
    .click();
  expect((await apiDownload).suggestedFilename()).toBe(
    'testheon-session-tasks.csv',
  );
});

test('drag, keyboard reorder, file drop, and API-backed Kanban work', async ({
  page,
}) => {
  let patchedStatus = '';
  await page.route('**/practice/api/v1/lab/session', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: { csrfToken: 'drag-csrf' } }),
    }),
  );
  await page.route('**/practice/api/v1/tasks?*', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: tasks }),
    }),
  );
  await page.route('**/practice/api/v1/tasks/tsk-001', async (route) => {
    const body = route.request().postDataJSON() as { status: string };
    patchedStatus = body.status;
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: { ...tasks[0], status: body.status } }),
    });
  });
  await page.goto('/practice/components/drag-and-drop/');
  await page
    .getByRole('listitem', { name: 'Accessibility review' })
    .dragTo(page.getByRole('region', { name: 'Done card zone' }));
  await expect(page.getByTestId('drag-result')).toContainText('Done');
  await page.getByRole('button', { name: 'Move Mobile smoke up' }).click();
  await expect(page.locator('#sort-drag-result')).toContainText(
    'API contract, Mobile smoke, Desktop smoke',
  );
  await page.getByLabel('Choose files for drag practice').setInputFiles({
    name: 'drag.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('a,b\n1,2'),
  });
  await expect(page.locator('#drag-file-result')).toContainText('Accepted 1');
  const task = page.getByRole('listitem', {
    name: 'Practice task 1, high priority',
  });
  await task.dragTo(page.getByRole('region', { name: 'Done tasks' }));
  await expect(page.getByTestId('kanban-result')).toContainText(
    'tsk-001 persisted as done',
  );
  expect(patchedStatus).toBe('done');
});

test('cookies, storage, permissions, offline routing, and breakpoints expose state', async ({
  context,
  page,
}, testInfo) => {
  await page.route('**/practice/api/v1/lab/session', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: { csrfToken: 'context-csrf' } }),
    }),
  );
  await page.goto('/practice/components/browser-context/');
  await page.getByRole('button', { name: 'Set fixture cookie' }).click();
  await page.getByRole('button', { name: 'Read fixture cookie' }).click();
  await expect(page.getByTestId('cookie-result')).toContainText(
    'practice_preference=compact',
  );
  await page
    .getByRole('button', { name: 'Accept practice preference' })
    .click();
  await expect(page.locator('#consent-result')).toContainText('accepted');
  await page
    .getByRole('button', { name: 'Inspect auth cookie boundary' })
    .click();
  await expect(page.getByTestId('cookie-result')).toContainText('HttpOnly');

  await page.getByLabel('Local storage value').fill('local-4803');
  await page.getByRole('button', { name: 'Write local storage' }).click();
  await page.getByLabel('Session storage value').fill('session-731');
  await page.getByRole('button', { name: 'Write session storage' }).click();
  await expect(page.locator('#local-storage-result')).toContainText(
    'local-4803',
  );
  await expect(page.locator('#session-storage-result')).toContainText(
    'session-731',
  );

  const origin = new URL(page.url()).origin;
  await context.grantPermissions(['geolocation'], { origin });
  await context.setGeolocation({ latitude: 12.9716, longitude: 77.5946 });
  await page.getByRole('button', { name: 'Read fictional location' }).click();
  await expect(page.getByTestId('geolocation-result')).toContainText(
    'Bengaluru Test Centre',
  );

  await page.route('**/practice/api/v1/health', (route) => route.abort());
  await page.getByRole('button', { name: 'Request health endpoint' }).click();
  await expect(page.getByTestId('network-result')).toContainText(
    'Network request failed',
  );
  if (testInfo.project.name.startsWith('mobile')) {
    const width = await page.evaluate(() => window.innerWidth);
    const mode = width >= 1024 ? 'desktop' : width >= 700 ? 'tablet' : 'mobile';
    await expect(page.getByTestId('responsive-result')).toContainText(
      `Responsive mode: ${mode}; viewport ${width}px`,
    );
  } else {
    for (const [width, mode] of [
      [699, 'mobile'],
      [700, 'tablet'],
      [1023, 'tablet'],
      [1024, 'desktop'],
    ] as const) {
      await page.setViewportSize({ width, height: 800 });
      await expect(page.getByTestId('responsive-result')).toContainText(
        `Responsive mode: ${mode}; viewport ${width}px`,
      );
    }
  }
});

test('save Chunk 7 review screenshots', async ({ page }, testInfo) => {
  testInfo.setTimeout(60_000);
  const device = testInfo.project.name.startsWith('mobile')
    ? 'mobile'
    : 'desktop';
  const directory = 'docs/reports/assets/chunk-07';
  await mkdir(directory, { recursive: true });
  for (const route of [
    'frames-and-windows',
    'files',
    'drag-and-drop',
    'browser-context',
  ]) {
    if (route === 'drag-and-drop') {
      await page.route('**/practice/api/v1/tasks?*', (request) =>
        request.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({ data: tasks }),
        }),
      );
    }
    await page.goto(`/practice/components/${route}/`);
    await page.waitForLoadState('networkidle');
    await page.getByRole('contentinfo').scrollIntoViewIfNeeded();
    await page.locator('h1').first().scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `${directory}/components-${route}-${device}.png`,
      fullPage: true,
      scale: 'css',
    });
  }
});
