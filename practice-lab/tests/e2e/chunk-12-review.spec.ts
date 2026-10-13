import { mkdir } from 'node:fs/promises';
import { expect, test } from './test-fixture';

test('save Chunk 12 accessibility review screenshot', async ({
  page,
}, testInfo) => {
  const device = testInfo.project.name.startsWith('mobile')
    ? 'mobile'
    : 'desktop';
  const directory = 'docs/reports/assets/chunk-12';

  await page.goto('/practice/components/accessibility/');
  await expect(
    page.getByRole('heading', { name: 'Accessibility practice lab' }),
  ).toBeVisible();
  await mkdir(directory, { recursive: true });
  await page.screenshot({
    path: `${directory}/accessibility-${device}.png`,
    fullPage: true,
  });
});
