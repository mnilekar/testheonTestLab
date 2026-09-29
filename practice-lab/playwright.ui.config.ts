import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PRACTICE_LAB_BASE_URL;
if (!baseURL) throw new Error('PRACTICE_LAB_BASE_URL is required.');

const username = process.env.PRACTICE_LAB_STAGING_HTTP_USER;
const password = process.env.PRACTICE_LAB_STAGING_HTTP_PASSWORD;

export default defineConfig({
  testDir: './tests/live',
  fullyParallel: false,
  forbidOnly: true,
  retries: 2,
  timeout: 60_000,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    ...(process.platform === 'win32' ? { channel: 'chrome' } : {}),
    ...(username && password
      ? { httpCredentials: { username, password } }
      : {}),
  },
  projects: [{ name: 'staging-chrome', use: { ...devices['Desktop Chrome'] } }],
});
