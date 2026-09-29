import { expect, test } from '@playwright/test';

test('hosted auth app creates, enforces, and invalidates a cookie session', async ({
  page,
}) => {
  await page.goto('/practice/apps/auth/?delay=0');
  const login = page.locator('#login-form');
  await login.getByLabel('Username').fill('manager_user');
  await login.getByLabel('Password').fill('Practice@123');
  await page.getByRole('button', { name: 'Sign in to Practice' }).click();
  await expect(page.getByTestId('signed-in-user')).toContainText(
    'manager_user (Manager)',
  );
  await page.getByRole('button', { name: 'Read manager report' }).click();
  await expect(page.getByTestId('permission-result')).toContainText(
    'Manager allowed: reports.read',
  );
  await expect(
    page.getByRole('button', { name: 'Manage practice users' }),
  ).not.toBeVisible();
  const forbidden = await page.evaluate(async () => {
    const response = await fetch(
      '/practice/api/v1/auth/protected?permission=users.manage',
    );
    return { status: response.status, body: await response.json() };
  });
  expect(forbidden.status).toBe(403);
  expect(forbidden.body.error.code).toBe('PERMISSION_DENIED');
  await page.getByRole('button', { name: 'Log out' }).click();
  await page.getByRole('button', { name: 'Inspect session' }).click();
  await expect(page.locator('#session-result')).toContainText(
    'AUTH_SESSION_INVALID',
  );
});

test('hosted token, API-key, and Practice Inbox fixtures work', async ({
  page,
}) => {
  await page.goto('/practice/apps/auth/?delay=0');
  await page
    .getByRole('button', { name: 'Issue and store access token' })
    .click();
  await expect(page.getByTestId('token-result')).toContainText(
    'token stored in localStorage',
  );
  await page
    .getByRole('button', { name: 'Call API with bearer token' })
    .click();
  await expect(page.getByTestId('token-result')).toContainText('manager_user');
  await page.getByRole('button', { name: 'Call API-key profile' }).click();
  await expect(page.getByTestId('api-key-result')).toContainText(
    'public_demo_api_key',
  );
  await page.getByRole('button', { name: 'Send fake reset email' }).click();
  await expect(page.getByTestId('practice-inbox')).toContainText(
    'standard_user',
  );
});
