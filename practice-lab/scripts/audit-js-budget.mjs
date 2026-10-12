import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

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

const results = [];
for (const route of routes) {
  const relative = route.replace(/^\/practice\/?/, '');
  const htmlPath = resolve('dist', relative, 'index.html');
  const html = await readFile(htmlPath, 'utf8');
  const assets = new Set(
    [
      ...html.matchAll(
        /<(?:script[^>]+src|link[^>]+href)=["']([^"']+\.js)["']/g,
      ),
    ].map(([, value]) => value),
  );
  let bytes = [
    ...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g),
  ].reduce((total, [, source]) => total + Buffer.byteLength(source ?? ''), 0);
  for (const asset of assets) {
    const assetPath = resolve('dist', asset.replace(/^\/practice\//, ''));
    bytes += (await stat(assetPath)).size;
  }
  results.push({
    route,
    javascriptBytes: bytes,
    budgetBytes: budget.javascriptBytesPerPage,
    pass: bytes <= budget.javascriptBytesPerPage,
  });
}

await mkdir(resolve('docs/evidence/chunk-12/local'), { recursive: true });
await writeFile(
  resolve('docs/evidence/chunk-12/local/js-budget.json'),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2)}\n`,
);
const failed = results.filter(({ pass }) => !pass);
console.table(results);
if (failed.length > 0) {
  throw new Error(
    `JavaScript budget exceeded on ${failed.map(({ route }) => route).join(', ')}.`,
  );
}
