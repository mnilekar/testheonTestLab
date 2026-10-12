import { mkdir } from 'node:fs/promises';
import { expect, test } from './test-fixture';

const roles = [
  { role: 'Customer', permissions: ['profile.read', 'orders.create'] },
  { role: 'Employee', permissions: ['profile.read', 'tickets.update'] },
  {
    role: 'Manager',
    permissions: ['profile.read', 'tickets.update', 'reports.read'],
  },
  {
    role: 'Admin',
    permissions: [
      'profile.read',
      'orders.create',
      'tickets.update',
      'reports.read',
      'users.manage',
    ],
  },
  { role: 'Read-only', permissions: ['profile.read', 'reports.read'] },
];

test('auth UI covers login, registration, reset, roles, tokens, API key, and tab state', async ({
  page,
}) => {
  let signedIn = false;
  let inbox = false;
  await page.route('**/practice/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace('/practice/api/v1/', '');
    const fulfill = (body: unknown, status = 200) =>
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    if (path === 'lab/session')
      return fulfill({ data: { csrfToken: 'auth-csrf' } });
    if (path === 'auth/roles') return fulfill({ data: roles });
    if (path === 'auth/inbox')
      return fulfill({
        data: inbox
          ? [
              {
                to: 'standard_user',
                subject: 'Reset your practice password',
                resetUrl: '/practice/apps/auth/?reset=rst_local_4803',
                expiresAt: '2026-09-29T10:00:00Z',
              },
            ]
          : [],
      });
    if (path === 'auth/login') {
      signedIn = true;
      return fulfill({
        data: {
          user: {
            username: 'manager_user',
            role: 'Manager',
            demo: true,
          },
          session: { idleTtlSeconds: 300, remembered: false },
        },
      });
    }
    if (path === 'auth/me') {
      if (route.request().headers().authorization?.includes('invalid'))
        return fulfill(
          { error: { code: 'TOKEN_INVALID', message: 'Invalid token.' } },
          401,
        );
      if (!signedIn && !route.request().headers().authorization)
        return fulfill(
          { error: { code: 'AUTH_REQUIRED', message: 'Sign in.' } },
          401,
        );
      return fulfill({
        data: {
          user: { username: 'manager_user', role: 'Manager', demo: true },
          authentication: route.request().headers().authorization
            ? 'bearer'
            : 'cookie',
        },
      });
    }
    if (path === 'auth/register')
      return fulfill(
        {
          data: {
            user: { username: 'learner_4803', role: 'Customer', demo: false },
          },
        },
        201,
      );
    if (path === 'auth/forgot-password') {
      inbox = true;
      return fulfill(
        {
          data: {
            message:
              'If the practice account is eligible, a reset link is now in Practice Inbox.',
          },
        },
        202,
      );
    }
    if (path === 'auth/reset-password')
      return fulfill({ data: { passwordReset: true } });
    if (path === 'auth/lockout/reset')
      return fulfill({ data: { message: 'Temporary lock reset.' } });
    if (path === 'auth/logout') {
      signedIn = false;
      return fulfill({ data: { loggedOut: true } });
    }
    if (path === 'auth/token')
      return fulfill({
        data: {
          tokenType: 'Bearer',
          accessToken: 'atk_local_4803',
          refreshToken: 'rtk_local_4803',
          expiresIn: 120,
        },
      });
    if (path === 'auth/refresh')
      return fulfill({
        data: {
          accessToken: 'atk_local_731',
          refreshToken: 'rtk_local_731',
        },
      });
    if (path === 'auth/api-key/profile')
      return fulfill({
        data: { authenticated: true, principal: 'public_demo_api_key' },
      });
    if (path === 'auth/protected')
      return fulfill({
        data: {
          allowed: true,
          permission:
            url.searchParams.get('permission') ??
            (route.request().postDataJSON() as { permission: string })
              .permission,
          role: 'Manager',
        },
      });
    return fulfill({ error: { code: 'NOT_FOUND', message: path } }, 404);
  });

  await page.goto('/practice/apps/auth/?delay=0');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex,follow',
  );
  await expect(page.locator('[data-fixture-id="FX-AUTH-001"]')).toBeVisible();
  await expect(
    page.getByRole('table', { name: 'Public demo accounts' }),
  ).toContainText('slow_user');
  await page.locator('#login-form').getByLabel('Username').fill('manager_user');
  await page.getByRole('button', { name: 'Sign in to Practice' }).click();
  await expect(page.getByTestId('signed-in-user')).toContainText(
    'manager_user (Manager)',
  );
  await expect(
    page.getByRole('button', { name: 'Manage practice users' }),
  ).not.toBeVisible();
  await page.getByRole('button', { name: 'Read manager report' }).click();
  await expect(page.getByTestId('permission-result')).toContainText(
    'Manager allowed: reports.read',
  );

  await page.getByRole('button', { name: 'Register sandbox account' }).click();
  await expect(page.getByTestId('register-result')).toContainText(
    'Created learner_4803',
  );
  await page.getByRole('button', { name: 'Send fake reset email' }).click();
  await expect(page.getByTestId('practice-inbox')).toContainText(
    'standard_user',
  );
  await page.getByRole('link', { name: 'Open reset link' }).click();
  await expect(page.getByLabel('Reset or forced-change token')).toHaveValue(
    'rst_local_4803',
  );
  await page.getByRole('button', { name: 'Reset practice password' }).click();
  await expect(page.getByTestId('reset-result')).toContainText(
    'prior sessions were revoked',
  );

  await page
    .getByRole('button', { name: 'Issue and store access token' })
    .click();
  await expect(page.getByTestId('token-result')).toContainText('localStorage');
  expect(
    await page.evaluate(() => localStorage.getItem('practice_access_token')),
  ).toBe('atk_local_4803');
  await page
    .getByRole('button', { name: 'Call API with bearer token' })
    .click();
  await expect(page.getByTestId('token-result')).toContainText('manager_user');
  await page.getByRole('button', { name: 'Call API-key profile' }).click();
  await expect(page.getByTestId('api-key-result')).toContainText(
    'public_demo_api_key',
  );
  await page.getByLabel('Current onboarding step').selectOption('review');
  await page.getByRole('button', { name: 'Save wizard step' }).click();
  await expect(page.locator('#wizard-result')).toContainText('review');
  expect(
    await page.evaluate(() => sessionStorage.getItem('practice_auth_wizard')),
  ).toBe('review');
});

test('authentication lesson is indexable and teaches every required reuse flow', async ({
  page,
}) => {
  await page.goto('/practice/playwright/authentication/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'index,follow',
  );
  for (const heading of [
    'Create state through one observable login',
    'Model permissions in Playwright configuration',
    'Skip repeated UI login without skipping behavior',
    'Assert server invalidation, not only navigation',
  ]) {
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }
  const text = await page.locator('article').innerText();
  for (const concept of [
    'storageState',
    'API login',
    '401',
    '403',
    'TOKEN_EXPIRED',
  ]) {
    expect(text).toContain(concept);
  }
});

test('save Chunk 8 review screenshots', async ({ page }, testInfo) => {
  testInfo.setTimeout(60_000);
  await page.route('**/practice/api/v1/**', (route) =>
    route.fulfill({
      status: route.request().url().endsWith('/auth/me') ? 401 : 200,
      contentType: 'application/json',
      body: route.request().url().endsWith('/auth/roles')
        ? JSON.stringify({ data: roles })
        : route.request().url().endsWith('/auth/inbox')
          ? '{"data":[]}'
          : route.request().url().endsWith('/auth/me')
            ? '{"error":{"code":"AUTH_REQUIRED","message":"Sign in."}}'
            : '{"data":{"csrfToken":"screenshot-csrf"}}',
    }),
  );
  const device = testInfo.project.name.startsWith('mobile')
    ? 'mobile'
    : 'desktop';
  const directory = 'docs/reports/assets/chunk-08';
  await mkdir(directory, { recursive: true });
  for (const [path, name] of [
    ['/practice/apps/auth/', 'apps-auth'],
    ['/practice/playwright/authentication/', 'playwright-authentication'],
  ] as const) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: `${directory}/${name}-${device}.png`,
      fullPage: true,
      scale: 'css',
    });
  }
});
