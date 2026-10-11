import { mkdir } from 'node:fs/promises';
import { expect, test } from './test-fixture';
import catalogue from '../../content/challenges/challenges.json' with { type: 'json' };

const evidence = 'docs/evidence/chunk-10';

test('catalogue is complete in static HTML and filters progressively', async ({
  page,
  request,
}, testInfo) => {
  const response = await request.get('/practice/challenges/');
  expect(response.status()).toBe(200);
  const source = await response.text();
  for (const challenge of catalogue.challenges) {
    expect(source).toContain(`/practice/challenges/${challenge.slug}/`);
  }
  expect(source).toContain('name="robots" content="index,follow"');

  await page.goto('/practice/challenges/');
  await expect(page.locator('[data-challenge-card]')).toHaveCount(28);
  await page.getByLabel('Difficulty').selectOption('expert');
  await expect(page.locator('[data-challenge-card]:visible')).toHaveCount(4);
  await page.locator('select[name="skill"]').selectOption('debugging');
  await expect(page.locator('[data-challenge-card]:visible')).toHaveCount(1);
  await expect(page.locator('#challenge-filter-status')).toHaveText(
    '1 of 28 challenges shown.',
  );
  if (testInfo.project.name === 'desktop-chrome') {
    await mkdir(evidence, { recursive: true });
    await page.screenshot({
      path: `${evidence}/catalogue-expert-debugging.png`,
      fullPage: true,
    });
  }
});

test('all detail pages are noindex, linked to fixtures, and expose progressive help', async ({
  request,
}) => {
  for (const challenge of catalogue.challenges) {
    const response = await request.get(
      `/practice/challenges/${challenge.slug}/`,
    );
    expect(response.status(), challenge.id).toBe(200);
    const source = await response.text();
    expect(source, challenge.id).toContain(
      'name="robots" content="noindex,follow"',
    );
    expect(source, challenge.id).toContain('Open practice page');
    expect(source, challenge.id).toContain('Hint 1');
    expect(source, challenge.id).toContain('Hint 2');
    expect(source, challenge.id).toContain('Hint 3');
    expect(source, challenge.id).toContain('I’ve tried it — show solution');
  }
});

test('starter and ecommerce downloads are served with usable content', async ({
  request,
}) => {
  for (const path of [
    'playwright-ts-starter.zip',
    'playwright-python-starter.zip',
    'playwright-java-starter.zip',
    'test-cases/ecommerce.json',
    'test-cases/ecommerce.csv',
    'test-cases/ecommerce.md',
  ]) {
    const response = await request.get(`/practice/downloads/${path}`);
    expect(response.status(), path).toBe(200);
    expect((await response.body()).length, path).toBeGreaterThan(100);
  }
});
