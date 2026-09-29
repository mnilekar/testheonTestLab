import { defineConfig } from '@playwright/test';

const origin = process.env.PRACTICE_LAB_API_BASE_URL;
if (!origin) {
  throw new Error('PRACTICE_LAB_API_BASE_URL is required for live API tests.');
}
const username = process.env.PRACTICE_LAB_STAGING_HTTP_USER;
const password = process.env.PRACTICE_LAB_STAGING_HTTP_PASSWORD;
if (!username || !password) {
  throw new Error('Staging HTTP credentials are required for live API tests.');
}

export default defineConfig({
  testDir: './tests/api',
  fullyParallel: false,
  workers: 1,
  retries: 2,
  timeout: 60_000,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report/api' }],
  ],
  use: {
    baseURL: `${origin.replace(/\/$/, '')}/practice/api/v1/`,
    httpCredentials: { username, password },
    extraHTTPHeaders: { Accept: 'application/json' },
  },
});
