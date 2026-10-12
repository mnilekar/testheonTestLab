import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve('.');
const manifestPath = resolve(root, 'fixtures/manifest.json');
const lockPath = resolve(root, 'fixtures/contract-v1.0.0.json');
const testPath = 'tests/e2e/fixture-contract.spec.ts';

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const lock = JSON.parse(await readFile(lockPath, 'utf8'));
const contractTest = await readFile(resolve(root, testPath), 'utf8');

const normalize = (value) => `${JSON.stringify(value, null, 2)}\n`;
const contract = {
  contractVersion: manifest.contractVersion,
  manifestVersion: manifest.manifestVersion,
  fixtures: manifest.fixtures.map(
    ({
      id,
      version,
      url,
      anchor,
      behavior,
      defaults,
      controls,
      intentionalDefects,
      expectedOutcomes,
      tests,
    }) => ({
      id,
      version,
      url,
      anchor,
      behavior,
      defaults,
      controls,
      intentionalDefects,
      expectedOutcomes,
      tests,
    }),
  ),
};
const testSha256 = createHash('sha256').update(contractTest).digest('hex');

if (normalize(contract) !== normalize(lock.contract)) {
  throw new Error(
    'Fixture contract differs from fixtures/contract-v1.0.0.json. Bump manifestVersion, add CHANGELOG.md notes, and intentionally update the lock.',
  );
}
if (lock.fixtureContractTestSha256 !== testSha256) {
  throw new Error(
    'fixture-contract.spec.ts changed without updating the frozen lock. Bump manifestVersion and add a CHANGELOG.md entry before updating the lock hash.',
  );
}

const argIndex = process.argv.indexOf('--base');
const base = argIndex >= 0 ? process.argv[argIndex + 1] : undefined;
if (base && !/^0+$/.test(base)) {
  const changed = execFileSync(
    'git',
    [
      'diff',
      '--name-only',
      `${base}...HEAD`,
      '--',
      'practice-lab/fixtures/manifest.json',
      `practice-lab/${testPath}`,
    ],
    { cwd: resolve(root, '..'), encoding: 'utf8' },
  )
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);
  if (changed.length > 0) {
    let baseManifest;
    try {
      baseManifest = JSON.parse(
        execFileSync(
          'git',
          ['show', `${base}:practice-lab/fixtures/manifest.json`],
          {
            cwd: resolve(root, '..'),
            encoding: 'utf8',
          },
        ),
      );
    } catch {
      baseManifest = { manifestVersion: '0.0.0' };
    }
    const parse = (value) => value.split('.').map(Number);
    const newer = (left, right) => {
      const a = parse(left);
      const b = parse(right);
      return a.some(
        (part, index) =>
          part > b[index] &&
          a.slice(0, index).every((value, i) => value === b[i]),
      );
    };
    if (!newer(manifest.manifestVersion, baseManifest.manifestVersion)) {
      throw new Error(
        'Fixture contract changes require a manifestVersion bump.',
      );
    }
    const changelog = await readFile(resolve(root, 'CHANGELOG.md'), 'utf8');
    if (!changelog.includes(`## [${manifest.manifestVersion}]`)) {
      throw new Error(
        `CHANGELOG.md needs a ## [${manifest.manifestVersion}] entry.`,
      );
    }
  }
}

console.log(
  `Fixture contract ${manifest.contractVersion} verified: ${manifest.fixtures.length} fixtures, manifest ${manifest.manifestVersion}.`,
);
