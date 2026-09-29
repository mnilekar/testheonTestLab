# Testheon Practice Lab

The Lab is a static Astro/TypeScript site with small Preact islands. It builds under the fixed `/practice/` base and stays independent from WordPress code, credentials, and storage.

## Local development

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:4321/practice/`.

## Full verification

```powershell
pnpm run verify
```

The pipeline runs lint, formatting, strict type checks, unit/integration tests, deterministic API artifact validation, the static build, Playwright smoke tests against the built output, and fixture-manifest validation.

Component Lab A provides grouped fixture pages at:

- `/practice/components/inputs/`
- `/practice/components/buttons/`
- `/practice/components/checkboxes-radios/`
- `/practice/components/dropdowns/`
- `/practice/components/forms/`
- `/practice/components/tables/`
- `/practice/components/search-and-lists/`
- `/practice/components/dynamic-dom/`
- `/practice/components/dialogs/`
- `/practice/components/interactions/`
- `/practice/components/date-time-and-ranges/`
- `/practice/components/frames-and-windows/`
- `/practice/components/files/`
- `/practice/components/drag-and-drop/`
- `/practice/components/browser-context/`
- `/practice/playwright/locators/`
- `/practice/playwright/waits/`
- `/practice/apps/auth/`
- `/practice/playwright/authentication/`
- `/practice/apps/ecommerce/`
- `/practice/apps/ecommerce/products/`
- `/practice/apps/ecommerce/product/`
- `/practice/apps/ecommerce/cart/`
- `/practice/apps/ecommerce/checkout/`
- `/practice/apps/ecommerce/confirmation/`
- `/practice/apps/ecommerce/orders/`
- `/practice/apps/ecommerce/profile/`

Every page has a stable manifest ID and anchor. Its executable TypeScript examples live in `examples/playwright-ts/` and run as part of the normal Playwright suite.

The Practice API is a standalone PHP 8.3/PDO SQLite runtime under `/practice/api/v1/`. It does not bootstrap WordPress or use WordPress data or credentials. Its versioned synthetic seed and OpenAPI contract are generated and checked with:

```powershell
pnpm api:generate
pnpm api:validate
```

After a staging deployment, load the ignored `.env` values into the process, set `PRACTICE_LAB_API_BASE_URL` to `PRACTICE_LAB_STAGING_ORIGIN`, and run:

```powershell
pnpm api:test:staging
pnpm ui:test:staging
```

Staging API documentation is at `https://practice-staging.testheon.com/practice/api/`; health is at `/practice/api/v1/health` and the OpenAPI 3.1 document is at `/practice/api/v1/openapi.json`.

The authentication sandbox exposes only synthetic public users. Its shared practice password is `Practice@123`; its public API-key fixture is `testheon-demo-key-4803`. These values are deliberately documented test data and are never used for WordPress, Hostinger, staging protection, or release control.

The Testheon Store uses only session-scoped synthetic products, carts and orders. Checkout accepts the documented fake success card `4242 4242 4242 4242` and fake decline card `4000 0000 0000 0002`; it never contacts a payment processor. Its 50-case functional pack is generated in JSON, Markdown and CSV with `pnpm testcases:generate`.

## Staging release

Create the ignored local staging credentials once:

```powershell
pnpm staging:credentials
```

The resulting `practice-lab/.env` is intentionally ignored. It contains the review gate and release-control values and must never be committed or printed. A deployment additionally needs short-lived Hostinger File Browser upload values in ignored `.deploy.env`; delete that file immediately after the command.

```powershell
pnpm deploy:staging
```

The command builds a `noindex,nofollow` artifact, uploads it to `practice/releases/<timestamp>-<nonce>/`, and asks the protected server-side controller to replace `.current` with an atomic same-directory rename. The authenticated smoke test must pass before the command reports success. The controller retains at most three releases.

Rollback to the previous retained release with one command:

```powershell
pnpm rollback:staging
```

Reactivate a known retained release with:

```powershell
pnpm activate:staging -- --release 20260927T101500Z-a1b2c3
```

Check the protected stage and active pointer with:

```powershell
pnpm status:staging
```

Production is locked until its authorized chunk. The production command refuses to run before Chunk 13 even when an approval flag is supplied.
