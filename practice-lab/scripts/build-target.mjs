import { spawnSync } from 'node:child_process';

const target = process.argv[2];
if (target !== 'staging' && target !== 'production') {
  throw new Error('Usage: node scripts/build-target.mjs <staging|production>');
}

const origin =
  target === 'staging'
    ? (process.env.PRACTICE_LAB_STAGING_ORIGIN ??
      'https://practice-staging.testheon.com')
    : 'https://testheon.com';

const isWindows = process.platform === 'win32';
const command = isWindows ? (process.env.ComSpec ?? 'cmd.exe') : 'pnpm';
const commandArgs = isWindows
  ? ['/d', '/s', '/c', 'pnpm run build']
  : ['run', 'build'];
const result = spawnSync(command, commandArgs, {
  cwd: process.cwd(),
  env: {
    ...process.env,
    PUBLIC_SITE_ORIGIN: origin,
    PUBLIC_DEPLOY_TARGET: target,
    PUBLIC_ROBOTS_POLICY:
      target === 'staging' ? 'noindex,nofollow' : 'index,follow',
  },
  stdio: 'inherit',
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
