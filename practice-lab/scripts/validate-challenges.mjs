import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import { renderChallenges } from './generate-challenges.mjs';

const root = process.cwd();
const readJson = async (path) =>
  JSON.parse(await readFile(resolve(root, path), 'utf8'));
const schema = await readJson('content/challenges/challenge.schema.json');
const catalogue = await readJson('content/challenges/challenges.json');
const manifest = await readJson('fixtures/manifest.json');
const ajv = new Ajv2020({
  allErrors: true,
  strict: false,
  validateFormats: false,
});
const validate = ajv.compile(schema);

if (!validate(catalogue)) {
  console.error(validate.errors);
  process.exitCode = 1;
  throw new Error('Challenge catalogue failed JSON Schema validation.');
}

assert.equal(
  `${JSON.stringify(catalogue, null, 2)}\n`,
  renderChallenges(),
  'challenges.json is stale; run pnpm challenges:generate',
);

const challenges = catalogue.challenges;
assert.equal(challenges.length, 28);
const unique = (values) => new Set(values).size === values.length;
assert.ok(
  unique(challenges.map(({ id }) => id)),
  'Challenge IDs must be unique.',
);
assert.ok(
  unique(challenges.map(({ slug }) => slug)),
  'Challenge slugs must be unique.',
);

const counts = Object.fromEntries(
  ['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((difficulty) => [
    difficulty,
    challenges.filter((challenge) => challenge.difficulty === difficulty)
      .length,
  ]),
);
assert.deepEqual(counts, {
  Beginner: 8,
  Intermediate: 9,
  Advanced: 7,
  Expert: 4,
});

const fixtureIds = new Set(manifest.fixtures.map(({ id }) => id));
for (const challenge of challenges) {
  for (const fixtureId of challenge.relatedFixtures) {
    assert.ok(
      fixtureIds.has(fixtureId),
      `${challenge.id} references missing ${fixtureId}`,
    );
  }
  if (challenge.starterCode) {
    await stat(resolve(root, 'starter/playwright-ts', challenge.starterCode));
  }
}

const coverage = new Set(challenges.flatMap(({ skills }) => skills));
for (const skill of [
  'locators',
  'forms',
  'tables',
  'waits',
  'dialogs',
  'frames',
  'files',
  'authentication',
  'storage-state',
  'api',
  'api-ui',
  'network-mocking',
  'ecommerce',
]) {
  assert.ok(coverage.has(skill), `Missing required skill coverage: ${skill}`);
}

for (const id of [
  'PW-AUTH-001',
  'PW-ECOM-002',
  'PW-APIUI-001',
  'PW-AUTH-004',
]) {
  assert.ok(
    challenges.some((challenge) => challenge.id === id),
    `Missing required challenge ${id}`,
  );
}

const debugChallenges = challenges.filter(({ id }) => id.startsWith('PW-DBG-'));
assert.equal(debugChallenges.length, 3);
assert.deepEqual(
  new Set(debugChallenges.map(({ slug }) => slug)),
  new Set([
    'debug-hidden-race',
    'debug-wrong-locator',
    'debug-unhandled-dialog',
  ]),
);

console.log(
  `Challenge catalogue valid: ${challenges.length} challenges (${Object.entries(
    counts,
  )
    .map(([key, value]) => `${key} ${value}`)
    .join(', ')}).`,
);
