import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test } from './test-fixture';

interface ContractFixture {
  id: string;
  version: string;
  url: string;
  anchor: string;
  intentionalDefects: string[];
  expectedOutcomes: string[];
  tests: string[];
}

const lock = JSON.parse(
  await readFile(resolve('fixtures/contract-v1.0.0.json'), 'utf8'),
) as { contract: { contractVersion: string; fixtures: ContractFixture[] } };

test('frozen 1.0.0 fixture contract covers every registered behavior and defect', async ({
  page,
  request,
}) => {
  expect(lock.contract.contractVersion).toBe('1.0.0');
  expect(lock.contract.fixtures).toHaveLength(20);

  for (const fixture of lock.contract.fixtures) {
    expect(fixture.expectedOutcomes.length, fixture.id).toBeGreaterThan(0);
    expect(fixture.tests.length, fixture.id).toBeGreaterThan(0);
    for (const testPath of fixture.tests) {
      await expect(
        readFile(resolve(testPath), 'utf8'),
        `${fixture.id} references ${testPath}`,
      ).resolves.not.toHaveLength(0);
    }

    const response = await request.get(fixture.url);
    expect(response.status(), fixture.url).toBe(200);
    await page.goto(`${fixture.url}${fixture.anchor}`);
    await expect(
      page.locator(`[data-fixture-id="${fixture.id}"]`),
    ).toBeVisible();
  }
});

test('accessibility fixture exposes only the three frozen intentional defects', async ({
  page,
}) => {
  const fixture = lock.contract.fixtures.find(({ id }) => id === 'FX-A11Y-001');
  expect(fixture?.intentionalDefects).toHaveLength(3);
  await page.goto('/practice/components/accessibility/');
  await expect(page.locator('[data-a11y-exclude]')).toHaveCount(1);
  await expect(page.locator('[data-intentional-defect]')).toHaveCount(3);
  await expect(
    page.locator('[data-intentional-defect="missing-input-label"] input'),
  ).not.toHaveAttribute('aria-label', /.+/);
  await expect(
    page.locator('[data-intentional-defect="unnamed-icon-button"]'),
  ).toHaveAccessibleName('');
  await expect(
    page.locator('[data-intentional-defect="insufficient-contrast"]'),
  ).toHaveCSS('color', 'rgb(183, 183, 183)');
});
