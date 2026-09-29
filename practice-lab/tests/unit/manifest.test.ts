import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { validateFixtureManifest } from '../../src/lib/manifest';

async function loadJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(resolve(path), 'utf8')) as unknown;
}

describe('fixture manifest', () => {
  it('accepts the registered Chunk 9 fixtures and anchors', async () => {
    const manifest = await loadJson('fixtures/manifest.json');
    const schema = (await loadJson('fixtures/manifest.schema.json')) as Record<
      string,
      unknown
    >;
    const result = validateFixtureManifest(manifest, schema);
    expect(result).toEqual({
      valid: true,
      errors: [],
    });
    const fixtures = (manifest as { fixtures: Array<{ anchor: string }> })
      .fixtures;
    expect(fixtures).toHaveLength(19);
    expect(fixtures.every((fixture) => fixture.anchor.startsWith('#'))).toBe(
      true,
    );
  });

  it('rejects duplicate stable IDs and URLs', async () => {
    const schema = (await loadJson('fixtures/manifest.schema.json')) as Record<
      string,
      unknown
    >;
    const fixture = {
      id: 'FX-UI-001',
      version: '1.0.0',
      url: '/practice/fixtures/fx-ui-001/',
      anchor: '#fixture-input',
      title: 'Input',
      area: 'UI',
      difficulty: 'Beginner',
      component: 'TextInput',
      behavior: 'Accepts a value.',
      defaults: {},
      controls: {},
      seedVersion: '1.0.0',
      intentionalDefects: [],
      expectedOutcomes: ['Value is retained.'],
      tests: ['tests/e2e/input.spec.ts'],
      guideLinks: [],
      challengeLinks: [],
    };
    const manifest = {
      $schema: './manifest.schema.json',
      manifestVersion: '1.0.0',
      updatedAt: '2026-09-27',
      fixtures: [fixture, fixture],
    };
    const result = validateFixtureManifest(manifest, schema);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Duplicate fixture id: FX-UI-001');
    expect(result.errors).toContain(
      'Duplicate fixture url: /practice/fixtures/fx-ui-001/',
    );
  });
});
