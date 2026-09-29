import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';
import {
  activateLocalRelease,
  deployLocalRelease,
  readCurrentRelease,
  remoteActivationCommand,
  rollbackLocalRelease,
} from '../../scripts/deploy-lib.mjs';

const temporaryRoots: string[] = [];

async function makeBuild(content: string) {
  const root = await mkdtemp(join(tmpdir(), 'testheon-build-'));
  temporaryRoots.push(root);
  await writeFile(join(root, 'index.html'), content, 'utf8');
  return root;
}

afterEach(async () => {
  await Promise.all(
    temporaryRoots
      .splice(0)
      .map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe('immutable releases and rollback', () => {
  it('deploys, rolls back to the previous release, and redeploys atomically', async () => {
    const releaseRoot = await mkdtemp(join(tmpdir(), 'testheon-releases-'));
    temporaryRoots.push(releaseRoot);
    await mkdir(join(releaseRoot, 'releases'), { recursive: true });

    const first = '20260927T100000Z';
    const second = '20260927T101500Z';
    await deployLocalRelease({
      buildDir: await makeBuild('<h1>first</h1>'),
      rootDirectory: releaseRoot,
      releaseId: first,
    });
    await deployLocalRelease({
      buildDir: await makeBuild('<h1>second</h1>'),
      rootDirectory: releaseRoot,
      releaseId: second,
    });
    expect(await readCurrentRelease(releaseRoot)).toBe(second);

    expect(await rollbackLocalRelease(releaseRoot)).toBe(first);
    expect(await readCurrentRelease(releaseRoot)).toBe(first);
    expect(
      await readFile(
        join(releaseRoot, 'releases', first, 'index.html'),
        'utf8',
      ),
    ).toContain('first');

    await activateLocalRelease(releaseRoot, second);
    expect(await readCurrentRelease(releaseRoot)).toBe(second);
    const releases = await readdir(join(releaseRoot, 'releases'));
    expect(releases.sort()).toEqual([first, second]);
  });

  it('uses a same-filesystem temporary symlink and atomic rename remotely', () => {
    const command = remoteActivationCommand({
      root: '/home/example/practice-lab-releases',
      liveLink: '/home/example/domains/staging.example/public_html/practice',
      releaseId: '20260927T101500Z',
    });
    expect(command).toContain('ln -s releases/20260927T101500Z');
    expect(command).toContain('mv -Tf');
    expect(command).not.toContain('rm -rf /home/example/domains');
  });

  it('refuses production without the explicit approval flag', () => {
    const result = spawnSync(
      process.execPath,
      ['scripts/deploy.mjs', 'deploy', '--target', 'production'],
      { cwd: process.cwd(), encoding: 'utf8' },
    );
    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toContain(
      'Production deployment refused',
    );
  });
});
