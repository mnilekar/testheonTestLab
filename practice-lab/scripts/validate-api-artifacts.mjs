import { readFile } from 'node:fs/promises';
import { buildSeed, serializeSeed } from '../api/seed/generate-seed.mjs';
import { buildOpenApi, serializeOpenApi } from './generate-openapi.mjs';
import { resourceContracts } from '../api/contract.mjs';

const seedPath = new URL('../api/seed/fixtures-v1.json', import.meta.url);
const openApiPath = new URL('../api/openapi/openapi.json', import.meta.url);
const expectedSeed = serializeSeed(buildSeed());
const expectedOpenApi = serializeOpenApi(buildOpenApi());
const [seedBytes, openApiBytes] = await Promise.all([
  readFile(seedPath, 'utf8'),
  readFile(openApiPath, 'utf8'),
]);

if (seedBytes !== expectedSeed) {
  throw new Error(
    'Fixture seed is stale or non-deterministic. Run pnpm api:generate.',
  );
}
if (openApiBytes !== expectedOpenApi) {
  throw new Error('OpenAPI document is stale. Run pnpm api:generate.');
}

const seed = JSON.parse(seedBytes);
const expectedCounts = {
  users: 40,
  customers: 60,
  employees: 120,
  products: 80,
  orders: 150,
  tasks: 50,
  tickets: 60,
  bookings: 40,
};
for (const [resource, count] of Object.entries(expectedCounts)) {
  if (seed.data[resource]?.length !== count) {
    throw new Error(`${resource} count must be ${count}.`);
  }
}

const openApi = JSON.parse(openApiBytes);
for (const resource of Object.keys(resourceContracts)) {
  for (const path of [`/${resource}`, `/${resource}/{id}`]) {
    if (!openApi.paths[path]) throw new Error(`OpenAPI path missing: ${path}`);
  }
}

console.log(
  `API artifacts valid: ${Object.keys(resourceContracts).length} resources, fixture ${seed.metadata.fixtureVersion}, OpenAPI ${openApi.info.version}.`,
);
