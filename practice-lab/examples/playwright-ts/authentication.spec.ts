import { expect, test } from '@playwright/test';

test('log in once and inspect reusable authenticated state', async ({
  page,
}) => {
  await page.route('**/practice/api/v1/**', (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/lab/session'))
      return route.fulfill({
        contentType: 'application/json',
        body: '{"data":{"csrfToken":"example-csrf"}}',
      });
    if (path.endsWith('/auth/roles'))
      return route.fulfill({
        contentType: 'application/json',
        body: '{"data":[]}',
      });
    if (path.endsWith('/auth/inbox'))
      return route.fulfill({
        contentType: 'application/json',
        body: '{"data":[]}',
      });
    if (path.endsWith('/auth/login') || path.endsWith('/auth/me'))
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            user: { username: 'manager_user', role: 'Manager', demo: true },
            authentication: 'cookie',
            session: { idleTtlSeconds: 300, remembered: false },
          },
        }),
      });
    return route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: '{"error":{"code":"AUTH_REQUIRED","message":"Sign in."}}',
    });
  });
  await page.goto('/practice/apps/auth/?delay=0');
  const login = page.locator('#login-form');
  await login.getByLabel('Username').fill('manager_user');
  await login.getByLabel('Password').fill('Practice@123');
  await page.getByRole('button', { name: 'Sign in to Practice' }).click();
  await expect(page.getByTestId('signed-in-user')).toContainText(
    'manager_user',
  );
  const state = await page.context().storageState();
  expect(state.origins).toEqual(expect.any(Array));
});
