import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import {
  authContract,
  budgets,
  resourceContracts,
  simulatedStatuses,
  storeContract,
} from '../../api/contract.mjs';
import {
  buildOpenApi,
  serializeOpenApi,
} from '../../scripts/generate-openapi.mjs';

describe('Practice API contract', () => {
  it('keeps OpenAPI byte-identical with the executable contract', async () => {
    const stored = await readFile('api/openapi/openapi.json', 'utf8');
    expect(stored).toBe(serializeOpenApi(buildOpenApi()));
  });

  it('declares every REST verb and required control', () => {
    const document = buildOpenApi();
    const paths = document.paths as Record<string, Record<string, unknown>>;
    for (const resource of Object.keys(resourceContracts)) {
      expect(Object.keys(paths[`/${resource}`] ?? {})).toEqual(
        expect.arrayContaining(['get', 'post']),
      );
      expect(Object.keys(paths[`/${resource}/{id}`] ?? {})).toEqual(
        expect.arrayContaining(['get', 'put', 'patch', 'delete']),
      );
    }
    expect(simulatedStatuses).toEqual([
      400, 401, 403, 404, 409, 422, 429, 500, 503,
    ]);
    expect(budgets.maxDelayMs).toBe(10_000);
    expect(budgets.bodyBytes).toBe(65_536);
    expect(budgets.uploadFileBytes).toBe(2_097_152);
    expect(paths['/files/upload']).toHaveProperty('post');
    expect(paths['/files/download/dynamic-pdf']).toHaveProperty('get');
    expect(paths['/auth/login']).toHaveProperty('post');
    expect(paths['/auth/token']).toHaveProperty('post');
    expect(paths['/auth/protected']).toEqual(
      expect.objectContaining({
        get: expect.any(Object),
        post: expect.any(Object),
      }),
    );
    expect(authContract.accounts).toHaveLength(8);
    expect(Object.keys(authContract.permissions)).toEqual([
      'Customer',
      'Employee',
      'Manager',
      'Admin',
      'Read-only',
    ]);
    expect(budgets.authLockAttempts).toBe(3);
    expect(paths['/store/catalog']).toHaveProperty('get');
    expect(paths['/store/cart/items']).toHaveProperty('post');
    expect(paths['/store/checkout']).toHaveProperty('post');
    expect(paths['/store/scenario']).toEqual(
      expect.objectContaining({
        get: expect.any(Object),
        post: expect.any(Object),
      }),
    );
    expect(storeContract.nextRequestScenarios).toHaveLength(11);
    expect(storeContract.validCoupon).toBe('TESTHEON10');
    expect(budgets.storeScenarioTimeoutMs).toBe(10_000);
    expect(document.openapi).toBe('3.1.0');
  });
});
