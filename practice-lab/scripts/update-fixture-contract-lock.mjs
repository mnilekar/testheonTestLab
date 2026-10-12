import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const manifest = JSON.parse(
  await readFile(resolve('fixtures/manifest.json'), 'utf8'),
);
const approved = process.argv[process.argv.indexOf('--approve-version') + 1];
if (approved !== manifest.manifestVersion) {
  throw new Error(
    `Pass --approve-version ${manifest.manifestVersion} to acknowledge this contract update.`,
  );
}
const testSource = await readFile(
  resolve('tests/e2e/fixture-contract.spec.ts'),
  'utf8',
);
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
const lock = {
  generatedBy: 'scripts/update-fixture-contract-lock.mjs',
  fixtureContractTestSha256: createHash('sha256')
    .update(testSource)
    .digest('hex'),
  contract,
};
await writeFile(
  resolve('fixtures/contract-v1.0.0.json'),
  `${JSON.stringify(lock, null, 2)}\n`,
  'utf8',
);
console.log(
  `Wrote frozen contract ${contract.contractVersion} for manifest ${contract.manifestVersion}.`,
);
