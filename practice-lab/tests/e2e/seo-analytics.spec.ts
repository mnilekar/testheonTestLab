import { expect, test } from './test-fixture';

const indexRoutes = [
  '/practice/',
  '/practice/playwright/',
  '/practice/playwright/locators/',
  '/practice/playwright/waits/',
  '/practice/playwright/authentication/',
  '/practice/playwright/api-testing/',
  '/practice/components/',
  '/practice/components/tables/',
  '/practice/apps/ecommerce/',
  '/practice/challenges/',
];

test('every INDEX page exposes the complete source-HTML SEO contract', async ({
  request,
}) => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const route of indexRoutes) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
    const html = await response.text();
    const title = /<title>([^<]+)<\/title>/.exec(html)?.[1] ?? '';
    const description =
      /<meta name="description" content="([^"]+)"/.exec(html)?.[1] ?? '';
    expect(title.length, route).toBeGreaterThan(0);
    expect(title.length, route).toBeLessThanOrEqual(60);
    expect(titles.has(title), route).toBe(false);
    expect(descriptions.has(description), route).toBe(false);
    titles.add(title);
    descriptions.add(description);
    expect((html.match(/<h1(?:\s|>)/g) ?? []).length, route).toBe(1);
    expect(html, route).toContain('name="robots" content="index,follow"');
    expect(html, route).toContain('data-seo-objective');
    expect(html, route).toContain('data-seo-guide');
    expect(html, route).toContain('data-seo-siblings');
    expect(html, route).toContain('"@type":"BreadcrumbList"');
    expect(html, route).toContain(
      `rel="canonical" href="https://testheon.com${route}"`,
    );
  }
});

test('sitemap contains only the INDEX allowlist and meaningful lastmod dates', async ({
  request,
}) => {
  const response = await request.get('/practice/sitemap.xml');
  expect(response.status()).toBe(200);
  const xml = await response.text();
  const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => new URL(match[1] ?? '').pathname,
  );
  expect(locations).toEqual(indexRoutes);
  expect(xml.match(/<lastmod>2026-10-11<\/lastmod>/g)).toHaveLength(
    indexRoutes.length,
  );
  expect(xml).not.toContain(
    '/practice/challenges/login-standard-user-dashboard/',
  );
  expect(xml).not.toContain('/practice/components/inputs/');
  expect(xml).not.toContain('/practice/api/');
});

test('NOINDEX fixture HTML stays followable and has no analytics runtime', async ({
  page,
}) => {
  await page.goto('/practice/components/inputs/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex,follow',
  );
  expect(await page.evaluate(() => 'dataLayer' in window)).toBe(false);
});

test('analytics emits allowlisted, non-personal challenge events without DOM mutation', async ({
  page,
}) => {
  await page.goto(
    '/practice/challenges/locate-primary-action-by-role/#ref=blog&source_post=playwright-locators',
  );
  const before = await page
    .locator('main')
    .evaluate((element) => element.outerHTML);
  await page.locator('.hint-stack details').first().locator('summary').click();
  await page.locator('details.solution summary').click();
  await page.waitForFunction(
    () =>
      ((window as Window & { dataLayer?: Record<string, unknown>[] }).dataLayer
        ?.length ?? 0) === 3,
  );
  const events = await page.evaluate(
    () =>
      (window as Window & { dataLayer?: Record<string, unknown>[] }).dataLayer,
  );
  expect(events).toEqual([
    {
      event: 'blog_to_practice_click',
      page_path: '/practice/challenges/locate-primary-action-by-role/',
      source_post: 'playwright-locators',
    },
    {
      event: 'hint_used',
      page_path: '/practice/challenges/locate-primary-action-by-role/',
      content_id: 'PW-LOC-001',
      hint_number: 1,
    },
    {
      event: 'solution_opened',
      page_path: '/practice/challenges/locate-primary-action-by-role/',
      content_id: 'PW-LOC-001',
    },
  ]);
  const after = await page
    .locator('main')
    .evaluate((element) => element.outerHTML);
  expect(after.replaceAll(' open=""', '')).toBe(before);
  expect(JSON.stringify(events)).not.toContain('standard_user');
});
