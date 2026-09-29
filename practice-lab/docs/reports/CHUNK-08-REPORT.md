# Chunk 08 Report — Authentication, sessions, roles and API auth

## 1. Summary

1. Added a protected/noindex Authentication Practice App with login, logout, registration, generic forgot-password responses, a fake Practice Inbox, password reset, remember-me, idle expiry and public lockout reset exercises.
2. Added eight synthetic public accounts for standard, admin, manager, employee, read-only, locked, expired-password and deterministic slow-login scenarios. Their shared fake password is `Practice@123`.
3. Added signed HttpOnly session cookies, a readable non-sensitive UI preference, access-token localStorage, wizard sessionStorage, explicit logout invalidation and reusable Playwright storage-state guidance.
4. Added Customer, Employee, Manager, Admin and Read-only roles with an enforced permission matrix, 401/403 behavior, a hidden non-admin control and a role-disabled destructive control.
5. Added short-lived bearer and rotating refresh tokens, expired/invalid token cases, a public demo API key, cookie-authenticated API access and generated OpenAPI documentation.
6. Added the indexable Playwright Authentication lesson with global setup, per-role storage states, API login, logout and expiry examples.
7. Isolated authentication data in Lab-owned SQLite tables scoped to synthetic Lab sessions; no WordPress identity, credential or database is used.
8. Registered `FX-AUTH-001`; manifest version `1.5.0` now contains 18 fixtures.
9. Deployed immutable release `20260929T034048Z-ac085a` to protected/noindex staging with two rollback releases retained.
10. Passed local and hosted validation, repeated R4 evidence and confirmed **WordPress untouched: PASS**.

## 2. Files created / changed

- `src/pages/apps/auth/index.astro`, `src/scripts/auth-app.ts` — complete browser authentication sandbox and client-side storage exercises.
- `src/pages/playwright/authentication/index.astro` — indexable authentication guide with executable patterns and stable internal links.
- `deploy/runtime/api-auth.php` — Lab-only users, password hashes, sessions, lockouts, reset tokens, bearer/refresh tokens, API-key authentication and permission enforcement.
- `deploy/runtime/api-runtime.php`, `deploy/runtime/runtime.php`, `deploy/runtime/practice.htaccess`, `deploy/runtime/api.htaccess` — auth dispatch, cleanup/reset integration, the signed staging-gate cookie and protected API routing.
- `scripts/deploy.mjs` — packages the authentication runtime inside each immutable release.
- `api/contract.mjs`, `scripts/generate-openapi.mjs`, `api/openapi/openapi.json` — authentication budgets, contract, security schemes and generated route documentation.
- `examples/playwright-ts/authentication.spec.ts` — runnable storage-state, role, API-login, logout and token-expiry examples.
- `tests/api/auth-api.spec.ts`, `tests/live/chunk-08-live.spec.ts`, `tests/e2e/chunk-08-auth.spec.ts` — API, hosted and local authentication acceptance coverage.
- `tests/e2e/component-lab.spec.ts`, `tests/e2e/examples.spec.ts`, `tests/unit/manifest.test.ts`, `tests/unit/api-contract.test.ts`, `tests/unit/runtime-contract.test.ts` — route, accessibility, example and contract regression coverage.
- `fixtures/manifest.json` — `FX-AUTH-001`, manifest version `1.5.0` and 18-fixture total.
- `src/config/categories.ts`, `src/pages/playwright/index.astro`, `src/styles/global.css` — navigation, track cards and responsive authentication presentation.
- `README.md`, `docs/CHUNK-08-TASK.md` — route inventory, commands and checked-out CRE-53 scope.
- `docs/reports/assets/chunk-08/` — reviewed desktop and mobile captures for the app and lesson.
- `docs/evidence/chunk-08/`, `docs/reports/CHUNK-08-REPORT.md` — pre/post R4 evidence and this checkpoint report.

## 3. Decisions made

- **Synthetic identities only:** all accounts, emails, roles, tokens and reset messages belong to the Practice Lab sandbox and are deliberately unrelated to WordPress users.
- **Modern password storage:** the PHP runtime uses `password_hash(PASSWORD_DEFAULT)` and `password_verify`; plaintext passwords are never stored.
- **Non-enumerating recovery:** forgot-password always returns the same accepted response, while messages appear only in the sandbox Practice Inbox.
- **Explicit session boundaries:** session cookies are Secure, HttpOnly and SameSite=Lax; the readable preference cookie contains only a display preference.
- **Deterministic expiry:** access tokens last 120 seconds, refresh tokens last 900 seconds and rotate once; tests can request an already-expired access token.
- **Server-side logout:** logout revokes the active session, and the expiry control makes deterministic idle-session testing possible without waiting.
- **Scoped authorization:** every request resolves the sandbox identity before checking the named permission, producing 401 for no identity and 403 for an authenticated identity without permission.
- **Visible UI authorization:** the admin-only control is absent for non-admins, while the destructive user control remains visible and disabled unless the active role is Admin.
- **Safe lockout fixture:** three failures create a five-minute temporary lock; the public reset affects only the current Lab session, and `locked_user` remains a permanent scenario.
- **Bounded delay:** `slow_user` defaults to 3,000 ms; the documented test override is deterministic and all requested delays remain within the global cap.
- **Staging Bearer compatibility:** after valid HTTP Basic authentication, the staging runtime sets a two-hour signed gate cookie so the browser can use its `Authorization` header for the Lab bearer token without weakening the outer gate.
- **Immutable release:** deployment used the existing atomic controller, preserved password/noindex protection and retained one-command rollback.

## 4. How to run locally

From PowerShell:

```powershell
Set-Location -LiteralPath 'C:\Users\MayurN\OneDrive\Documents\ChatGPT\Testheon-Content_project\practice-lab'
corepack pnpm install --frozen-lockfile
pnpm verify
pnpm dev
```

Run the staging suites after loading the ignored staging environment:

```powershell
$env:PRACTICE_LAB_BASE_URL = $env:PRACTICE_LAB_STAGING_ORIGIN
pnpm ui:test:staging

$env:PRACTICE_LAB_API_BASE_URL = $env:PRACTICE_LAB_STAGING_ORIGIN
pnpm api:test:staging
```

Operators with the ignored `.env` and a fresh short-lived `.deploy.env` can inspect, deploy or roll back with:

```powershell
pnpm status:staging
pnpm deploy:staging
pnpm rollback:staging
```

## 5. Staging URLs to review

- Authentication Practice App: <https://practice-staging.testheon.com/practice/apps/auth/>
- Playwright Authentication lesson: <https://practice-staging.testheon.com/practice/playwright/authentication/>
- Generated Practice API documentation: <https://practice-staging.testheon.com/practice/api/>
- Playwright track: <https://practice-staging.testheon.com/practice/playwright/>
- Lab home: <https://practice-staging.testheon.com/practice/>

The staging host remains protected by the existing HTTP credentials in ignored `practice-lab/.env` and sends `noindex,nofollow`. The public synthetic account names and fake password are intentionally displayed inside the protected app.

## 6. Tests

| Check | Result |
| --- | --- |
| ESLint | PASS, 0 warnings/errors |
| Prettier | PASS |
| Astro typecheck | PASS, 0 errors/warnings/hints across 91 files |
| unit/integration | PASS, 7 files / 21 tests |
| API artifact validation | PASS, 8 resources, fixture 1.0.0, OpenAPI 1.0.0 |
| manifest validation | PASS, 18 fixtures |
| production build | PASS, 28 static pages plus release API package |
| local full E2E | PASS, 134 passed / 2 intentional mobile real-timer skips |
| hosted API suite | PASS, 23/23 |
| hosted UI suite | PASS, 12/12 |
| deploy smoke and release status | PASS, hub, API docs, health and active release verified |
| desktop/mobile visual review | PASS, app and authentication lesson at both viewports |
| R4 public HTTP comparison | PASS, 11/11 URLs and response bodies unchanged |
| temporary credential cleanup | PASS, short-lived upload credential files removed |

The hosted authentication tests prove bearer 401/403 behavior, permission grants, access-token expiry, one-time refresh rotation, API-key success/failure, Secure HttpOnly session cookies, logout invalidation, registration, non-enumerating recovery, Practice Inbox reset, temporary and permanent lockout behavior, expired-password handling and the deterministic three-second slow user. The hosted browser tests prove the complete login/logout path, hidden manager controls, permission denial, localStorage bearer use, the public demo API key and fake Inbox behavior.

One initial hosted assertion compared the Secure cookie attribute case-sensitively. PHP returned the valid lowercase `secure` attribute. The assertion now normalizes the header before checking it; the unchanged runtime then passed all 23 API tests and all 12 hosted UI tests.

Release evidence:

- Active release: `20260929T034048Z-ac085a`.
- Artifact SHA-256: `1107fae56c30bb7dec1b27b2d6e3786b038cf26a7e60c743de9792d218925e87`.
- Immediate rollback release: `20260928T150416Z-7bb20e`.
- Additional retained release: `20260928T130939Z-f8497f`.
- Hostinger `.current` was re-read after deployment and matches the active release.
- `pnpm rollback:staging` remains the one-command rollback.

This checkout has no configured Git remote, so there is no remote GitHub Actions run to link. The existing frozen-install workflow discovers the new example and tests, and the complete local plus hosted suites passed.

## 7. Fixture manifest changes

| Fixture ID | Version | Route and anchor | Intentional defect |
| --- | --- | --- | --- |
| `FX-AUTH-001` | `1.0.0` | `/practice/apps/auth/#fixture-auth` | None |

The fixture records eight synthetic accounts, five roles, permission names, the shared fake password, lockout threshold/duration, token lifetimes, slow-user delay and public API key. The manifest validates at version `1.5.0` with 18 total fixtures.

## 8. WordPress untouched proof

**WordPress untouched: PASS.**

| Evidence | Before deployment | After deployment | Result |
| --- | --- | --- | --- |
| Production root `.htaccess` SHA-256 | `3f9689ed4759a5a35a33c4f7ccfb40613310fbc1b0f98387bfdc76f21ce00d24` | `3f9689ed4759a5a35a33c4f7ccfb40613310fbc1b0f98387bfdc76f21ce00d24` | Identical |
| Homepage + 10 published posts | 11/11 HTTP 200 with correct self-canonical | 11/11 HTTP 200 with correct self-canonical | PASS |
| Production response bodies | Eleven SHA-256 values recorded | All eleven SHA-256 values identical | PASS |
| Production final URLs | Eleven expected HTTPS URLs | All unchanged | PASS |
| Staging root `.htaccess` SHA-256 | `9186269b669a6a1ab7bc26d52b66c633e1ae616460974cd60ff394c45bcacaf6` | `9186269b669a6a1ab7bc26d52b66c633e1ae616460974cd60ff394c45bcacaf6` | Identical |
| WordPress files/database/credentials | Not used | Not used | PASS |
| Deployment target | Dedicated protected subdomain | Only immutable staging release and Lab runtime changed | PASS |

Evidence is stored in `docs/evidence/chunk-08/pre-deploy/` and `docs/evidence/chunk-08/post-deploy/`. The comparison found zero differences across requested URL, final URL, status, canonical count/value and body SHA-256 for all 11 production pages. Deployment did not edit WordPress core, themes, plugins, configuration, posts, pages, settings, database, media or production root `.htaccess`.

## 9. Known issues and deviations from the chunk

- The Hostinger developer API still returns its upstream Cloudflare challenge for direct reads of nested `practice/.htaccess`. The deployed source hash, active release status, successful protected-route behavior, API tests and unchanged staging-root hash provide the recorded substitute evidence.
- PHP CLI remains unavailable on this workstation. The deployed PHP runtime passed all 23 hosted API acceptance tests.
- This checkout has no configured Git remote, so a remote GitHub Actions result is unavailable; complete local and hosted verification passed.
- Browser output includes the inherited harmless `NO_COLOR`/`FORCE_COLOR` warning.
- No functional, safety or requested-scope deviation remains open for CRE-53.

## 10. Carry-forward for later chunks

- CRE-54 may start only after its ticket is checked out and read in full.
- Preserve `FX-AUTH-001` at version `1.0.0`; bump its version and add a changelog entry for breaking DOM or behavior changes.
- Keep all authentication identities synthetic and separate from WordPress, and continue using Lab-owned session-scoped storage.
- Preserve password hashing, generic recovery responses, CSRF/origin enforcement, cookie flags, lockout limits and bounded deterministic delays.
- Preserve 401 versus 403 semantics, the published role/permission matrix and explicit hidden/disabled UI exercises.
- Keep access/refresh lifetimes deterministic, refresh rotation one-time and the demo API key clearly public and sandbox-only.
- Preserve the signed staging-gate cookie while browser bearer-token exercises remain behind HTTP Basic protection.
- Preserve protected/noindex staging, immutable releases, one-command rollback and R4 evidence before and after every deployment.
- Production remains locked until Chunk 13 and its explicit approval gates.

## 11. Questions for Mayur

None. Chunk 8 is complete and stops before CRE-54.
