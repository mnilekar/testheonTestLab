import { randomBytes } from 'node:crypto';
import { access, writeFile } from 'node:fs/promises';

try {
  await access('.env');
  throw new Error(
    '.env already exists; refusing to overwrite staging credentials.',
  );
} catch (error) {
  if (error && typeof error === 'object' && error.code !== 'ENOENT')
    throw error;
}

const password = randomBytes(24).toString('base64url');
const controlToken = randomBytes(32).toString('base64url');
const content = [
  'PRACTICE_LAB_STAGING_ORIGIN=https://practice-staging.testheon.com',
  'PRACTICE_LAB_STAGING_AUTH_CONFIRMED=true',
  'PRACTICE_LAB_STAGING_HTTP_USER=testheon-review',
  `PRACTICE_LAB_STAGING_HTTP_PASSWORD=${password}`,
  `PRACTICE_LAB_RELEASE_CONTROL_TOKEN=${controlToken}`,
  '',
].join('\n');
await writeFile('.env', content, { encoding: 'utf8', flag: 'wx' });
console.log('Uncommitted staging credentials created in practice-lab/.env.');
