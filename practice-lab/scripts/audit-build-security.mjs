import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { extname, relative, resolve } from 'node:path';

const root = resolve('dist');
const forbiddenExtensions = new Set([
  '.env',
  '.ini',
  '.log',
  '.pem',
  '.php',
  '.sqlite',
  '.sql',
]);
const textExtensions = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.md',
  '.txt',
  '.xml',
]);
const forbiddenContent = [
  /wp-config\.php/i,
  /\$wpdb\b/,
  /DB_PASSWORD\b/,
  /BEGIN (?:RSA |EC )?PRIVATE KEY/,
  /TESTHEON_WP_APP_PASSWORD/,
  /HOSTINGER_(?:PASSWORD|TOKEN)/,
];
const findings = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else {
      const name = relative(root, path).replaceAll('\\', '/');
      if (forbiddenExtensions.has(extname(entry.name).toLowerCase()))
        findings.push(`${name}: forbidden server or secret-bearing extension`);
      if (textExtensions.has(extname(entry.name).toLowerCase())) {
        const source = await readFile(path, 'utf8');
        for (const pattern of forbiddenContent)
          if (pattern.test(source))
            findings.push(`${name}: matched ${pattern}`);
      }
    }
  }
}

await walk(root);
await mkdir(resolve('docs/evidence/chunk-12/local'), { recursive: true });
await writeFile(
  resolve('docs/evidence/chunk-12/local/build-security.json'),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), pass: findings.length === 0, findings }, null, 2)}\n`,
);
if (findings.length > 0)
  throw new Error(`Build security audit failed:\n${findings.join('\n')}`);
console.log(
  'Build security audit passed: no secrets, WordPress internals, server files, or private keys in dist.',
);
