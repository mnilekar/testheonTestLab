import { expect, test } from '@playwright/test';

test('same-origin frames and secure context headers work on staging', async ({
  page,
}) => {
  const response = await page.goto('/practice/components/frames-and-windows/');
  expect(response?.headers()['content-security-policy']).toContain(
    "frame-ancestors 'self'",
  );
  await expect(
    page
      .frameLocator('iframe[title="Single practice frame"]')
      .getByText('FRAME-4803'),
  ).toBeVisible();
  await page.goto('/practice/components/browser-context/');
  await expect(page.locator('#secure-context-state')).toContainText(
    'Secure context: yes',
  );
});

test('safe CSV upload reaches private server storage', async ({ page }) => {
  await page.goto('/practice/components/files/');
  await page.getByLabel('Single safe file').setInputFiles({
    name: 'hosted-people.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('name,team\nAsha,QA'),
  });
  await expect(page.getByTestId('upload-result')).toContainText(
    'hosted-people.csv',
  );
  await expect(page.getByTestId('upload-result')).not.toContainText('failed');
});

test('Kanban status persists through the live tasks API', async ({ page }) => {
  await page.goto('/practice/components/drag-and-drop/');
  await expect(page.getByTestId('kanban-result')).toContainText('Loaded');
  const source = page
    .getByRole('region', { name: 'To Do tasks' })
    .getByRole('listitem')
    .first();
  const id = await source.getAttribute('data-task-id');
  expect(id).toBeTruthy();
  await source.dragTo(page.getByRole('region', { name: 'Done tasks' }));
  await expect(page.getByTestId('kanban-result')).toContainText(
    `${id} persisted as done`,
  );
  const stored = await page.evaluate(async (taskId) => {
    const response = await fetch(`/practice/api/v1/tasks/${taskId}`);
    return (await response.json()).data.status as string;
  }, id);
  expect(stored).toBe('done');
});
