import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { validateFixtureManifest } from '../src/lib/manifest.ts';

const manifestPath = resolve('fixtures/manifest.json');
const schemaPath = resolve('fixtures/manifest.schema.json');

const [manifest, schema] = await Promise.all([
  readFile(manifestPath, 'utf8').then((value) => JSON.parse(value) as unknown),
  readFile(schemaPath, 'utf8').then(
    (value) => JSON.parse(value) as Record<string, unknown>,
  ),
]);

const result = validateFixtureManifest(manifest, schema);
if (!result.valid) {
  console.error('Fixture manifest validation failed:');
  for (const error of result.errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  const count = Array.isArray((manifest as { fixtures?: unknown }).fixtures)
    ? (manifest as { fixtures: unknown[] }).fixtures.length
    : 0;
  console.log(`Fixture manifest valid: ${count} fixtures.`);
}
