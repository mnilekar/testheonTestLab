# Chunk 03 Report — API foundation, seed data, sandbox sessions and reset

## 1. Summary

1. Added an independent PHP 8.3 and SQLite JSON API at `/practice/api/v1/` without using WordPress code, data or credentials.
2. Added byte-identical seed generation for eight resource types and the specified record counts and edge cases.
3. Added cookie and header sandbox sessions, copy-on-write overlays, reset, statistics, expiry and bounded cleanup.
4. Added complete REST operations, page and cursor pagination, filtering, search, sorting and deterministic controls.
5. Added strict input validation, quotas, parameterised queries, CORS/CSRF controls, real host throttling and safe logs.
6. Added generated OpenAPI 3.1 JSON, protected HTML documentation and a storage-aware health endpoint.
7. Added unit, contract and live staging acceptance coverage for the complete CRE-48 behavior and abuse cases.
8. Deployed two corrected immutable releases and installed the five-minute cleanup cron on protected/noindex staging.
9. Verified the active and rollback releases, existing Practice Lab pages and API behavior on Hostinger staging.
10. Re-ran R4 evidence: **WordPress untouched: PASS**.

## 2. Files created / changed

- `api/contract.mjs` — canonical resource, field, filter, sort and status contract shared by generators and validators.
- `api/seed/generate-seed.mjs`, `api/seed/fixtures-v1.json` — deterministic synthetic data generator and version 1.0.0 output for all eight resources.
- `api/openapi/openapi.json`, `scripts/generate-openapi.mjs`, `scripts/validate-api-artifacts.mjs` — generated OpenAPI 3.1 contract and cross-artifact validation.
- `deploy/runtime/api-runtime.php` — PHP 8.3/PDO SQLite runtime, sessions, overlays, REST routes, controls, quotas, throttling, health, CORS and safe logging.
- `deploy/runtime/api-index.php`, `api.htaccess`, `api-cleanup.php` — stable API entry point, protected routing and CLI-only cleanup entry point.
- `deploy/runtime/practice-index.php`, `practice.htaccess`, `release-control.php` — API routing, noindex/cache policy and API-aware immutable release validation.
- `scripts/deploy.mjs`, `deploy/README.md`, `.env.example` — packages API artifacts inside each release, verifies docs/health and documents the new runtime variables.
- `playwright.api.config.ts`, `tests/api/practice-api.spec.ts` — authenticated live API acceptance suite.
- `tests/unit/seed.test.ts`, `api-contract.test.ts`, `runtime-contract.test.ts` — repeatability, artifact and runtime safety coverage.
- `package.json` — API generation, validation and live staging test commands; API validation is part of `verify`.
- `.github/workflows/practice-lab.yml` — PHP 8.3 syntax checks and the expanded verification pipeline.
- `scripts/capture-r4-http.mjs` — reusable chunk-numbered R4 evidence capture.
- `AGENTS.md`, `README.md`, `docs/CHUNK-03-TASK.md` — operating instructions and preserved CRE-48 scope.
- `docs/evidence/chunk-03/` — pre/post production HTTP and server-configuration evidence.
- `docs/reports/CHUNK-03-REPORT.md` — this completion record.

## 3. Decisions made

- **PHP 8.3 with PDO SQLite:** Hostinger already serves PHP 8.3 on the isolated staging host. SQLite keeps Practice Lab state independent from WordPress and avoids introducing shared database credentials or a service dependency.
- **Copy-on-write sandboxes:** immutable seed JSON remains the source of truth; each session stores only its generation-scoped mutations. Reset increments the generation atomically, which avoids copying hundreds of rows and prevents reset/write races.
- **Hashed opaque session tokens:** `lab_sid` supports browser labs and `X-Lab-Session` supports API clients. Only SHA-256 token hashes are stored. Cookie mutations require same-origin plus CSRF; header-mode clients use the opaque bearer token.
- **Bounded state:** sessions expire after a two-hour idle TTL or 24-hour absolute TTL, with a test-only shorter expiry seam. Limits cover sessions, overlays, request bodies, pages, searches, delays and total storage.
- **Deterministic controls:** delay, simulated statuses, data seed/size and simulated throttling are explicit and capped. Real per-IP throttling is separate and cannot be disabled by practice controls.
- **Generated artifacts:** seed and OpenAPI files are generated and checked against one source contract. Regeneration is byte-identical and validation prevents count/version/route drift.
- **Dependency-free server runtime:** the narrow API uses PHP/PDO primitives and parameterised statements, so Composer adds no useful capability in this chunk and would enlarge each immutable release.
- **Release-coupled API:** API runtime, seed and OpenAPI files live inside every immutable release. The stable front controller follows `.current`, so the documented one-command rollback switches static pages and API together.
- **External cleanup:** the stable CLI wrapper follows the active release and is scheduled every five minutes; direct HTTP access is denied.

## 4. How to run locally

From PowerShell:

```powershell
Set-Location -LiteralPath 'C:\Users\MayurN\OneDrive\Documents\ChatGPT\Testheon-Content_project\practice-lab'
corepack pnpm install --frozen-lockfile
pnpm api:generate
pnpm verify
pnpm dev
```

Run the API acceptance suite against a configured protected staging environment:

```powershell
$env:PRACTICE_LAB_API_BASE_URL = $env:PRACTICE_LAB_STAGING_ORIGIN
pnpm api:test:staging
```

Operators with ignored `.env` and short-lived `.deploy.env` values can deploy, roll back or inspect status with:

```powershell
pnpm deploy:staging
pnpm rollback:staging
pnpm status:staging
```

The review username, password, control token and generated API secret remain only in ignored environment/server configuration. They are absent from tracked artifacts and this report.

## 5. Staging URLs to review

- Practice Lab hub: <https://practice-staging.testheon.com/practice/>
- API documentation: <https://practice-staging.testheon.com/practice/api/>
- OpenAPI 3.1: <https://practice-staging.testheon.com/practice/api/v1/openapi.json>
- Health: <https://practice-staging.testheon.com/practice/api/v1/health>
- Sessions: <https://practice-staging.testheon.com/practice/api/v1/lab/session>
- Reset: <https://practice-staging.testheon.com/practice/api/v1/lab/reset>
- Simulation controls: <https://practice-staging.testheon.com/practice/api/v1/sim>
- Resources: `users`, `customers`, `employees`, `products`, `orders`, `tasks`, `tickets` and `bookings` under <https://practice-staging.testheon.com/practice/api/v1/>.

The staging host is protected by the existing HTTP credentials in ignored `practice-lab/.env` and remains `noindex,nofollow`.

## 6. Tests

| Check | Result |
| --- | --- |
| `pnpm lint` | PASS, 0 warnings/errors |
| `pnpm format` | PASS |
| `pnpm typecheck` | PASS, 0 errors/warnings/hints across 30 files |
| `pnpm unit` | PASS, 7 files / 20 tests |
| `pnpm api:validate` | PASS, 8 resources, fixture 1.0.0, OpenAPI 1.0.0 |
| deterministic seed replay | PASS, byte-identical generated JSON |
| `pnpm build` | PASS, 3 static pages plus release API package |
| local `pnpm e2e` | PASS, 10/10 desktop/mobile Chrome tests |
| `pnpm manifest:validate` | PASS, 0 UI fixtures |
| complete local `pnpm verify` | PASS |
| final live `pnpm api:test:staging` | PASS, 15/15 tests |
| final live staging `pnpm e2e` | PASS, 10/10 tests |
| deploy smoke | PASS, static hub, API docs and health verified after activation |
| cleanup cron installation | PASS, one `*/5 * * * *` job targets the stable CLI cleanup wrapper |

The live API suite exercises all eight resources and every REST verb; 200/201/204/400/401/403/404/409/413/415/422/429/500/503 behavior; page and cursor pagination; sorting, filters and search; deterministic seed, size, delay and status controls; two-session isolation; reset; expiry; simulated rate limiting; injection strings; traversal rejection; oversized bodies; cookie CSRF and localhost CORS. An initial live run exposed expired sessions being removed before lookup; the runtime was corrected, a regression contract test was added and the complete live suite then passed 15/15.

The workflow now provisions PHP 8.3 and runs `php -l` over every deployed PHP file. PHP CLI is unavailable on this workstation, so local syntax execution could not be run directly; Hostinger executed the same files successfully through deploy health checks and all 15 live API tests. This checkout has no configured Git remote, so there is no remote GitHub Actions run to link; the exact `pnpm verify` workflow path passed locally. No available test was skipped.

Release evidence:

- Corrected rollback release: `20260927T180347Z-00ae7b`, smoke-verified.
- Active release: `20260927T180429Z-5c1f66`, smoke-verified.
- Active pointer was re-read from Hostinger and matches the release above.
- Retention also contains prior release `20260927T175826Z-4668d3`; rollback selects the corrected immediate predecessor.

## 7. Fixture manifest changes

No UI fixture ID, challenge ID or test-case ID was added. `fixtures/manifest.json` remains valid with zero fixtures because CRE-48 adds API infrastructure and seed data rather than a learner-facing practice fixture.

The separate API seed contract is version `1.0.0` and contains exactly 40 users, 60 customers, 120 employees, 80 products, 150 orders, 50 tasks, 60 tickets and 40 bookings. It includes long and Unicode names, out-of-stock products, cancelled records, eight fictional Rahuls across departments and one explicitly marked invalid fixture.

## 8. WordPress untouched proof

**WordPress untouched: PASS.**

| Evidence | Before deployment | After final deployment | Result |
| --- | --- | --- | --- |
| Production root `.htaccess` SHA-256 | `3f9689ed4759a5a35a33c4f7ccfb40613310fbc1b0f98387bfdc76f21ce00d24` | `3f9689ed4759a5a35a33c4f7ccfb40613310fbc1b0f98387bfdc76f21ce00d24` | Identical |
| Homepage + 10 published posts | 11/11 HTTP 200 with one correct self-canonical each | 11/11 HTTP 200 with one correct self-canonical each | PASS |
| Production response bodies | Eleven recorded SHA-256 values | All eleven SHA-256 values identical | PASS |
| Production final URLs | Eleven expected HTTPS URLs | All unchanged | PASS |
| Staging root `.htaccess` SHA-256 | `9186269b669a6a1ab7bc26d52b66c633e1ae616460974cd60ff394c45bcacaf6` | `9186269b669a6a1ab7bc26d52b66c633e1ae616460974cd60ff394c45bcacaf6` | Identical |
| WordPress files/database/credentials | Not used | Not used | PASS |
| Deployment target | Dedicated protected subdomain | Only dedicated subdomain releases/runtime changed | PASS |

Evidence is in `docs/evidence/chunk-03/pre-deploy/` and `docs/evidence/chunk-03/post-deploy/`. The Hostinger file API returned the production `.htaccess` content without its final LF while reporting the original 1466-byte size; adding that omitted byte reproduces the exact pre-deploy hash recorded above. Deployment did not edit WordPress core, theme, plugins, configuration, posts, settings, database or production root `.htaccess`.

## 9. Known issues and deviations from the chunk

- PHP CLI is unavailable on the local workstation. The CI definition performs PHP 8.3 syntax checks, while the deployed PHP was verified through Hostinger health checks and 15 live acceptance tests.
- A remote GitHub Actions result is unavailable because this checkout has no configured Git remote. The expanded workflow's full `pnpm verify` command passed locally with the frozen dependency graph.
- The Hostinger developer API continued to return an upstream Cloudflare challenge when asked for nested `practice/.htaccess` content. Its server size, deployed local source hash and unchanged production/staging-root hashes are recorded instead.
- Hostinger currently returns an empty cron-output buffer. The account job list confirms exactly one intended five-minute cleanup job and its stable command.
- No functional or safety deviation remains open for CRE-48.

## 10. Carry-forward for later chunks

- CRE-49 may consume this API only after its ticket is checked out and read in full; no CRE-49 page or fixture was started here.
- Keep the authentication description in OpenAPI as a placeholder until the planned auth chunk defines learner-facing authentication behavior.
- Preserve seed version 1.0.0, deterministic controls, sandbox isolation and the immutable-release contract when later apps begin consuming the API.
- Keep protected staging/noindex and refresh the R4 baseline before and after every later deployment.
- Production remains locked until Chunk 13 and its explicit approval gates.

## 11. Questions for Mayur

None. Chunk 3 is complete and stops before CRE-49.
