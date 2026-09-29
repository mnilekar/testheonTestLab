import { defineConfig, devices } from '@playwright/test';

const externalBase = process.env.PRACTICE_LAB_BASE_URL;
const baseURL = externalBase ?? 'http://127.0.0.1:4321';
const username = process.env.PRACTICE_LAB_STAGING_HTTP_USER;
const password = process.env.PRACTICE_LAB_STAGING_HTTP_PASSWORD;
const gateCookie = process.env.PRACTICE_LAB_STAGING_GATE_COOKIE;
const localChannel = process.platform === 'win32' ? 'chrome' : undefined;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    ...(localChannel ? { channel: localChannel } : {}),
    ...(username && password
      ? { httpCredentials: { username, password } }
      : {}),
    ...(gateCookie ? { extraHTTPHeaders: { Cookie: gateCookie } } : {}),
  },
  ...(externalBase
    ? {}
    : {
        webServer: {
          command:
            'node scripts/serve-dist.mjs --port 4321 --idle-timeout 15000',
          url: 'http://127.0.0.1:4321/practice/',
          reuseExistingServer: false,
          timeout: 30_000,
        },
      }),
  projects: [
    {
      name: 'desktop-chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 1000 },
      },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
  ],
});
