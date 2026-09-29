# Chunk 09 Report — Testheon Store, API↔UI, network and errors

## 1. Summary

1. Added the indexable Testheon Store overview plus noindex catalogue, product, cart, checkout, confirmation, order-history and profile screens.
2. Added a Lab-only ecommerce API backed by session-isolated SQLite state for catalogue filtering, guest carts, variants, coupons, dependent locations, fake checkout, profiles and synthetic order history.
3. Reused the Chunk 8 authentication runtime for login at checkout while preserving the guest cart in the same Lab sandbox.
4. Added deterministic API→UI→API workflows for product creation, account registration and login, checkout verification, and order deletion.
5. Added one-shot `401`, `403`, `404`, `409`, `422`, `429`, `500`, `503`, timeout, malformed-JSON and empty-array scenarios with visible recovery states.
6. Added stable visual mode, responsive store layouts, six desktop/mobile review captures and eight local SVG product assets.
7. Generated 50 functional ecommerce cases in JSON, Markdown and CSV, plus runnable TypeScript page objects and fixtures for login, cart and API seeding.
8. Registered `FX-STORE-001`; manifest version `1.6.0` now contains 19 fixtures.
9. Deployed immutable release `20260929T090841Z-b53810` to protected/noindex staging with two rollback releases retained.
10. Passed local and hosted validation, repeated R4 evidence and confirmed **WordPress untouched: PASS**.

## 2. Files created / changed

- `src/pages/apps/ecommerce/` — Store overview, catalogue, product, cart, checkout, confirmation, order-history and profile pages.
- `src/components/StoreShell.astro`, `src/scripts/store-app.ts`, `src/styles/global.css` — shared navigation, API client, full Store behavior, stable visual mode and responsive presentation.
- `public/images/store/` — eight local synthetic product illustrations with synchronized labels and alt text.
- `deploy/runtime/api-store.php` — session-scoped catalogue, cart, coupon, location, checkout, order, profile and one-shot scenario behavior.
- `deploy/runtime/api-runtime.php`, `deploy/runtime/api-auth.php` — Store dispatch, schema lifecycle, sandbox reset/cleanup and Chunk 8 identity integration.
- `scripts/deploy.mjs` — packages the Store runtime in immutable releases and retries bounded transient upload failures.
- `api/contract.mjs`, `api/seed/fixtures-v1.json`, `scripts/generate-openapi.mjs`, `api/openapi/openapi.json` — Store fixtures, route contract and generated OpenAPI definitions.
- `content/test-cases/ecommerce.json`, `content/test-cases/ecommerce.md`, `content/test-cases/ecommerce.csv`, `scripts/generate-ecommerce-test-cases.mjs` — one deterministic 50-case test suite in three synchronized formats.
- `examples/playwright-ts/ecommerce.spec.ts` — runnable Store page object, cart object, login fixture and API-seeding fixture examples.
- `tests/e2e/chunk-09-store.spec.ts`, `tests/api/store-api.spec.ts`, `tests/live/chunk-09-live.spec.ts` — local, API and hosted acceptance coverage.
- `tests/e2e/examples.spec.ts`, `tests/e2e/component-lab.spec.ts`, `tests/unit/manifest.test.ts`, `tests/unit/api-contract.test.ts`, `tests/unit/runtime-contract.test.ts` — example, route, manifest and contract regression coverage.
- `playwright.api.config.ts`, `playwright.ui.config.ts` — bounded hosted-test retries and 60-second test budgets for remote infrastructure.
- `fixtures/manifest.json` — `FX-STORE-001`, manifest version `1.6.0` and 19-fixture total.
- `src/config/categories.ts`, `src/pages/index.astro`, `README.md`, `.prettierignore`, `docs/CHUNK-09-TASK.md` — navigation, documentation and generated-case formatting policy.
- `docs/reports/assets/chunk-09/` — reviewed desktop and mobile Store overview, catalogue and product captures.
- `docs/evidence/chunk-09/`, `docs/reports/CHUNK-09-REPORT.md` — pre/post R4 evidence, deployment evidence and this checkpoint report.

## 3. Decisions made

- **Synthetic commerce only:** products, customers, carts, coupons, addresses, payments and orders belong only to the Practice Lab. No external payment, fulfilment, email or analytics service is called.
- **Session isolation:** every Store mutation is keyed to the current Lab session and generation. Reset and cleanup affect only Lab-owned tables and files.
- **Guest-to-auth handoff:** the cart remains attached to the Lab session while checkout requires a valid Chunk 8 user session. Authentication never uses WordPress identities.
- **Fake payment contract:** `4242 4242 4242 4242` deterministically succeeds and `4000 0000 0000 0002` deterministically declines without contacting a processor or storing card data.
- **Deterministic coupons:** `TESTHEON10` applies a 10% discount, `EXPIRED20` returns an explicit expired state, and unknown codes return a validation error.
- **Stable catalogue:** search, category, minimum/maximum price, rating, sort and pagination operate over fixed seed data with stable IDs and response shapes.
- **One-shot errors:** the scenario controller applies only to the next catalogue request in the current sandbox, then consumes itself so recovery can be asserted immediately.
- **Safe initialization:** both checkout sign-in and order submission stay disabled until their JavaScript handlers are attached, preventing native form submission during slow hosted initialization.
- **Bounded resources:** session cleanup runs before capacity checks, active Lab capacity is 250 sessions, request bodies and delays remain capped, and Store data follows the existing sandbox TTL.
- **Indexing boundary:** only `/practice/apps/ecommerce/` is indexable in a production build. Internal app screens are noindex, and the entire staging host remains protected and `noindex,nofollow`.
- **Immutable release:** deployment used the existing atomic controller, preserved the gate and noindex policy, and retained two prior releases for one-command rollback.

## 4. How to run locally

From PowerShell:

```powershell
Set-Location -LiteralPath 'C:\Users\MayurN\OneDrive\Documents\ChatGPT\Testheon-Content_project\practice-lab'
corepack pnpm install --frozen-lockfile
pnpm verify
pnpm dev
```

Regenerate and inspect the synchronized ecommerce cases:

```powershell
pnpm testcases:generate
Get-Content content/test-cases/ecommerce.md
```

Run the staging suites after loading the ignored staging environment:

```powershell
$env:PRACTICE_LAB_BASE_URL = $env:PRACTICE_LAB_STAGING_ORIGIN
pnpm ui:test:staging

$env:PRACTICE_LAB_API_BASE_URL = $env:PRACTICE_LAB_STAGING_ORIGIN
pnpm api:test:staging
```

Operators with the ignored `.env` and fresh short-lived upload credentials can inspect, deploy or roll back with:

```powershell
pnpm status:staging
pnpm deploy:staging
pnpm rollback:staging
```

## 5. Staging URLs to review

- Store overview: <https://practice-staging.testheon.com/practice/apps/ecommerce/>
- Product catalogue: <https://practice-staging.testheon.com/practice/apps/ecommerce/products/>
- Product detail: <https://practice-staging.testheon.com/practice/apps/ecommerce/product/?id=prd-002&visual=stable>
- Guest cart: <https://practice-staging.testheon.com/practice/apps/ecommerce/cart/>
- Login-at-checkout: <https://practice-staging.testheon.com/practice/apps/ecommerce/checkout/?visual=stable>
- Order confirmation: <https://practice-staging.testheon.com/practice/apps/ecommerce/confirmation/>
- Order history: <https://practice-staging.testheon.com/practice/apps/ecommerce/orders/>
- Customer profile: <https://practice-staging.testheon.com/practice/apps/ecommerce/profile/>
- Generated Practice API documentation: <https://practice-staging.testheon.com/practice/api/>

The staging host remains protected by the existing HTTP credentials in ignored `practice-lab/.env` and sends `noindex,nofollow`.

## 6. Tests

| Check | Result |
| --- | --- |
| ESLint | PASS, 0 warnings/errors |
| Prettier | PASS |
| Astro typecheck | PASS, 0 errors/warnings/hints across 105 files |
| unit/integration | PASS, 8 files / 24 tests |
| API artifact validation | PASS, 8 resources, fixture 1.0.0, OpenAPI 1.0.0 |
| manifest validation | PASS, 19 fixtures |
| production/staging builds | PASS, 36 static pages plus release API package |
| local full E2E regression | PASS, 150 passed / 2 intentional mobile real-timer skips before the final checkout guard |
| final focused Chunk 9 E2E | PASS, 14/14 desktop and mobile tests |
| hosted API suite | PASS, 27 direct passes and 1 timing check passed on configured retry |
| focused hosted timing recheck | PASS, 1/1 |
| hosted UI suite | PASS, 14/14 |
| deploy smoke and release status | PASS, hub, API docs, health and active release verified |
| desktop/mobile visual review | PASS, overview, catalogue and product at both viewports |
| R4 public HTTP comparison | PASS, 11/11 final URLs, status, canonicals and response bodies unchanged |
| temporary credential cleanup | PASS, no temporary `.env` or `.deploy.env` remains in the deployment workspace |

The Store tests cover catalogue filtering and pagination, product variants and stock, guest cart quantity/removal, coupons, login-at-checkout, dependent addresses, shipping, successful and declined fake cards, order history, profile data, sandbox reset, API→UI→API workflows, all eleven one-shot scenarios, malformed JSON, empty arrays, recovery, network interception and stable screenshots.

The full hosted API run recorded one infrastructure timing retry: the `slow_user` response completed in 6,677 ms once, outside its 5,000 ms assertion, while the configured retry passed. A separate focused rerun then passed cleanly. No Store assertion required a retry.

Release evidence:

- Active release: `20260929T090841Z-b53810`.
- Artifact SHA-256: `7214d8019058c625f365c7110d91f4477189d419e141d7b190ba401552bb2e35`.
- Immediate rollback release: `20260929T085840Z-00d783`.
- Additional retained release: `20260929T083326Z-d1ed41`.
- Hostinger status was re-read after deployment and matches the active release.
- `pnpm rollback:staging` remains the one-command rollback.

This checkout has no configured Git remote, so there is no remote GitHub Actions run to link. The existing frozen-install workflow discovers the new example and tests, and the local plus hosted checks above passed.

## 7. Fixture manifest changes

| Fixture ID | Version | Route and anchor | Intentional defect |
| --- | --- | --- | --- |
| `FX-STORE-001` | `1.0.0` | `/practice/apps/ecommerce/#integration-scenarios` | None |

The fixture records catalogue defaults, INR currency, the stable visual date, deterministic coupons, fake success/decline cards and all eleven next-request scenarios. The manifest validates at version `1.6.0` with 19 total fixtures.

## 8. WordPress untouched proof

**WordPress untouched: PASS.**

| Evidence | Before deployment | After deployment | Result |
| --- | --- | --- | --- |
| Production root `.htaccess` SHA-256 | `3f9689ed4759a5a35a33c4f7ccfb40613310fbc1b0f98387bfdc76f21ce00d24` | `3f9689ed4759a5a35a33c4f7ccfb40613310fbc1b0f98387bfdc76f21ce00d24` | Identical |
| Homepage + 10 published posts | 11/11 HTTP 200 with correct self-canonical | 11/11 HTTP 200 with correct self-canonical | PASS |
| Production response bodies | Eleven SHA-256 values recorded | All eleven SHA-256 values identical in the final comparison | PASS |
| Production final URLs | Eleven expected HTTPS URLs | All unchanged | PASS |
| Staging root `.htaccess` SHA-256 | `9186269b669a6a1ab7bc26d52b66c633e1ae616460974cd60ff394c45bcacaf6` | `9186269b669a6a1ab7bc26d52b66c633e1ae616460974cd60ff394c45bcacaf6` | Identical |
| Release controller SHA-256 | `00ebe9d6888c27d4d5e57bce22ad5fa36e13333ee96f49089e5cafc0aab67416` | `00ebe9d6888c27d4d5e57bce22ad5fa36e13333ee96f49089e5cafc0aab67416` | Identical |
| WordPress files/database/credentials | Not used | Not used | PASS |
| Deployment target | Dedicated protected subdomain | Only immutable staging releases and Lab runtime changed | PASS |

Evidence is stored in `docs/evidence/chunk-09/pre-deploy/` and `docs/evidence/chunk-09/post-deploy/`. The final comparison found zero differences across requested URL, final URL, status, canonical count/value and body SHA-256 for all 11 production pages. Deployment did not edit WordPress core, themes, plugins, configuration, posts, pages, settings, database, media or production root `.htaccess`.

The first post-deploy capture reached an older Hostinger CDN variant for `/playwright-ci-cd/`; its ETag timestamp predated the pre-deploy response. That raw capture is retained as `http-baseline-cdn-variant.json`. The immediate repeat returned the expected representation and produced an exact 11/11 comparison, while the production root hash remained identical throughout.

## 9. Known issues and deviations from the chunk

- One hosted `slow_user` timing assertion exceeded its upper bound during the full API suite, passed on the configured retry, and passed a focused rerun. This was remote latency; all functional assertions and all Store API tests passed directly.
- The first R4 post-deploy read received one older CDN-cached article representation. The evidence is retained; the repeat matched all 11 pre-deploy hashes exactly, and the older ETag rules out this deployment as its source.
- PHP CLI remains unavailable on this workstation. The deployed PHP runtime passed the complete hosted API and browser acceptance suites.
- This checkout has no configured Git remote, so a remote GitHub Actions result is unavailable; complete local and hosted verification passed.
- Browser output includes the inherited harmless `NO_COLOR`/`FORCE_COLOR` warning.
- No functional, safety or requested-scope deviation remains open for CRE-54.

## 10. Carry-forward for later chunks

- CRE-55 may start only after its ticket is checked out and read in full.
- Preserve `FX-STORE-001` at version `1.0.0`; bump its version and add a changelog entry for breaking DOM, API or behavior changes.
- Keep ecommerce identities, products, carts, payments and orders synthetic, Lab-owned and isolated from WordPress and external services.
- Preserve guest-cart continuity across login, fake-only payments, deterministic coupons and explicit successful/declined outcomes.
- Preserve stable IDs and response shapes for API→UI→API and network-interception exercises.
- Preserve all eleven one-shot error scenarios, visible recovery states and `?visual=stable` behavior.
- Keep generated JSON, Markdown and CSV cases synchronized through `pnpm testcases:generate`.
- Preserve protected/noindex staging, immutable releases, one-command rollback and R4 evidence before and after every deployment.
- Production remains locked until Chunk 13 and its explicit approval gates.

## 11. Questions for Mayur

None. Chunk 9 is complete and stops before CRE-55.
