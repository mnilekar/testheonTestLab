import { expect, test } from './test-fixture';

const expectedOrigin =
  process.env.PRACTICE_LAB_EXPECTED_CANONICAL_ORIGIN ?? 'https://testheon.com';
const expectedRobots =
  process.env.PRACTICE_LAB_EXPECTED_ROBOTS ?? 'index,follow';

test('hub renders its SEO contract without console errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/practice/');
  await expect(page).toHaveTitle('Testheon Practice Lab');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Testheon Practice Lab' }),
  ).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    `${expectedOrigin}/practice/`,
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    expectedRobots,
  );
  await expect(
    page.getByText('Advanced Playwright', { exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('every Lab link in hub HTML returns 200', async ({ page, request }) => {
  const response = await request.get('/practice/');
  expect(response.status()).toBe(200);
  const source = await response.text();
  expect(source).toContain('href="/practice/playwright/"');
  expect(source).toContain('href="/practice/"');

  await page.goto('/practice/');
  const hrefs = await page
    .locator('a[href^="/practice/"]')
    .evaluateAll(
      (links) =>
        [
          ...new Set(
            links.map((link) => link.getAttribute('href')).filter(Boolean),
          ),
        ] as string[],
    );
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) {
    const linked = await request.get(href);
    expect(linked.status(), href).toBe(200);
  }
});

test('keyboard reaches the main Lab navigation', async ({ page }) => {
  await page.goto('/practice/');
  let reached = false;
  for (let index = 0; index < 8; index += 1) {
    await page.keyboard.press('Tab');
    reached = await page.evaluate(() => {
      const active = document.activeElement;
      return Boolean(
        active && active.closest('nav[aria-label="Lab navigation"]'),
      );
    });
    if (reached) break;
  }
  expect(reached).toBe(true);
});

test('Lab-scoped missing route returns the Lab 404', async ({ request }) => {
  const response = await request.get('/practice/not-a-real-lab-route/');
  expect(response.status()).toBe(404);
  expect(await response.text()).toContain('Practice page not found');
});

test('save review screenshot', async ({ page }, testInfo) => {
  await page.goto('/practice/');
  await page.screenshot({
    path: `docs/reports/assets/chunk-02/hub-${testInfo.project.name.startsWith('mobile') ? 'mobile' : 'desktop'}.png`,
    fullPage: true,
  });
});
