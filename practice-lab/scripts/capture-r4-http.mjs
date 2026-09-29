import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const label = process.argv[2];
const chunk = process.argv[3] ?? '02';
if (!label || !/^[a-z0-9-]+$/.test(label)) {
  throw new Error(
    'Usage: node scripts/capture-r4-http.mjs <evidence-label> [chunk-number]',
  );
}
if (!/^\d{2}$/.test(chunk))
  throw new Error('Chunk number must use two digits.');

const urls = [
  'https://testheon.com/',
  'https://testheon.com/playwright-ci-cd/',
  'https://testheon.com/playwright-visual-testing/',
  'https://testheon.com/playwright-trace-viewer/',
  'https://testheon.com/playwright-fixtures/',
  'https://testheon.com/playwright-test-agents/',
  'https://testheon.com/playwright-ai/',
  'https://testheon.com/playwright-mcp/',
  'https://testheon.com/playwright-interview-questions/',
  'https://testheon.com/playwright-e2e/',
  'https://testheon.com/playwright-authentication/',
];

const results = [];
for (const requestedUrl of urls) {
  const observedAt = new Date().toISOString();
  const response = await fetch(requestedUrl, {
    redirect: 'follow',
    headers: { 'user-agent': 'Testheon-Practice-Lab-R4/1.0' },
  });
  const body = await response.text();
  const canonicals = [
    ...body.matchAll(
      /<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']+)["'][^>]*>/gi,
    ),
  ].map((match) => match[1]);
  const record = {
    requestedUrl,
    finalUrl: response.url,
    status: response.status,
    canonicalCount: canonicals.length,
    canonical: canonicals[0] ?? null,
    bodySha256: createHash('sha256').update(body).digest('hex'),
    observedAt,
    headers: Object.fromEntries(response.headers.entries()),
  };
  results.push(record);
  console.log(
    `${record.status} ${record.finalUrl} canonical=${record.canonical}`,
  );
}

const evidence = {
  label,
  capturedAt: new Date().toISOString(),
  tlsVerification: 'Node fetch default verification enabled',
  results,
  pass: results.every(
    (entry) =>
      entry.status === 200 &&
      entry.canonicalCount === 1 &&
      entry.canonical === entry.finalUrl,
  ),
};
const output = resolve(
  `docs/evidence/chunk-${chunk}/${label}/http-baseline.json`,
);
await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
console.log(
  `R4 public HTTP result: ${evidence.pass ? 'PASS' : 'FAIL'} (${output})`,
);
if (!evidence.pass) process.exitCode = 1;
