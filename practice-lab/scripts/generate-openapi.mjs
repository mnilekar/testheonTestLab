import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import {
  apiVersion,
  authContract,
  budgets,
  fixtureVersion,
  resourceContracts,
  simulatedStatuses,
  storeContract,
} from '../api/contract.mjs';

const errorResponse = {
  description: 'Error response',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorEnvelope' },
      example: {
        error: {
          code: 'VALIDATION_FAILED',
          message: 'The request contains invalid fields.',
          details: [{ field: 'email', issue: 'must be a valid email' }],
        },
        requestId: '6edc0fc7be69a451',
      },
    },
  },
};

function standardParameters(contract, cursor = false) {
  return [
    { $ref: '#/components/parameters/Page' },
    { $ref: '#/components/parameters/Limit' },
    ...(cursor ? [{ $ref: '#/components/parameters/Cursor' }] : []),
    { $ref: '#/components/parameters/Sort' },
    { $ref: '#/components/parameters/Search' },
    { $ref: '#/components/parameters/Delay' },
    { $ref: '#/components/parameters/Simulate' },
    { $ref: '#/components/parameters/Seed' },
    { $ref: '#/components/parameters/Size' },
    ...contract.filters.map((name) => ({
      name,
      in: 'query',
      required: false,
      schema: { type: 'string', maxLength: 200 },
      description: `Exact ${name} filter.`,
    })),
  ];
}

export function buildOpenApi() {
  const paths = {};
  for (const [resource, contract] of Object.entries(resourceContracts)) {
    paths[`/${resource}`] = {
      get: {
        operationId: `list${resource[0].toUpperCase()}${resource.slice(1)}`,
        summary: `List ${resource}`,
        parameters: standardParameters(contract, contract.cursor === true),
        responses: {
          200: {
            description: 'Paginated collection',
            headers: {
              'X-Total-Count': { schema: { type: 'integer', minimum: 0 } },
              Link: { schema: { type: 'string' } },
            },
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CollectionEnvelope' },
              },
            },
          },
          400: errorResponse,
          429: errorResponse,
          503: errorResponse,
        },
      },
      post: {
        operationId: `create${contract.prefix.toUpperCase()}`,
        summary: `Create a session-scoped ${resource} record`,
        requestBody: { $ref: '#/components/requestBodies/ResourceBody' },
        responses: {
          201: {
            description: 'Created with a Location header',
            headers: {
              Location: { schema: { type: 'string', format: 'uri-reference' } },
            },
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ResourceEnvelope' },
              },
            },
          },
          400: errorResponse,
          409: errorResponse,
          413: errorResponse,
          422: errorResponse,
        },
      },
    };
    paths[`/${resource}/{id}`] = {
      parameters: [{ $ref: '#/components/parameters/ResourceId' }],
      get: {
        operationId: `get${contract.prefix.toUpperCase()}`,
        summary: `Get one ${resource} record`,
        responses: {
          200: {
            description: 'Found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ResourceEnvelope' },
              },
            },
          },
          404: errorResponse,
        },
      },
      put: {
        operationId: `replace${contract.prefix.toUpperCase()}`,
        summary: `Replace one ${resource} record`,
        requestBody: { $ref: '#/components/requestBodies/ResourceBody' },
        responses: {
          200: { description: 'Replaced' },
          404: errorResponse,
          413: errorResponse,
          422: errorResponse,
        },
      },
      patch: {
        operationId: `patch${contract.prefix.toUpperCase()}`,
        summary: `Patch one ${resource} record`,
        requestBody: { $ref: '#/components/requestBodies/ResourceBody' },
        responses: {
          200: { description: 'Updated' },
          404: errorResponse,
          413: errorResponse,
          422: errorResponse,
        },
      },
      delete: {
        operationId: `delete${contract.prefix.toUpperCase()}`,
        summary: `Delete one ${resource} record from this sandbox`,
        responses: { 204: { description: 'Deleted' }, 404: errorResponse },
      },
    };
  }

  Object.assign(paths, {
    '/health': {
      get: {
        operationId: 'getHealth',
        summary:
          'Read API, fixture, and storage health without creating a sandbox',
        security: [],
        responses: { 200: { description: 'Healthy' }, 503: errorResponse },
      },
    },
    '/openapi.json': {
      get: {
        operationId: 'getOpenApi',
        summary: 'Read this OpenAPI 3.1 document',
        security: [],
        responses: { 200: { description: 'OpenAPI document' } },
      },
    },
    '/lab/session': {
      get: {
        operationId: 'getLabSession',
        summary: 'Read the current sandbox ID and aggregate statistics',
        responses: {
          200: { description: 'Session statistics' },
          401: errorResponse,
        },
      },
      post: {
        operationId: 'createLabSession',
        summary: 'Create a cookie or header-mode sandbox',
        parameters: [{ $ref: '#/components/parameters/ExpiresIn' }],
        responses: { 201: { description: 'Created' }, 503: errorResponse },
      },
    },
    '/lab/reset': {
      post: {
        operationId: 'resetLabSession',
        summary: 'Delete only the caller sandbox overlays and reset counters',
        responses: {
          200: { description: 'Reset' },
          401: errorResponse,
          403: errorResponse,
        },
      },
    },
    '/auth/roles': {
      get: {
        tags: ['authentication'],
        operationId: 'getPracticeRoleMatrix',
        summary: 'Read the public synthetic role and permission matrix',
        security: [],
        responses: { 200: { description: 'Role matrix' } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['authentication'],
        operationId: 'loginPracticeUser',
        summary: 'Create an HttpOnly practice UI session',
        requestBody: { $ref: '#/components/requestBodies/AuthCredentials' },
        responses: {
          200: { description: 'Signed in and secure session cookie set' },
          401: errorResponse,
          409: errorResponse,
          422: errorResponse,
          429: errorResponse,
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['authentication'],
        operationId: 'logoutPracticeUser',
        summary: 'Invalidate the current server-side practice session',
        security: [{ practiceAuthCookie: [] }, { bearerAuth: [] }],
        responses: {
          200: { description: 'Session invalidated' },
          401: errorResponse,
          403: errorResponse,
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['authentication'],
        operationId: 'registerPracticeUser',
        summary: 'Register a sandbox-scoped Customer account',
        responses: {
          201: { description: 'Sandbox account created' },
          409: errorResponse,
          422: errorResponse,
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['authentication'],
        operationId: 'requestPracticePasswordReset',
        summary:
          'Place a non-enumerating synthetic reset message in Practice Inbox',
        responses: {
          202: { description: 'Generic request accepted response' },
          422: errorResponse,
        },
      },
    },
    '/auth/inbox': {
      get: {
        tags: ['authentication'],
        operationId: 'getPracticeInbox',
        summary: 'Read reset links for this isolated sandbox; no email is sent',
        responses: { 200: { description: 'Practice Inbox messages' } },
      },
    },
    '/auth/reset-password': {
      post: {
        tags: ['authentication'],
        operationId: 'resetPracticePassword',
        summary: 'Consume a one-time sandbox reset or forced-change token',
        responses: {
          200: {
            description: 'Password hash replaced and prior sessions revoked',
          },
          400: errorResponse,
          422: errorResponse,
        },
      },
    },
    '/auth/lockout/reset': {
      post: {
        tags: ['authentication'],
        operationId: 'resetPracticeLockout',
        summary: 'Reset a temporary sandbox lock without enumerating accounts',
        responses: { 200: { description: 'Generic reset result' } },
      },
    },
    '/auth/session/expire': {
      post: {
        tags: ['authentication'],
        operationId: 'expirePracticeSession',
        summary: 'Deterministically expire the current cookie session',
        security: [{ practiceAuthCookie: [] }],
        responses: {
          200: { description: 'Session marked idle-expired' },
          401: errorResponse,
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['authentication'],
        operationId: 'getPracticeIdentity',
        summary: 'Read the bearer-token or session-cookie identity',
        security: [{ practiceAuthCookie: [] }, { bearerAuth: [] }],
        responses: {
          200: { description: 'Authenticated identity' },
          401: errorResponse,
        },
      },
    },
    '/auth/token': {
      post: {
        tags: ['authentication'],
        operationId: 'issuePracticeTokens',
        summary: 'Issue a short-lived access token and refresh token',
        requestBody: { $ref: '#/components/requestBodies/AuthCredentials' },
        responses: {
          200: { description: 'Bearer and refresh tokens' },
          401: errorResponse,
          429: errorResponse,
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['authentication'],
        operationId: 'refreshPracticeToken',
        summary: 'Rotate a valid one-time practice refresh token',
        responses: {
          200: { description: 'Rotated tokens' },
          401: errorResponse,
        },
      },
    },
    '/auth/api-key/profile': {
      get: {
        tags: ['authentication'],
        operationId: 'getPracticeApiKeyProfile',
        summary: 'Authenticate with the public synthetic demo API key',
        security: [{ practiceApiKey: [] }],
        responses: {
          200: { description: 'API-key principal' },
          401: errorResponse,
        },
      },
    },
    '/auth/protected': {
      get: {
        tags: ['authentication'],
        operationId: 'readProtectedPracticePermission',
        summary:
          'Exercise 401 versus role-based 403 for a requested permission',
        security: [{ practiceAuthCookie: [] }, { bearerAuth: [] }],
        responses: {
          200: { description: 'Permission allowed' },
          401: errorResponse,
          403: errorResponse,
        },
      },
      post: {
        tags: ['authentication'],
        operationId: 'executeProtectedPracticePermission',
        summary: 'Exercise a CSRF-protected role mutation',
        security: [{ practiceAuthCookie: [] }, { bearerAuth: [] }],
        responses: {
          200: { description: 'Permission allowed' },
          401: errorResponse,
          403: errorResponse,
        },
      },
    },
    '/store/catalog': {
      get: {
        tags: ['store'],
        operationId: 'listStoreCatalogue',
        summary: 'Search, filter, sort, and paginate enriched store products',
        parameters: [
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Search' },
          {
            name: 'limit',
            in: 'query',
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: budgets.storeCataloguePageSize,
              default: 12,
            },
          },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          {
            name: 'minPrice',
            in: 'query',
            schema: { type: 'integer', minimum: 0 },
          },
          {
            name: 'maxPrice',
            in: 'query',
            schema: { type: 'integer', minimum: 0 },
          },
          {
            name: 'rating',
            in: 'query',
            schema: { type: 'integer', minimum: 0, maximum: 5 },
          },
          {
            name: 'sort',
            in: 'query',
            schema: { type: 'string', enum: storeContract.catalogueSorts },
          },
          {
            name: 'featured',
            in: 'query',
            schema: { type: 'integer', enum: [1] },
          },
        ],
        responses: {
          200: { description: 'Enriched catalogue and pagination metadata' },
          400: errorResponse,
          422: errorResponse,
        },
      },
    },
    '/store/products/{id}': {
      get: {
        tags: ['store'],
        operationId: 'getStoreProduct',
        summary: 'Read product images, variants, stock, and fictional reviews',
        parameters: [{ $ref: '#/components/parameters/ResourceId' }],
        responses: {
          200: { description: 'Enriched product' },
          404: errorResponse,
        },
      },
    },
    '/store/cart': {
      get: {
        tags: ['store'],
        operationId: 'getStoreCart',
        summary: 'Read the current session guest cart and totals',
        responses: {
          200: { description: 'Cart items, coupon, discount, and totals' },
        },
      },
    },
    '/store/cart/items': {
      post: {
        tags: ['store'],
        operationId: 'addStoreCartItem',
        summary: 'Add a product, quantity, and variant to the session cart',
        requestBody: { $ref: '#/components/requestBodies/StoreCartItem' },
        responses: {
          201: { description: 'Updated cart' },
          404: errorResponse,
          422: errorResponse,
        },
      },
    },
    '/store/cart/items/{id}': {
      parameters: [{ $ref: '#/components/parameters/ResourceId' }],
      patch: {
        tags: ['store'],
        operationId: 'updateStoreCartItem',
        summary: 'Update one cart quantity',
        responses: {
          200: { description: 'Updated cart' },
          404: errorResponse,
          422: errorResponse,
        },
      },
      delete: {
        tags: ['store'],
        operationId: 'deleteStoreCartItem',
        summary: 'Remove a product from the session cart',
        responses: { 200: { description: 'Updated cart' } },
      },
    },
    '/store/cart/coupon': {
      post: {
        tags: ['store'],
        operationId: 'applyStoreCoupon',
        summary: `Apply ${storeContract.validCoupon} or exercise expired and unknown coupon errors`,
        responses: {
          200: { description: 'Coupon applied' },
          404: errorResponse,
          409: errorResponse,
        },
      },
    },
    '/store/locations': {
      get: {
        tags: ['store'],
        operationId: 'getStoreLocations',
        summary: 'Read deterministic Country → State → City options',
        responses: { 200: { description: 'Location hierarchy' } },
      },
    },
    '/store/scenario': {
      get: {
        tags: ['store'],
        operationId: 'getStoreScenario',
        summary: 'Inspect the pending one-shot session scenario',
        responses: { 200: { description: 'Pending scenario or null' } },
      },
      post: {
        tags: ['store'],
        operationId: 'setStoreScenario',
        summary: 'Arm one deterministic response for the next store GET',
        responses: {
          202: { description: 'Scenario armed' },
          422: errorResponse,
        },
      },
    },
    '/store/checkout': {
      post: {
        tags: ['store'],
        operationId: 'createStoreCheckout',
        summary: 'Create an order with a signed-in role and fake test card',
        security: [{ practiceAuthCookie: [] }, { bearerAuth: [] }],
        responses: {
          201: { description: 'Synthetic order created; no charge attempted' },
          401: errorResponse,
          403: errorResponse,
          409: errorResponse,
          422: errorResponse,
        },
      },
    },
    '/store/orders': {
      get: {
        tags: ['store'],
        operationId: 'listStoreOrders',
        summary: 'Read orders belonging to the signed-in practice identity',
        security: [{ practiceAuthCookie: [] }, { bearerAuth: [] }],
        responses: {
          200: { description: 'Authenticated order history' },
          401: errorResponse,
        },
      },
    },
    '/store/profile': {
      get: {
        tags: ['store'],
        operationId: 'getStoreProfile',
        summary: 'Read the Chunk 8 identity and its order count',
        security: [{ practiceAuthCookie: [] }, { bearerAuth: [] }],
        responses: {
          200: { description: 'Practice profile' },
          401: errorResponse,
        },
      },
    },
    '/store/reset': {
      post: {
        tags: ['store'],
        operationId: 'resetStoreData',
        summary:
          'Reset products, orders, cart, coupon, and scenario for this sandbox',
        responses: {
          200: { description: 'Store state reset' },
          403: errorResponse,
        },
      },
    },
    '/files/upload': {
      post: {
        operationId: 'uploadPracticeFiles',
        summary:
          'Validate and store allowlisted files privately with random non-executable names and a ten-minute TTL',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['files'],
                properties: {
                  files: {
                    type: 'array',
                    minItems: 1,
                    maxItems: budgets.uploadFilesPerSession,
                    items: {
                      type: 'string',
                      format: 'binary',
                      maxLength: budgets.uploadFileBytes,
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Validated files stored in private temporary storage',
          },
          400: errorResponse,
          409: errorResponse,
          413: errorResponse,
          415: errorResponse,
          422: errorResponse,
        },
      },
    },
    ...Object.fromEntries(
      [
        'static-pdf',
        'static-csv',
        'static-txt',
        'dynamic-csv',
        'dynamic-pdf',
      ].map((kind) => [
        `/files/download/${kind}`,
        {
          get: {
            operationId: `download${kind
              .split('-')
              .map((part) => part[0].toUpperCase() + part.slice(1))
              .join('')}`,
            summary: `Download the ${kind} fixture with attachment disposition`,
            parameters: [{ $ref: '#/components/parameters/Delay' }],
            responses: {
              200: {
                description: 'Attachment with a deterministic filename',
                headers: {
                  'Content-Disposition': { schema: { type: 'string' } },
                },
              },
              400: errorResponse,
            },
          },
        },
      ]),
    ),
    '/sim/status/{code}': {
      get: {
        operationId: 'simulateStatus',
        summary: 'Return an allowlisted deterministic HTTP error',
        parameters: [
          {
            name: 'code',
            in: 'path',
            required: true,
            schema: { type: 'integer', enum: simulatedStatuses },
          },
        ],
        responses: { default: errorResponse },
      },
    },
    '/sim/rate-limit': {
      get: {
        operationId: 'simulateRateLimit',
        summary:
          'Return 429 with Retry-After after a caller-scoped deterministic threshold',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 20, default: 3 },
          },
        ],
        responses: {
          200: { description: 'Below the simulated limit' },
          429: errorResponse,
        },
      },
    },
  });

  return {
    openapi: '3.1.0',
    info: {
      title: 'Testheon Practice API',
      version: apiVersion,
      description:
        'Synthetic, session-isolated REST practice API for resources, authentication, ecommerce, files, and deterministic failures. It never uses WordPress data or identities.',
    },
    servers: [{ url: '/practice/api/v1', description: 'Current Lab origin' }],
    tags: [
      ...Object.keys(resourceContracts).map((name) => ({ name })),
      { name: 'lab' },
      { name: 'files' },
      { name: 'authentication' },
      { name: 'store' },
      { name: 'simulation' },
    ],
    paths,
    components: {
      securitySchemes: {
        labSessionHeader: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Lab-Session',
        },
        labSessionCookie: { type: 'apiKey', in: 'cookie', name: 'lab_sid' },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'opaque practice token',
          description: `Short-lived ${budgets.authAccessTokenSeconds}-second synthetic access token.`,
        },
        practiceAuthCookie: {
          type: 'apiKey',
          in: 'cookie',
          name: 'practice_auth',
          description: 'Secure HttpOnly sandbox UI session cookie.',
        },
        practiceApiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Practice-Api-Key',
          description: `Public demo key: ${authContract.demoApiKey}`,
        },
      },
      parameters: {
        ResourceId: {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{2,63}$' },
        },
        Page: {
          name: 'page',
          in: 'query',
          schema: { type: 'integer', minimum: 1, default: 1 },
        },
        Limit: {
          name: 'limit',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: budgets.pageLimit,
            default: 20,
          },
        },
        Cursor: {
          name: 'cursor',
          in: 'query',
          schema: { type: 'string', maxLength: 500 },
        },
        Sort: {
          name: 'sort',
          in: 'query',
          schema: { type: 'string', example: 'name,-id' },
        },
        Search: {
          name: 'q',
          in: 'query',
          schema: { type: 'string', maxLength: budgets.searchLength },
        },
        Delay: {
          name: 'delay',
          in: 'query',
          schema: { type: 'integer', minimum: 0, maximum: budgets.maxDelayMs },
        },
        Simulate: {
          name: 'simulate',
          in: 'query',
          schema: { type: 'integer', enum: simulatedStatuses },
        },
        Seed: {
          name: 'seed',
          in: 'query',
          schema: { type: 'integer', minimum: 0, maximum: 2147483647 },
        },
        Size: {
          name: 'size',
          in: 'query',
          schema: { type: 'string', enum: ['small', 'medium', 'large'] },
        },
        ExpiresIn: {
          name: 'expiresIn',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: budgets.absoluteTtlSeconds,
          },
        },
      },
      schemas: {
        ErrorEnvelope: {
          type: 'object',
          required: ['error', 'requestId'],
          properties: {
            error: {
              type: 'object',
              required: ['code', 'message', 'details'],
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                details: { type: 'array', items: {} },
              },
            },
            requestId: { type: 'string' },
          },
        },
        Resource: {
          type: 'object',
          required: ['id'],
          additionalProperties: true,
          properties: { id: { type: 'string' } },
        },
        ResourceEnvelope: {
          type: 'object',
          required: ['data', 'requestId'],
          properties: {
            data: { $ref: '#/components/schemas/Resource' },
            requestId: { type: 'string' },
          },
        },
        CollectionEnvelope: {
          type: 'object',
          required: ['data', 'meta', 'requestId'],
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Resource' },
            },
            meta: { type: 'object', additionalProperties: true },
            requestId: { type: 'string' },
          },
        },
      },
      requestBodies: {
        ResourceBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', maxProperties: 30 },
            },
          },
        },
        AuthCredentials: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string', example: 'standard_user' },
                  password: {
                    type: 'string',
                    example: authContract.sharedDemoPassword,
                  },
                  rememberMe: { type: 'boolean', default: false },
                  idleSeconds: {
                    type: 'integer',
                    minimum: budgets.authIdleMinimumSeconds,
                    maximum: budgets.authIdleMaximumSeconds,
                    default: 300,
                  },
                  scenario: { type: 'string', enum: ['expired'] },
                },
              },
            },
          },
        },
        StoreCartItem: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId', 'quantity', 'variant'],
                properties: {
                  productId: { type: 'string' },
                  quantity: {
                    type: 'integer',
                    minimum: 1,
                    maximum: budgets.storeCartQuantity,
                  },
                  variant: { type: 'string', maxLength: 100 },
                },
              },
            },
          },
        },
      },
    },
    security: [{ labSessionHeader: [] }, { labSessionCookie: [] }],
    'x-testheon-fixture-version': fixtureVersion,
    'x-error-catalogue': {
      BAD_REQUEST: 400,
      SESSION_INVALID: 401,
      AUTHENTICATION_FAILED: 401,
      TOKEN_INVALID: 401,
      PERMISSION_DENIED: 403,
      CSRF_REJECTED: 403,
      NOT_FOUND: 404,
      DUPLICATE_RECORD: 409,
      BODY_TOO_LARGE: 413,
      VALIDATION_FAILED: 422,
      RATE_LIMITED: 429,
      STORAGE_FAILURE: 500,
      CAPACITY_REACHED: 503,
    },
    'x-cors-policy':
      'Same-origin by default. Explicit localhost origins may make non-credentialed requests with Content-Type and X-Lab-Session. Credentialed wildcard CORS is never emitted.',
  };
}

export function serializeOpenApi(document = buildOpenApi()) {
  return `${JSON.stringify(document, null, 2)}\n`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const output = fileURLToPath(
    new URL('../api/openapi/openapi.json', import.meta.url),
  );
  await writeFile(output, serializeOpenApi(), 'utf8');
  console.log(`OpenAPI ${apiVersion} written to ${output}.`);
}
