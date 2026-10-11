import { mkdir } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import catalogue from '../../content/challenges/challenges.json' with { type: 'json' };

const evidence = 'docs/evidence/chunk-10/post-deploy';

test('hosted challenge catalogue filters all 28 immutable exercises', async ({
  page,
}) => {
  await page.goto('/practice/challenges/');
  await expect(
    page.getByRole('heading', { name: 'Playwright challenges' }),
  ).toBeVisible();
  await expect(page.locator('[data-challenge-card]')).toHaveCount(28);
  await page.getByLabel('Difficulty').selectOption('expert');
  await expect(page.locator('[data-challenge-card]:visible')).toHaveCount(4);
  await page.locator('select[name="skill"]').selectOption('debugging');
  await expect(page.locator('[data-challenge-card]:visible')).toHaveCount(1);
  await expect(page.locator('#challenge-filter-status')).toHaveText(
    '1 of 28 challenges shown.',
  );
  await mkdir(evidence, { recursive: true });
  await page.screenshot({
    path: `${evidence}/catalogue-staging-expert-debugging.png`,
    fullPage: true,
  });
});

test('hosted challenge details stay noindex and all downloads are usable', async ({
  request,
}) => {
  for (const challenge of catalogue.challenges) {
    const response = await request.get(
      `/practice/challenges/${challenge.slug}/`,
    );
    expect(response.status(), challenge.id).toBe(200);
    const source = await response.text();
    expect(source, challenge.id).toContain('name="robots" content="noindex,');
    expect(source, challenge.id).toContain('I’ve tried it — show solution');
  }

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
