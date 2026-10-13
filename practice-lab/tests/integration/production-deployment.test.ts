import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import {
  assertDeploymentDestination,
  runtimeMappings,
} from '../../scripts/deploy-targets.mjs';

describe('production deployment boundary', () => {
  it('maps every production runtime file below the Practice Lab directory', () => {
    const destinations = runtimeMappings('production').map((entry) => {
      const destination = entry[1];
      if (typeof destination !== 'string') {
        throw new Error('Production runtime mapping is malformed.');
      }
      return destination;
    });

    expect(destinations).not.toContain('.htaccess');
    expect(destinations).not.toContain('index.php');
    expect(
      destinations.every((destination) => destination.startsWith('practice/')),
    ).toBe(true);
    expect(destinations).toContain('practice/.htaccess');
    expect(destinations).toContain('practice/api/index.php');
  });

  it('rejects any accidental production write outside public_html/practice', () => {
    expect(() =>
      assertDeploymentDestination('production', '.htaccess'),
    ).toThrow('public_html/practice');
    expect(() =>
      assertDeploymentDestination('production', 'index.php'),
    ).toThrow('public_html/practice');
    expect(() =>
      assertDeploymentDestination('production', 'practice/index.php'),
    ).not.toThrow();
  });

  it('keeps incomplete upload attempts out of the production rollback set', async () => {
    const runtime = await readFile(
      new URL('../../deploy/runtime/production-runtime.php', import.meta.url),
      'utf8',
    );
    expect(runtime).toContain('function lab_release_is_complete');
    expect(runtime).toContain('/_api/api-runtime.php');
    expect(runtime).toContain('/_api/fixtures-v1.json');
    expect(runtime).toContain('/_api/openapi.json');
    expect(runtime).toContain('&& lab_release_is_complete($name)');
  });
});
