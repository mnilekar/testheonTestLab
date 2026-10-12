import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';

const budget = JSON.parse(
  await readFile(resolve('config/performance-budget.json'), 'utf8'),
);
const routes = [
  '/practice/',
  '/practice/playwright/locators/',
  '/practice/components/tables/',
  '/practice/challenges/',
  '/practice/apps/ecommerce/',
];
const port = 4330;
const origin = `http://127.0.0.1:${port}`;
const server = spawn(
  process.execPath,
  [
    'scripts/serve-dist.mjs',
    '--port',
    String(port),
    '--idle-timeout',
    '180000',
  ],
  {
    cwd: resolve('.'),
    stdio: ['ignore', 'pipe', 'inherit'],
  },
);

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${origin}/practice/`);
      if (response.ok) return;
    } catch {
      // The server may still be binding the local port.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 200));
  }
  throw new Error('Built-site server did not become ready for Lighthouse.');
}

let chrome;
try {
  await waitForServer();
  chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
  });
  const results = [];
  for (const route of routes) {
    const runner = await lighthouse(`${origin}${route}`, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      formFactor: 'mobile',
      onlyCategories: ['performance', 'accessibility', 'best-practices'],
      screenEmulation: {
        mobile: true,
        width: 412,
        height: 823,
        deviceScaleFactor: 1.75,
        disabled: false,
      },
    });
    if (!runner) throw new Error(`Lighthouse returned no result for ${route}.`);
    const lhr = runner.lhr;
    results.push({
      route,
      performance: lhr.categories.performance?.score ?? null,
      accessibility: lhr.categories.accessibility?.score ?? null,
      bestPractices: lhr.categories['best-practices']?.score ?? null,
      cumulativeLayoutShift:
        lhr.audits['cumulative-layout-shift']?.numericValue ?? null,
      largestContentfulPaintMs:
        lhr.audits['largest-contentful-paint']?.numericValue ?? null,
    });
  }
  const landing = results.find(({ route }) => route === '/practice/');
  const thresholds = budget.lighthouse;
  const pass =
    landing &&
    landing.performance >= thresholds.landingPerformance &&
    landing.cumulativeLayoutShift < thresholds.landingCumulativeLayoutShift &&
    landing.largestContentfulPaintMs <
      thresholds.landingLargestContentfulPaintMs;
  await mkdir(resolve('docs/evidence/chunk-12/local'), { recursive: true });
  await writeFile(
    resolve('docs/evidence/chunk-12/local/lighthouse-mobile.json'),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), pass: Boolean(pass), results }, null, 2)}\n`,
  );
  console.table(results);
  if (!pass)
    throw new Error(
      'Landing-page Lighthouse performance, CLS, or LCP target was missed.',
    );
} finally {
  if (chrome) await chrome.kill();
  server.kill();
}
