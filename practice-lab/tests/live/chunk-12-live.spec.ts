import { mkdir } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

const evidence = 'docs/evidence/chunk-12/post-deploy';

test('hosted accessibility lab remains protected, isolated, and noindex', async ({
  page,
  request,
}) => {
  const response = await request.get('/practice/components/accessibility/');
  expect(response.status()).toBe(200);
  expect(response.headers()['x-robots-tag']).toContain('noindex');
  expect(response.headers()['content-security-policy']).toContain(
    "frame-ancestors 'self'",
  );
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
  expect(response.headers()['referrer-policy']).toBe('no-referrer');
  const html = await response.text();
  expect(html).toContain('data-a11y-exclude="true"');
  expect(html.match(/data-intentional-defect=/g)).toHaveLength(3);

  await page.goto('/practice/components/accessibility/');
  await expect(page.getByLabel('Work email')).toBeVisible();
  await page.getByLabel('Work email').fill('review@example.test');
  await page.getByRole('button', { name: 'Request access' }).click();
  await expect(page.getByRole('status')).toContainText(
    'Access request recorded',
  );

  await mkdir(evidence, { recursive: true });
  await page.screenshot({
    path: `${evidence}/accessibility-staging.png`,
    fullPage: true,
  });
});

test('hosted API exposes private observability without simulated errors', async ({
  request,
}) => {
  const response = await request.get('/practice/api/v1/health');
  expect(response.status()).toBe(200);
  expect(response.headers()['cache-control']).toContain('no-store');
  expect(response.headers()['x-robots-tag']).toContain('noindex');
  expect(response.headers()['content-security-policy']).toContain(
    "frame-ancestors 'none'",
  );
  const health = await response.json();
  expect(health).toMatchObject({
    status: 'ok',
    fixtureVersion: '1.0.0',
    metrics: {
      window: 'last_1000_application_requests',
      requestCount: expect.any(Number),
      p95LatencyMs: expect.any(Number),
      realErrorRate: expect.any(Number),
      simulatedErrorsExcluded: true,
    },
  });

  const protectedPath = await request.get('/practice/wp-admin/', {
    maxRedirects: 0,
  });
  expect(protectedPath.status()).toBe(404);
  expect(await protectedPath.text()).not.toContain('wp-login.php');
});
