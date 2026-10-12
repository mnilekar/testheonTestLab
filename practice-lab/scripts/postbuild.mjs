import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import manifest from '../fixtures/manifest.json' with { type: 'json' };

const dist = resolve('dist');
const target = process.env.PUBLIC_DEPLOY_TARGET ?? 'local';
const robots =
  target === 'staging'
    ? 'noindex,nofollow'
    : (process.env.PUBLIC_ROBOTS_POLICY ?? 'index,follow');
const releaseId = process.env.PRACTICE_LAB_RELEASE_ID ?? 'local-build';

await readFile(resolve(dist, 'index.html'), 'utf8');
await mkdir(dist, { recursive: true });

const release = {
  releaseId,
  target,
  robots,
  generatedAt: new Date().toISOString(),
  manifestVersion: manifest.manifestVersion,
};

await writeFile(
  resolve(dist, 'release.json'),
  `${JSON.stringify(release, null, 2)}\n`,
  'utf8',
);

const securityHeaders = [
  'Options -Indexes',
  'DirectoryIndex index.html',
  'ErrorDocument 404 /practice/404.html',
  '',
  '<IfModule mod_headers.c>',
  '  Header always set X-Content-Type-Options "nosniff"',
  '  Header always set Referrer-Policy "strict-origin-when-cross-origin"',
  '  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"',
  "  Header always set Content-Security-Policy \"default-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data:; font-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'\"",
  ...(target === 'staging'
    ? [
        '  Header always set X-Robots-Tag "noindex, nofollow"',
        '  Header always set Cache-Control "no-store, private"',
      ]
    : []),
  '  <FilesMatch "\\.(zip|csv|md|json|xml)$">',
  '    Header always set X-Robots-Tag "noindex, nofollow"',
  '  </FilesMatch>',
  '</IfModule>',
  '',
  '<Files "sitemap.xml">',
  '  ForceType application/xml',
  '</Files>',
  '',
].join('\n');

await writeFile(resolve(dist, '.htaccess'), securityHeaders, 'utf8');

if (target === 'staging') {
  await writeFile(
    resolve(dist, 'robots.txt'),
    'User-agent: *\nDisallow: /\n',
    'utf8',
  );
}

console.log(`Post-build policy written for ${target} (${robots}).`);
