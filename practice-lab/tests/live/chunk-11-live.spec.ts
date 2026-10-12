import { mkdir } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

const evidence = 'docs/evidence/chunk-11/post-deploy';
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

test('hosted INDEX candidates preserve their SEO contract under the staging block', async ({
  request,
}) => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();

  for (const route of indexRoutes) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
    expect(response.headers()['x-robots-tag'], route).toContain('noindex');
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
    expect(html, route).toContain('name="robots" content="noindex,nofollow"');
    expect(html, route).toContain('data-seo-objective');
    expect(html, route).toContain('data-seo-guide');
    expect(html, route).toContain('data-seo-siblings');
    expect(html, route).toContain('"@type":"BreadcrumbList"');
    expect(html, route).toContain(
      `rel="canonical" href="https://practice-staging.testheon.com${route}"`,
    );
  }
});

test('hosted staging sitemap is empty, blocked, and served as XML', async ({
  request,
}) => {
  const response = await request.get('/practice/sitemap.xml');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/xml');
  expect(response.headers()['x-robots-tag']).toContain('noindex');
  const xml = await response.text();
  expect(xml).toContain('<urlset');
  expect(xml).not.toContain('<url>');
});

test('hosted analytics emits safe events without changing fixture markup', async ({
  page,
}) => {
  await page.goto(
    '/practice/challenges/locate-primary-action-by-role/#ref=blog&source_post=playwright-locators',
  );
  const main = page.locator('main');
  const before = await main.evaluate((element) => element.outerHTML);
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
  expect(events?.map((event) => event.event)).toEqual([
    'blog_to_practice_click',
    'hint_used',
    'solution_opened',
  ]);
  expect(JSON.stringify(events)).not.toContain('standard_user');
  const after = await main.evaluate((element) => element.outerHTML);
  expect(after.replaceAll(' open=""', '')).toBe(before);
});

test('save hosted Chunk 11 review screenshots', async ({ page }) => {
  await mkdir(evidence, { recursive: true });
  await page.goto('/practice/components/');
  await page.screenshot({
    path: `${evidence}/components-hub.png`,
    fullPage: true,
  });
  await page.goto('/practice/playwright/api-testing/');
  await page.screenshot({
    path: `${evidence}/api-testing-guide.png`,
    fullPage: true,
  });
});
