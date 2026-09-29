import { expect, test } from '@playwright/test';

test('setInputFiles uploads a safe CSV and renders its table preview', async ({
  page,
}) => {
  await page.route('**/practice/api/v1/lab/session', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: { csrfToken: 'example-csrf' } }),
    }),
  );
  await page.route('**/practice/api/v1/files/upload', (route) =>
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            id: 'upl-example',
            name: 'people.csv',
            mime: 'text/csv',
            size: 24,
            expiresInSeconds: 600,
          },
        ],
      }),
    }),
  );
  await page.goto('/practice/components/files/');
  await page.getByLabel('Single safe file').setInputFiles({
    name: 'people.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('name,team\nAsha,QA'),
  });
  await expect(page.getByTestId('upload-result')).toContainText('people.csv');
  await expect(
    page.getByRole('table', { name: 'Sanitized CSV preview' }),
  ).toBeVisible();
});

test("waitForEvent('download') exposes the attachment filename", async ({
  page,
}) => {
  await page.route('**/practice/api/v1/files/download/static-txt', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/plain',
      headers: {
        'Content-Disposition':
          'attachment; filename="testheon-practice-notes.txt"',
      },
      body: 'Synthetic practice notes.',
    }),
  );
  await page.goto('/practice/components/files/');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download static TXT' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('testheon-practice-notes.txt');
});

test('dragTo moves a card between named zones', async ({ page }) => {
  await page.route('**/practice/api/v1/tasks?*', (route) =>
    route.fulfill({ contentType: 'application/json', body: '{"data":[]}' }),
  );
  await page.goto('/practice/components/drag-and-drop/');
  await page
    .getByRole('listitem', { name: 'Accessibility review' })
    .dragTo(page.getByRole('region', { name: 'Done card zone' }));
  await expect(page.getByTestId('drag-result')).toContainText('Done');
});
