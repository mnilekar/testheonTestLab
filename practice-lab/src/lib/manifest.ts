import Ajv, { type ErrorObject } from 'ajv';

export interface ManifestValidation {
  valid: boolean;
  errors: string[];
}

interface FixtureIdentity {
  id?: unknown;
  url?: unknown;
}

interface FixtureManifestShape {
  fixtures?: unknown;
}

function formatAjvError(error: ErrorObject): string {
  const path = error.instancePath || '/';
  return `${path} ${error.message ?? 'is invalid'}`;
}

export function validateFixtureManifest(
  manifest: unknown,
  schema: Record<string, unknown>,
): ManifestValidation {
  const ajv = new Ajv({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);
  const validSchema = validate(manifest);
  const errors = validSchema ? [] : (validate.errors ?? []).map(formatAjvError);

  const fixtures = (manifest as FixtureManifestShape | null)?.fixtures;
  if (Array.isArray(fixtures)) {
    const ids = new Set<string>();
    const urls = new Set<string>();
    for (const fixture of fixtures as FixtureIdentity[]) {
      if (typeof fixture.id === 'string') {
        if (ids.has(fixture.id))
          errors.push(`Duplicate fixture id: ${fixture.id}`);
        ids.add(fixture.id);
      }
      if (typeof fixture.url === 'string') {
        if (urls.has(fixture.url))
          errors.push(`Duplicate fixture url: ${fixture.url}`);
        urls.add(fixture.url);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
